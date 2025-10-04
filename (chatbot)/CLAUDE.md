# CLAUDE-CHATBOT.md

**Claude's Session Memory | v1.0 | Chatbot Project Standards**

> ## 🔴 CRITICAL: READ-BEFORE-EDIT MANDATE
>
> **YOU MUST FOLLOW THESE STEPS BEFORE ANY ACTION:**
>
> 1. **READ FIRST** - Always use Read tool on any file before editing it
> 2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files, scripts, or tests already exist
> 3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones (99% of the time)
> 4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first
>
> **For root project documentation:**
> - Main standards: [`../CLAUDE.md`](../CLAUDE.md) - Core development rules
> - Project overview: [`../README.md`](../README.md) - Repository structure

---

## 🎯 PROJECT: Strive AI Chatbot (Sai)

**Location:** `(chatbot)/` → chatbot.strivetech.ai (Next.js project)
**Stack:** Next.js 15.6.0 + React 19.1.0 + TypeScript + OpenRouter/Groq + RAG
**Focus:** Embeddable AI assistant with industry-specific knowledge bases

> **Purpose:** Two deployment modes:
> 1. **Widget** - Embeddable `<script>` tag for any website
> 2. **Standalone** - Full-page chat interface at chatbot.strivetech.ai

---

## ⚡ TECH STACK

```yaml
Core: Next.js 15.6.0, React 19.1.0, TypeScript 5.6+

# AI & RAG
AI Gateway: OpenRouter (GPT-4, Claude 3.5, Llama 3.3)
Fast Inference: Groq (Llama 3.3, Mixtral, Gemma)
Vector DB: Supabase pgvector
Embeddings: OpenAI text-embedding-3-small

# Backend
Database: Supabase PostgreSQL
ORM: Prisma 6.16.2 (connects to Supabase)
Auth: API key based (for widget)
Storage: Supabase Storage

# Frontend
UI: shadcn/ui + Radix UI + Tailwind CSS
State: TanStack Query + Zustand
Forms: React Hook Form + Zod
Streaming: Server-Sent Events (SSE)

Testing: Jest + React Testing Library (80% min)
```

**IMPORTANT:** RAG (Retrieval Augmented Generation) is core to this project:
- **RAG** = Semantic search over knowledge base + AI generation
- **pgvector** = PostgreSQL extension for vector similarity search
- **Embeddings** = Text converted to 1536-dimensional vectors

---

## 📁 STRUCTURE

```
(chatbot)/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout (REQUIRED)
│   ├── page.tsx             # Root page (redirects to /full)
│   ├── globals.css          # Global styles
│   ├── full/                # Standalone chat interface
│   │   └── page.tsx
│   ├── widget/              # Embeddable widget
│   │   └── page.tsx
│   ├── api/
│   │   ├── chat/           # Streaming chat endpoint
│   │   └── embed/          # Widget embed script
│   ├── constants/          # App constants
│   ├── features/           # Feature components
│   │   ├── ai-chat.tsx
│   │   ├── chat-input.tsx
│   │   └── message-bubble.tsx
│   ├── industries/         # Industry customizations
│   │   ├── real-estate/
│   │   │   ├── config.json
│   │   │   ├── system-prompt.ts
│   │   │   └── solutions.ts
│   │   └── strive/
│   ├── schemas/            # Zod validation
│   └── services/
│       ├── cache-service.ts
│       └── rag-service.ts
├── components/
│   └── ui/                 # shadcn components
├── lib/
│   ├── ai/                 # AI integration
│   │   ├── client.ts      # OpenRouter/Groq clients
│   │   ├── chat.ts        # Chat completion logic
│   │   └── streaming.ts   # SSE streaming
│   ├── rag/                # RAG system
│   │   ├── embeddings.ts  # Generate embeddings
│   │   ├── search.ts      # Vector similarity search
│   │   └── context.ts     # Build context from results
│   ├── database/
│   │   └── prisma.ts      # Prisma client
│   ├── supabase/
│   │   └── client.ts      # Supabase client
│   └── utils/              # Helper functions
├── types/                  # TypeScript types
│   ├── api.ts
│   ├── conversation.ts
│   ├── industry.ts
│   └── rag.ts
├── scripts/
│   ├── generate-embeddings.ts    # Populate vector DB
│   └── test-vector-search.ts     # Test RAG
├── __tests__/              # Test suites
├── SUPABASE-RAG-SETUP.sql         # Vector DB schema
└── middleware.ts           # API key validation
```

