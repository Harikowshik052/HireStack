# Careers Page Customization Platform

A powerful, customizable careers page builder for companies to create and manage their job listings with branded design, banner carousel, and team collaboration.

## 🚀 Features

- 🎨 **Theme Customization**: Colors, fonts, logo, multiple banner carousel with auto/manual rotation
- 📝 **Dynamic Sections**: Drag-and-drop content sections with multi-column layouts  
- 💼 **Job Management**: Add, edit, delete jobs with CSV bulk import
- 👥 **Team Access Control**: Role-based permissions (Admin/Recruiter)
- 🎬 **Media Support**: Banner carousel, video showcase with autoplay
- 📱 **Fully Responsive**: Mobile-first design with glassmorphism UI
- 🔒 **Secure Authentication**: NextAuth.js with JWT
- 🔔 **Toast Notifications**: Beautiful Sonner toast system
- 🚀 **Production Ready**: Built with Next.js 14, TypeScript, Prisma

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router) with TypeScript
- React 18
- Tailwind CSS
- shadcn/ui components
- @dnd-kit for drag-and-drop

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (via Supabase)

**Authentication:**
- NextAuth.js v5
- Credential-based login
- Role-based access control

**Deployment:**
- Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase account recommended)

## 🏃 Getting Started

### Quick Setup (Windows)

Run the setup script:
```bash
scripts\setup.bat
```

### Manual Setup

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd careers-customization
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Database (Get from Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
# Generate secret with: openssl rand -base64 32

# Optional: Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
\`\`\`

### 4. Set up the database

\`\`\`bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
\`\`\`

### 5. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧪 Test Credentials

After seeding the database:

- **Email**: recruiter@techcorp.com
- **Password**: password123
- **Company Slug**: techcorp

**Test URLs:**
- Homepage: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Public Careers Page: `http://localhost:3000/techcorp/careers`
- Editor: `http://localhost:3000/techcorp/edit`
- Preview: `http://localhost:3000/techcorp/preview`

## 📖 User Guide

### For Recruiters

#### 1. Login
Navigate to `/login` and enter your credentials.

#### 2. Access Editor
After login, go to `/{your-company-slug}/edit` to customize your careers page.

#### 3. Customize Theme
- Go to the "Theme & Branding" tab
- Set your primary and secondary colors
- Add URLs for logo, banner image, and culture video

#### 4. Manage Sections
- Go to the "Page Sections" tab
- Click "Add Section" to create new sections
- Drag sections by the grip handle to reorder
- Click the expand button (▼) to edit content
- Use the eye icon to show/hide sections
- Click trash icon to delete sections
- HTML is supported in section content

#### 5. Update Company Info
- Go to the "Company Info" tab
- Update company name and description

#### 6. Save & Publish
- Click "Save Changes" to save your edits
- Click "Publish" to make the page live
- Click "Preview" to see how it looks before publishing

#### 7. Share Your Page
Share the public URL: `https://yourdomain.com/{your-company-slug}/careers`

### For Candidates

Simply visit the company's careers page URL. You can:
- Browse all open positions
- Search jobs by title
- Filter by location type (Remote/Onsite/Hybrid)
- Filter by job type (Full-time/Part-time/Contract/Internship)
- Read about the company through custom sections
- View job details

## 🏗️ Project Structure

\`\`\`
careers-customization/
├── app/
│   ├── [company]/              # Dynamic company routes
│   │   ├── careers/           # Public careers page
│   │   ├── edit/              # Protected editor
│   │   └── preview/           # Protected preview
│   ├── api/
│   │   ├── auth/              # NextAuth handlers
│   │   └── companies/         # Company API
│   ├── login/                 # Login page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Homepage
├── components/
│   ├── careers/               # Careers page components
│   ├── editor/                # Editor components
│   └── ui/                    # Reusable UI components
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── PRODUCTION_READY.md   # Production checklist
│   ├── SCALING_TOOLS.md      # Scaling guidelines
│   └── SETUP.md              # Setup instructions
├── data/                      # Sample data
│   ├── sample-jobs.csv       # Sample job listings
│   └── job-template.csv      # CSV template for import
├── scripts/                   # Automation scripts
│   ├── setup.bat             # Windows setup script
│   └── deploy-prep.bat       # Deployment preparation
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utility functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── middleware.ts             # Route protection
└── package.json
\`\`\`

## 🗄️ Database Schema

**Key Models:**
- \`User\` - Recruiter accounts with company association
- \`Company\` - Company profiles with slug for URLs
- \`CompanyTheme\` - Brand colors, logo, banner, video
- \`PageSection\` - Draggable content sections with ordering
- \`Job\` - Job postings with filters and search

See \`prisma/schema.prisma\` for full schema details.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your connection strings from Settings → Database
3. Add to Vercel environment variables
4. Run migrations: \`npx prisma db push\`
5. Seed data (optional): \`npm run db:seed\`

### Post-Deployment

1. Update \`NEXTAUTH_URL\` to your production URL
2. Generate a new \`NEXTAUTH_SECRET\` for production
3. Test authentication and page creation

## 🔮 Future Enhancements

### Phase 1 (Next Sprint)
- [ ] Rich text editor (TipTap) for section content
- [ ] Image upload to Supabase Storage
- [ ] Job application form and tracking
- [ ] Email notifications for new applications
- [ ] Analytics dashboard for page views

### Phase 2 (Scaling)
- [ ] Custom domains per company (Vercel API integration)
- [ ] Team collaboration (multiple recruiters per company)
- [ ] Section templates library
- [ ] A/B testing for careers pages
- [ ] Applicant tracking system (ATS) integration

### Phase 3 (Enterprise)
- [ ] Multi-language support
- [ ] Advanced SEO tools (structured data, sitemaps)
- [ ] Performance analytics
- [ ] White-label solution
- [ ] API for third-party integrations

## 🎨 Design Decisions

### Why Next.js App Router?
- Server-side rendering for SEO
- Dynamic routing for company slugs
- API routes for backend
- Fast and modern

### Why @dnd-kit?
- Lightweight and performant
- Built-in accessibility
- Active maintenance
- Better than react-beautiful-dnd

### Why Prisma?
- Type-safe database queries
- Great developer experience
- Easy migrations
- Works perfectly with PostgreSQL

### Why Single Deployment?
- Instant publishing (no build time)
- Simpler infrastructure
- Cost-effective
- Easy to maintain
- Scalable to hundreds of companies

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Protected routes redirect to login
- [ ] Session persists across refreshes

**Editor:**
- [ ] Update theme colors and see changes
- [ ] Add/remove/reorder sections
- [ ] Save changes and verify persistence
- [ ] Preview before publishing

**Public Page:**
- [ ] View published careers page
- [ ] Search jobs by title
- [ ] Filter by location and job type
- [ ] Mobile responsive layout
- [ ] Unpublished pages return 404

## 🤝 Contributing

This is an assignment project, but feedback is welcome!

## 📝 License

MIT License - feel free to use this for learning purposes.

## 👨‍💻 Author

Built by [Your Name] for the Whitecarrot ATS Assignment

## 🙏 Acknowledgments

- Design inspiration from Workable, Ashby HQ, and other modern ATS platforms
- shadcn/ui for beautiful components
- Vercel for seamless deployment
- Supabase for excellent database hosting

---

**Note**: This project was built with assistance from AI tools (GitHub Copilot, Claude) for rapid development. See AGENT_LOG.md for details on AI usage.
