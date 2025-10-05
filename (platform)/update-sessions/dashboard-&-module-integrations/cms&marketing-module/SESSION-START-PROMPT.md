# CMS & Marketing Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-8).

---

## 📋 Session Start Prompt

```
I'm starting Session {SESSION_NUMBER} of the CMS & Marketing (ContentPilot) integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\cms&marketing-module\session{SESSION_NUMBER}.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

3. **Create Detailed Todo List:**
   - Break down the session plan into actionable todo items
   - Use the TodoWrite tool to create an in-depth todo list with:
     * Specific, granular tasks (not vague descriptions)
     * Proper status (pending/in_progress/completed)
     * Active form descriptions for in-progress items
   - Include todos for:
     * Reading/analyzing existing code
     * Creating new files
     * Modifying existing files
     * Testing implementations
     * Validating security/RBAC/multi-tenancy
     * Any additional tasks from the session plan

4. **Important Reminders:**
   - ALWAYS read files before editing them
   - Follow the READ-BEFORE-EDIT MANDATE from CLAUDE.md
   - Maintain multi-tenancy (organizationId on all queries)
   - Enforce RBAC permissions on all Server Actions
   - Use Supabase MCP tools for all database operations (schema changes, migrations, queries)
   - Validate all input with Zod schemas
   - Add proper error handling and loading states
   - Ensure mobile responsiveness
   - Check subscription tier limits for content features

5. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

6. **Content-Specific Requirements:**
   - Rich text editor: Use TipTap for WYSIWYG editing
   - Media uploads: Use Supabase Storage with sharp for optimization
   - SEO tools: Implement meta tag validation and optimization
   - Multi-platform: Support Facebook, Twitter, Instagram, LinkedIn
   - Analytics: Track views, engagement, campaign performance
   - Scheduling: Support content and campaign scheduling

7. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\cms&marketing-module\session{SESSION_NUMBER}-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Next steps / what's ready for next session
     * Overall progress percentage for the entire ContentPilot integration

Let's begin Session {SESSION_NUMBER}!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] RBAC permissions added and tested
- [ ] Subscription tier limits checked (GROWTH+ for content features)
- [ ] Input validation with Zod implemented
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created
- [ ] Ready to proceed to next session

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every ContentPilot model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't create duplicate code** - Check if components/modules already exist
6. **Don't forget revalidatePath** - Call after mutations for fresh data
7. **Don't skip error handling** - Wrap database calls in try/catch
8. **Don't hardcode values** - Use environment variables and configs
9. **Don't forget tier limits** - Content features require GROWTH tier or higher
10. **Don't skip media optimization** - Always optimize images with sharp

---

## 📊 Session Overview

**Session 1: Database Schema & Foundation**
- Add ContentPilot tables to Prisma schema
- Implement RLS policies
- Create database migration

**Session 2: Content Module - Backend & Validation**
- Build content management backend
- Implement Zod validation
- Create content server actions

**Session 3: Media Library - Upload & Management**
- Supabase Storage integration
- File upload with optimization
- Folder management system

**Session 4: Content Editor UI - Rich Text & Publishing**
- Integrate TipTap rich text editor
- Build content editor UI
- Implement SEO panel

**Session 5: Campaign Management - Email & Social**
- Create campaign module
- Build email campaign builder
- Implement social media scheduler

**Session 6: Analytics & Reporting - Performance Insights**
- Build analytics dashboard
- Implement performance tracking
- Create export functionality

**Session 7: Navigation & Dashboard Integration**
- Update platform navigation
- Create main dashboard
- Implement breadcrumbs

**Session 8: Testing, Polish & Go-Live**
- Comprehensive testing
- Performance optimization
- Production deployment

---

## 🔑 Key Technical Details

**Tech Stack:**
- Rich Text: TipTap (React)
- Media Upload: Supabase Storage + Sharp
- Charts: Recharts
- Drag-Drop: react-dropzone
- Forms: React Hook Form + Zod

**Database Tables:**
- ContentItem, ContentCategory, ContentTag
- MediaAsset, MediaFolder
- Campaign, EmailCampaign, SocialMediaPost
- ContentRevision, ContentComment

**Feature Access:**
- FREE/STARTER: No content features
- GROWTH: 100 content items, 500 media, 5 campaigns/month
- ELITE: Unlimited content, media, campaigns

**Permissions:**
- `canAccessContent`: Employee + Member+ org role
- `canPublishContent`: Owner/Admin only
- `canManageCampaigns`: Owner/Admin only

---

## 📁 File Organization

```
lib/modules/content/
├── content/          # Content management
├── media/            # Media library
├── campaigns/        # Campaign management
└── analytics/        # Analytics & reporting

components/real-estate/content/
├── dashboard/        # Main dashboard
├── editor/           # Rich text editor
├── media/            # Media library UI
├── campaigns/        # Campaign UI
├── analytics/        # Analytics UI
└── shared/           # Shared components

app/real-estate/content/
├── dashboard/        # Main dashboard route
├── editor/           # Content editor routes
├── library/          # Media library route
├── campaigns/        # Campaign routes
└── analytics/        # Analytics route
```

---

**Remember:** ContentPilot is a comprehensive CMS & Marketing module. Each component must work seamlessly together while maintaining security, performance, and user experience standards.

**Last Updated:** 2025-10-05
