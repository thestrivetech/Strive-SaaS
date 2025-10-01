# Session 2 - Phases 6-8: Database Integration, Testing, & Cleanup

**Goal:** Complete chatbot integration with database, testing, and final cleanup
**Status:** 32/32 files migrated | 5/8 phases complete (62.5%)
**Time:** ~1.5-2 hours remaining

---

## 📋 Quick Start

### Pre-Session Checklist
- [ ] Read `Session1_Summary.md` for context
- [ ] Verify backups exist: `ls -la | grep backup`
- [ ] Check git status: `git status`
- [ ] Confirm on main branch: `git branch`

### Session Files to Reference
1. `CHATBOT-INTEGRATION-GUIDE.md` - Complete guide
2. `Session1_Summary.md` - Previous session recap
3. `QUICK_STATUS.md` - One-page status

---

## 🎯 Phase 6: Database Integration (30 min)

### Objective
Add Conversation model to Prisma schema and integrate with RAG service for storing chat history and analytics.

### Tasks

#### 6.1 Add Prisma Schema (10 min)

**File:** `app/prisma/schema.prisma`

```prisma
// Add to existing schema
model Conversation {
  id                   String   @id @default(uuid())
  organizationId       String   @map("organization_id")
  industry             String   @default("strive")
  sessionId            String   @map("session_id")
  userMessage          String   @map("user_message") @db.Text
  assistantResponse    String   @map("assistant_response") @db.Text
  embedding            Json?    // Store as JSON until pgvector setup
  problemDetected      String?  @map("problem_detected")
  solutionPresented    String?  @map("solution_presented")
  conversationStage    String   @map("conversation_stage")
  outcome              String?
  conversionScore      Float?   @map("conversion_score")
  bookingCompleted     Boolean  @default(false) @map("booking_completed")
  responseTimeMs       Int?     @map("response_time_ms")
  userSatisfaction     Int?     @map("user_satisfaction")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@map("conversations")
  @@index([organizationId])
  @@index([sessionId])
  @@index([industry])
}

// Update Organization model
model Organization {
  // ... existing fields ...
  conversations Conversation[]  // Add this line
}
```

#### 6.2 Generate Prisma Client (5 min)

```bash
cd app
npx prisma generate
```

**Expected Output:** "Generated Prisma Client"

#### 6.3 Create Migration (10 min)

```bash
cd app
npx prisma migrate dev --name add_chatbot_conversations
```

**What This Does:**
- Creates migration file in `prisma/migrations/`
- Applies migration to database
- Adds `conversations` table with all fields

**Verification:**
```bash
# Check migration created
ls app/prisma/migrations/ | grep add_chatbot

# Verify in Prisma Studio (optional)
npx prisma studio
# Navigate to Conversation model
```

#### 6.4 Update RAG Service (5 min)

**File:** `app/lib/modules/chatbot/services/rag-service.ts`

Add Prisma import and update storeConversation function:

```typescript
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';  // Add this
import { CacheService } from './cache-service';
// ... rest of imports

// Update or add this function
export async function storeConversation(data: {
  industry: string;
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  conversationStage: string;
  outcome?: string;
  problemDetected?: string;
  solutionPresented?: string;
  organizationId?: string;
}) {
  try {
    // Use default org ID if not provided (public chatbot)
    const orgId = data.organizationId || 'public-chatbot-org';

    return await prisma.conversation.create({
      data: {
        organizationId: orgId,
        industry: data.industry,
        sessionId: data.sessionId,
        userMessage: data.userMessage,
        assistantResponse: data.assistantResponse,
        conversationStage: data.conversationStage,
        outcome: data.outcome,
        problemDetected: data.problemDetected,
        solutionPresented: data.solutionPresented,
      }
    });
  } catch (error) {
    console.error('Failed to store conversation:', error);
    // Don't throw - logging failure shouldn't break chat
    return null;
  }
}
```

### Verification

```bash
# Type check
npx tsc --noEmit

# Check Prisma schema
npx prisma validate

# Verify migration applied
npx prisma migrate status
```

**Success Criteria:**
- [ ] Prisma client generated
- [ ] Migration created and applied
- [ ] No TypeScript errors
- [ ] RAG service updated

---

## 🧪 Phase 7: Testing & Verification (45 min)

### Objective
Verify the chatbot works end-to-end with type checking, linting, and functional testing.

### 7.1 Type Checking (5 min)

```bash
cd app
npx tsc --noEmit
```

**Expected:** 0 errors

**Common Issues:**
- Missing imports: Add to file
- Type mismatches: Check Prisma types
- Module not found: Clear `.next` cache

