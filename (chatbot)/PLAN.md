# Chatbot Production Plan

**Project:** Strive AI Chatbot (Sai)
**Type:** Embeddable AI Assistant + Standalone Interface
**Framework:** Next.js 15.6.0 + React 19.1.0 + TypeScript 5.6+
**AI:** OpenRouter + Groq with RAG (Retrieval Augmented Generation)
**Status:** 🚧 Development → Production

---

## 🎯 Project Overview

The **Chatbot** project provides an AI-powered assistant (Sai) that can be:
1. **Embedded** as a widget on any website (strivetech.ai, client sites)
2. **Standalone** full-page chat interface for power users
3. **Industry-specific** with custom knowledge bases (Real Estate, Healthcare, etc.)

### Key Features
- **RAG System** - Vector search with Supabase pgvector
- **Multi-model AI** - GPT-4, Claude 3.5, Llama 3.3 via OpenRouter/Groq
- **Contextual Memory** - Conversation history with semantic search
- **Embeddable Widget** - <script> tag integration
- **Industry Customization** - Industry-specific knowledge & responses
- **Real-time Streaming** - Token-by-token response streaming

---

## 📁 Current Structure Analysis

### ✅ What's Correct

```
(chatbot)/
├── app/                           # Next.js App Router ✅
│   ├── full/                     # Full-page chat interface ✅
│   ├── widget/                   # Embeddable widget ✅
│   ├── constants/                # App constants ✅
│   ├── features/                 # Feature modules ✅
│   ├── industries/               # Industry customizations ✅
│   │   ├── real-estate/
│   │   └── strive/
│   ├── schemas/                  # Zod validation schemas ✅
│   ├── services/                 # Service layer ✅
│   └── styling/                  # Layout & styles ⚠️
│       └── layout.tsx            # Should be at app/layout.tsx
│
├── components/                    # UI components ✅
│   └── UI/                       # Reusable components ✅
│
├── lib/                          # Business logic ✅
│   └── (empty)                   # Needs to be populated
│
├── types/                        # TypeScript types ✅
│
├── scripts/                      # Utility scripts ✅
│   ├── generate-embeddings.ts   # RAG embedding generation ✅
│   └── test-vector-search.ts    # RAG testing ✅
│
├── __tests__/                    # Test suites ✅
│
├── SUPABASE-RAG-SETUP.sql       # RAG database setup ✅
└── SUPABASE-RAG-SETUP-EXECUTE.sql ✅
```

### 🔴 CRITICAL ISSUES

#### Issue #1: Missing Root Files (BREAKS Next.js)

```
❌ MISSING at app/:
- app/layout.tsx (exists in app/styling/, needs to move)
- app/page.tsx (doesn't exist - need to create)
- app/globals.css (doesn't exist - need to create)
- app/favicon.ico (doesn't exist - need to add)
```

**Why this breaks Next.js:**
- Next.js REQUIRES `app/layout.tsx` at root level
- Without `app/page.tsx`, there's no root route
- App won't build or run correctly

**Impact:** Critical - app currently can't start ⚠️

#### Issue #2: Empty lib/ Directory

```
⚠️ lib/ folder is empty
Should contain:
- lib/ai/ - AI model integration
- lib/rag/ - Vector search & embeddings
- lib/database/ - Prisma client
- lib/supabase/ - Supabase client
- lib/utils/ - Helper functions
```

#### Issue #3: No Prisma Integration

```
❌ Not using shared Prisma schema
Needs to connect to: ../shared/prisma/schema.prisma
```

#### Issue #4: Environment Variables

```
❌ Has .env (should be .env.local and gitignored)
❌ Missing .env.example
```

---

## 🚀 Phase 1: Critical Fixes (DO IMMEDIATELY)

### Step 1.1: Fix Next.js Structure ⚠️ URGENT

```bash
# Run from (chatbot)/ directory

# Move layout from styling/ to app/ root
mv app/styling/layout.tsx app/layout.tsx

# Delete styling folder
rm -rf app/styling/

# Create root page.tsx
cat > app/page.tsx << 'EOF'
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to full chat interface by default
  redirect('/full');
}
EOF

# Create globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

# Update layout.tsx to import globals.css
```

Update `app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Sai - AI Assistant by Strive Tech',
  description: 'Intelligent AI chatbot with industry-specific knowledge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### Step 1.2: Setup Shared Database Connection

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate --schema=../shared/prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=../shared/prisma/schema.prisma",
    "rag:setup": "psql $DATABASE_URL -f SUPABASE-RAG-SETUP-EXECUTE.sql",
    "rag:generate-embeddings": "tsx scripts/generate-embeddings.ts",
    "rag:test-search": "tsx scripts/test-vector-search.ts"
  }
}
```

