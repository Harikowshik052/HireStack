# Scaling Tools & Implementation Guide

## 📊 Current State (0-1,000 Companies)

### ✅ Already Implemented:
- **Next.js 14.0.4** - React framework with SSR
- **PostgreSQL** (via Supabase) - Relational database
- **Prisma 5.22.0** - ORM with connection pooling
- **NextAuth 4.24.5** - Authentication
- **Vercel** (recommended) - Deployment platform

### 💰 Monthly Cost Estimate:
- Supabase (Free tier): $0
- Vercel (Hobby): $0
- **Total: $0/month** (up to 1K companies)

---

## 🚀 Phase 1: 1K - 10K Companies

### New Tools Required:

#### 1. **Redis Cache** 
**Purpose:** Store frequently accessed data in memory

**Options:**
- **Upstash** (Serverless Redis) - $0.20/100K requests
- **Redis Cloud** - Free tier → $10/month
- **AWS ElastiCache** - ~$15/month (t4g.micro)

**Installation:**
```bash
npm install ioredis
npm install @upstash/redis  # For serverless option
```

**Implementation:**
```typescript
// lib/redis.ts
import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL)

// Cache company data
export async function getCachedCompany(slug: string) {
  const cached = await redis.get(`company:${slug}`)
  if (cached) return JSON.parse(cached)
  
  const company = await prisma.company.findUnique({ where: { slug } })
  await redis.setex(`company:${slug}`, 300, JSON.stringify(company)) // 5min cache
  
  return company
}
```

**Environment Variables:**
```env
REDIS_URL=redis://default:password@hostname:6379
```

---

#### 2. **CDN (Content Delivery Network)**
**Purpose:** Serve static assets (images, videos) faster globally

**Options:**
- **Cloudflare CDN** - Free tier (unlimited bandwidth!)
- **AWS CloudFront** - $0.085/GB transferred
- **Vercel Edge Network** - Built-in (automatic)

**For Cloudflare:**
- Sign up at cloudflare.com
- Add your domain
- Enable "Auto Minify" and "Brotli" compression
- No code changes needed!

---

#### 3. **S3 Object Storage**
**Purpose:** Store images/videos instead of database base64

**Options:**
- **AWS S3** - $0.023/GB/month
- **Cloudflare R2** - $0.015/GB/month (cheaper!)
- **Backblaze B2** - $0.005/GB/month (cheapest!)

**Installation:**
```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

**Implementation:**
```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadFile(file: File, key: string) {
  const buffer = await file.arrayBuffer()
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    ACL: 'public-read'
  }))
  
  return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
}
```

**Replace in editor-client.tsx:**
```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // Upload to S3 instead of base64
  const url = await uploadFile(file, `${company.slug}/${field}/${file.name}`)
  handleThemeChange(field, url)
}
```

---

#### 4. **Image Optimization Service**
**Purpose:** Resize and optimize images automatically

**Options:**
- **Vercel Image Optimization** - Built-in with Next.js
- **Cloudinary** - 25GB free/month
- **ImageKit** - 20GB free/month

**For Next.js (already have it!):**
```tsx
import Image from 'next/image'

<Image 
  src={company.theme.logoUrl}
  alt="Logo"
  width={200}
  height={80}
  quality={85}
  priority
