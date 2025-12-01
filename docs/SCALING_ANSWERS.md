# System Design & Scaling Questions

## Q1: How will you store data for each company separately?

### Current Approach: Multi-Tenant with Shared Database

**Implementation:**
- Single PostgreSQL database
- Every table has a `companyId` foreign key
- Application-level isolation (not database-level)
- All queries include `WHERE companyId = ?`

**Schema Example:**
```prisma
model Job {
  id         String   @id @default(cuid())
  companyId  String   // FK to Company
  title      String
  company    Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId, isActive])
}
```

**Pros:**
- Simple to implement and maintain
- Cost-effective (one database for all)
- Easy to add features globally
- Backup and monitoring are centralized

**Cons:**
- Noisy neighbor problem (one company's heavy queries affect others)
- Hard limit on total scale
- Data leakage risk if query forgets companyId filter

**How It Works:**
1. User logs in → session stores companyId
2. Every API call validates user owns the company
3. Middleware: `prisma.job.findMany({ where: { companyId: user.companyId }})`
4. Database enforces foreign key constraints
5. Cascade deletes clean up when company is removed

### Future Scaling Options:

**Option A: Sharded Multi-Tenant (100-1000 companies)**
- Split companies across multiple databases
- Route by companyId hash: `db = hash(companyId) % numDatabases`
- Still share infrastructure
- Reduces blast radius of issues

**Option B: Hybrid (1000+ companies)**
- Small companies stay in shared DB
- Large companies (>1000 jobs) get dedicated database
- Use a routing layer to decide which DB to query
- Metadata table tracks which company is where

**Option C: Schema-per-Tenant (Enterprise)**
- Each company gets its own PostgreSQL schema
- Better isolation than shared tables
- Still share the same database cluster
- Query: `SET search_path TO company_acme; SELECT * FROM jobs;`

**Chosen: Option A for next phase**
Why? Good balance of isolation and simplicity. Can shard by companyId range (0-999 in DB1, 1000-1999 in DB2, etc.)

---

## Q2: How can recruiters easily build and customize their page?

### Design Principles:
1. **No code required** - Visual editor only
2. **Instant preview** - See changes immediately
3. **Drag and drop** - Intuitive section reordering
4. **One-click publish** - No complex deployment

### Current Implementation:

**Theme Customization:**
- Color pickers (not hex input)
- Font dropdown (common choices)
- Image upload via URL (simple, no file storage needed)
- Live preview on the right side

**Section Builder:**
- Pre-defined section types (About, Culture, Benefits, Custom)
- Layout options: Full width, 2-column, 3-column
- Rich text editor for content (HTML supported)
- Drag handle to reorder
- Toggle visibility (show/hide without deleting)

**Job Management:**
- Simple form: title, location, type, description
- CSV bulk import with template download
- Edit in place
- Activate/deactivate toggle

**Publishing:**
- Single "Publish Changes" button
- Instant live update (no build step)
- Toast notification with public URL
- Auto-save drafts

### UX Flow:
```
Login → Editor → Theme Tab (customize branding)
              → Sections Tab (build content)
              → Jobs Tab (add listings)
              → Publish → Share URL
```

### Future Improvements:

**Phase 1: Better Content Editing**
- WYSIWYG editor (TipTap or Quill)
- Drag-drop for images within sections
- Embed videos/YouTube links
- Pre-built section templates

**Phase 2: Advanced Features**
- Duplicate section button
- Undo/redo history
- Preview mode (see page without publishing)
- Mobile preview toggle
- A/B testing (show variant to 50% of visitors)

**Phase 3: Collaboration**
- Multiple recruiters editing simultaneously
- Comment system on sections
- Approval workflow (Recruiter creates, Admin approves)
- Version history (revert to previous publish)

---

## Q3: How will edits safely update the page?

### Safety Mechanisms:

**1. Authentication & Authorization**
```typescript
// Middleware checks
const user = await getSession()
if (!user) redirect('/login')

const company = await prisma.company.findUnique({
  where: { slug: params.slug }
})

if (company.id !== user.companyId && user.role !== 'ADMIN') {
  return unauthorized()
}
```

**2. Database Transactions**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.companyTheme.update({ where: { companyId }, data: theme })
  await tx.pageSection.deleteMany({ where: { companyId }})
  await tx.pageSection.createMany({ data: sections })
  await tx.company.update({ where: { id: companyId }, data: { isPublished: true }})
})
```
If any step fails, entire update rolls back.

**3. Validation**
- Zod schemas validate all inputs
- Required fields checked before save
- URL validation for images
- Color format validation (#HEX)

**4. Optimistic UI**
- Show changes immediately in editor
- If save fails, revert UI and show error toast
- User can retry

**5. Draft vs Published**
- Current: Edits are live immediately on publish
- Future: Add draft mode
  - Edits save as draft
  - Preview draft before publishing
  - Publish makes draft live atomically

**6. Audit Logging (Future)**
```typescript
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'UPDATE_THEME',
    companyId: company.id,
    changes: { before: oldTheme, after: newTheme },
    timestamp: new Date()
  }
})
```

**7. Rate Limiting**
- Prevent spam updates
- Max 10 publishes per hour per company
- Use Upstash or Vercel's built-in rate limiting

### Rollback Strategy:

**Current:** Manual database restore from Supabase backups

**Future:**
1. Store each publish as a version
2. Keep last 10 versions
3. One-click rollback in UI
4. Database: Add `CompanyVersion` table with serialized state

---

## Q4: How can candidates browse jobs smoothly?

### Current Experience:

**Fast Initial Load:**
- Server-side rendering (Next.js SSR)
- HTML sent from server with all job data
- No loading spinner on first visit
- Good for SEO (Google sees full content)

**Client-Side Filtering:**
- Search by title: instant, no server request
- Filter by location type: instant
- Filter by job type: instant
- Uses JavaScript array methods on client

**Mobile Responsive:**
- Cards stack vertically on mobile
- Touch-friendly filter buttons
- Collapsible job descriptions
- Hamburger menu for navigation

### Performance Optimizations:

**1. Database Indexes**
```sql
CREATE INDEX idx_jobs_company_active ON jobs(companyId, isActive);
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title));
```

**2. Pagination (Future)**
```typescript
// Show 20 jobs per page
const jobs = await prisma.job.findMany({
  where: { companyId, isActive: true },
  take: 20,
  skip: page * 20,
  orderBy: { postedAt: 'desc' }
})
```

**3. Infinite Scroll (Future)**
- Load 20 jobs initially
- Load 20 more when user scrolls to bottom
- Use Intersection Observer API
- Better UX than pagination for mobile

**4. Debounced Search**
- Wait 300ms after typing before filtering
- Prevents lag on every keystroke

**5. Image Lazy Loading**
- Use Next.js Image component (already doing this)
- `loading="lazy"` attribute
- Blur placeholder while loading

**6. Caching**
```typescript
// Cache published pages in Redis
const cacheKey = `careers:${slug}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const page = await fetchPageData(slug)
await redis.setex(cacheKey, 300, page) // 5 min cache
return page
```