**Fix Commands:**
```bash
# Clear cache if errors
rm -rf .next
npm install
npx tsc --noEmit
```

### 7.2 Linting (5 min)

```bash
npm run lint
```

**Expected:** 0 warnings, 0 errors

**Auto-fix:**
```bash
npm run lint -- --fix
```

### 7.3 Build Test (10 min)

```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**Success Indicators:**
- Bundle size < 500kb for first load
- No build errors
- All pages generated

### 7.4 Development Server (5 min)

```bash
npm run dev
```

**Test URLs:**

**Localhost Testing (without subdomain):**
1. `http://localhost:3000/` → Should redirect to `/full`
2. `http://localhost:3000/full` → Full-page chatbot
3. `http://localhost:3000/widget` → Widget mode

**What to Check:**
- [ ] Pages load without errors
- [ ] Dark mode applied
- [ ] Welcome message displays
- [ ] Input field visible
- [ ] No console errors

### 7.5 API Endpoint Test (5 min)

```bash
# Test chat API (requires GROQ_API_KEY)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "sessionId": "test-123",
    "industry": "strive"
  }'
```

**Expected:** Streaming response or 400 if API key missing

**Without API Key:**
```json
{
  "error": "Internal server error"
}
```

**With API Key:**
- Streaming SSE response
- `data: {"content": "..."}` chunks
- `data: [DONE]` at end

### 7.6 Functional Testing Checklist (15 min)

**Chat Interface:**
- [ ] Welcome message appears
- [ ] Can type in input field
- [ ] Input expands with multi-line text
- [ ] Send button is clickable
- [ ] "Thinking..." shows when processing
- [ ] Response streams character by character
- [ ] Messages show in chat history
- [ ] Scroll auto-updates to bottom
- [ ] Avatar images load
- [ ] Timestamps display

**Error Handling:**
- [ ] Empty message shows validation error
- [ ] Network error shows retry option
- [ ] API error displays user-friendly message

**Responsive Design:**
- [ ] Mobile viewport (375px) works
- [ ] Tablet viewport (768px) works
- [ ] Desktop viewport (1920px) works

### Verification Commands

```bash
# Check for console errors in dev tools
# Network tab should show:
# - POST /api/chat (200 or streaming)
# - No 404s for assets
# - Images loading correctly

# Verify file sizes
ls -lh app/public/images/strive-wordmark.png

# Check component rendering
# Open React DevTools
# Verify component tree:
# - ChatbotRootPage
#   - ChatContainer
#     - ChatMessage (multiple)
#     - ChatInput
```

**Success Criteria:**
- [ ] Type checks pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Dev server starts
- [ ] Pages load
- [ ] Chat interface works (if API keys configured)
- [ ] No console errors
- [ ] Responsive on all viewports

---

## 🧹 Phase 8: Cleanup & Documentation (20 min)

### Objective
Remove old chatbot folder, update configuration, create documentation, and commit changes.

### 8.1 Verify Everything Works (5 min)

**CRITICAL: Only proceed if Phase 7 testing passed!**

```bash
# Final verification checklist
# [ ] Build successful
# [ ] No TypeScript errors
# [ ] Pages load correctly
# [ ] API endpoint responds (or gracefully errors without keys)
```

### 8.2 Remove Old Chatbot Folder (2 min)

```bash
# ONLY after verification!
rm -rf chatbot

# Verify removal
ls chatbot 2>/dev/null || echo "✓ Chatbot folder removed"
```

### 8.3 Update package.json Scripts (3 min)

**File:** `app/package.json`

Add chatbot-specific scripts:

```json
{
  "scripts": {
    // ... existing scripts ...
    "chatbot:seed": "tsx scripts/seed-chatbot-data.ts",
    "chatbot:test": "npm run lint && npm run type-check && npm run dev",
    "chatbot:studio": "npx prisma studio"
  }
}
```

### 8.4 Create Module README (5 min)

**File:** `app/lib/modules/chatbot/README.md`

