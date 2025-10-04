# Strive AI Chatbot (Sai)

**Embeddable AI Assistant + Standalone Interface**

[![Next.js](https://img.shields.io/badge/Next.js-15.6.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI_Gateway-green)](https://openrouter.ai/)
[![Groq](https://img.shields.io/badge/Groq-Fast_Inference-orange)](https://groq.com/)

> **Quick Reference:** For development rules and best practices, see [`/CLAUDE.md`](./CLAUDE.md). For root project standards, see [`../CLAUDE.md`](../CLAUDE.md).

---

## 🎯 Project Overview

**Sai** is an AI-powered chatbot with industry-specific knowledge, deployable as:

1. **Embeddable Widget** - Add to any website with a `<script>` tag
2. **Standalone Chat** - Full-page interface at chatbot.strivetech.ai
3. **Industry-Specific** - Customized responses per industry (Real Estate, Healthcare, etc.)

### Key Features

- **RAG System** - Retrieval Augmented Generation with Supabase pgvector
- **Multi-Model AI** - GPT-4, Claude 3.5, Llama 3.3 via OpenRouter/Groq
- **Semantic Search** - Find relevant context from knowledge base
- **Streaming Responses** - Token-by-token for better UX
- **Widget Embedding** - Isolated styles, minimal bundle size
- **Industry Customization** - Custom system prompts and knowledge bases

---

## Tech Stack

### Core Framework
```yaml
Framework: Next.js 15.6.0 (App Router)
Runtime: React 19.1.0
Language: TypeScript 5.6+
Styling: Tailwind CSS + shadcn/ui
```

### AI & RAG (Retrieval Augmented Generation)
```yaml
# AI Providers
OpenRouter: Multi-model gateway (200+ models)
  - GPT-4 Turbo
  - Claude 3.5 Sonnet
  - Llama 3.3 70B
  - Mixtral 8x7B

Groq: Ultra-fast open-source inference
  - Llama 3.3 70B Versatile
  - Mixtral 8x7B
  - Gemma 2 9B

# RAG System
Vector DB: Supabase pgvector (PostgreSQL extension)
Embeddings: OpenAI text-embedding-3-small (1536 dimensions)
Search: Cosine similarity (threshold: 0.7)
```

### Data Layer
```yaml
Database Provider: Supabase PostgreSQL
ORM: Prisma 6.16.2
Auth: API key based (for widget embedding)
Storage: Supabase Storage
Cache: Redis (Upstash)
```

### Frontend
```yaml
UI Components: shadcn/ui + Radix UI
State: TanStack Query + Zustand
Forms: React Hook Form + Zod
Streaming: Server-Sent Events (SSE)
```

### Testing & Quality
```yaml
Unit/Integration: Jest + React Testing Library
Coverage: 80% minimum (RAG: 90%, AI: 85%)
E2E: Playwright (future)
```

---

## Getting Started

### 1. Environment Setup

Create `.env.local`:
```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..." # Server-only

# AI Providers
OPENROUTER_API_KEY="sk-or-..."
GROQ_API_KEY="gsk_..."

# RAG Configuration
EMBEDDING_MODEL="text-embedding-3-small"
VECTOR_DIMENSIONS=1536

# Cache (Optional)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
NEXT_PUBLIC_CHATBOT_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Setup pgvector extension and RAG tables
npm run rag:setup

# Or manually:
psql $DATABASE_URL -f SUPABASE-RAG-SETUP-EXECUTE.sql
```

This creates:
- `chatbot_knowledge` table with vector embeddings
- Vector similarity search functions
- Indexes for fast retrieval

### 4. Populate Knowledge Base

```bash
# Generate embeddings for knowledge content
npm run rag:generate-embeddings

# Test vector search
npm run rag:test-search
```

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- Full chat: http://localhost:3000/full
- Widget: http://localhost:3000/widget

---

## Project Structure

```
(chatbot)/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page (redirects to /full)
│   ├── globals.css          # Global styles
│   ├── full/                # Standalone chat interface
│   ├── widget/              # Embeddable widget
│   ├── api/
│   │   ├── chat/           # Streaming chat endpoint
│   │   └── embed/          # Widget embed script
│   ├── features/           # Chat UI components
│   ├── industries/         # Industry customizations
│   ├── schemas/            # Zod validation
│   └── services/           # Business logic
│
├── lib/                     # Core logic
│   ├── ai/                 # AI integration
│   │   ├── client.ts      # OpenRouter/Groq clients
│   │   ├── chat.ts        # Chat completion
│   │   └── streaming.ts   # SSE streaming
│   ├── rag/                # RAG system
│   │   ├── embeddings.ts  # Generate embeddings
│   │   ├── search.ts      # Vector search
│   │   └── context.ts     # Build context
│   ├── database/
│   │   └── prisma.ts      # Prisma client
│   └── supabase/
│       └── client.ts      # Supabase client
│
├── components/ui/           # shadcn components
├── types/                   # TypeScript types
├── scripts/                 # Utility scripts
│   ├── generate-embeddings.ts
│   └── test-vector-search.ts
└── __tests__/               # Test suites
```

---

## RAG (Retrieval Augmented Generation)

### What is RAG?

RAG combines **semantic search** (finding relevant content) with **AI generation** (creating responses):

1. User asks a question
2. Convert question to embedding (1536-dimensional vector)
3. Search knowledge base for similar vectors (cosine similarity)
4. Include top 5 results as context in AI prompt
5. AI generates response grounded in retrieved knowledge

### RAG Workflow

```
User: "What is a comparative market analysis?"
    ↓
Generate Query Embedding (200ms)
    ↓
Vector Similarity Search (100ms)
    ↓
Top 5 Results (similarity > 0.7):
  1. "CMA definition..." (0.92)
  2. "How to perform CMA..." (0.85)
  3. "CMA vs appraisal..." (0.78)
    ↓
Build Context:
  """
  Relevant context:
  [1] CMA definition...
  [2] How to perform CMA...
  [3] CMA vs appraisal...
  """
    ↓
Send to AI:
  System: "You are a real estate expert..."
  Context: [retrieved knowledge]
  User: "What is a comparative market analysis?"
    ↓
AI Response (streaming)
```

### Knowledge Base Structure

```sql
-- chatbot_knowledge table
CREATE TABLE chatbot_knowledge (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,           -- The actual knowledge content
  embedding VECTOR(1536),           -- Vector representation
  metadata JSONB,                   -- { industry, category, source }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_industry TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
);
```

### Adding Knowledge

1. **Prepare Content** (Markdown, JSON, etc.)
```typescript
const knowledge = [
  {
    content: "A Comparative Market Analysis (CMA) is...",
    metadata: {
      industry: "real-estate",
      category: "valuation",
      source: "internal-docs"
    }
  },
  // ...
];
```

2. **Generate Embeddings**
```bash
npm run rag:generate-embeddings
```

3. **Verify in Database**
```bash
npx prisma studio
# Check chatbot_knowledge table
```

4. **Test Search**
```bash
npm run rag:test-search
```

---

## AI Model Selection

### Available Models

**Free Tier** (Groq - Ultra-fast, free):
- `llama-3.3-70b-versatile` - Best quality free model
- `mixtral-8x7b-32768` - Large context window
- `gemma-2-9b-it` - Lightweight, fast

**Standard Tier** (OpenRouter - Paid):
- `openai/gpt-4-turbo-preview` - Balanced quality/cost
- `openai/gpt-3.5-turbo` - Fast, affordable
- `meta-llama/llama-3-70b-instruct` - Open-source alternative

**Premium Tier** (OpenRouter - Best quality):
- `anthropic/claude-3.5-sonnet` - Best reasoning
- `openai/gpt-4` - Most capable

### Model Selection Logic

```typescript
// lib/ai/model-selector.ts
export function selectModel(userTier: string, task: string) {
  if (userTier === 'free') {
    return {
      provider: 'groq',
      model: 'llama-3.3-70b-versatile'
    };
  }

  if (task === 'complex-reasoning') {
    return {
      provider: 'openrouter',
      model: 'anthropic/claude-3.5-sonnet'
    };
  }

  return {
    provider: 'openrouter',
    model: 'openai/gpt-4-turbo-preview'
  };
}
```

---

## Widget Embedding

### Usage

Customers can embed Sai on their website with:

```html
<!-- Basic embedding -->
<script src="https://chatbot.strivetech.ai/widget/embed?key=YOUR_API_KEY"></script>

<!-- Industry-specific -->
<script src="https://chatbot.strivetech.ai/widget/embed?key=YOUR_API_KEY&industry=healthcare"></script>
```

### Widget Features

- **Isolated Styles** - Won't conflict with parent page CSS
- **Minimal Bundle** - < 150kb JavaScript
- **Fast Load** - < 500ms initialization
- **Customizable** - Colors, position, behavior
- **Secure** - API key validation server-side

### API Key Management

1. Generate API key in platform
2. Configure allowed domains
3. Set rate limits
4. Embed on customer site

---

## Industry Customization

### Available Industries

- **Real Estate** - Property listings, market analysis, valuations
- **Healthcare** - Medical information, appointment scheduling
- **Strive** - General Strive Tech knowledge
- **Custom** - Per-client customization

### Industry Structure

```
app/industries/real-estate/
├── config.json              # Industry metadata
├── system-prompt.ts         # Custom AI instructions
├── solutions.ts             # Pre-defined solutions
├── problem-patterns.ts      # Common user issues
└── conversation-flow.ts     # Guided conversations
```

### Custom System Prompts

```typescript
// app/industries/real-estate/system-prompt.ts
export const REAL_ESTATE_SYSTEM_PROMPT = `
You are Sai, an AI assistant specializing in real estate.

Expert knowledge areas:
- Property listings and valuations
- Comparative Market Analysis (CMA)
- Mortgage calculations
- Market trends and analytics
- Legal and compliance

Always:
- Provide accurate, data-driven information
- Cite sources when possible
- Ask clarifying questions
- Use real estate terminology correctly
`;
```

---

## Development Commands

```bash
# Setup
npm install                     # Install dependencies
npx prisma generate            # Generate Prisma client
npm run rag:setup              # Setup vector database

# Development
npm run dev                     # Start dev server (Turbopack)
npm run rag:generate-embeddings # Populate knowledge base
npm run rag:test-search        # Test vector search

# Pre-commit (ALWAYS RUN)
npm run lint                    # ESLint - Zero warnings
npm run type-check              # TypeScript - Zero errors
npm test                        # Tests - 80% coverage minimum

# Testing
npm test                        # Run all tests
npm test -- --coverage          # With coverage report
npm test rag                    # Test RAG system only
npm test ai                     # Test AI integration only
npm test -- --watch             # Watch mode

# Production
npm run build                   # Production build
npm start                       # Start production server
```

---

## Testing Strategy

### Coverage Requirements

- **RAG System:** 90% (critical for accuracy)
- **AI Integration:** 85% (important for quality)
- **Widget Embedding:** 80% (important for reliability)
- **API Routes:** 100% (critical for security)
- **Overall:** 80% minimum

### Key Test Scenarios

**RAG System:**
```typescript
// __tests__/rag/search.test.ts
it('should return relevant results above threshold', async () => {
  const results = await searchKnowledge('property valuation', {
    industry: 'real-estate',
    threshold: 0.7,
  });

  expect(results.length).toBeGreaterThan(0);
  expect(results[0].similarity).toBeGreaterThan(0.7);
});
```

**AI Integration:**
```typescript
// __tests__/ai/chat.test.ts
it('should stream response with RAG context', async () => {
  const messages = [
    { role: 'user', content: 'What is a CMA?' }
  ];

  const stream = await chat(messages, {
    model: 'gpt-4-turbo',
    provider: 'openrouter',
    industry: 'real-estate',
    useRAG: true,
    stream: true,
  });

  expect(stream).toBeDefined();
  // Verify streaming works
});
```

---

## Performance Targets

```yaml
# Streaming Performance
First Token: < 500ms        # Time to first AI response token
Token Rate: > 50/sec        # Streaming speed

# RAG Performance
Vector Search: < 100ms      # Similarity search time
Embedding Gen: < 200ms      # Query embedding generation

# Widget Performance
Load Time: < 500ms          # Widget initialization
Bundle Size: < 150kb        # JavaScript bundle

# Overall
Chat Response: < 2s         # End-to-end (RAG + AI)
Similarity Threshold: 0.7   # Minimum match quality
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] RAG system setup and tested
- [ ] Knowledge base populated (embeddings generated)
- [ ] AI integration working (OpenRouter + Groq)
- [ ] Widget embedding functional
- [ ] 80%+ test coverage
- [ ] Environment variables set in Vercel
- [ ] Build succeeds
- [ ] Security review (API keys, CORS, rate limiting)

### Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Verify endpoints:
# - https://chatbot.strivetech.ai/full
# - https://chatbot.strivetech.ai/widget/embed
```

### Environment Variables (Vercel)

Set in Vercel dashboard:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (encrypted)
- `OPENROUTER_API_KEY` (encrypted)
- `GROQ_API_KEY` (encrypted)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN` (encrypted)

---

## Troubleshooting

### RAG Issues

**Problem:** Vector search returns no results
```bash
# Check if embeddings exist
npx prisma studio
# Look at chatbot_knowledge table

# Regenerate embeddings
npm run rag:generate-embeddings
```

**Problem:** Low similarity scores
```typescript
// Lower threshold temporarily for debugging
const results = await searchKnowledge(query, {
  threshold: 0.5,  // Normally 0.7
});
```

### AI Issues

**Problem:** API rate limit errors
```typescript
// Switch to Groq for free tier
const model = 'llama-3.3-70b-versatile';
const provider = 'groq';
```

**Problem:** Slow streaming
```typescript
// Use faster model
const model = 'gpt-3.5-turbo';  // Faster than gpt-4
```

---

## Related Documentation

- [Development Rules](./CLAUDE.md) - Chatbot-specific standards
- [Root Project Standards](../CLAUDE.md) - Shared development rules
- [Root README](../README.md) - Repository overview
- [Platform Project](../(platform)/README.md) - SaaS platform
- [Website Project](../(website)/README.md) - Marketing site

---

**Built with ❤️ by Strive Tech**