### Search Improvements (Future):

**Phase 1: Better Filters**
- Department filter
- Salary range filter
- Sort by: Newest, Salary (high to low)

**Phase 2: Full-Text Search**
- Search in job description too (not just title)
- PostgreSQL full-text search
- Highlight matching terms

**Phase 3: Advanced Features**
- Saved searches (candidates can save filters)
- Email alerts for new matching jobs
- Apply button with form (track applications)
- Share job link (with proper meta tags)

---

## Q5: How does your design adapt across devices?

### Responsive Breakpoints:

**Mobile (< 640px):**
- Single column layout
- Hamburger menu instead of nav links
- Full-width job cards
- Stacked filter buttons
- Banner carousel with swipe gestures

**Tablet (640px - 1024px):**
- 2-column job grid
- Condensed nav with some icons
- Side-by-side filters
- Reduced padding

**Desktop (> 1024px):**
- 3-column job grid for search results
- Full navigation bar
- Max width 1280px (centered)
- Spacious padding

### Tailwind Mobile-First Approach:

```jsx
<div className="p-4 md:p-6 lg:p-8">           // Padding scales up
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">  // Grid adapts
<img className="h-48 md:h-64 lg:h-96">        // Images resize
```

### Touch Optimizations:

**Mobile:**
- Buttons min 44px height (Apple HIG)
- Swipeable carousel
- Pull to refresh (future)
- Sticky filter bar

**Testing:**
- Chrome DevTools mobile emulation
- Tested on iPhone 13, iPad Air
- Safari and Chrome

### Performance on Mobile:

**Current:**
- Lighthouse score: 85+ on mobile
- First Contentful Paint: < 2s
- Time to Interactive: < 3s

