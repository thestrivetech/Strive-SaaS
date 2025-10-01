# Chatbot Module

AI-powered sales chatbot with RAG (Retrieval-Augmented Generation) capabilities for Strive Tech.

## Features

- 🤖 **Streaming Responses** - Real-time streaming via Groq LLM (llama-3.3-70b-versatile)
- 🔍 **Semantic Search** - OpenAI embeddings with vector similarity search
- 🎯 **Industry-Specific** - Configurable for different industries (default: Strive Tech)
- 📊 **Analytics & Tracking** - Conversation history and conversion tracking
- 💾 **Persistent Storage** - Prisma-based database with Supabase PostgreSQL
- ⚡ **High Performance** - Redis caching for embeddings and search results

## Module Structure

```
chatbot/
├── config/
│   └── industries/       # Industry-specific configurations
├── constants/            # Shared constants
├── schemas/              # Zod validation schemas
├── services/             # Business logic (server-only)
│   ├── rag-service.ts    # RAG logic and semantic search
│   └── cache-service.ts  # Redis caching layer
├── types/                # TypeScript type definitions
├── actions/              # Server Actions (for mutations)
├── queries/              # Data fetching functions
└── index.ts              # Public API exports
```

## Routes

### Public Routes (chatbot subdomain)

- **Full Page**: `https://chatbot.strivetech.ai/full`
- **Widget Mode**: `https://chatbot.strivetech.ai/widget`
- **API Endpoint**: `POST /api/chat`

### Local Development

```bash
# Access routes at:
http://localhost:3000/full      # Full-page chatbot
http://localhost:3000/widget    # Widget mode
```

## Environment Variables

Required environment variables (add to `app/.env.local`):

```env
# Groq API (required for chat)
GROQ_API_KEY=your_groq_api_key

# OpenAI API (required for RAG embeddings)
OPENAI_API_KEY=your_openai_api_key

# Supabase (required for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (Prisma)
DATABASE_URL=your_database_connection_string
DIRECT_URL=your_direct_database_connection

# Optional: Redis (for caching)
REDIS_URL=your_redis_url
```

### Getting API Keys

- **Groq**: https://console.groq.com/keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Supabase**: https://supabase.com/dashboard

## Database Setup

### 1. Run Prisma Migration

The `Conversation` model is already defined in the Prisma schema.

```bash
cd app
npx prisma generate
npx prisma migrate dev
```

### 2. Set Up Supabase RAG Functions (Optional)

For full RAG functionality with vector search, run the SQL setup:

```bash
# 1. Open Supabase SQL Editor
# 2. Copy contents of app/SUPABASE-RAG-SETUP.sql
# 3. Run the script
```

This creates:
- `pgvector` extension for vector similarity search
- `match_example_conversations()` function
- Indexes for performance

## Usage

### Starting the Dev Server

```bash
cd app
npm run dev
```

Visit `http://localhost:3000/full` to test the chatbot.

### Testing the API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, I need help with automation"}],
    "sessionId": "test-session-123",
    "industry": "strive"
  }'
```

### Industry Configuration

To use a different industry configuration:

```typescript
import { loadIndustryConfig } from '@/lib/modules/chatbot/config/industries';

const config = await loadIndustryConfig('healthcare'); // or 'default', 'strive', etc.
```

## Architecture

### Server Components (Default)

- Direct database access via Prisma
- No client-side JavaScript by default
- SEO-friendly and performant

### Client Components

- Interactive UI (chat interface, input)
- Use `"use client"` directive
- Located in `app/app/(chatbot)/`

### API Routes

- Streaming chat endpoint: `POST /api/chat`
- Handles Groq LLM streaming
- Integrates RAG context

### RAG Service (Server-Only)

- Generates embeddings via OpenAI
- Performs semantic search in Supabase
- Caches results in Redis
- Builds enhanced system prompts

## Testing

### Type Check

```bash
cd app
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Troubleshooting

### "Module not found" errors

- Verify import paths use `@/` alias
- Check file is in correct location
- File names are case-sensitive

### "Environment variable not found"

- Check `.env.local` exists in `app/` directory
- Verify variable names match exactly
- Restart dev server after changing `.env`

### Chatbot routes return 404

- Check `middleware.ts` for subdomain logic
- Verify `(chatbot)` route group exists
- Check `layout.tsx` exists in chatbot route group

### RAG not working

- Verify `OPENAI_API_KEY` is set (not placeholder)
- Check Supabase functions exist (run SQL script)
- Look for errors in browser console
- Check network tab for API call failures

### Streaming not working

- Check `GROQ_API_KEY` is valid
- Verify API route returns `ReadableStream`
- Check for CORS issues
- Look for errors in server logs

## Performance

- **Embeddings**: Cached in Redis (15-minute TTL)
- **Semantic Search**: Indexed with pgvector
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Bundle Size**: Client components < 50kb

## Security

- ✅ Server-only guards on services
- ✅ Zod validation on all inputs
- ✅ No API keys exposed to client
- ✅ Rate limiting on API endpoints
- ✅ Sanitized user inputs

## Documentation

- **Architecture Guide**: `app/RAG-CONFIGURATION-OPTIONS.md`
- **Environment Checklist**: `app/CHATBOT-ENV-CHECKLIST.md`
- **Database Setup**: `app/SUPABASE-RAG-SETUP.sql`
- **Integration Guide**: `chat-logs/chatbot/CHATBOT-INTEGRATION-GUIDE.md`
- **Quick Status**: `chat-logs/chatbot/QUICK_STATUS.md`

## Future Enhancements

- [ ] E2E tests with Playwright
- [ ] Conversation analytics dashboard
- [ ] Admin panel for training data
- [ ] Conversation export/import
- [ ] Multiple LLM provider support
- [ ] Conversation rating system
- [ ] A/B testing for prompts

## License

Internal use only - Strive Tech proprietary.