---

## 🔴 CRITICAL RULES - CHATBOT SPECIFIC

### RAG System Best Practices

**1. Vector Search Quality**
```typescript
// ✅ ALWAYS use similarity threshold
const results = await searchKnowledge(query, {
  industry: 'real-estate',
  threshold: 0.7,  // Minimum similarity score
  limit: 5,
});

// ❌ NEVER return low-quality matches
const badResults = await searchKnowledge(query, {
  threshold: 0.3,  // Too low - returns irrelevant content
});
```

**2. Embedding Generation**
```typescript
// ✅ Batch embeddings for efficiency
const embeddings = await generateEmbeddings([text1, text2, text3]);

// ❌ NEVER generate one at a time in loop
for (const text of texts) {
  await generateEmbedding(text); // Slow!
}
```

**3. Context Window Management**
```typescript
// ✅ Limit context to fit model's window
const context = buildContext(results, {
  maxTokens: 2000,  // Leave room for prompt + response
  industry,
});

// ❌ NEVER exceed model's context limit
const tooMuchContext = results.map(r => r.content).join('\n'); // Can exceed 4096 tokens
```

### AI Provider Patterns

**1. Model Selection**
```typescript
// ✅ Use appropriate model for task
const FREE_TIER = 'llama-3.3-70b-versatile';      // Groq - fast, free
const PAID_TIER = 'gpt-4-turbo-preview';          // OpenRouter - capable
const PREMIUM_TIER = 'anthropic/claude-3.5-sonnet'; // Best quality

// Choose based on user tier
const model = user.tier === 'free' ? FREE_TIER : PAID_TIER;
```

**2. Streaming Responses**
```typescript
// ✅ ALWAYS stream for better UX
export const runtime = 'edge';

export async function POST(req: Request) {
  const stream = await chat(messages, { stream: true });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

// ❌ NEVER wait for full response
const fullResponse = await chat(messages, { stream: false }); // Slow UX
```

**3. Error Handling**
```typescript
// ✅ Graceful fallback for AI failures
try {
  const response = await chat(messages, { model: 'gpt-4' });
  return response;
} catch (error) {
  // Fallback to faster/cheaper model
  return await chat(messages, { model: 'llama-3.3-70b' });
}
```

### Widget Embedding Standards

**1. Widget Initialization**
```typescript
// ✅ Isolate widget styles
const Widget = () => (
  <div className="sai-widget" style={{ all: 'initial' }}>
    <style>{isolatedStyles}</style>
    <ChatInterface />
  </div>
);

// ❌ NEVER pollute parent page styles
const BadWidget = () => (
  <div className="chat"> {/* Conflicts with parent CSS */}
    <ChatInterface />
  </div>
);
```

**2. API Key Security**
```typescript
// ✅ Validate API key server-side
export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  const isValid = await validateApiKey(apiKey);
  if (!isValid) return new Response('Unauthorized', { status: 401 });
  // ...
}

// ❌ NEVER trust client-provided keys
const apiKey = searchParams.get('key'); // Can be stolen!
```

**3. CORS Configuration**
```typescript
// ✅ Allow specific domains
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  const isAllowed = await checkAllowedDomain(origin);

  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : '',
      'Access-Control-Allow-Methods': 'POST',
    },
  });
}
```