/>
```

---

#### 5. **Database Connection Pooler**
**Purpose:** Handle more concurrent connections

**Supabase already includes this!** ✅
```env
DATABASE_URL=postgresql://postgres.xxx:5432/postgres
DIRECT_URL=postgresql://postgres.xxx:6543/postgres?pgbouncer=true
```

---

### Phase 1 Implementation Checklist:

- [ ] **Week 1:** Set up Redis cache (Upstash free tier)
  - Cache company data
  - Cache job listings
  - Invalidate on updates

- [ ] **Week 2:** Migrate files to S3/R2
  - Set up S3 bucket
  - Update file upload logic
  - Migrate existing base64 images

- [ ] **Week 3:** Add CDN (Cloudflare)
  - Configure DNS
  - Enable caching rules
  - Test performance

- [ ] **Week 4:** Add monitoring
  - Set up Sentry for errors
  - Add performance tracking
  - Create dashboard

### 💰 Phase 1 Monthly Cost:
- Supabase: $25/month (Pro plan)
- Vercel: $20/month (Pro plan)
- Upstash Redis: $10/month
- S3/R2 Storage: $5/month (100GB)
- **Total: ~$60/month** (for 10K companies)

---

## 🔥 Phase 2: 10K - 100K Companies

### New Tools Required:

#### 1. **PostgreSQL Read Replicas**
**Purpose:** Separate read/write operations for better performance

**Options:**
- **Supabase Read Replicas** - $100/month per replica
- **AWS RDS** - $50-200/month
- **Neon.tech** - Serverless Postgres with branching

**Setup with Supabase:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Write operations (primary)
export const prismaWrite = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

// Read operations (replica)
export const prismaRead = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READ_URL } }
})
```

**Usage:**
```typescript
// For reads (public careers pages)
const company = await prismaRead.company.findUnique({ where: { slug } })

// For writes (editor updates)
await prismaWrite.company.update({ where: { id }, data: { ... } })
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://primary-db:5432/postgres
DATABASE_READ_URL=postgresql://read-replica:5432/postgres
```

---

#### 2. **Database Sharding**
**Purpose:** Split data across multiple databases

**Options:**
- **Vitess** - MySQL sharding (open source)
- **Citus** - PostgreSQL extension for sharding
- **Custom sharding** - Manual implementation

**Custom Sharding Strategy:**
```typescript
// lib/sharding.ts
function getShardId(companySlug: string): number {
  const hash = companySlug.charCodeAt(0) % 10 // 10 shards
  return hash
}

function getShardUrl(shardId: number): string {
  return process.env[`DATABASE_SHARD_${shardId}_URL`]!
}

export function getPrismaClient(companySlug: string) {
  const shardId = getShardId(companySlug)
  const url = getShardUrl(shardId)
  
  return new PrismaClient({
    datasources: { db: { url } }
  })
}

// Usage
const prisma = getPrismaClient(company.slug)
const jobs = await prisma.job.findMany({ where: { companyId } })
```

**Environment Variables:**
```env
DATABASE_SHARD_0_URL=postgresql://shard0:5432/postgres
DATABASE_SHARD_1_URL=postgresql://shard1:5432/postgres
# ... up to shard 9
```

---

#### 3. **Background Job Queue**
**Purpose:** Process heavy tasks asynchronously (CSV uploads, email notifications)

**Options:**
- **BullMQ** - Redis-based queue (most popular)
- **Inngest** - Serverless queue ($0 → $100/month)
- **AWS SQS** - $0.40 per million requests

**Installation:**
```bash
npm install bullmq
npm install @bull-board/express  # Dashboard
```

**Implementation:**
```typescript
// lib/queue.ts
import { Queue, Worker } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST,
  port: 6379,
}

// Create queues
export const csvQueue = new Queue('csv-processing', { connection })
export const emailQueue = new Queue('email-notifications', { connection })

// Add job to queue
export async function processCsvAsync(companyId: string, csvData: string) {
  await csvQueue.add('process-csv', { companyId, csvData })
}

// Worker to process jobs
const worker = new Worker('csv-processing', async (job) => {
  const { companyId, csvData } = job.data
  
  // Process CSV in background
  const rows = Papa.parse(csvData)
  await prisma.job.createMany({ data: rows })
  
  // Send notification
  await emailQueue.add('csv-complete', { companyId })
}, { connection })
```

**API Route Update:**
```typescript
// app/api/jobs/bulk-upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file')
  
  // Instead of processing immediately, queue it
  await processCsvAsync(company.id, csvText)
  
  return NextResponse.json({ 
    message: 'Processing CSV in background. You will receive an email when complete.' 
  })
}
```

---

#### 4. **Rate Limiting**
**Purpose:** Prevent abuse and DDoS attacks

**Options:**
- **Upstash Rate Limit** - Serverless rate limiting
- **redis-rate-limit** - DIY with Redis
- **Cloudflare Rate Limiting** - Network level

