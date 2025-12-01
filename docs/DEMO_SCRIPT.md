# Demo Video Script (5 minutes)

## Introduction (30 seconds)
"Hey, I'm showing you HireStack, a Hire Stack I built for companies to create custom branded job boards. Think Ashby or Workable but simpler. Let me walk through the entire stack - frontend, backend, database, and how it scales."

## Frontend Tour (1 minute)

"Starting with the public careers page at /techcorp/careers."

**Show:**
- Banner carousel auto-rotating (point out speed)
- Scroll to About Us section
- Show job listings with filters
- Search for "Engineer"
- Filter by Remote
- Click mobile view - show hamburger menu
- "Built with Next.js 14 and Tailwind. SSR for SEO, client components for interactivity."

## Editor Demo (1.5 minutes)

"Now the editor at /techcorp/edit. This is where recruiters customize."

**Theme Tab:**
- Change primary color to purple - "See it update instantly"
- Upload new banner image
- Toggle auto-rotate OFF, back ON
- Change font to Roboto
- "All stored in CompanyTheme table as JSON and enums"

**Sections Tab:**
- Drag a section up
- Add new Custom section
- Delete it
- "Uses @dnd-kit for drag-drop, updates order field in database"

**Jobs Tab:**
- Add a job quickly (show form)
- Click Import CSV - "Bulk import with papaparse, validates all fields"
- Show one imported job

**Performance Features:**
- Make a change - "Notice the Save button shows (1) for tracked changes"
- Edit theme colors - "Now shows Save (3) - only modified fields get sent"
- Click Save - "Delta saving reduces payload by 60-90%, saves in 100-300ms"
- Show orange pulse dot for unsaved changes

**Collaboration:**
- Click Preview
- "Notice comment buttons on header, banner, sections"
- Click comment on a section
- Add comment with @mention - "Type @ to see team members"
- "All comments persist in database for team collaboration"

**Publish:**
- Go back to editor
- Click Publish (show ADMIN vs RECRUITER roles)
- "Only ADMINs can publish, RECRUITERs can edit but need approval"
- Show toast notification (Sonner library)
- "Instant publish - no build step needed"

## Backend Architecture (1 minute)

"Let me show the code quickly."

**Show in VS Code:**
1. API route: `app/api/companies/[slug]/route.ts`
   - "This is the update endpoint"
   - "Takes theme, sections, jobs"
   - "Uses Prisma transactions for atomicity"

2. Middleware: `middleware.ts`
   - "Protects editor routes"
   - "NextAuth checks if user owns this company"

3. Prisma schema: `prisma/schema.prisma`
   - "Multi-tenant with companyId everywhere"
   - "Cascade deletes for cleanup"
   - "Enums for type safety"

"Backend is Next.js API routes. Could separate into microservices later but overkill for now."

## Database Design (45 seconds)

"Open Supabase dashboard" (or show schema file)

**Show tables:**
- Company table - "Has slug for URL routing"
- CompanyTheme - "1-to-1, stores all branding"
- PageSection - "Many-to-one, has order and columnGroup for layouts"  
- Job - "Many-to-one, filtered by location and type enums"
- User - "Links to Company, role-based access"

"Key decision: Single database, multi-tenant. Isolated by companyId foreign keys. Every query filters by company."

**Why not separate DBs per company?**
"Simpler, cheaper, easier to maintain. If we hit 1000+ companies, we'd shard by companyId range or move big clients to dedicated instances."

## System Design & Scaling (1 minute)

"Current setup handles 100 companies easily. Here's how I'd scale to 1000+:"

**Architecture diagram** (draw on screen or show image):
```
User → Cloudflare CDN → Vercel (Next.js)
                            ↓
                    Supabase Pooler → PostgreSQL
                            ↓
                    Redis Cache (job listings)
```

**What I'd add:**

1. **CDN for images**
   - "Right now images are external URLs"
   - "Move to S3 + CloudFront"
   - "Serve banners from edge locations"

2. **Redis caching**
   - "Cache published pages for 5 minutes"
   - "Invalidate on publish"
   - "Reduce DB load by 80%"

3. **Read replicas**
   - "Job searches hit the database hard"
   - "Add read replicas for SELECT queries"
   - "Write to primary, read from replicas"

4. **Database indexing**
   - "Already have index on slug"
   - "Add composite index on (companyId, isActive) for job queries"
   - "Add full-text search index on job titles"

5. **Rate limiting**
   - "Prevent abuse on public pages"
   - "Use Vercel's rate limiting or Upstash"

6. **Monitoring**
   - "Add Sentry for error tracking"
   - "Vercel Analytics for performance"
   - "Set up alerts for 500 errors"

## Scaling Questions Answered (30 seconds)

**"How do you store data separately?"**
"Multi-tenant DB with companyId foreign keys. Every query filters by company. Isolated at app layer, not DB layer."

**"How do recruiters customize easily?"**
"Drag-drop editor, no code needed. Visual theme picker, instant preview, one-click publish."

**"How are edits safe?"**
"Transactions in Prisma. Auth checks ownership. Publish is atomic - all or nothing."

**"How do candidates browse smoothly?"**
"SSR for fast initial load. Client-side filtering. Eventually add pagination and infinite scroll."

**"Responsive design?"**
"Mobile-first Tailwind. Tested on iPhone, iPad, desktop. Hamburger menu on mobile."

**"Scaling to hundreds of companies?"**
"Add caching, CDN, read replicas, better indexes. Current architecture supports it with those tweaks."

## Wrap Up (15 seconds)

"That's HireStack. Built in 3 days with Next.js, Prisma, PostgreSQL. Production-ready with room to scale. Thanks for watching!"

---

## Demo Tips

1. **Prepare beforehand:**
   - Have 2 companies seeded (techcorp and another)
   - Clear browser cache
   - Test all features once
   - Have VS Code open to relevant files

2. **Screen setup:**
   - Browser on left (main demo)
   - VS Code on right (code snippets)
   - Keep terminal hidden (unless showing commands)

3. **Talking pace:**
   - Speak clearly, not too fast
   - Pause after each section
   - Show, don't just tell

4. **If something breaks:**
   - Have backup screenshots
   - Explain what should happen
   - Move on quickly

5. **Time management:**
   - Practice once to check timing
   - Have a watch visible
   - Skip optional parts if running over
