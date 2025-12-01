# Collaboration Features

## Overview

Team members can collaborate on the careers page using the comment system. Comments are available in preview mode and allow for asynchronous feedback and discussion on every major component.

## Comment System

### Where Comments Appear

Comments are available on:
- **Header/Navigation** - Discuss logo, navigation links, company name
- **Banner/Hero** - Feedback on banner images, carousel settings
- **Culture Video** - Comments on video content and placement
- **Custom Sections** - Each About Us, Culture, Values section has its own comment thread
- **Jobs Section** - General feedback on the jobs area
- **Individual Job Cards** - Comment on specific job postings
- **Footer** - Discuss footer content, links, copyright text

### Comment Features

#### 1. @Mentions
- Type `@` in the comment box to see a dropdown of team members
- Autocomplete filters by name or email as you type
- Mentioned users are stored in the `mentions` JSON field
- Future enhancement: Email notifications to mentioned users

#### 2. Comment Display
- Shows commenter's name and email
- Relative timestamps: "Just now", "5m ago", "2h ago", or date
- Scrollable list when multiple comments exist
- Fixed-position panel in top-right corner (doesn't go off-screen)

#### 3. Real-time Updates
- Comments fetched when panel opens
- Refreshed after posting a new comment
- Currently no polling (manual refresh by closing/reopening panel)
- Future enhancement: WebSocket or polling for live updates

### Technical Implementation

#### Database Schema
```prisma
model SectionComment {
  id          String      @id @default(cuid())
  sectionId   String      // Links to any commentable section
  userEmail   String      // Who posted
  userName    String?     // Display name
  content     String      @db.Text
  mentions    Json?       // Array of mentioned user emails
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([sectionId, createdAt])
}
```

#### API Endpoints

**GET /api/sections/[sectionId]/comments**
- Fetches all comments for a section
- Returns array ordered by `createdAt`
- No authentication required (preview mode has session check)

**POST /api/sections/[sectionId]/comments**
- Creates a new comment
- Validates user session and company access
- Extracts mentions from content using regex `/@(\S+)/g`
- Returns created comment

**GET /api/companies/[slug]/team**
- Fetches all team members for @mention autocomplete
- Returns users with email, name, and role
- Protected endpoint requiring company access

#### Component Architecture

**SectionComments Component**
- Props: `sectionId` (string), `companySlug` (string)
- State management for comments, mentions, panel visibility
- Fixed positioning with `max-h-[calc(100vh-6rem)]` for viewport fit
- Flexbox layout with scrollable comments area

**Section IDs**
- Custom sections: Use actual section.id from database
- System sections: Use generated IDs like `header-{companyId}`, `banner-{companyId}`
- Jobs: Use `jobs-{companyId}` for section, `job-{jobId}` for individual cards

## Role-Based Access

### ADMIN Role
- Full access to all features
- Can manage team members (add/remove users)
- Can publish/unpublish the careers page
- Can edit all content and settings
- Can view and post comments

### RECRUITER Role
- Can edit theme, sections, and jobs
- Can preview the page
- Can view and post comments
- **Cannot** publish/unpublish (needs ADMIN approval)
- **Cannot** manage team members or access Company Info tab

### Permission Checks
- Editor route: `middleware.ts` checks if user belongs to company
- Publish button: Hidden for RECRUITER role in UI
- Comment API: Validates user has access to company before saving
- Team API: Protected endpoint requiring session

## Future Enhancements

### Planned Features
1. **Email Notifications**
   - Send email to mentioned users
   - Digest of new comments
   - Subscribe/unsubscribe per section

2. **Comment Reactions**
   - Emoji reactions (👍, 👎, ❤️)
   - Quick feedback without writing text

3. **Resolved Status**
   - Mark comment threads as resolved
   - Filter to show only unresolved comments
   - Visual indicator for resolved threads

4. **Real-time Updates**
   - WebSocket connection for live comment updates
   - Show typing indicators
   - Presence indicators (who's viewing)

5. **Comment Search**
   - Full-text search across all comments
   - Filter by author, date range, section
   - Search within mentions

6. **Threaded Replies**
   - Reply to specific comments
   - Nested conversation threads
   - Collapse/expand threads

### Technical Considerations

**Scaling Comments**
- Current implementation: Fetch all comments per section
- For high-volume: Implement pagination (load 10 at a time)
- Consider denormalizing comment count to avoid expensive COUNT queries
- Add caching for comment threads (Redis)

**Performance**
- No polling currently (fetch on open only)
- Option 1: Poll every 10 seconds when panel open
- Option 2: WebSocket with Socket.io for real-time
- Option 3: Server-Sent Events (SSE) for one-way updates

**Data Retention**
- No automatic deletion currently
- Consider archiving comments older than 6 months
- Export comments before deleting sections
- Soft delete instead of hard delete

## Usage Examples

### Scenario 1: Banner Feedback
1. Admin uploads new banner images
2. Opens preview mode, clicks comment on banner
3. "@john @sarah What do you think of these new images?"
4. John and Sarah see comment, provide feedback
5. Admin makes adjustments, posts "Updated based on feedback ✓"

### Scenario 2: Job Description Review
1. Recruiter adds new Software Engineer job
2. Opens preview, comments on job card
3. "@manager Can you review this description?"
4. Manager clicks comment, adds suggestions
5. Recruiter edits job based on feedback
6. Posts "Changes made, ready to publish"
7. Admin publishes the page

### Scenario 3: Section Collaboration
1. Team discussing Culture section rewrite
2. Multiple comments with different ideas
3. Use @mentions to assign tasks
4. Each person adds their part
5. Final review with "@everyone Please approve"
6. Admin publishes when consensus reached

## Migration Guide

### Enabling Comments on Existing Pages

If you have an existing careers page without comments:

1. **Database Migration**
   ```bash
   npx prisma db push
   ```
   This creates the `section_comments` table

2. **Add Comment Buttons**
   - Already integrated in `preview-client.tsx`
   - Comment buttons appear automatically in preview mode

3. **No Data Migration Needed**
   - Comments are new feature
   - No existing data to migrate
   - Old sections work with new comment system

### Disabling Comments

If you want to remove the comment feature:

1. Remove `<SectionComments>` components from `preview-client.tsx`
2. Delete comment API routes
3. Optionally drop `section_comments` table
4. Keep schema if you might re-enable later

## Best Practices

### For Admins
- Set clear guidelines for comment usage
- Encourage constructive feedback
- Resolve comments when addressed
- Archive old comment threads

### For Team Members
- Be specific in feedback
- Use @mentions to direct comments
- Check comments before publishing
- Mark important comments with emoji

### For Development
- Always validate user has company access
- Sanitize comment content (prevent XSS)
- Use transactions when updating related data
- Index sectionId for fast comment queries
- Consider rate limiting comment creation

## Troubleshooting

### Comments Not Showing
- Check if user is in preview mode (not public careers page)
- Verify section ID is correct
- Check browser console for API errors
- Confirm database connection is working

### @Mentions Not Working
- Ensure team members API returns data
- Check regex pattern for @ detection
- Verify dropdown positioning (might be off-screen)
- Test with different browsers

### Performance Issues
- Too many comments? Implement pagination
- Slow queries? Add database indexes
- Memory issues? Clear old comments
- Network slow? Add caching layer