### Industry Customization

**1. System Prompts**
```typescript
// ✅ Load industry-specific prompts
const config = await getIndustryConfig(industry);
const systemPrompt = config.systemPrompt || DEFAULT_PROMPT;

const messages = [
  { role: 'system', content: systemPrompt },
  ...userMessages,
];
```

**2. Knowledge Filtering**
```typescript
// ✅ Filter by industry in vector search
const results = await supabase.rpc('search_knowledge', {
  query_embedding: embedding,
  filter_industry: 'healthcare',  // Only healthcare content
  match_count: 5,
});
```

---

## 🔒 SECURITY MANDATES - CHATBOT SPECIFIC

```typescript
// 1. API Key Authentication
const apiKey = req.headers.get('x-api-key');
if (!apiKey || !await validateKey(apiKey)) {
  return new Response('Unauthorized', { status: 401 });
}

// 2. Rate Limiting (per API key)
const { success } = await rateLimit(apiKey);
if (!success) {
  return new Response('Too Many Requests', { status: 429 });
}

// 3. Input Sanitization (prevent prompt injection)
const sanitized = sanitizeUserInput(message);
if (sanitized.length > 2000) {
  return new Response('Message too long', { status: 400 });
}

// 4. Output Filtering (prevent leaked secrets)
const response = await chat(messages);
const filtered = filterSensitiveInfo(response);

// 5. CORS Restrictions
const allowedOrigins = await getAllowedOrigins(apiKey);
if (!allowedOrigins.includes(origin)) {
  return new Response('Forbidden', { status: 403 });
}
```

**NEVER expose:**
- OpenRouter/Groq API keys
- Supabase Service Role Key
- Database credentials
- Other users' conversations

---

## 🚀 PERFORMANCE TARGETS - CHATBOT

```yaml
# Streaming Performance
First Token: < 500ms      # Time to first AI response token
Token Rate: > 50/sec      # Streaming speed

# RAG Performance
Vector Search: < 100ms    # Similarity search time
Embedding Gen: < 200ms    # Time to generate query embedding

# Widget Performance
Load Time: < 500ms        # Widget initialization
Bundle Size: < 150kb      # Widget JavaScript bundle

# Overall
Chat Response: < 2s       # End-to-end (search + AI)
```

**Optimization Patterns:**
```typescript
// 1. Cache embeddings (avoid regeneration)
const cached = await redis.get(`embed:${text.hash()}`);
if (cached) return JSON.parse(cached);

// 2. Parallel RAG + AI
const [ragResults, aiStream] = await Promise.all([
  searchKnowledge(query),
  initiateChatStream(messages),
]);

// 3. Edge runtime for low latency
export const runtime = 'edge';
```

---

## ✅ PRE-COMMIT CHECKLIST - CHATBOT

**MANDATORY before ANY commit:**
```bash
npm run lint        # Zero warnings
npm run type-check  # Zero errors
npm test            # 80% coverage minimum
```

**Chatbot-Specific Checks:**
- [ ] RAG search returns relevant results (similarity > 0.7)
- [ ] AI responses stream properly (first token < 500ms)
- [ ] Widget loads without CSS conflicts
- [ ] API keys validated server-side
- [ ] Rate limiting enforced
- [ ] Industry knowledge bases accurate
- [ ] No exposed secrets in code

**Test Coverage Requirements:**
- RAG system: 90%
- AI integration: 85%
- Widget embedding: 80%
- API routes: 100%
- Overall: 80% minimum

---

## 🛠 COMMANDS - CHATBOT

```bash
# Setup
npm install
npx prisma generate
npm run rag:setup              # Setup pgvector database

# Development
npm run dev                     # Start dev server
npm run rag:generate-embeddings # Populate knowledge base
npm run rag:test-search        # Test vector search

# Pre-commit (ALWAYS)
npm run lint && npm run type-check && npm test

# RAG Management
npm run rag:setup              # Initialize vector DB
npm run rag:generate-embeddings # Generate embeddings
npm run rag:test-search        # Test similarity search

# Testing
npm test                       # Run all tests
npm test -- --coverage         # With coverage
npm test rag                   # Test RAG system
npm test ai                    # Test AI integration
```

