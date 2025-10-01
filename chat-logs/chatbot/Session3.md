# Session 3 - Phase 8: Cleanup & Documentation

**Goal:** Remove old files, finalize documentation, complete integration
**Status:** 32/32 files migrated | Phase 8/8 (final phase)
**Time:** ~30-45 minutes

---

## Phase 8 Objectives (from CHATBOT-INTEGRATION-GUIDE.md)

### 1. Cleanup Old Chatbot Folder
**Verify backups exist, then remove legacy folder**

```bash
# Step 1: Verify backup exists
ls chatbot-backup/
# Should show: app/, components/, hooks/, lib/, etc.

# Step 2: Verify new location working
ls app/lib/modules/chatbot/
ls app/app/\(chatbot\)/

# Step 3: Remove old folder
rm -rf chatbot/
# Or if you want to keep as archive: mv chatbot/ archive/old-chatbot/
```

---

### 2. Update package.json Scripts
**Add chatbot-specific development and testing scripts**

Add to `app/package.json`:
```json
{
  "scripts": {
    "dev:chatbot": "Next.js dev server focuses on chatbot routes",
    "test:chatbot": "Run chatbot-specific tests",
    "db:setup-rag": "Instructions to run SUPABASE-RAG-SETUP.sql"
  }
}
```

**Note:** Exact script names and commands TBD based on project needs

---

### 3. Create Module README
**Document the chatbot module for future developers**

**File:** `app/lib/modules/chatbot/README.md`

**Should include:**
- Architecture overview
- Environment variables needed
- Setup instructions
- API endpoints
- Testing guide
- Troubleshooting

**References:**
- `RAG-CONFIGURATION-OPTIONS.md` (architecture decisions)
- `RAG-SYSTEM-STATUS.md` (current implementation)
- `CHATBOT-ENV-CHECKLIST.md` (environment setup)
- `SUPABASE-RAG-SETUP.sql` (database setup)

---

### 4. Final Verification
**Test all chatbot functionality**

#### Development Server Test
```bash
# Start dev server
npm run dev

# Test routes (in browser)
http://localhost:3000/           # Should redirect to /full
http://localhost:3000/full       # Full-page chatbot
http://localhost:3000/widget     # Widget mode
```

#### Functional Tests
- [ ] Chat interface loads
- [ ] Can send messages
- [ ] Receives responses from Groq API
- [ ] Streaming works
- [ ] Error handling works
- [ ] Calendly button appears
- [ ] Responsive design works
- [ ] Widget mode embeds correctly

#### RAG Tests (requires OPENAI_API_KEY)
- [ ] Embeddings generate without error
- [ ] Vector search executes (may return empty if no conversations)
- [ ] RAG context adds to system prompt
- [ ] Caching works (check console logs)

#### API Tests
```bash
# Test chat API endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "sessionId": "test-session",
    "industry": "strive"
  }'
```

---

## Optional Tasks

### Fix ESLint Build Errors
**Only if build is required for deployment**

**Option A: Fix types in chatbot files (recommended)**
```typescript
// rag-service.ts line 120
let examples: Array<{
  id: string;
  user_input: string;
  assistant_response: string;
  problem_type?: string;
  solution_type?: string;
  outcome?: string;
  conversion_score?: number;
  similarity: number;
}> = [];

// rag-service.ts line 263
conversationHistory: {
  stage: string;
  messageCount: number;
  problemsDiscussed: string[];
}
```

**Option B: Adjust ESLint config**
```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn" // Change from "error"
  }
}
```

### Set Up Supabase RAG Functions
**Run the SQL setup for full RAG functionality**

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/bztkedvdjbxffpjxihtc/sql
2. Copy contents of `SUPABASE-RAG-SETUP.sql`
3. Run the script
4. Verify pgvector enabled: `SELECT * FROM pg_extension WHERE extname = 'vector';`

### Add Training Examples
**Populate example_conversations table for better RAG results**

```sql
-- Add after running SUPABASE-RAG-SETUP.sql
-- See bottom of that file for example INSERT statements
```

---

## Key Commands

### Verification
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (if ESLint fixed)
npm run build

# Dev server
npm run dev
```

### Testing
```bash
# Check routes exist
curl -I http://localhost:3000/full
curl -I http://localhost:3000/widget
curl -I http://localhost:3000/api/chat

# Check Supabase connection
npx prisma studio
# Look for "Conversation" model
```

### Cleanup
```bash
# Remove old chatbot folder
rm -rf chatbot/

