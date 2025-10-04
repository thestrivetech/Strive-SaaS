# Chatbot Project - Session Start Prompt

**Session:** session[n].md
**Project:** Strive AI Chatbot (Sai) - Embeddable AI Assistant
**Working Directory:** `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(chatbot)`

---

## =Ë Session Initialization

Before starting work, Claude should read the following files IN ORDER:

### 1. Project Standards & Architecture (REQUIRED)
```
Read these files to understand development rules and architecture:

1. ../CLAUDE.md - Root repository standards (shared across all projects)
2. ./CLAUDE.md - Chatbot-specific development rules (RAG, AI, widget embedding)
3. ./PLAN.md - Chatbot development plan (RAG system, AI integration, widget)
4. ./README.md - Project overview, RAG system, embedding generation
5. ../README.md - Repository overview (tri-fold structure)
```

### 2. Current Project State (ASSESS)
```
Assess the current state by checking:

- ./app/ structure - Verify Next.js App Router conventions
- ./app/layout.tsx - Ensure root layout exists (NOT in app/styling/)
- ./app/page.tsx - Ensure root page exists (redirects to /full)
- ./app/globals.css - Ensure global styles exist
- ./lib/rag/ - Check RAG system implementation (embeddings, search, context)
- ./lib/ai/ - Check AI integration (OpenRouter, Groq)
- ./lib/database/prisma.ts - Verify connection to ../shared/prisma/
- ./SUPABASE-RAG-SETUP-EXECUTE.sql - Verify pgvector setup
```

### 3. Key Architectural Principles
```
This chatbot follows:

 Next.js 15 App Router - Server Components for static UI
 RAG System - Supabase pgvector for semantic search (threshold: 0.7)
 Multi-Model AI - OpenRouter (GPT-4, Claude) + Groq (Llama, Mixtral)
 Shared Prisma schema at ../shared/prisma/schema.prisma
 Widget embedding - Isolated styles, minimal bundle (<150kb)
 Industry customization - app/industries/[industry]/
 Streaming responses - Server-Sent Events (SSE)
 80% test coverage minimum (RAG: 90%, AI: 85%)
 Files under 500 lines (hard limit)
```

---

## <¯ Session Workflow

### At Session Start:
1. **Read context files** (listed above)
2. **Understand current task** from user
3. **Create todo list** using TodoWrite tool for multi-step tasks
4. **Check RAG system status** - Are embeddings generated?

### During Session:
1. **Read before editing** - Always use Read tool before Edit/Write
2. **Test RAG first** - Verify vector search before implementing features
3. **Validate embeddings** - Check similarity scores (threshold: 0.7)
4. **Server Components first** - Only "use client" for interactive chat UI
5. **Update todos** - Mark tasks as in_progress/completed in real-time
6. **Reference line numbers** - Use `file:line` format when mentioning code

### Critical Reminders:
- L NEVER create files in app/styling/ (root files go in app/)
- L NEVER skip embedding generation after knowledge base updates
- L NEVER expose API keys to client (server-side only)
- L NEVER hardcode industry knowledge (use RAG system)
- L NEVER return low similarity results (threshold < 0.7)
-  ALWAYS run: `npm run lint && npx tsc --noEmit && npm test`
-  ALWAYS test vector search: `npm run rag:test-search`

---

## =Ý Session End Requirements

At the end of this session, create:

**File:** `./update-sessions/session[n]_summary.md` (under 1000 lines)

**Required sections:**
```markdown
# Chatbot Session [n] Summary

**Date:** [auto-fill]
**Duration:** [estimate]
**Status:**  Complete /   Partial / L Blocked

## Session Goal
[What we planned to accomplish]

## Changes Made
- `lib/rag/embeddings.ts:23-45` - Added batch embedding generation
- `lib/ai/chat.ts:67-89` - Implemented streaming with RAG context
- `app/industries/healthcare/prompts.ts:new` - Added healthcare system prompt

## RAG Updates
- **Knowledge Added:** [count] new entries ([industry] domain)
- **Embeddings Generated:** [count] vectors (1536 dimensions)
- **Search Tested:** Average similarity [score] (threshold: 0.7)
- **Performance:** Vector search <100ms /L

## AI Integration
- **Models Tested:** [list models used]
- **Streaming:** First token <500ms /L
- **Response Quality:** [assessment]
- **Token Rate:** [tokens/sec] (target: 50+)

## Tests Written
- RAG tests: [count] new tests (coverage: [%])
- AI tests: [count] new tests (coverage: [%])
- Integration tests: [count] new tests
- Overall coverage: [%] (target: 80%+)

## Issues Encountered
1. **Issue:** [Description]
   **Resolution:** [How it was fixed]

## Next Steps
[Recommended actions for next session]

## Commands Run
```bash
npm run rag:setup
npm run rag:generate-embeddings
npm run rag:test-search
npm run lint && npx tsc --noEmit && npm test
npm run build
```

## Verification
- /L Build successful
- /L All tests passing ([%] coverage)
- /L Zero TypeScript errors
- /L Zero ESLint warnings
- /L RAG system functional
- /L Streaming responses working

## Architecture Notes
[Any architectural decisions or patterns used]
```

---

## =€ Ready to Start

Now that context is loaded, ask the user:
**"What would you like to work on in this session? (RAG system, AI integration, widget, or industry customization)"**

Then create a todo list and begin work following TDD and Next.js best practices.