**Installation:**
```bash
npm install @upstash/ratelimit
```

**Implementation:**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 min
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

---

#### 5. **Full-Text Search**
**Purpose:** Better job search performance

**Options:**
- **Elasticsearch** - $45/month (AWS OpenSearch)
- **Algolia** - $1/month per 1,000 searches
- **Meilisearch** - Self-hosted, open source
- **PostgreSQL Full-Text** - Already have it! (free)

**PostgreSQL Implementation:**
```sql
-- Add search index
CREATE INDEX idx_jobs_search ON jobs 
USING GIN (to_tsvector('english', title || ' ' || description));
```

```typescript
// Search query
const jobs = await prisma.$queryRaw`
  SELECT * FROM jobs 
  WHERE company_id = ${companyId}
  AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', ${searchQuery})
  ORDER BY posted_at DESC
`
```

---

#### 6. **Monitoring & Observability**

**Required Tools:**

**A) Error Tracking:**
- **Sentry** - Free tier → $26/month
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**B) Application Performance Monitoring (APM):**
- **New Relic** - Free tier available
- **Datadog** - $15/host/month
- **Better Uptime** - $10/month (uptime monitoring)

**C) Log Management:**
- **Vercel Logs** - Built-in
- **Datadog Logs** - $0.10 per GB
- **Better Stack** - $10/month

**Implementation:**
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

export function trackPerformance(operation: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${operation} took ${duration}ms`,
    level: 'info',
  })
  
  if (duration > 1000) {
    Sentry.captureMessage(`Slow operation: ${operation}`, 'warning')
  }
}

// Usage
const start = Date.now()
const result = await prisma.job.findMany()
trackPerformance('job-query', Date.now() - start)
```

---

### Phase 2 Implementation Checklist:

- [ ] **Month 1:** Set up read replicas
  - Configure replica in Supabase
  - Update Prisma clients
  - Route reads to replica

- [ ] **Month 2:** Implement sharding
  - Create 10 database shards
  - Implement routing logic
  - Migrate existing data

- [ ] **Month 3:** Add background jobs
  - Set up BullMQ
  - Move CSV processing to queue
  - Add email notifications

- [ ] **Month 4:** Add monitoring
  - Set up Sentry
  - Add performance tracking
  - Configure alerts

- [ ] **Month 5:** Add rate limiting
  - Implement per-IP limits
  - Add per-user limits
  - Monitor abuse patterns

- [ ] **Month 6:** Optimize search
  - Add full-text search indexes
  - Test search performance
  - Fine-tune relevance

### 💰 Phase 2 Monthly Cost:
- Supabase: $100/month (with read replicas)
- Vercel: $20/month
- Redis: $50/month (larger instance)
- S3: $20/month (1TB)
- Sentry: $26/month
- Background Jobs: $30/month (Inngest)
- Monitoring: $30/month
- **Total: ~$276/month** (for 100K companies)

---

## 🌍 Phase 3: 100K+ Companies (Global Scale)

### New Tools Required:

#### 1. **Multi-Region Database**
**Purpose:** Serve users from nearest region

**Options:**
- **CockroachDB** - $295/month (serverless)
- **AWS Aurora Global** - $1,000+/month
- **PlanetScale** - Serverless MySQL, $29-999/month
- **Neon** - Serverless Postgres with branching

**CockroachDB Setup:**
```bash
npm install @cockroachdb/prisma-generator
```

```typescript
// Multi-region configuration
datasource db {
  provider = "cockroachdb"
  url      = env("DATABASE_URL")
}

// Data partitioned by region
model Company {
  id     String @id
  region String  // us-east, eu-west, ap-south
  
  @@index([region])
}
```

---

#### 2. **Edge Functions**
**Purpose:** Run code closer to users globally

**Options:**
- **Vercel Edge Functions** - Included in Pro plan
- **Cloudflare Workers** - $5/month for 10M requests
- **AWS Lambda@Edge** - $0.60 per 1M requests

**Vercel Edge Functions:**
```typescript
// app/[company]/careers/route.ts
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // This runs at the edge, close to users
  const company = await fetch(`https://api.yourapp.com/companies/${slug}`)
  
  return new Response(JSON.stringify(company), {
    headers: {
      'Cache-Control': 'public, s-maxage=300',
      'Content-Type': 'application/json'
    }
  })
}
```

---

#### 3. **Global CDN with Edge Caching**

**Cloudflare Workers + KV Storage:**
```bash
npm install @cloudflare/workers-types
```

```typescript
// Cloudflare Worker
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const cacheKey = url.pathname
    
    // Check edge cache
    const cached = await env.KV.get(cacheKey)
    if (cached) return new Response(cached)
    
    // Fetch from origin
    const response = await fetch(request)
    const data = await response.text()
    
    // Cache at edge for 5 minutes
    await env.KV.put(cacheKey, data, { expirationTtl: 300 })
    
    return new Response(data)
  }
}
```

---

#### 4. **Database Connection Management**

**Prisma Data Proxy (Serverless):**
```bash
npm install @prisma/client@latest
npx prisma generate --data-proxy
```

```typescript
// Use Prisma Data Proxy for edge functions
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Data proxy URL for edge
  // postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
}
```

---

#### 5. **Advanced Caching Layer**

**Multi-Tier Caching:**
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const L1_CACHE = new Map() // In-memory (edge)
const L2_CACHE = Redis.fromEnv() // Redis (regional)

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  // L1: Check memory cache
  if (L1_CACHE.has(key)) {
    return L1_CACHE.get(key)
  }
  
  // L2: Check Redis cache
  const cached = await L2_CACHE.get(key)
  if (cached) {
    L1_CACHE.set(key, cached)
    return JSON.parse(cached as string)
  }
  
  // L3: Fetch from database
  const data = await fetcher()
  
  // Update caches
  await L2_CACHE.setex(key, ttl, JSON.stringify(data))
  L1_CACHE.set(key, data)
  
  return data
}

// Usage
const company = await getCached(
  `company:${slug}`,
  () => prisma.company.findUnique({ where: { slug } }),
  300 // 5 minutes
)
```