Then:
```bash
npm run prisma:generate
```

### Step 1.3: Create lib/ Structure

```bash
# Create necessary lib directories
mkdir -p lib/ai
mkdir -p lib/rag
mkdir -p lib/database
mkdir -p lib/supabase
mkdir -p lib/utils
```

Create `lib/database/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Create `lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Step 1.4: Environment Variables

```bash
# Rename .env to .env.local
mv .env .env.local

# Create .env.example
cat > .env.example << 'EOF'
# Database (Supabase PostgreSQL via shared schema)
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/db"

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

# App
NEXT_PUBLIC_CHATBOT_URL="http://localhost:3000"
NODE_ENV="development"
EOF
```

### Step 1.5: Verify Build

```bash
# Clean install
rm -rf node_modules .next
npm install

# Type check
npm run type-check

# Build
npm run build
```

---

## 🧠 Phase 2: RAG (Retrieval Augmented Generation) System

### 2.1: Vector Database Setup

The `SUPABASE-RAG-SETUP-EXECUTE.sql` file already exists. Run it:

```bash
# Setup pgvector extension and tables
npm run rag:setup

# Or manually:
psql $DATABASE_URL -f SUPABASE-RAG-SETUP-EXECUTE.sql
```

This creates:
- `chatbot_knowledge` table with vector embeddings
- Vector similarity search functions
- Indexes for fast retrieval

### 2.2: Implement RAG Service

Create `lib/rag/embeddings.ts`:
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const promises = texts.map(text => generateEmbedding(text));
  return Promise.all(promises);
}
```

Create `lib/rag/search.ts`:
```typescript
import { supabase } from '@/lib/supabase/client';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export async function searchKnowledge(
  query: string,
  industry?: string,
  limit: number = 5
): Promise<SearchResult[]> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search with vector similarity
  const { data, error } = await supabase.rpc('search_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    filter_industry: industry,
  });

  if (error) throw error;

  return data as SearchResult[];
}
```

Create `lib/rag/context.ts`:
```typescript
import { searchKnowledge, SearchResult } from './search';

export async function buildContextFromRAG(
  query: string,
  industry?: string
): Promise<string> {
  const results = await searchKnowledge(query, industry, 5);

  if (results.length === 0) {
    return '';
  }

  const context = results
    .map((r, i) => `[${i + 1}] ${r.content}`)
    .join('\n\n');

  return `Relevant context:\n\n${context}\n\n`;
}
```

### 2.3: Generate Embeddings for Knowledge Base

```bash
# Run embedding generation script
npm run rag:generate-embeddings

# Test vector search
npm run rag:test-search
```

---

## 🤖 Phase 3: AI Integration

### 3.1: Multi-Model AI Service

Create `lib/ai/client.ts`:
```typescript
import { OpenAI } from 'openai';
import Groq from 'groq-sdk';

// OpenRouter for GPT-4, Claude, etc.
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Groq for fast open-source models
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type AIProvider = 'openrouter' | 'groq';
export type AIModel =
  | 'gpt-4-turbo'
  | 'claude-3.5-sonnet'
  | 'llama-3.3-70b'
  | 'mixtral-8x7b';

