# Agent Log - AI Tool Usage

## Project Context
Built a multi-tenant Hire Stack in 3 days using Next.js, Prisma, and PostgreSQL.

## How I Used AI

### Initial Setup (Day 1)
Started with basic Next.js app, asked Copilot to:
- Generate Prisma schema for multi-tenant architecture
- Showed it similar schema from another project
- It suggested using companyId as foreign key everywhere
- Added cascade deletes myself after realizing orphaned records issue

Prompt example: "create prisma schema for companies with themes, sections, and jobs"

### Building Editor (Day 1-2)
Used Copilot inline suggestions heavily for:
- Form state management (lots of useState hooks)
- Event handlers for theme updates
- Drag-drop logic with @dnd-kit

Where I got stuck:
- DnD sorting wasn't working correctly
- Asked Claude: "dnd-kit sections not reordering, here's my code"
- It pointed out I wasn't updating the `order` field
- Fixed by adding explicit order recalculation on drop

Refinement: Changed from react-beautiful-dnd to @dnd-kit after Copilot suggested it's better maintained.

### Styling Issues (Day 2)
Font changes weren't applying on preview page.
- Tried CSS modules first (didn't work with dynamic values)
- Asked: "how to apply dynamic font-family in next.js"
- Got suggestion to use inline styles + global CSS injection
- Combined both approaches, worked perfectly

Banner carousel:
- Initially used plain image switching
- User wanted auto-rotation with manual controls
- Wrote basic version, then asked Copilot to add pause-on-hover
- It generated the interval logic, I added the speed slider

### TypeScript Errors (Day 2-3)
Hit tons of type errors with Prisma's JSON fields.
- bannerUrls came back as JsonValue, not string[]
- Asked: "prisma json field typescript error"
- Solution was casting to `any` for theme interfaces
- Not ideal but pragmatic for demo

CSV import:
- Used papaparse library
- Copilot autocompleted most of the parsing logic
- Had to manually add validation for required fields

### Database Seeding (Day 3)
Wrote seed.ts manually but used Copilot for:
- Generating 15 sample job listings
- Prompt: "generate diverse job listings with different locations and types"
- It created good variety, I edited departments and salaries

Enum issues during deployment:
- Vercel build failed with "string not assignable to SectionType"
- Fixed by importing enums and using SectionType.ABOUT instead of 'ABOUT'
- Copilot didn't catch this, found it through build errors

### Authentication (Day 1)
NextAuth setup:
- Followed official docs first
- Used Copilot for boilerplate (credentials provider config)
- Middleware protection logic was mostly AI-generated
- I added the role-based checks manually

Password hashing:
- Asked: "best way to hash passwords in next.js"
- Used bcryptjs as suggested
- Copilot completed the hash/compare functions

### Production Prep (Day 3)
Asked Claude: "what files should I clean up before deploying"
- It listed unused dependencies
- Ran npm uninstall for 72 packages (!!)
- Created setup.bat script with AI help
- Wrote .gitignore rules myself, then AI enhanced it

Toast notifications:
- User wanted non-blocking notifications
- I knew about Sonner library
- Asked Copilot to replace all alert() calls
- It did 90% correctly, I fixed a few edge cases

### Deployment Debugging
Multiple TypeScript errors on Vercel:
1. JSON field types → added casting
2. Implicit any in map functions → added type annotations  
3. Enum usage in seed → imported proper types

Each fix was: see error → ask Copilot "how to fix X" → apply solution → test → push

## Learnings

### What Worked Well
- Copilot is great for boilerplate (forms, handlers, configs)
- Claude good for architectural questions
- Inline suggestions saved hours on repetitive code
- AI caught some bugs I would have missed

### What Didn't Work
- AI suggested outdated Next.js patterns (pages router instead of app router)
- TypeScript types from AI were often too loose or too strict
- Had to manually fix multi-column section layout (AI didn't understand the grid logic)
- Drag-drop state management needed human debugging

### When I Went Manual
- Database schema design (too important to delegate)
- Multi-tenant isolation logic (security critical)
- Section ordering algorithm (business logic)
- Error handling patterns (wanted consistency)
- Mobile responsive breakpoints (needed pixel-perfect)

### Time Saved
Rough estimate: AI saved 30-40% of coding time.
- Would've taken 5-6 days without AI
- Finished in 3 days with AI help
- Most savings on: boilerplate, type definitions, config files

### Productivity Tips
1. Give AI specific code context, not vague descriptions
2. Ask for explanations when solution seems odd
3. Always test AI-generated code (don't trust blindly)
4. Use AI for scaffolding, human for logic
5. Iterate with AI: generate → test → refine → ask again

## Specific Prompts That Worked

Good prompt:
"Create a Next.js API route that updates company theme with these fields: primaryColor, secondaryColor, bannerUrls (array). Use Prisma and return JSON."

Bad prompt:
"Make my theme update work"

Good prompt:
"Fix this TypeScript error: Type 'JsonValue' is not assignable to type 'string[]'. Here's my interface: [code]"

Bad prompt:
"Types are broken"

## Final Thoughts
AI is a tool, not a replacement. It's like having a junior developer who's fast but needs supervision. Best results came from:
- Me designing the architecture
- AI generating the implementation
- Me reviewing and refining
- AI helping debug issues

Would I build this without AI? Yes, but slower.
Would I trust AI to build it alone? Absolutely not.
