# Strive AI Chatbot System

This folder contains all files from the chatbot integration commit (b2fb05fc).

## 📁 Structure

```
chatbot/
├── app/
│   ├── api/chat/           # Chat API route
│   ├── constants/          # Chat constants
│   ├── full/               # Full-page chat mode
│   ├── widget/             # Widget/embed mode
│   ├── utils/              # Animation & parent communication
│   ├── globals1.css        # Global styles (duplicate)
│   ├── layout1.tsx         # Layout (duplicate)
│   └── page1.tsx           # Page (duplicate)
├── components/
│   ├── chat/               # Chat UI components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   └── shared/
│       └── Avatars.tsx
├── hooks/
│   ├── useChat.ts          # Main chat hook (523 lines - needs splitting)
│   ├── useAdvancedChat.ts  # Advanced features
│   └── useScrollManager.ts # Scroll management
├── lib/
│   ├── industries/         # Industry-specific configs
│   │   ├── index.ts
│   │   └── strive/
│   │       ├── config.json
│   │       ├── conversation-flow.ts
│   │       ├── problem-patterns.ts
│   │       ├── solutions.ts
│   │       └── system-prompt.ts
│   └── services/
│       ├── cache-service.ts # LRU cache for embeddings
│       └── rag-service.ts   # RAG semantic search
├── public/images/
│   └── strive-wordmark.png
├── scripts/
│   └── seed-training-data.ts
├── types/
│   ├── api.ts
│   ├── conversation.ts
│   ├── industry.ts
│   └── rag.ts
├── middleware.ts           # Next.js middleware
├── next.config.ts          # Next.js config
├── next-env.d.ts           # Next.js TypeScript definitions
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind config
└── tsconfig.json           # TypeScript config
```

## 🚀 Features

- **AI-Powered Chat:** Groq LLM (Llama 3.3 70B) with streaming
- **RAG System:** Semantic search using OpenAI embeddings + Supabase vector storage
- **Industry Configs:** Customizable per industry (currently: Strive Tech)
- **Conversation Tracking:** Stores conversations for learning and improvement
- **Multiple Modes:** Full-page and widget/embed modes
- **Smart Detection:** Automatic problem detection and solution matching

## ⚠️ Known Issues (See CLAUDE-CHATBOT-ANALYSIS.md)

### Must Fix (Blocks PR):
1. **useChat.ts (523 lines)** - Exceeds 500-line hard limit
2. **Missing Zod validation** - Security vulnerability in API route
3. **No 'server-only' guard** - RAG service needs safeguard

### Should Fix:
4. **API Route** - Should document why not Server Action
5. **Supabase direct usage** - Should use Prisma hybrid approach

### Optional Improvements:
6. Split large components (ChatContainer, ChatInput, ChatMessage)
7. Extract utilities (formatting, auto-resize)
8. Add tests (80% coverage required)

## 📋 Next Steps

1. Review `CLAUDE-CHATBOT-ANALYSIS.md` for detailed analysis
2. Implement Phase 1 fixes (~3 hours):
   - Split useChat.ts into 2 files
   - Add Zod validation
   - Add 'server-only' import
   - Document API route choice
3. Test thoroughly
4. Integrate into main app when ready

## 🔗 Related Documentation

- `/COMMIT-ANALYSIS-b2fb05fc.md` - Full 75-page analysis
- `/CLAUDE-CHATBOT-ANALYSIS.md` - Quick reference guide
- `/CLAUDE.md` - Project standards

## 📦 Dependencies Added

```json
{
  "@supabase/supabase-js": "^2.47.10",
  "groq-sdk": "^0.8.0",
  "openai": "^4.78.1",
  "framer-motion": "^12.23.22",
  "react-hot-toast": "^2.6.0",
  "@upstash/ratelimit": "^2.0.6",
  "@upstash/redis": "^1.35.4"
}
```

## 🔐 Environment Variables Required

```bash
GROQ_API_KEY=          # Groq LLM
OPENAI_API_KEY=        # OpenAI embeddings
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=  # Keep secure!
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## ⚡ Quick Start (When Ready to Integrate)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Set up database (Supabase)
# - Create conversations table
# - Create example_conversations table
# - Create vector search functions
# See COMMIT-ANALYSIS for SQL

# 4. Seed training data
npm run seed

# 5. Test
npm run dev
```

## 📊 Statistics

- **Files:** 36
- **Lines Added:** 5,879
- **Components:** 4
- **Hooks:** 3
- **Services:** 2
- **Types:** 4
- **Commit:** b2fb05fc
- **Date:** 2025-09-30

---

**Status:** Awaiting integration after Phase 1 fixes
**Priority:** P0 fixes required before merge