---

#### 6. **Load Balancer**

**Options:**
- **Cloudflare Load Balancing** - $5/month
- **AWS ALB** - $16/month + traffic
- **Vercel (automatic)** - Included

**Setup is automatic with Vercel** ✅

---

#### 7. **Advanced Monitoring**

**Required Tools:**

**A) Distributed Tracing:**
- **Datadog APM** - $31/host/month
- **New Relic** - $25/user/month
- **Honeycomb** - $100/month

**B) Real User Monitoring (RUM):**
- **Vercel Analytics** - $10/month
- **Google Analytics 4** - Free
- **PostHog** - $0-450/month

**C) Database Monitoring:**
- **Supabase Metrics** - Built-in
- **Datadog Database Monitoring** - $70/host/month

---

### Phase 3 Implementation Checklist:

- [ ] **Quarter 1:** Multi-region setup
  - Deploy to 3 regions (US, EU, APAC)
  - Set up CockroachDB or Aurora Global
  - Configure geo-routing

- [ ] **Quarter 2:** Edge optimization
  - Move to edge functions
  - Set up edge caching (Cloudflare Workers)
  - Optimize for latency

- [ ] **Quarter 3:** Advanced caching
  - Implement multi-tier caching
  - Add cache warming
  - Monitor hit rates

- [ ] **Quarter 4:** Enterprise features
  - Add SSO (SAML)
  - Custom domains per company
  - White-label options
  - Advanced analytics

### 💰 Phase 3 Monthly Cost:
- CockroachDB: $295/month (serverless)
- Vercel: $20/month (or $150 for Enterprise)
- Cloudflare Workers: $5/month
- Redis (Enterprise): $100/month
- S3/R2: $100/month (5TB)
- Monitoring: $200/month (Datadog)
- CDN: $50/month
- **Total: ~$770/month** (for 100K+ companies)