```markdown
# Chatbot Module

AI-powered sales chatbot with RAG (Retrieval-Augmented Generation) capabilities.

## Features

- 🤖 Streaming responses via Groq LLM (llama-3.3-70b-versatile)
- 🔍 Semantic search with OpenAI embeddings
- 🎯 Industry-specific configurations
- 📊 Conversation analytics and tracking
- 💾 Persistent chat history with Prisma

## Structure

\`\`\`
chatbot/
├── config/industries/     # Industry-specific configs
├── constants/            # Shared constants
├── schemas/              # Zod validation schemas
├── services/             # Business logic (server-only)
├── types/                # TypeScript types
└── index.ts              # Public API
\`\`\`

## Usage

### Routes
- **Full Page:** \`https://chatbot.strivetech.ai/full\`
- **Widget:** \`https://chatbot.strivetech.ai/widget\`
- **API:** \`POST /api/chat\`

### Local Development
\`\`\`bash
# Start dev server
npm run dev

# Access chatbot
http://localhost:3000/full
http://localhost:3000/widget
\`\`\`

## Environment Variables

\`\`\`env
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## Database

The chatbot uses Prisma with the \`Conversation\` model for storing chat history.

\`\`\`bash
# Run migrations
npx prisma migrate dev

# Seed training data
npm run chatbot:seed

# View database
npm run chatbot:studio
\`\`\`

## Architecture

- **Server Components:** Direct database access
- **Client Components:** UI and interactivity only
- **API Routes:** Streaming chat endpoint
- **RAG Service:** Semantic search and context building

## Testing

\`\`\`bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Test chatbot
npm run chatbot:test
\`\`\`
\`\`\`

### 8.5 Git Commit (5 min)

```bash
# Check status
git status

# Add all changes
git add -A

# Commit with detailed message
git commit -m "feat: Integrate AI chatbot system

✅ Phases 1-8 Complete

Migration:
- Migrated 32 files to app/lib/modules/chatbot
- Created (chatbot) route group for subdomain
- Updated all imports to use @/ alias

Features:
- Groq-powered chat with streaming responses
- RAG with semantic search (OpenAI embeddings)
- Industry-specific configurations
- Conversation analytics and tracking
- Zod validation and error handling

Architecture:
- Module-based structure (lib/modules/chatbot)
- Server-only guards for services
- No cross-module imports
- All files under 500 lines

Database:
- Added Conversation model to Prisma
- Integrated with RAG service

Subdomain:
- chatbot.strivetech.ai → (chatbot) route group
- Middleware routing configured
- No authentication required

Dependencies:
- groq-sdk@^0.8.0
- framer-motion@^12.23.22
- react-hot-toast@^2.6.0

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Verify commit
git log -1 --stat
```

### 8.6 Optional: Remove Backups (Later)

```bash
# WAIT A FEW DAYS before removing backups!
# Only remove after stable operation

# Remove physical backups
rm -rf chatbot-backup app-backup

# Delete backup branch (optional)
git branch -D chatbot-integration-backup
```

**Success Criteria:**
- [ ] Old chatbot folder removed
- [ ] package.json scripts added
- [ ] Module README created
- [ ] Changes committed to git
- [ ] Backup branch preserved

---

## 📊 Session 2 Success Criteria

- [ ] Conversation model in Prisma
- [ ] Migration applied successfully
- [ ] Type checks passing
- [ ] Build successful
- [ ] Chatbot pages load
- [ ] No console errors
- [ ] Old chatbot folder removed
- [ ] Documentation complete
- [ ] Changes committed

---

## ⚠️ Troubleshooting

### Issue: Migration fails

```bash
# Reset migrations (caution!)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --create-only
# Edit migration file
npx prisma migrate dev
```

### Issue: Type errors after migration

```bash
# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf .next
npx tsc --noEmit
```

### Issue: Build fails

```bash
# Clear all caches
rm -rf .next node_modules/.cache

# Reinstall
npm install

# Rebuild
npm run build
```

### Issue: Chatbot not loading

Check:
1. Middleware routing (chatbot subdomain configured?)
2. Route group correct: `(chatbot)` not `(web)/chatbot`
3. No errors in console
4. Layout.tsx exists in `(chatbot)/`

---

## 📝 Post-Session Tasks

1. [ ] Update `CHATBOT-INTEGRATION-GUIDE.md` with ✅ for phases 6-8
2. [ ] Create `Session2_Summary.md`
3. [ ] Archive session logs to `chat-logs/chatbot/archive/`
4. [ ] Test on staging environment
5. [ ] Add API keys to production environment
6. [ ] Monitor chatbot performance

---

## 🎉 Completion

Once all phases are complete, the chatbot integration is DONE!

**The system is now:**
- ✅ Production-ready
- ✅ Secure and validated
- ✅ Maintainable and scalable
- ✅ Following project standards
- ✅ Fully documented

**Next Steps:**
1. Deploy to staging
2. Test with real users
3. Monitor analytics
4. Gather feedback
5. Iterate and improve

---

**Ready to begin Session 2!** Start with Phase 6: Database Integration.