export function getClient(provider: AIProvider) {
  return provider === 'groq' ? groq : openrouter;
}
```

Create `lib/ai/chat.ts`:
```typescript
import { buildContextFromRAG } from '@/lib/rag/context';
import { openrouter, groq, AIProvider, AIModel } from './client';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model: AIModel;
  provider: AIProvider;
  industry?: string;
  useRAG?: boolean;
  stream?: boolean;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions
) {
  const { model, provider, industry, useRAG = true, stream = true } = options;

  // Build RAG context if enabled
  let contextualMessages = [...messages];
  if (useRAG && messages.length > 0) {
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      const context = await buildContextFromRAG(
        lastUserMessage.content,
        industry
      );

      if (context) {
        contextualMessages = [
          messages[0], // System message
          {
            role: 'system',
            content: context,
          },
          ...messages.slice(1),
        ];
      }
    }
  }

  // Call AI provider
  const client = provider === 'groq' ? groq : openrouter;

  const response = await client.chat.completions.create({
    model,
    messages: contextualMessages,
    stream,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response;
}
```

### 3.2: Streaming Response API

Create `app/api/chat/route.ts`:
```typescript
import { NextRequest } from 'next/server';
import { chat } from '@/lib/ai/chat';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { messages, model, provider, industry } = await req.json();

  const stream = await chat(messages, {
    model,
    provider,
    industry,
    useRAG: true,
    stream: true,
  });

  // Return streaming response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 📦 Phase 4: Widget Embedding System

### 4.1: Widget Embed Code

Create `app/widget/embed/route.ts`:
```typescript
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('key');
  const industry = searchParams.get('industry') || 'general';

  const embedScript = `
    (function() {
      const script = document.createElement('script');
      script.src = '${process.env.NEXT_PUBLIC_CHATBOT_URL}/widget/bundle.js';
      script.async = true;
      script.dataset.apiKey = '${apiKey}';
      script.dataset.industry = '${industry}';
      document.body.appendChild(script);
    })();
  `;

  return new Response(embedScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### 4.2: Widget Component

Create `components/Widget.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

export function Widget({ apiKey, industry }: { apiKey: string; industry: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Sai Assistant</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <ChatInterface apiKey={apiKey} industry={industry} />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </>
  );
}
```

### 4.3: Usage Example

Customers embed the chatbot with:
```html
<script src="https://chatbot.strivetech.ai/widget/embed?key=YOUR_API_KEY&industry=healthcare"></script>
```

---

## 🏭 Phase 5: Industry Customization

### 5.1: Industry Knowledge Base

Structure:
```
app/industries/
├── real-estate/
│   ├── knowledge.ts      # Domain-specific knowledge
│   ├── prompts.ts        # Custom system prompts
│   └── tools.ts          # Industry-specific tools
└── healthcare/
    ├── knowledge.ts
    ├── prompts.ts
    └── tools.ts
```

Example `app/industries/real-estate/prompts.ts`:
```typescript
export const REAL_ESTATE_SYSTEM_PROMPT = `
You are Sai, an AI assistant specializing in real estate.
You have expert knowledge of:
- Property listings and valuations
- Market trends and analytics
- Mortgage calculations
- Legal and compliance requirements

Always provide accurate, helpful information specific to real estate.
`;
```

### 5.2: Dynamic Industry Loading

Create `lib/industries/loader.ts`:
```typescript
export async function getIndustryConfig(industry: string) {
  try {
    const config = await import(`@/app/industries/${industry}/prompts`);
    return config;
  } catch {
    // Fallback to general
    return null;
  }
}
```

---

## ✅ Phase 6: Testing & Quality

### 6.1: Test Coverage Requirements

- RAG System: 90%
- AI Chat Integration: 85%
- Widget Embedding: 80%
- API Routes: 100%
- Overall: 80% minimum

### 6.2: Key Test Files

```typescript
// __tests__/rag/search.test.ts
describe('RAG Search', () => {
  it('should return relevant results', async () => {
    const results = await searchKnowledge('real estate pricing', 'real-estate');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.7);
  });
});

// __tests__/ai/chat.test.ts
describe('AI Chat', () => {
  it('should generate response with RAG context', async () => {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'What is property valuation?' },
    ];

    const response = await chat(messages, {
      model: 'gpt-4-turbo',
      provider: 'openrouter',
      industry: 'real-estate',
      useRAG: true,
    });

    expect(response).toBeDefined();
  });
});
```

---

## 🚀 Phase 7: Deployment

### 7.1: Pre-Deployment Checklist

- [ ] All Phase 1 critical fixes completed
- [ ] RAG system setup and tested
- [ ] AI integration working
- [ ] Widget embedding functional
- [ ] 80%+ test coverage
- [ ] Environment variables set
- [ ] Build succeeds

### 7.2: Deployment

```bash
# Deploy to Vercel
vercel --prod

# Verify endpoints:
# - https://chatbot.strivetech.ai/full (standalone)
# - https://chatbot.strivetech.ai/widget/embed (embed script)
```

---

## 📊 Success Metrics

### Technical
- ✅ RAG search returns relevant results (>0.7 similarity)
- ✅ Response time < 2s for first token
- ✅ Widget loads in < 500ms
- ✅ 80%+ test coverage

### Functional
- ✅ Standalone chat interface working
- ✅ Widget embeddable on external sites
- ✅ Industry-specific responses accurate
- ✅ Conversation memory persists
- ✅ Streaming responses functional

---

## 🔗 Related Documentation

- [Project Root](../README.md)
- [Shared Prisma Schema](../shared/prisma/schema.prisma)
- [Platform Plan](../(platform)/PLAN.md)
- [Website Plan](../(website)/PLAN.md)

---

**Next Steps: Start with Phase 1.1 NOW - fix the missing root files!**