# Or archive it
mkdir -p archive/
mv chatbot/ archive/old-chatbot-$(date +%Y%m%d)/
```

---

## Success Criteria

### Must Have
- [x] Old chatbot folder removed or archived
- [ ] Chatbot scripts added to package.json
- [ ] Module README created
- [ ] Dev server runs without errors
- [ ] Can send/receive chat messages
- [ ] Subdomain routing works (/, /full, /widget)

### Should Have
- [ ] OPENAI_API_KEY configured
- [ ] Supabase RAG functions set up
- [ ] Vector search working
- [ ] Training examples added
- [ ] ESLint build errors resolved

### Nice to Have
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] Analytics integrated
- [ ] E2E tests written

---

## Documentation Checklist

### Files That Exist
- [x] `RAG-CONFIGURATION-OPTIONS.md` - Architecture guide
- [x] `RAG-SYSTEM-STATUS.md` - Implementation status
- [x] `SUPABASE-RAG-SETUP.sql` - Database setup
- [x] `CHATBOT-ENV-CHECKLIST.md` - Environment guide
- [x] `.env.local.example` - Template with placeholders
- [x] Session1_Summary.md - First session recap
- [x] Session2_Summary.md - Second session recap

### Files Needed
- [ ] `lib/modules/chatbot/README.md` - Module documentation
- [ ] Session3_Summary.md - Final session recap
- [ ] Updated QUICK_STATUS.md - Mark as 100% complete

---

## Troubleshooting Guide

### "Module not found" errors
- Check import paths use `@/` alias
- Verify file is in correct location
- Check for typos in file names (case-sensitive)

### "Environment variable not found"
- Check `.env.local` exists in `app/` directory
- Verify variable names match exactly
- Restart dev server after changing .env

### Chatbot routes 404
- Check middleware.ts for subdomain logic
- Verify `(chatbot)` route group exists
- Check layout.tsx in chatbot route group

### RAG not working
- Verify OPENAI_API_KEY is set (not placeholder)
- Check Supabase functions exist (run SQL script)
- Look for errors in browser console
- Check network tab for API call failures

### Streaming not working
- Check GROQ_API_KEY is valid
- Verify API route is returning ReadableStream
- Check for CORS issues
- Look for errors in server logs

---

## Post-Integration Tasks

### Deployment
1. Deploy to Vercel/production
2. Configure subdomain: chatbot.strivetech.ai
3. Set environment variables in hosting platform
4. Run database migrations in production
5. Test production deployment

### Monitoring
1. Set up error tracking (Sentry, etc.)
2. Configure analytics (Mixpanel, GA4)
3. Monitor API costs (OpenAI, Groq)
4. Track performance metrics
5. Set up alerts for failures

### Optimization
1. Monitor cache hit rates
2. Optimize vector search performance
3. Add more training examples
4. Fine-tune conversation detection
5. A/B test different prompts

---

## Integration Checklist

### Code
- [x] All files migrated to `app/`
- [x] Import paths use `@/` alias
- [x] No cross-module imports
- [x] Server-only guards in place
- [x] Type safety (0 TS errors)
- [x] File size limits met

### Database
- [x] Conversation model in Prisma schema
- [x] Migration applied to Supabase
- [x] Relation to Organization added
- [ ] pgvector extension enabled
- [ ] Vector search functions created
- [ ] Indexes created

### Environment
- [x] All Supabase keys configured
- [x] GROQ_API_KEY set
- [x] Database URLs set
- [ ] OPENAI_API_KEY set (required for RAG)
- [x] Template file updated

### Routes
- [x] `(chatbot)/layout.tsx` configured
- [x] `(chatbot)/full/page.tsx` exists
- [x] `(chatbot)/widget/page.tsx` exists
- [x] API route at `/api/chat`
- [x] Middleware handles subdomain

### Testing
- [ ] Dev server runs
- [ ] Routes load correctly
- [ ] Chat sends/receives messages
- [ ] Streaming works
- [ ] Error handling works
- [ ] Responsive design works

### Documentation
- [x] Architecture documented
- [x] Environment variables documented
- [x] Database setup documented
- [ ] Module README created
- [ ] Session summaries complete

---

## Handoff for Production

### Before Deploying
1. Set OPENAI_API_KEY in production environment
2. Run SUPABASE-RAG-SETUP.sql in production database
3. Verify all environment variables set
4. Test build passes: `npm run build`
5. Test production mode locally: `npm run start`

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Subdomain DNS configured
- [ ] SSL certificates valid
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Monitoring alerts set up

### Post-Deployment
- [ ] Test chatbot.strivetech.ai loads
- [ ] Test full-page mode
- [ ] Test widget embed
- [ ] Test chat functionality
- [ ] Verify RAG working
- [ ] Check error logs
- [ ] Monitor API costs

---

## Known Limitations

### Current State
- **RAG:** Vector search returns empty until training data added
- **Embeddings:** Require OPENAI_API_KEY (not free)
- **Supabase:** Functions need manual setup (run SQL)
- **Build:** Blocked by strict ESLint (easily fixable)
- **Testing:** No automated tests yet

### Future Improvements
- Add E2E tests with Playwright
- Implement conversation analytics dashboard
- Add admin panel for training data
- Implement conversation export/import
- Add support for multiple LLM providers
- Implement conversation rating system

---

## Session 3 Workflow

### Step 1: Verify Current State (5 min)
```bash
# Check git status
git status
git log --oneline -5

# Verify backup
ls chatbot-backup/

# Check new location
ls app/lib/modules/chatbot/
```

### Step 2: Cleanup (10 min)
```bash
# Remove old folder
rm -rf chatbot/

# Or archive
mv chatbot/ archive/old-chatbot/
```

### Step 3: Documentation (15 min)
- Create `lib/modules/chatbot/README.md`
- Update package.json scripts (if needed)
- Create Session3_Summary.md

### Step 4: Testing (15 min)
```bash
# Start dev server
npm run dev

# Test in browser:
# - http://localhost:3000/full
# - http://localhost:3000/widget
# - Send test messages
```

### Step 5: Final Commit (5 min)
```bash
git add .
git commit -m "Phase 8: Final cleanup and documentation"
git push
```

---

**Ready to complete the integration!** 🚀

**Estimated time:** 30-45 minutes
**Next steps:** Follow workflow above, verify all tests pass, deploy to production