**Or go serverless:**
- PlanetScale: $400/month
- Vercel: $150/month (Enterprise)
- Upstash: $80/month
- Cloudflare: $20/month
- **Total: ~$650/month**

---

## 📦 Complete Tool Stack Comparison

| Tool | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| **Database** | Supabase $25 | Supabase $100 | CockroachDB $295 |
| **Caching** | Upstash $10 | Redis $50 | Redis Enterprise $100 |
| **Storage** | S3/R2 $5 | S3/R2 $20 | S3/R2 $100 |
| **CDN** | Cloudflare Free | Cloudflare Free | Cloudflare Workers $5 |
| **Monitoring** | - | Sentry $26 | Datadog $200 |
| **Queue** | - | Inngest $30 | Inngest $50 |
| **Search** | Built-in | PostgreSQL FTS | Algolia $100 |
| **Edge** | Vercel $20 | Vercel $20 | Vercel Ent $150 |
| **Total/mo** | **$60** | **$276** | **$770** |

---

## 🛠️ Installation Commands Summary

### Phase 1:
```bash
# Redis caching
npm install ioredis @upstash/redis

# S3 storage
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Image optimization (built-in with Next.js)
# Nothing to install!
```

### Phase 2:
```bash
# Background jobs
npm install bullmq @bull-board/express

# Rate limiting
npm install @upstash/ratelimit

# Monitoring
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Performance tracking
npm install web-vitals
```

### Phase 3:
```bash
# Multi-region database
npm install @cockroachdb/prisma-generator

# Edge runtime (built-in with Vercel)
# Nothing to install!

# Advanced monitoring
npm install @datadog/browser-rum
npm install dd-trace  # APM
```

---

## 🎯 Decision Tree: When to Upgrade

```
Current Traffic: < 1K companies
├─ Everything working fine? → Stay on Phase 0
└─ Slow queries? → Add database indexes

Current Traffic: 1K-10K companies
├─ Page load > 3s? → Add Redis cache (Phase 1)
├─ Large images? → Add S3 + CDN (Phase 1)
└─ All good? → Stay on Phase 1

Current Traffic: 10K-100K companies
├─ Database CPU > 80%? → Add read replicas (Phase 2)
├─ CSV uploads timing out? → Add background jobs (Phase 2)
├─ Getting abused? → Add rate limiting (Phase 2)
└─ All good? → Stay on Phase 2

Current Traffic: > 100K companies
├─ Users complaining about latency? → Go multi-region (Phase 3)
├─ Want to go global? → Add edge functions (Phase 3)
└─ Need enterprise features? → Phase 3
```

---

## ✅ Quick Start Recommendations

### Start with Phase 1 when you reach:
- 1,000 companies
- Page loads > 2 seconds
- Database queries > 200ms
- Storage > 50GB of images

### Start with Phase 2 when you reach:
- 10,000 companies
- Database CPU > 80%
- Need 99.9% uptime SLA
- Background processing needed

### Start with Phase 3 when you reach:
- 100,000 companies
- International users (multi-region)
- Enterprise contracts
- Custom domain requirements

---

## 📚 Learning Resources

### For Phase 1:
- [Redis Caching Guide](https://redis.io/docs/manual/client-side-caching/)
- [AWS S3 Basics](https://docs.aws.amazon.com/s3/)
- [Cloudflare CDN Setup](https://developers.cloudflare.com/cache/)

### For Phase 2:
- [Database Read Replicas](https://supabase.com/docs/guides/platform/read-replicas)
- [BullMQ Guide](https://docs.bullmq.io/)
- [Database Sharding](https://www.digitalocean.com/community/tutorials/understanding-database-sharding)

### For Phase 3:
- [CockroachDB Multi-Region](https://www.cockroachlabs.com/docs/stable/multiregion-overview.html)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

---

## 🎉 Conclusion

You have a clear roadmap to scale from 0 to 100K+ companies! Start small, monitor your metrics, and upgrade when you see the signals. Your current architecture is solid and ready for Phase 1 upgrades when needed.

**Key Takeaway:** Don't over-engineer early. Add complexity only when you have the data to justify it! 📊