---

## 🎯 CORE PRINCIPLES - CHATBOT

1. **RAG-first** - Always use knowledge base for grounded responses
2. **Stream everything** - Token-by-token for perceived speed
3. **Industry-aware** - Customize responses per industry
4. **Widget-friendly** - Isolated styles, minimal bundle size
5. **API key security** - Never expose keys, validate server-side
6. **Model flexibility** - Support multiple AI providers
7. **Quality threshold** - Only return relevant RAG results (>0.7 similarity)
8. **Production mindset** - Every token costs money

---

## 📋 RAG WORKFLOW

**Knowledge Base Population:**
```bash
# 1. Prepare content (markdown, JSON, etc.)
# 2. Generate embeddings
npm run rag:generate-embeddings

# 3. Verify in database
npx prisma studio
# Check chatbot_knowledge table

# 4. Test search
npm run rag:test-search
```

**Query Flow:**
```
User Query
    ↓
Generate Query Embedding (200ms)
    ↓
Vector Similarity Search (100ms)
    ↓
Build Context from Top 5 Results
    ↓
Send to AI Model with Context
    ↓
Stream Response to User
```

---

## ❌ NEVER DO THIS - CHATBOT

```typescript
// RAG Anti-patterns
❌ return allResults;  // Without similarity threshold
❌ const embedding = await embed(text); // In a loop (use batch)
❌ const context = results.join('\n'); // Without token limit

// AI Anti-patterns
❌ const response = await chat({ stream: false }); // Non-streaming
❌ const gpt4 = await chat({ model: 'gpt-4' }); // For all users (expensive)
❌ return aiResponse; // Without filtering sensitive info

// Widget Anti-patterns
❌ <div className="chat"> // Generic class names (conflicts)
❌ const key = params.get('key'); // Client-side API key
❌ document.body.innerHTML = widget; // Pollutes parent page

// Security Anti-patterns
❌ const apiKey = process.env.OPENROUTER_KEY; // Exposed to client
❌ await chat({ messages: userInput }); // Without sanitization
❌ return new Response(result); // Without CORS check
```

---

## 🔗 QUICK REFS - CHATBOT

- **AI Models:**
  - Free: `llama-3.3-70b-versatile` (Groq)
  - Standard: `gpt-4-turbo-preview` (OpenRouter)
  - Premium: `anthropic/claude-3.5-sonnet` (OpenRouter)

- **RAG Config:**
  - Embedding model: `text-embedding-3-small`
  - Vector dimensions: 1536
  - Similarity threshold: 0.7
  - Context limit: 2000 tokens

- **Industries:**
  - Real Estate
  - Healthcare
  - Strive (general)
  - Custom (per client)

---

## 🎯 DECISION TREE - CHATBOT

**Before you start:**
1. **Check RAG setup** → Is vector DB initialized?
2. **Check API keys** → Are OpenRouter/Groq keys set?
3. **Check knowledge base** → Are embeddings generated?

**During implementation:**
- **Need to query knowledge?** → Use RAG search with threshold
- **Need AI response?** → Stream from appropriate model
- **Need to embed widget?** → Isolate styles, validate API key
- **Adding industry?** → Create industry folder with config
- **Need to cache?** → Use Redis for embeddings/responses

**Before committing:**
- [ ] RAG search tested and accurate
- [ ] AI streaming works
- [ ] Widget loads without conflicts
- [ ] API keys secured
- [ ] Rate limiting enforced
- [ ] 80%+ test coverage

---

**Remember:** This is AI infrastructure. Quality > Speed. Every API call costs money. Cache aggressively.