**Improvements Needed:**
- Reduce JavaScript bundle (currently ~200KB)
- Code splitting for editor (don't load on public page)
- Prefetch job pages on hover
- Service worker for offline support

---

## Q6: How would you scale if hundreds of companies used it?

### Current Limits:
- Single database, one Vercel instance
- Can handle ~100 companies comfortably
- Assumes 1000 visitors/day per company = 100K daily visitors
- Database: 10K jobs total, 1K sections

### Scaling to 500 Companies:

**Infrastructure Changes:**

**1. Database Scaling**
```
Current: 1 PostgreSQL (Supabase)
→ Add: Connection pooler (PgBouncer) - already using
→ Add: Read replicas (2x) for job queries
→ Upgrade: Larger instance (4 CPU, 16GB RAM)
```

**2. Caching Layer**
```
Add: Redis (Upstash)
- Cache published pages (5 min TTL)
- Cache job listings per company
- Invalidate on publish
- Reduces DB load by 70-80%
```

**3. CDN for Static Assets**
```
Current: Images hosted externally
→ Move to: S3 + CloudFront
- Upload banners/logos to S3
- Serve from edge locations
- 10x faster load times globally
```

**4. Application Scaling**
```
Vercel auto-scales serverless functions
No changes needed - pay per request
But add:
- Background jobs (Inngest or BullMQ)
- Email sending (via queue, not inline)
- CSV processing (async worker)
```

**5. Monitoring & Alerts**
```
Add:
- Sentry (error tracking)
- Vercel Analytics (performance)
- Uptime monitoring (Checkly)
- Database dashboard (Supabase built-in)
```

### Scaling to 1000+ Companies:

**Database Sharding:**
```
Split companies across 3 databases:
- DB1: Companies 0-333
- DB2: Companies 334-666
- DB3: Companies 667-999

Router logic:
shard = companyId.hashCode() % 3
db = databases[shard]
```

**Separate Services:**
```
Current: Monolith (Next.js)
→ Split:
  - Public pages (Next.js SSR)
  - Editor API (Node.js)
  - Job search (Elasticsearch)
  - File uploads (separate service)
  - Background jobs (worker nodes)
```

**Advanced Caching:**
```
- Page cache at edge (Cloudflare Workers)
- Database query cache (Redis)
- Application cache (Next.js ISR)
- Pre-render popular pages
```

### Cost Analysis:

**Current (100 companies):**
- Vercel: $20/month (Pro plan)
- Supabase: $25/month (Pro plan)
- Domain: $12/year
- **Total: ~$45/month**

**At 500 companies:**
- Vercel: $50/month (more bandwidth)
- Supabase: $100/month (larger DB)
- Redis: $20/month (Upstash)
- S3/CloudFront: $30/month
- Monitoring: $30/month
- **Total: ~$230/month**

**At 1000 companies:**
- Vercel: $100/month
- Database (3 shards): $400/month
- Redis: $50/month
- CDN: $100/month
- Monitoring: $50/month
- **Total: ~$700/month**

### Bottlenecks to Watch:

1. **Database connections** - Max 100 concurrent
   - Solution: Connection pooling (done), read replicas

2. **Image loading** - Externally hosted, slow
   - Solution: Move to CDN

3. **Job search** - Linear scan on large datasets
   - Solution: Full-text search index, Elasticsearch

4. **CSV import** - Blocks API during processing
   - Solution: Background job queue

5. **Vercel function timeout** - 10s for Hobby, 60s for Pro
   - Solution: Use background jobs for long tasks

### Scaling Checklist:

**At 200 companies:**
- [ ] Add Redis caching
- [ ] Set up read replicas
- [ ] Move images to S3
- [ ] Add monitoring

**At 500 companies:**
- [ ] Implement database sharding
- [ ] Add rate limiting
- [ ] Separate background workers
- [ ] Add Elasticsearch for search

**At 1000 companies:**
- [ ] Split into microservices
- [ ] Multi-region deployment
- [ ] Advanced caching (edge)
- [ ] Dedicated DBs for large clients

---

## Summary Table

| Metric | Current | 500 Companies | 1000 Companies |
|--------|---------|---------------|----------------|
| Database | 1 PostgreSQL | 1 + 2 replicas | 3 sharded DBs |
| Caching | None | Redis (5 min) | Edge + Redis |
| CDN | No | CloudFront | Multi-region CDN |
| Search | SQL LIKE | SQL indexes | Elasticsearch |
| Cost | $45/mo | $230/mo | $700/mo |
| Response | 500ms | 200ms | 100ms |

**Key Takeaway:** Current architecture supports 100-200 companies without changes. Beyond that, add caching and read replicas. Beyond 500, shard the database and consider microservices.
