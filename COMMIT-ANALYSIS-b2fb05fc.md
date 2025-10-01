# Commit Analysis: Chatbot Integration (b2fb05fc)

**Commit Hash:** `b2fb05fc1da9b3e2107e47633e1ea71c115e7ac2`
**Author:** thestrivetech <garrettholland@strivetech.ai>
**Date:** Tuesday, September 30, 2025 - 7:01 PM CST
**Message:** "Chatbot integration"
**Files Changed:** 36 files
**Lines Added:** 5,879 lines

---

## 🎯 Executive Summary

This commit introduces a comprehensive AI chatbot system ("Sai") with RAG (Retrieval-Augmented Generation) capabilities, designed to handle sales conversations, qualify leads, and book consultations. The system uses Groq LLM (llama-3.3-70b), OpenAI embeddings, Supabase vector storage, and advanced conversation analytics.

**Primary Goal:** Create an intelligent sales chatbot that learns from conversations and improves over time through semantic similarity search and pattern matching.

**Technology Stack Added:**
- **AI Models:** Groq SDK (Llama 3.3 70B), OpenAI (text-embedding-ada-002)
- **Database:** Supabase (PostgreSQL with pgvector extension)
- **Frontend:** Framer Motion animations, React hooks
- **State Management:** Custom hooks with localStorage persistence
- **Caching:** In-memory LRU cache service

---

## 🏗️ Architecture Overview

### Data Flow Architecture

```
User Input
    ↓
ChatContainer (UI Component)
    ↓
useChat Hook (State Management)
    ↓
/api/chat Route (Next.js API Route)
    ↓
├─→ RAGService.buildRAGContext()
│       ├─→ generateEmbedding() [OpenAI]
│       │       └─→ CacheService (check cache first)
│       └─→ searchSimilarConversations()
│               └─→ Supabase.rpc('match_conversations')
│                       └─→ Vector similarity search (pgvector)
│
├─→ loadIndustryConfig() [Industry-specific prompts]
│
└─→ Groq.chat.completions.create() [Stream LLM response]
        ↓
    SSE Stream to Client
        ↓
    Display in ChatMessage
        ↓
    Store conversation in Supabase
```

### Component Hierarchy

```
Page Routes
├─→ app/page1.tsx (Home/Full mode)
├─→ app/full/page.tsx (Full page mode)
└─→ app/widget/page.tsx (Widget/embed mode)
        ↓
    ChatContainer (471 lines) ⚠️ EXCEEDS 200 SOFT LIMIT
        ├─→ ChatMessage (317 lines) ⚠️ EXCEEDS 200 SOFT LIMIT
        ├─→ ChatInput (367 lines) ⚠️ EXCEEDS 200 SOFT LIMIT
        └─→ Hooks
            ├─→ useChat (523 lines) ⚠️ EXCEEDS 500 HARD LIMIT
            ├─→ useScrollManager (206 lines) ⚠️ EXCEEDS 200 SOFT LIMIT
            └─→ useAdvancedChat (135 lines)
```

### Industry Configuration System

```
lib/industries/
└─→ [industry]/
    ├─→ config.json (Industry metadata)
    ├─→ system-prompt.ts (AI personality/behavior)
    ├─→ conversation-flow.ts (Conversation stages)
    ├─→ problem-patterns.ts (Problem detection)
    └─→ solutions.ts (Solution mapping)
```

---

## 📁 File-by-File Breakdown

### 1. API Routes (1 file, 236 lines)

#### `app/api/chat/route.ts` (236 lines) ❌ VIOLATES ARCHITECTURE

**Purpose:** Main chat endpoint that handles streaming LLM responses with RAG enhancement

**Critical Issues:**
1. **Violates "API routes for webhooks ONLY" rule** from CLAUDE.md
2. Should be a Server Action instead
3. Missing rate limiting
4. Missing authentication/authorization
5. No Zod validation on request body
6. Exceeds 150-line soft limit for API routes

**What it does:**
- Receives chat messages from frontend
- Loads industry-specific configuration
- Performs RAG semantic search to find similar conversations
- Builds enhanced system prompt with contextual intelligence
- Streams response from Groq LLM using SSE (Server-Sent Events)
- Stores conversation in Supabase for future learning

**Key Functions:**
- `POST(req: NextRequest)` - Main handler
- `buildEnhancedSystemPrompt()` - Adds RAG context to base prompt
- `determineConversationStage()` - Discovery → Qualifying → Solutioning → Closing
- `extractProblemsDiscussed()` - Keyword-based problem detection

**Dependencies:**
```typescript
Groq SDK (groq-sdk)
RAGService (lib/services/rag-service)
Industry Config (lib/industries)
```

**Environment Variables Required:**
- `GROQ_API_KEY` - Groq LLM API key

---

### 2. Components (4 files, 1,413 lines total)

#### `components/chat/ChatContainer.tsx` (471 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Main orchestration component for chat UI

**Issues:**
1. 471 lines exceeds 200-line soft target (235% over)
2. Multiple responsibilities (should be split)
3. Uses "use client" correctly but could be optimized
4. Complex state management inline

**What it does:**
- Renders full-page or widget chat interface
- Manages UI state (minimized, stats panel, shortcuts)
- Handles user interactions (send, clear, schedule, export)
- Implements scroll management
- Shows service cards and quick actions
- Manages keyboard shortcuts

**Key Features:**
- Stats panel with conversation metrics
- Service showcase cards (Predictive Analytics, Computer Vision, NLP)
- Quick action buttons (Demo, ROI Calculator, Case Studies)
- Scroll-to-bottom functionality
- Export chat history
- Book consultation integration

**Should be split into:**
- `ChatContainer.tsx` (< 200 lines) - Main orchestration
- `ChatHeader.tsx` - Header with logo, stats, actions
- `ChatStats.tsx` - Statistics panel
- `ServiceShowcase.tsx` - Service cards
- `QuickActions.tsx` - Action buttons

---

#### `components/chat/ChatMessage.tsx` (317 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Individual message rendering with animations

**Issues:**
1. 317 lines exceeds 200-line soft target (158% over)
2. Complex markdown/formatting logic inline
3. Should extract message formatting utilities

**What it does:**
- Renders user vs assistant messages with different styling
- Handles streaming messages with typing indicator
- Processes markdown and special formatting
- Detects and makes URLs clickable (especially Calendly links)
- Shows avatars with glow effects
- Implements message animations

**Key Features:**
- Real-time streaming display
- Markdown support (bold, lists, links)
- Automatic Calendly link detection and styling
- Typing indicator animation
- Framer Motion entrance animations
- Different styles for user/assistant/error messages

**Should be split into:**
- `ChatMessage.tsx` (< 200 lines) - Main rendering
- `MessageContent.tsx` - Content formatting
- `MessageAvatar.tsx` - Avatar display
- `utils/messageFormatting.ts` - Formatting utilities

---

#### `components/chat/ChatInput.tsx` (367 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Message input with auto-resize and controls

**Issues:**
1. 367 lines exceeds 200-line soft target (183% over)
2. Complex animation logic should be extracted
3. Multiple UI states managed inline

**What it does:**
- Auto-resizing textarea input
- Character counter and validation
- Send button with loading states
- Stop generation button
- Secondary actions (Clear, Schedule, Email, Export)
- Placeholder messages with industry context
- Mobile-responsive design

**Key Features:**
- Auto-resize textarea (52px to 140px)
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Visual feedback for typing
- Secondary action buttons with animations
- API key warning display
- Suggested prompts for first message

**Should be split into:**
- `ChatInput.tsx` (< 200 lines) - Main input component
- `InputActions.tsx` - Action buttons bar
- `InputControls.tsx` - Send/Stop buttons
- `hooks/useInputAutoResize.ts` - Auto-resize logic

---

#### `components/shared/Avatars.tsx` (258 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Avatar components with animated effects

**Issues:**
1. 258 lines exceeds 200-line soft target (129% over)
2. Could extract animation configs

**What it does:**
- Renders user and assistant avatars
- Animated glow effects
- Floating particles
- Rotating backgrounds
- Multiple size variants

**Key Features:**
- Strive triangle logo for assistant
- User initials/icon for user messages
- Pulsing glow animations
- Floating particle effects
- Responsive sizing

**Should be optimized to:**
- Extract animation configurations to constants
- Reduce to < 200 lines

---

### 3. Hooks (3 files, 864 lines total)

#### `hooks/useChat.ts` (523 lines) ❌ EXCEEDS HARD LIMIT

**Purpose:** Main chat state management and API communication

**Critical Issues:**
1. **523 lines EXCEEDS 500-line HARD LIMIT** (PR would be blocked)
2. Multiple responsibilities violate Single Responsibility Principle
3. Complex state management should use Zustand
4. Direct fetch to API route instead of Server Action

**What it does:**
- Manages chat messages state
- Handles SSE streaming from API
- Problem detection (client-side)
- Conversation stage tracking
- LocalStorage persistence
- Error handling and retry logic
- Grammar checking on responses
- Calendly link fixing

**Key State:**
```typescript
messages: Message[]
isLoading: boolean
streamingMessage: string
error: string | null
identifiedProblems: ProblemDetection[]
conversationStage: string
```

**Key Functions:**
- `sendMessage()` - Main message sending with streaming
- `handleStreamError()` - Error recovery
- `clearMessages()` - Reset conversation
- `stopGeneration()` - Abort streaming
- `retryLastMessage()` - Retry failed messages
- `getStats()` - Conversation statistics

**Must be split into:**
- `hooks/useChat.ts` (< 300 lines) - Core message state
- `hooks/useChatStream.ts` - SSE streaming logic
- `hooks/useChatPersistence.ts` - LocalStorage management
- `hooks/useProblemDetection.ts` - Problem detection
- `hooks/useChatStats.ts` - Statistics calculation
- `lib/modules/chat/actions.ts` - Server Actions (replace fetch)

---

#### `hooks/useScrollManager.ts` (206 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Manages scroll behavior for chat

**Issues:**
1. 206 lines exceeds 200-line soft target (103% over)
2. Complex scroll logic could be simplified

**What it does:**
- Auto-scroll to bottom on new messages
- Detects user scroll vs auto-scroll
- Shows/hides scroll-to-bottom button
- Smooth scroll animations
- Handles streaming message updates

**Key Features:**
- Debounced scroll detection
- IntersectionObserver for visibility
- Smart auto-scroll (only when near bottom)
- Smooth scroll behavior
- Mobile scroll optimization

---

#### `hooks/useAdvancedChat.ts` (135 lines) ✅ WITHIN LIMITS

**Purpose:** Advanced chat features (greeting, shortcuts, analytics)

**What it does:**
- Time-based greeting generation
- Keyboard shortcut handlers
- Chat analytics tracking
- Session management

**Key Features:**
- Dynamic greeting (morning/afternoon/evening)
- Cmd+K, Cmd+/, Cmd+Enter shortcuts
- Analytics event tracking
- Session ID generation

---

### 4. Services (2 files, 493 lines total)

#### `lib/services/rag-service.ts` (363 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** RAG (Retrieval-Augmented Generation) service with semantic search

**Issues:**
1. 363 lines exceeds 300-line soft target (121% over)
2. Missing Prisma integration (uses Supabase directly)
3. OpenAI embeddings are expensive without proper caching
4. No error handling for OpenAI API failures

**What it does:**
- Generates embeddings using OpenAI (text-embedding-ada-002)
- Searches for similar conversations using vector similarity
- Builds context for LLM from similar conversations
- Stores conversations with embeddings
- Generates guidance based on conversation patterns
- Tracks conversation outcomes and conversion rates

**Key Functions:**
- `generateEmbedding(text: string)` - Cached embedding generation
- `searchSimilarConversations()` - Vector similarity search
- `buildRAGContext()` - Build context from search results
- `storeConversation()` - Save conversation for learning
- `markConversationSuccess()` - Update conversion tracking

**Database Schema Required (MISSING):**
```sql
-- conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  industry TEXT,
  client_id TEXT,
  session_id TEXT,
  user_message TEXT,
  assistant_response TEXT,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions
  problem_detected TEXT,
  solution_presented TEXT,
  conversation_stage TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  booking_completed BOOLEAN,
  response_time_ms INTEGER,
  user_satisfaction INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Vector similarity function
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding VECTOR(1536),
  match_industry TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  assistant_response TEXT,
  problem_detected TEXT,
  solution_presented TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_message,
    c.assistant_response,
    c.problem_detected,
    c.solution_presented,
    c.outcome,
    c.conversion_score,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM conversations c
  WHERE c.industry = match_industry
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Should be split into:**
- `lib/modules/rag/queries/` - Database queries using Prisma
- `lib/modules/rag/actions/` - Server Actions
- `lib/modules/rag/services/embedding.ts` - Embedding generation
- `lib/modules/rag/services/search.ts` - Semantic search

---

#### `lib/services/cache-service.ts` (130 lines) ✅ WITHIN LIMITS

**Purpose:** In-memory LRU cache for embeddings and RAG results

**What it does:**
- LRU (Least Recently Used) cache implementation
- Caches OpenAI embeddings (saves $$$)
- Caches RAG search results
- Automatic expiration
- Cache statistics

**Key Features:**
- Configurable max size (default 1000 entries)
- TTL (Time To Live) support
- Cache hit/miss tracking
- Memory-efficient LRU eviction
- Namespace support for different cache types

**Cache Keys:**
- `embedding:{hash}` - OpenAI embedding results (24hr TTL)
- `rag:{industry}:{hash}` - RAG search results (1hr TTL)

**Cost Savings:**
- OpenAI embeddings: $0.0001 per request
- 90% cache hit rate = $0.90 savings per 10k requests
- Essential for production use

---

### 5. Industry Configuration (5 files, 788 lines total)

#### `lib/industries/index.ts` (128 lines) ✅ WITHIN LIMITS

**Purpose:** Industry configuration loader

**What it does:**
- Dynamic industry config loading
- Fallback to default (strive) industry
- Type-safe config validation
- Error handling for missing configs

---

#### `lib/industries/strive/system-prompt.ts` (175 lines) ✅ WITHIN LIMITS

**Purpose:** Core AI personality and behavior guidelines

**What it does:**
- Defines Sai's conversation approach
- Sets strict boundaries (never give away implementation)
- Response length guidelines
- Personality calibration rules
- Professional discovery questions
- Deflection techniques for pricing/implementation
- Closing strategies for consultation booking

**Key Rules:**
- NEVER provide implementation details
- Keep responses 2-3 sentences per paragraph
- Match user's communication style
- Build personal connection first
- Use professional discovery questions
- Always drive toward consultation when appropriate

---

#### `lib/industries/strive/conversation-flow.ts` (51 lines) ✅ WITHIN LIMITS

**Purpose:** Conversation stage definitions

**Stages:**
1. **Discovery** (0-2 messages) - Learn about business and challenges
2. **Qualifying** (3-4 messages) - Quantify problem and impact
3. **Solutioning** (5-6 messages) - Present tailored solution
4. **Closing** (7+ messages) - Drive toward booking

---

#### `lib/industries/strive/problem-patterns.ts` (176 lines) ✅ WITHIN LIMITS

**Purpose:** Problem detection patterns with regex and keywords

**Detected Problems:**
- Customer Churn (high urgency)
- Support Overload (medium urgency)
- Quality Control Issues (high urgency)
- Fraud/Risk (high urgency)
- Equipment Maintenance (high urgency)
- Inventory Management (medium urgency)
- Revenue Forecasting (medium urgency)
- Data Analytics (low urgency)

**Each Pattern Includes:**
- Keywords and phrases
- Regex patterns
- Urgency level
- Confidence scoring
- Industry relevance

---

#### `lib/industries/strive/solutions.ts` (125 lines) ✅ WITHIN LIMITS

**Purpose:** Solution catalog with problem → solution mapping

**Solutions:**
1. **Churn Prediction AI** - Predicts customer churn 2-4 weeks early
2. **Predictive Maintenance** - Equipment failure prediction
3. **Support Automation** - AI ticket routing and response
4. **Quality Control Vision** - Defect detection with computer vision
5. **Fraud Detection** - Real-time transaction monitoring
6. **Demand Forecasting** - Inventory and revenue prediction

**Each Solution Includes:**
- Problem mapping
- Key benefits
- ROI timeline
- Industry applicability

---

#### `lib/industries/strive/config.json` (103 lines) ✅ WITHIN LIMITS

**Purpose:** Industry metadata and configuration

**Contains:**
- Industry name and description
- Primary verticals
- Conversation settings
- Calendly booking URL
- Feature flags

---

### 6. Types (4 files, 375 lines total)

#### `types/rag.ts` (151 lines) ✅ WITHIN LIMITS

**Purpose:** RAG system type definitions

**Key Types:**
- `ConversationEmbedding` - Stored conversation with vector
- `ExampleConversation` - Training examples
- `SimilarConversation` - Search results
- `SemanticSearchResult` - RAG search output
- `RAGContext` - Enhanced context for LLM
- `LearnedPattern` - Auto-discovered patterns
- `ConversationAnalytics` - Metrics and tracking

---

#### `types/conversation.ts` (56 lines) ✅ WITHIN LIMITS

**Purpose:** Conversation and message types

**Key Types:**
- `Message` - Chat message with metadata
- `ConversationStage` - Stage enum
- `ProblemDetection` - Detected problem info

---

#### `types/industry.ts` (136 lines) ✅ WITHIN LIMITS

**Purpose:** Industry configuration types

**Key Types:**
- `IndustryType` - Industry identifier
- `IndustryConfig` - Full configuration
- `SolutionConfig` - Solution definition
- `ProblemPattern` - Problem detection config

---

#### `types/api.ts` (32 lines) ✅ WITHIN LIMITS

**Purpose:** API request/response types

**Key Types:**
- `ChatRequest` - Chat API request
- `ChatResponse` - Chat API response
- `StreamChunk` - SSE data format

---

### 7. Utilities (2 files, 551 lines total)

#### `app/utils/animationUtils.ts` (211 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Framer Motion animation presets and utilities

**Issues:**
1. 211 lines exceeds 200-line soft target (105% over)
2. Should be in `lib/utils/` not `app/utils/`

**What it provides:**
- Animation presets (fadeIn, scaleIn, slideUp, etc.)
- Floating particle generators
- Stagger animations
- Button animations
- Spring transitions
- Page transitions
- Scroll reveal animations

---

#### `app/utils/parentCommunication.ts` (340 lines) ⚠️ EXCEEDS LIMITS

**Purpose:** Widget → Parent window communication (iframe messaging)

**Issues:**
1. 340 lines exceeds 300-line soft target (113% over)
2. Should be in `lib/utils/` not `app/utils/`
3. Complex iframe communication logic

**What it does:**
- PostMessage API for widget embeds
- Analytics event tracking
- Navigation requests
- Minimize/maximize events
- Message validation
- Parent window detection

---

### 8. Pages (3 files, 193 lines total)

#### `app/full/page.tsx` (64 lines) ✅ WITHIN LIMITS

**Purpose:** Full-page chat mode entry point

**What it does:**
- Renders full-screen chat interface
- Initializes parent communication
- Loading state with Strive logo animation
- Dark mode enforcement

---

#### `app/widget/page.tsx` (43 lines) ✅ WITHIN LIMITS

**Purpose:** Widget/embed mode entry point

**What it does:**
- Compact widget view
- Optimized for iframe embedding
- Mobile-responsive

---

#### `app/page1.tsx` (86 lines) ❌ NAMING ISSUE

**Purpose:** Home page (duplicate/test file)

**Issues:**
1. **Incorrect naming convention** - Should be `page.tsx`
2. Creates conflict with existing `app/page.tsx`
3. Appears to be a duplicate or test version

---

### 9. Styles and Config (5 files, 544 lines total)

#### `app/globals1.css` (406 lines) ❌ NAMING ISSUE

**Purpose:** Global styles (duplicate file)

**Issues:**
1. **Incorrect naming** - Should be `globals.css`
2. Conflicts with existing `app/globals.css`
3. Appears to be version copy

**What it includes:**
- Tailwind base/components/utilities
- Custom scrollbar styles
- Chat-specific styles
- Animation keyframes
- Widget/full mode styles
- Mobile responsive styles

---

#### `app/layout1.tsx` (61 lines) ❌ NAMING ISSUE

**Purpose:** Root layout (duplicate file)

**Issues:**
1. **Incorrect naming** - Should be `layout.tsx`
2. Conflicts with existing `app/layout.tsx`

**What it includes:**
- Inter font configuration
- Dark mode enforcement
- Toast notification setup
- Metadata configuration

---

#### `app/constants/chatConstants.ts` (64 lines) ✅ WITHIN LIMITS

**Purpose:** Chat configuration constants

**Contains:**
- URLs (Calendly, website, Groq console)
- Service cards configuration
- Animation durations
- Sizes and colors
- Brand color definitions

---

#### `tailwind.config.ts` (66 lines) ⚠️ NEW FILE

**Purpose:** Tailwind CSS configuration

**Issues:**
- May conflict with existing Tailwind config
- Should merge with existing config

---

#### `tsconfig.json` (27 lines) ⚠️ NEW FILE

**Purpose:** TypeScript configuration

**Issues:**
- May conflict with existing TypeScript config
- Should merge with existing config

---

### 10. Scripts (1 file, 242 lines)

#### `scripts/seed-training-data.ts` (242 lines) ✅ WITHIN LIMITS

**Purpose:** Seed database with example conversations for RAG training

**What it does:**
- Creates example conversations with embeddings
- Stores in Supabase conversations table
- Covers multiple problem types
- Includes successful conversation patterns
- Sets conversion scores

**Usage:**
```bash
npm run seed
```

---

### 11. Assets (1 file)

#### `public/images/strive-wordmark.png` (Binary, 19.6 KB)

**Purpose:** Strive logo for chat header

---

### 12. Config Files (3 files)

#### `package.json` (41 lines) ⚠️ DEPENDENCY UPDATES

**New Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.47.10",
  "@upstash/ratelimit": "^2.0.6", // NOT USED YET
  "@upstash/redis": "^1.35.4", // NOT USED YET
  "axios": "^1.12.2",
  "framer-motion": "^12.23.22",
  "groq-sdk": "^0.8.0",
  "lucide-react": "^0.544.0",
  "openai": "^4.78.1",
  "react-hot-toast": "^2.6.0",
  "zod": "^4.1.11"
}
```

**Issues:**
- Upstash packages added but not implemented
- Zod added but not used in validation
- Should use existing Next.js/React versions

---

#### `middleware.ts` (76 lines) ⚠️ NEW FILE

**Purpose:** Next.js middleware (ADDED TO ROOT)

**Issues:**
1. **Conflicts with existing middleware** at root level
2. Should merge with existing auth middleware
3. Currently empty/placeholder

---

#### `next.config.ts` (7 lines) ⚠️ NEW FILE

**Purpose:** Next.js configuration

**Issues:**
- May conflict with existing `next.config.mjs`
- Should merge configurations

---

#### `next-env.d.ts` (6 lines) ✅ AUTO-GENERATED

**Purpose:** Next.js TypeScript definitions

---

---

## 🚨 Critical Issues & Anti-Patterns

### 1. Architecture Violations (MUST FIX)

#### ❌ API Route for Data Fetching
**File:** `app/api/chat/route.ts`
**Violation:** CLAUDE.md states "API Routes → Webhooks ONLY"
**Impact:** Wrong architectural pattern for Next.js 15
**Fix:** Convert to Server Action

```typescript
// ❌ WRONG - Current Implementation
// app/api/chat/route.ts
export async function POST(req: NextRequest) {
  // ... handles chat requests
}

// Frontend calls:
fetch('/api/chat', { method: 'POST', body: JSON.stringify(messages) })

// ✅ CORRECT - Server Action
// lib/modules/chat/actions/sendMessage.ts
'use server';

export async function sendChatMessage(messages: Message[], industry: string) {
  // ... same logic but as Server Action
  // Can return ReadableStream for streaming
}

// Frontend calls:
import { sendChatMessage } from '@/lib/modules/chat/actions';
await sendChatMessage(messages, industry);
```

**Why this matters:**
- Server Actions are type-safe
- Better error handling
- Automatic request deduplication
- Built-in loading states
- No need for separate API layer

---

#### ❌ Direct Supabase Usage Instead of Prisma
**File:** `lib/services/rag-service.ts`
**Violation:** CLAUDE.md states "Database: Prisma ONLY (no Drizzle, no raw SQL)"
**Impact:** Breaks single source of truth for database access

```typescript
// ❌ WRONG - Direct Supabase
const { data } = await supabase.rpc('match_conversations', {
  query_embedding: embedding,
  match_industry: industry
});

// ✅ CORRECT - Prisma with pgvector
// prisma/schema.prisma
model Conversation {
  id                   String   @id @default(uuid())
  industry             String
  sessionId            String   @map("session_id")
  userMessage          String   @map("user_message")
  assistantResponse    String   @map("assistant_response")
  embedding            Unsupported("vector(1536)")?
  problemDetected      String?  @map("problem_detected")
  solutionPresented    String?  @map("solution_presented")
  conversationStage    String   @map("conversation_stage")
  outcome              String
  conversionScore      Float?   @map("conversion_score")
  bookingCompleted     Boolean  @default(false) @map("booking_completed")
  responseTimeMs       Int?     @map("response_time_ms")
  userSatisfaction     Int?     @map("user_satisfaction")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  @@map("conversations")
  @@index([industry])
  @@index([sessionId])
}

// lib/modules/rag/queries/searchConversations.ts
import { prisma } from '@/lib/prisma';

export async function searchSimilarConversations(
  embedding: number[],
  industry: string,
  threshold: number = 0.75,
  limit: number = 5
) {
  // Use Prisma.$queryRaw with parameterized queries
  return await prisma.$queryRaw`
    SELECT id, user_message, assistant_response, problem_detected,
           solution_presented, outcome, conversion_score,
           1 - (embedding <=> ${embedding}::vector) AS similarity
    FROM conversations
    WHERE industry = ${industry}
      AND 1 - (embedding <=> ${embedding}::vector) > ${threshold}
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${limit}
  `;
}
```

**Required Prisma Setup:**
```bash
# Add pgvector extension
npm install @prisma/client prisma-extension-pgvector

# In migrations
CREATE EXTENSION IF NOT EXISTS vector;
```

---

#### ❌ Missing Zod Validation
**File:** `app/api/chat/route.ts` line 16
**Violation:** "Validation: Zod ALWAYS"
**Impact:** No runtime type safety, potential security issues

```typescript
// ❌ WRONG - No validation
const { messages, industry, sessionId } = await req.json();

// ✅ CORRECT - Zod validation
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000)
  })).min(1),
  industry: z.string().default('strive'),
  sessionId: z.string().uuid(),
  conversationStage: z.enum(['discovery', 'qualifying', 'solutioning', 'closing']).optional(),
  detectedProblems: z.array(z.string()).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = ChatRequestSchema.parse(body); // Throws if invalid
  // ... continue with validated data
}
```

---

### 2. File Size Violations (MUST FIX)

#### 🔴 HARD LIMIT EXCEEDED (BLOCKS PR)

**File:** `hooks/useChat.ts` - 523 lines
**Limit:** 500 lines (HARD LIMIT enforced by ESLint)
**Overage:** 23 lines (105%)
**Impact:** PR will be blocked, CI will fail

**Required Split:**
```
hooks/useChat.ts (523 lines)
    ↓ SPLIT INTO ↓
├─→ hooks/useChat.ts (280 lines) - Core message state
├─→ hooks/useChatStream.ts (120 lines) - SSE streaming
├─→ hooks/useChatPersistence.ts (80 lines) - LocalStorage
└─→ lib/modules/chat/utils/messageFormatting.ts (43 lines)
```

---

#### ⚠️ SOFT LIMITS EXCEEDED (CODE REVIEW WARNINGS)

| File | Lines | Limit | Overage | Priority |
|------|-------|-------|---------|----------|
| `ChatContainer.tsx` | 471 | 200 | 235% | HIGH |
| `ChatInput.tsx` | 367 | 200 | 183% | HIGH |
| `rag-service.ts` | 363 | 300 | 121% | MEDIUM |
| `ChatMessage.tsx` | 317 | 200 | 158% | HIGH |
| `Avatars.tsx` | 258 | 200 | 129% | LOW |
| `api/chat/route.ts` | 236 | 150 | 157% | HIGH |
| `animationUtils.ts` | 211 | 200 | 105% | LOW |
| `useScrollManager.ts` | 206 | 200 | 103% | LOW |

---

### 3. File Naming & Location Issues

#### ❌ Duplicate/Test Files (DELETE THESE)
- `app/page1.tsx` → Should be `app/page.tsx` (or delete if duplicate)
- `app/layout1.tsx` → Should be `app/layout.tsx` (or delete if duplicate)
- `app/globals1.css` → Should be `app/globals.css` (or delete if duplicate)

**These create conflicts and confusion. Likely leftover from development.**

---

#### ❌ Wrong Directory Structure
- `app/utils/` → Should be `lib/utils/`
- Files in `app/app/` → Should be in `app/`

**Next.js 15 App Router structure:**
```
app/
├── page.tsx           # NOT app/app/page.tsx
├── layout.tsx         # NOT app/app/layout.tsx
├── globals.css        # NOT app/app/globals.css
├── (platform)/        # Route groups
├── (web)/             # Route groups
└── api/               # API routes

lib/
├── utils/             # NOT app/utils/
├── modules/
└── services/
```

---

### 4. Missing Core Infrastructure

#### ❌ No Database Schema
**Impact:** RAG service won't work without Supabase setup
**Required:**
```sql
-- conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  client_id TEXT,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  embedding vector(1536), -- pgvector extension required
  problem_detected TEXT,
  solution_presented TEXT,
  conversation_stage TEXT NOT NULL,
  outcome TEXT NOT NULL,
  conversion_score FLOAT,
  booking_completed BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  user_satisfaction INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- example_conversations table
CREATE TABLE example_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  user_input TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  embedding vector(1536),
  problem_type TEXT,
  solution_type TEXT,
  conversation_stage TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(1536),
  match_industry TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  assistant_response TEXT,
  problem_detected TEXT,
  solution_presented TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_message,
    c.assistant_response,
    c.problem_detected,
    c.solution_presented,
    c.outcome,
    c.conversion_score,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM conversations c
  WHERE c.industry = match_industry
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Similar function for examples
CREATE OR REPLACE FUNCTION match_examples(
  query_embedding vector(1536),
  match_industry TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_input TEXT,
  assistant_response TEXT,
  problem_type TEXT,
  solution_type TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.user_input,
    e.assistant_response,
    e.problem_type,
    e.solution_type,
    e.outcome,
    e.conversion_score,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM example_conversations e
  WHERE e.industry = match_industry
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_conversations_industry ON conversations(industry);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_embedding ON conversations USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_examples_industry ON example_conversations(industry);
CREATE INDEX idx_examples_embedding ON example_conversations USING ivfflat (embedding vector_cosine_ops);
```

---

#### ❌ Missing Environment Variables
**File:** `.env.local` (not included in commit)
**Required:**
```bash
# Groq LLM
GROQ_API_KEY=gsk_xxxxx

# OpenAI Embeddings
OPENAI_API_KEY=sk-xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx # SERVICE ROLE (never expose to client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx # Safe for client

# Optional: Upstash Redis for rate limiting (added but not used)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

---

#### ❌ No Rate Limiting Implemented
**Package installed:** `@upstash/ratelimit`, `@upstash/redis`
**Implementation:** MISSING
**Impact:** Vulnerable to API abuse, expensive OpenAI/Groq costs

**Should add:**
```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});

// In Server Action
const { success } = await ratelimit.limit(sessionId);
if (!success) {
  throw new Error('Rate limit exceeded');
}
```

---

#### ❌ No Authentication
**Impact:** Anyone can use the chatbot API without auth
**Required:** Integrate with Supabase Auth (already in project)

```typescript
// middleware.ts - Add auth check
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();

  // Protect chat endpoints
  if (req.nextUrl.pathname.startsWith('/api/chat')) {
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
}
```

---

### 5. Testing & Quality Issues

#### ❌ No Tests
**Files Added:** 36
**Tests Added:** 0
**Target Coverage:** 80% minimum
**Actual Coverage:** 0%

**Required Tests:**
```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useChat.test.ts
│   │   ├── useChatStream.test.ts
│   │   └── useScrollManager.test.ts
│   ├── services/
│   │   ├── rag-service.test.ts
│   │   └── cache-service.test.ts
│   └── utils/
│       ├── messageFormatting.test.ts
│       └── problemDetection.test.ts
├── integration/
│   ├── chat-flow.test.ts
│   ├── rag-search.test.ts
│   └── conversation-storage.test.ts
└── e2e/
    ├── chatbot-conversation.spec.ts
    └── widget-embed.spec.ts
```

**Example Test:**
```typescript
// tests/unit/hooks/useChat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

describe('useChat', () => {
  it('should send message and receive response', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('should detect problems in messages', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('We are losing customers');
    });

    expect(result.current.identifiedProblems).toContainEqual(
      expect.objectContaining({ key: 'churn' })
    );
  });
});
```

---

#### ❌ No Error Boundaries
**Impact:** Errors in chat could crash entire app
**Required:** React Error Boundaries around chat components

```typescript
// components/chat/ChatErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chat-error">
          <h2>Something went wrong with the chat</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 6. Performance Issues

#### ⚠️ No Lazy Loading
**Issue:** All components load immediately
**Impact:** Larger initial bundle size

```typescript
// ❌ Current
import ChatContainer from '@/components/chat/ChatContainer';

// ✅ Should be
import dynamic from 'next/dynamic';

const ChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer'),
  {
    ssr: false, // Chat is interactive
    loading: () => <ChatSkeleton />
  }
);
```

---

#### ⚠️ OpenAI Embeddings Not Optimally Cached
**Issue:** Cache is in-memory only, lost on server restart
**Impact:** Expensive embedding regeneration
**Cost:** $0.0001 per embedding

**Solution:** Use Redis for persistent caching
```typescript
// lib/services/embedding-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const key = `embedding:${hashText(text)}`;
  const cached = await redis.get(key);
  return cached as number[] | null;
}

export async function setCachedEmbedding(text: string, embedding: number[]): Promise<void> {
  const key = `embedding:${hashText(text)}`;
  await redis.set(key, embedding, { ex: 86400 }); // 24 hours
}
```

---

#### ⚠️ No Streaming Optimization
**Issue:** Full message re-renders on every token
**Impact:** Performance degradation with long responses

**Solution:** Debounce updates
```typescript
// In useChat.ts
const debouncedUpdate = useDebouncedCallback((content: string) => {
  setStreamingMessage(content);
}, 50); // Update every 50ms instead of every token
```

---

### 7. Security Issues

#### 🔴 CRITICAL: Service Role Key Exposed Risk
**File:** `lib/services/rag-service.ts` line 15
**Issue:** Uses `SUPABASE_SERVICE_KEY` (full database access)
**Impact:** If leaked, attacker has full database control

**Current:**
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // 🔴 DANGEROUS
);
```

**Why it's dangerous:**
- Service role key bypasses Row Level Security (RLS)
- Full read/write access to entire database
- Should NEVER be used in API routes accessible from frontend
- Should ONLY be used in secure server-side contexts

**Correct approach:**
```typescript
// For client-facing operations - Use RLS with anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ SAFE with RLS
);

// Set up Row Level Security in Supabase
CREATE POLICY "Users can only read their own conversations"
ON conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**When service key is acceptable:**
- Server-side cron jobs
- Admin-only operations
- Migrations/seeds
- Never in API routes that users can call

---

#### ⚠️ No Input Sanitization
**File:** `hooks/useChat.ts` line 224
**Issue:** User input sent directly to LLM without sanitization
**Impact:** Potential prompt injection attacks

```typescript
// ❌ Current - No sanitization
const newUserMessage: Message = {
  content: userMessage.trim(), // Only trim
};

// ✅ Should include
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userMessage, {
  ALLOWED_TAGS: [], // No HTML
  ALLOWED_ATTR: []
});

// Also validate length
if (sanitized.length > 10000) {
  throw new Error('Message too long');
}
```

---

#### ⚠️ No CORS Configuration
**File:** `app/api/chat/route.ts`
**Issue:** No CORS headers for widget embedding
**Impact:** Won't work when embedded on other domains

```typescript
// Should add CORS headers
export async function POST(req: NextRequest) {
  // ... existing code ...

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

---

### 8. Code Quality Issues

#### ⚠️ TypeScript `any` Usage
**Files:** Multiple
**Issue:** Loose typing defeats TypeScript benefits

```typescript
// ❌ Bad - from rag-service.ts line 150
function buildEnhancedSystemPrompt(basePrompt: string, ragContext: any)

// ✅ Good
interface RAGContext {
  searchResults: SemanticSearchResult;
  guidance: {
    suggestedApproach: string;
    keyPoints: string[];
    avoidTopics: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

function buildEnhancedSystemPrompt(
  basePrompt: string,
  ragContext: RAGContext
): string
```

---

#### ⚠️ Console.log in Production
**Files:** Multiple
**Issue:** Debug logs left in production code

```typescript
// ❌ Bad - from rag-service.ts line 48
console.log('🔍 Searching for similar conversations...');
console.log('✅ RAG Context:', { /* ... */ });

// ✅ Good - Use proper logging
import { logger } from '@/lib/logger';

logger.debug('RAG search started', { industry, messageHash });
logger.info('RAG context built', { confidence, problems });
```

---

#### ⚠️ Magic Numbers
**Files:** Multiple
**Issue:** Hardcoded values without constants

```typescript
// ❌ Bad
if (userMessages.length <= 2) return 'discovery';
if (userMessages.length <= 4) return 'qualifying';

// ✅ Good
const CONVERSATION_STAGES = {
  DISCOVERY: { maxMessages: 2, stage: 'discovery' },
  QUALIFYING: { maxMessages: 4, stage: 'qualifying' },
  SOLUTIONING: { maxMessages: 6, stage: 'solutioning' },
  CLOSING: { maxMessages: Infinity, stage: 'closing' },
} as const;

function determineStage(messageCount: number) {
  for (const config of Object.values(CONVERSATION_STAGES)) {
    if (messageCount <= config.maxMessages) {
      return config.stage;
    }
  }
}
```

---

## ✅ Correct Implementation Guide

### Phase 1: Foundation & Structure (Week 1)

#### Step 1.1: Clean Up Duplicate Files
```bash
# DELETE these files
rm app/page1.tsx
rm app/layout1.tsx
rm app/globals1.css

# MERGE configurations
# - Merge tailwind.config.ts into existing config
# - Merge tsconfig.json into existing config
# - Merge middleware.ts into existing middleware
```

---

#### Step 1.2: Fix Directory Structure
```bash
# Move utils to correct location
mv app/utils/ lib/utils/

# Ensure correct App Router structure
# app/
#   ├── page.tsx (home)
#   ├── layout.tsx (root layout)
#   ├── globals.css (styles)
#   ├── (platform)/
#   │   ├── chat/
#   │   │   └── page.tsx (full chat mode)
#   │   └── dashboard/
#   └── api/
#       └── webhooks/ (only webhooks here)
```

---

#### Step 1.3: Add Prisma Schema for RAG
```prisma
// prisma/schema.prisma

// Add to existing schema
model Conversation {
  id                   String   @id @default(uuid())
  industry             String
  clientId             String?  @map("client_id")
  sessionId            String   @map("session_id")
  userId               String?  @map("user_id") // Link to User model

  // Content
  userMessage          String   @map("user_message") @db.Text
  assistantResponse    String   @map("assistant_response") @db.Text
  embedding            Unsupported("vector(1536)")?

  // Metadata
  problemDetected      String?  @map("problem_detected")
  solutionPresented    String?  @map("solution_presented")
  conversationStage    ConversationStage @map("conversation_stage")

  // Outcomes
  outcome              ConversationOutcome
  conversionScore      Float?   @map("conversion_score")
  bookingCompleted     Boolean  @default(false) @map("booking_completed")

  // Analytics
  responseTimeMs       Int?     @map("response_time_ms")
  userSatisfaction     Int?     @map("user_satisfaction")

  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  // Relations
  user                 User?    @relation(fields: [userId], references: [id])

  @@map("conversations")
  @@index([industry])
  @@index([sessionId])
  @@index([userId])
}

model ExampleConversation {
  id                   String   @id @default(uuid())
  industry             String

  userInput            String   @map("user_input") @db.Text
  assistantResponse    String   @map("assistant_response") @db.Text
  embedding            Unsupported("vector(1536)")?

  problemType          String   @map("problem_type")
  solutionType         String   @map("solution_type")
  conversationStage    String   @map("conversation_stage")

  outcome              String
  conversionScore      Float    @map("conversion_score")

  isVerified           Boolean  @default(false) @map("is_verified")
  notes                String?  @db.Text

  createdAt            DateTime @default(now()) @map("created_at")

  @@map("example_conversations")
  @@index([industry])
}

enum ConversationStage {
  DISCOVERY
  QUALIFYING
  SOLUTIONING
  CLOSING
}

enum ConversationOutcome {
  BOOKING_COMPLETED
  CONVERSATION_ENDED
  IN_PROGRESS
}
```

**Run migration:**
```bash
# Create migration
npx prisma migrate dev --name add_rag_conversations

# Generate client
npx prisma generate
```

---

#### Step 1.4: Set Up Environment Variables
```bash
# .env.local

# Groq LLM (required)
GROQ_API_KEY=gsk_your_key_here

# OpenAI Embeddings (required for RAG)
OPENAI_API_KEY=sk-your_key_here

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key  # Keep secure!

# Upstash Redis (for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Optional: Allowed origins for CORS (widget embedding)
ALLOWED_ORIGINS=https://yourdomain.com,https://partner.com
```

---

### Phase 2: Refactor Core Files (Week 2)

#### Step 2.1: Split `useChat.ts` (523 → 4 files)

**File 1: `hooks/useChat.ts` (280 lines)**
```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import { useChatStream } from './useChatStream';
import { useChatPersistence } from './useChatPersistence';
import { useProblemDetection } from './useProblemDetection';
import { sendChatMessage } from '@/lib/modules/chat/actions';
import type { Message, ChatStats } from '@/types/conversation';

export function useChat(industry: string = 'strive') {
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef(`conv-${Date.now()}`);
  const sessionIdRef = useRef(generateSessionId());

  // Compose hooks
  const { identifiedProblems, detectProblems } = useProblemDetection();
  const { streamMessage, stopStreaming } = useChatStream();
  const { saveChat, loadChat, clearChat } = useChatPersistence();

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Detect problems
    const detectedProblems = detectProblems(userMessage);

    // Add user message
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Call Server Action instead of API route
      const response = await sendChatMessage({
        messages: [...messages, newMessage],
        industry,
        sessionId: sessionIdRef.current,
        detectedProblems,
      });

      // Handle streaming response
      await streamMessage(response, (content) => {
        // Update message as it streams
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: new Date(),
        }]);
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, industry, detectProblems, streamMessage]);

  const clearMessages = useCallback(() => {
    setMessages([getWelcomeMessage()]);
    clearChat();
    conversationIdRef.current = `conv-${Date.now()}`;
  }, [clearChat]);

  const getStats = useCallback((): ChatStats => ({
    totalMessages: messages.length,
    userMessages: messages.filter(m => m.role === 'user').length,
    assistantMessages: messages.filter(m => m.role === 'assistant').length,
    conversationId: conversationIdRef.current,
    hasApiKey: true,
    isStreaming: isLoading,
    identifiedProblems: identifiedProblems.map(p => p.key),
    conversationStage: determineStage(messages.length),
  }), [messages, isLoading, identifiedProblems]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration: stopStreaming,
    getStats,
  };
}
```

**File 2: `hooks/useChatStream.ts` (120 lines)**
```typescript
'use client';

import { useCallback, useRef } from 'react';

export function useChatStream() {
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const streamMessage = useCallback(async (
    response: Response,
    onChunk: (content: string) => void
  ) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    readerRef.current = reader;
    const decoder = new TextDecoder();
    let accumulated = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.content;
            onChunk(accumulated);
          } catch (e) {
            console.warn('Failed to parse chunk:', data);
          }
        }
      }
    } finally {
      readerRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
  }, []);

  return { streamMessage, stopStreaming };
}
```

**File 3: `hooks/useChatPersistence.ts` (80 lines)**
```typescript
'use client';

import { useCallback, useEffect } from 'react';
import type { Message } from '@/types/conversation';

const STORAGE_KEY = 'strive-chat-history';

export function useChatPersistence() {
  const saveChat = useCallback((messages: Message[], metadata: any) => {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        messages: messages.filter(m => !m.isStreaming),
        metadata,
        timestamp: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save chat:', error);
    }
  }, []);

  const loadChat = useCallback((): Message[] | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return parsed.messages;
    } catch (error) {
      console.warn('Failed to load chat:', error);
      return null;
    }
  }, []);

  const clearChat = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { saveChat, loadChat, clearChat };
}
```

**File 4: `hooks/useProblemDetection.ts` (60 lines)**
```typescript
'use client';

import { useState, useCallback } from 'react';
import type { ProblemDetection } from '@/types/conversation';

const PROBLEM_KEYWORDS = {
  churn: ['losing customers', 'retention', 'cancel', 'churn'],
  support: ['customer support', 'tickets', 'overwhelmed'],
  quality: ['defect', 'quality control', 'faulty'],
  // ... more patterns
} as const;

export function useProblemDetection() {
  const [identifiedProblems, setIdentifiedProblems] = useState<ProblemDetection[]>([]);

  const detectProblems = useCallback((message: string): ProblemDetection[] => {
    const lowerMessage = message.toLowerCase();
    const detected: ProblemDetection[] = [];

    for (const [key, keywords] of Object.entries(PROBLEM_KEYWORDS)) {
      const matchedKeywords = keywords.filter(kw => lowerMessage.includes(kw));
      if (matchedKeywords.length > 0) {
        detected.push({
          key,
          confidence: matchedKeywords.length > 1 ? 'high' : 'medium',
          urgency: 'medium', // Could be dynamic
          matchedKeywords,
        });
      }
    }

    // Update state
    setIdentifiedProblems(prev => {
      const updated = [...prev];
      detected.forEach(problem => {
        if (!updated.find(p => p.key === problem.key)) {
          updated.push(problem);
        }
      });
      return updated;
    });

    return detected;
  }, []);

  return { identifiedProblems, detectProblems };
}
```

---

#### Step 2.2: Convert API Route to Server Action

**File: `lib/modules/chat/actions/sendMessage.ts`**
```typescript
'use server';

import { z } from 'zod';
import { Groq } from 'groq-sdk';
import { loadIndustryConfig } from '@/lib/industries';
import { RAGService } from '@/lib/modules/rag/services';
import { ratelimit } from '@/lib/ratelimit';
import { auth } from '@/lib/auth'; // Your auth system

// Zod validation schema
const SendMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000),
  })).min(1),
  industry: z.string().default('strive'),
  sessionId: z.string(),
  detectedProblems: z.array(z.object({
    key: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
    urgency: z.enum(['low', 'medium', 'high']),
  })).optional(),
});

type SendMessageInput = z.infer<typeof SendMessageSchema>;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function sendChatMessage(input: SendMessageInput) {
  // 1. Validate input
  const validated = SendMessageSchema.parse(input);
  const { messages, industry, sessionId, detectedProblems } = validated;

  // 2. Check authentication
  const session = await auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 3. Rate limiting
  const { success } = await ratelimit.limit(sessionId);
  if (!success) {
    throw new Error('Rate limit exceeded. Please wait a moment.');
  }

  // 4. Load industry config
  const config = await loadIndustryConfig(industry);

  // 5. Build RAG context
  const latestMessage = messages[messages.length - 1];
  const ragContext = await RAGService.buildRAGContext(
    latestMessage.content,
    industry,
    {
      stage: determineStage(messages.length),
      messageCount: messages.length,
      problemsDiscussed: detectedProblems?.map(p => p.key) || [],
    }
  );

  // 6. Build enhanced prompt
  const enhancedPrompt = buildEnhancedSystemPrompt(
    config.systemPrompt,
    ragContext
  );

  // 7. Prepare messages for Groq
  const groqMessages = [
    { role: 'system' as const, content: enhancedPrompt },
    ...messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  // 8. Stream response
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  });

  // 9. Create readable stream
  let fullResponse = '';

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }

        // 10. Store conversation
        await RAGService.storeConversation({
          industry,
          sessionId,
          userId: session.user.id,
          userMessage: latestMessage.content,
          assistantResponse: fullResponse,
          conversationStage: determineStage(messages.length),
          outcome: 'IN_PROGRESS',
          bookingCompleted: false,
          problemDetected: detectedProblems?.[0]?.key,
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function determineStage(messageCount: number): string {
  if (messageCount <= 2) return 'DISCOVERY';
  if (messageCount <= 4) return 'QUALIFYING';
  if (messageCount <= 6) return 'SOLUTIONING';
  return 'CLOSING';
}

function buildEnhancedSystemPrompt(
  basePrompt: string,
  ragContext: any
): string {
  // ... same logic as before
}
```

---

#### Step 2.3: Convert RAG Service to Use Prisma

**File: `lib/modules/rag/services/search.ts`**
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { embedText } from './embedding';
import { getCachedSearch, setCachedSearch } from './cache';
import type { SemanticSearchResult } from '@/types/rag';

export async function searchSimilarConversations(
  userMessage: string,
  industry: string,
  options: {
    threshold?: number;
    limit?: number;
  } = {}
): Promise<SemanticSearchResult> {
  const { threshold = 0.75, limit = 5 } = options;

  // Check cache
  const cacheKey = `${industry}:${hashText(userMessage)}`;
  const cached = await getCachedSearch(cacheKey);
  if (cached) return cached;

  // Generate embedding
  const embedding = await embedText(userMessage);

  // Search with Prisma
  const results = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      user_message,
      assistant_response,
      problem_detected,
      solution_presented,
      outcome,
      conversion_score,
      1 - (embedding <=> ${embedding}::vector) AS similarity
    FROM conversations
    WHERE industry = ${industry}
      AND 1 - (embedding <=> ${embedding}::vector) > ${threshold}
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${limit}
  `;

  // Analyze results
  const searchResult: SemanticSearchResult = {
    similarConversations: results,
    detectedProblems: extractProblems(results),
    recommendedSolutions: extractSolutions(results),
    bestPattern: findBestPattern(results),
    confidence: calculateConfidence(results),
  };

  // Cache results
  await setCachedSearch(cacheKey, searchResult, 3600); // 1 hour

  return searchResult;
}

function extractProblems(results: any[]): string[] {
  const problemCounts = new Map<string, number>();
  results.forEach(r => {
    if (r.problemDetected) {
      problemCounts.set(
        r.problemDetected,
        (problemCounts.get(r.problemDetected) || 0) + 1
      );
    }
  });

  return Array.from(problemCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([problem]) => problem);
}

// ... other helper functions
```

---

#### Step 2.4: Add Rate Limiting

**File: `lib/ratelimit.ts`**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
  prefix: 'strive-chat',
});

export const embedRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 embeddings per hour
  analytics: true,
  prefix: 'strive-embed',
});
```

---

### Phase 3: Component Refactoring (Week 3)

#### Step 3.1: Split ChatContainer (471 → 5 files)

**Main File: `components/chat/ChatContainer.tsx` (180 lines)**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { useScrollManager } from '@/hooks/useScrollManager';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatStats from './ChatStats';
import ServiceShowcase from './ServiceShowcase';

interface ChatContainerProps {
  mode?: 'full' | 'widget';
}

export default function ChatContainer({ mode = 'full' }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
    retryLastMessage,
    getStats,
  } = useChat();

  const {
    scrollContainerRef,
    messagesEndRef,
    showScrollButton,
    handleScrollToBottom,
  } = useScrollManager(messages);

  const [isMinimized, setIsMinimized] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();

  return (
    <motion.div
      className={`chat-container ${mode === 'widget' ? 'widget-chat' : 'full-chat'}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {mode === 'full' && (
        <ChatHeader
          stats={stats}
          showStats={showStats}
          onToggleStats={() => setShowStats(!showStats)}
          onClear={clearMessages}
          onMinimize={() => setIsMinimized(!isMinimized)}
          isMinimized={isMinimized}
        />
      )}

      {!isMinimized && (
        <>
          {showStats && <ChatStats stats={stats} />}

          <ChatMessages
            ref={scrollContainerRef}
            messages={messages}
            isLoading={isLoading}
            error={error}
            mode={mode}
            showScrollButton={showScrollButton}
            onScrollToBottom={handleScrollToBottom}
            onRetry={retryLastMessage}
          >
            {messages.length === 1 && mode === 'full' && (
              <ServiceShowcase onSelectService={sendMessage} />
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            disabled={!stats.hasApiKey}
            onStop={stopGeneration}
            onClear={clearMessages}
            mode={mode}
          />
        </>
      )}
    </motion.div>
  );
}
```

**Extract: `components/chat/ChatHeader.tsx` (120 lines)**
```typescript
'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import type { ChatStats } from '@/types/conversation';

interface ChatHeaderProps {
  stats: ChatStats;
  showStats: boolean;
  onToggleStats: () => void;
  onClear: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export default function ChatHeader({
  stats,
  showStats,
  onToggleStats,
  onClear,
  onMinimize,
  isMinimized,
}: ChatHeaderProps) {
  const handleScheduleClick = () => {
    window.open('https://calendly.com/strivetech', '_blank');
  };

  return (
    <motion.div className="chat-header">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <motion.img
            src="/images/strive-wordmark.png"
            alt="STRIVE"
            className="h-10 w-auto cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => window.open('https://strivetech.ai', '_blank')}
          />

          <div className="flex items-center space-x-2 text-sm mt-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 glow-pulse" />
            <span>Sai Active</span>
            <span>•</span>
            <span>{stats.totalMessages - 1} messages</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleScheduleClick}
            className="brand-orange-button px-4 py-2.5 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar size={24} />
            <span className="hidden sm:inline ml-2">Book Call</span>
          </motion.button>

          <motion.button
            onClick={onToggleStats}
            className="p-3 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp size={24} />
          </motion.button>

          <motion.button
            onClick={onClear}
            className="p-3 rounded-xl hidden-mobile"
            whileHover={{ scale: 1.05 }}
          >
            <RotateCcw size={24} />
          </motion.button>

          <motion.button
            onClick={onMinimize}
            className="p-3 rounded-xl hidden-mobile"
            whileHover={{ scale: 1.05 }}
          >
            {isMinimized ? <Maximize2 size={24} /> : <Minimize2 size={24} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
```

**Extract: `components/chat/ChatStats.tsx` (80 lines)**
**Extract: `components/chat/ChatMessages.tsx` (150 lines)**
**Extract: `components/chat/ServiceShowcase.tsx` (100 lines)**

---

### Phase 4: Testing & Quality (Week 4)

#### Step 4.1: Add Unit Tests

**File: `tests/unit/hooks/useChat.test.ts`**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';
import { sendChatMessage } from '@/lib/modules/chat/actions';

jest.mock('@/lib/modules/chat/actions');

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with welcome message', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.messages[0].content).toContain('Welcome');
  });

  it('should send message and receive response', async () => {
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    (sendChatMessage as jest.Mock).mockResolvedValue(
      new Response(mockResponse, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3); // welcome + user + assistant
      expect(result.current.messages[2].content).toBe('Hello');
    });
  });

  it('should detect problems in user message', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('We are losing customers');
    });

    const stats = result.current.getStats();
    expect(stats.identifiedProblems).toContain('churn');
  });

  it('should persist chat history to localStorage', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    const saved = localStorage.getItem('strive-chat-history');
    expect(saved).toBeTruthy();

    const parsed = JSON.parse(saved!);
    expect(parsed.messages).toHaveLength(3); // welcome + user + assistant
  });

  it('should clear messages and reset state', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Test');
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(1); // Only welcome message
    expect(localStorage.getItem('strive-chat-history')).toBeNull();
  });
});
```

---

#### Step 4.2: Add Integration Tests

**File: `tests/integration/chat-flow.test.ts`**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatContainer from '@/components/chat/ChatContainer';

describe('Chat Flow Integration', () => {
  it('should complete a full conversation flow', async () => {
    const user = userEvent.setup();
    render(<ChatContainer mode="full" />);

    // Verify welcome message
    expect(screen.getByText(/Welcome to STRIVE TECH/i)).toBeInTheDocument();

    // Send first message
    const input = screen.getByPlaceholderText(/Tell me about/i);
    await user.type(input, 'We are losing customers');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText(/churn/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify problem was detected
    expect(screen.getByText(/identified problems/i)).toBeInTheDocument();

    // Continue conversation
    await user.type(input, 'Tell me more about solutions');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Should present solution
    await waitFor(() => {
      expect(screen.getByText(/Churn Prediction AI/i)).toBeInTheDocument();
    });

    // Should show Calendly link
    expect(screen.getByText(/calendly.com\/strivetech/i)).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<ChatContainer mode="full" />);

    const input = screen.getByPlaceholderText(/Tell me about/i);
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/technical issue/i)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
```

---

#### Step 4.3: Add E2E Tests (Playwright)

**File: `tests/e2e/chatbot.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Chatbot E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/platform/chat');
  });

  test('should complete a conversation and book a call', async ({ page }) => {
    // Wait for welcome message
    await expect(page.getByText(/Welcome to STRIVE TECH/i)).toBeVisible();

    // Type message
    await page.fill('textarea[placeholder*="Tell me"]', 'We need help with customer retention');
    await page.click('button:has-text("Send")');

    // Wait for AI response
    await expect(page.getByText(/churn/i)).toBeVisible({ timeout: 10000 });

    // Continue conversation
    await page.fill('textarea', 'What solutions do you offer?');
    await page.click('button:has-text("Send")');

    // Should show solution
    await expect(page.getByText(/Churn Prediction AI/i)).toBeVisible({ timeout: 10000 });

    // Should show Calendly link
    const calendlyLink = page.locator('a[href*="calendly"]');
    await expect(calendlyLink).toBeVisible();

    // Click book call button
    await page.click('button:has-text("Book Call")');

    // Should open Calendly (in new tab)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Book Call")'),
    ]);

    await expect(newPage).toHaveURL(/calendly.com/);
  });

  test('should export chat history', async ({ page }) => {
    // Send a message
    await page.fill('textarea', 'Hello');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(2000);

    // Click export button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[title="Export chat"]'),
    ]);

    // Verify file downloaded
    expect(download.suggestedFilename()).toMatch(/strive-chat-.*\.json/);

    // Verify content
    const path = await download.path();
    const content = await require('fs').promises.readFile(path, 'utf-8');
    const data = JSON.parse(content);

    expect(data).toHaveLength(3); // welcome + user + assistant
  });
});
```

---

### Phase 5: Production Readiness (Week 5)

#### Step 5.1: Add Error Boundaries

**File: `components/ErrorBoundary.tsx`**
```typescript
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to error tracking service
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="brand-orange-button px-6 py-3 rounded-xl"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap ChatContainer:**
```typescript
// app/(platform)/chat/page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatContainer mode="full" />
    </ErrorBoundary>
  );
}
```

---

#### Step 5.2: Add Logging Service

**File: `lib/logger.ts`**
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  debug(message: string, data?: any) {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data);
    this.sendToService('info', message, data);
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
    this.sendToService('warn', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    console.error(`[ERROR] ${message}`, error, data);
    this.sendToService('error', message, { error: error?.message, stack: error?.stack, ...data });
  }

  private sendToService(level: LogLevel, message: string, data?: any) {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Log', { level, message, data });
    }

    // Could send to Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();
```

**Replace console.log:**
```typescript
// Before
console.log('🔍 Searching for similar conversations...');

// After
logger.debug('RAG search started', { industry, messageHash });
```

---

#### Step 5.3: Add Performance Monitoring

**File: `lib/performance.ts`**
```typescript
export class PerformanceMonitor {
  private timers = new Map<string, number>();

  start(label: string) {
    this.timers.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      console.warn(`Timer ${label} not found`);
      return 0;
    }

    const duration = performance.now() - start;
    this.timers.delete(label);

    this.track(label, duration);
    return duration;
  }

  private track(label: string, duration: number) {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Performance', {
        metric: label,
        duration,
        timestamp: Date.now(),
      });
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation: ${label} took ${duration}ms`);
    }
  }
}

export const perf = new PerformanceMonitor();
```

**Usage:**
```typescript
// In Server Action
perf.start('chat-message');
const response = await sendChatMessage(input);
perf.end('chat-message');

// In RAG search
perf.start('rag-search');
const results = await searchSimilarConversations(message, industry);
perf.end('rag-search');
```

---

#### Step 5.4: Add Security Headers

**File: `next.config.mjs`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow embedding on same origin
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

#### Step 5.5: Add Database Migrations

**File: `prisma/migrations/YYYYMMDD_add_rag_system/migration.sql`**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  client_id TEXT,
  session_id TEXT NOT NULL,
  user_id TEXT,

  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  embedding vector(1536),

  problem_detected TEXT,
  solution_presented TEXT,
  conversation_stage TEXT NOT NULL,

  outcome TEXT NOT NULL,
  conversion_score DOUBLE PRECISION,
  booking_completed BOOLEAN DEFAULT false,

  response_time_ms INTEGER,
  user_satisfaction INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create example_conversations table
CREATE TABLE example_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,

  user_input TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  embedding vector(1536),

  problem_type TEXT,
  solution_type TEXT,
  conversation_stage TEXT,

  outcome TEXT,
  conversion_score DOUBLE PRECISION,

  is_verified BOOLEAN DEFAULT false,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_industry ON conversations(industry);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_embedding ON conversations USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_examples_industry ON example_conversations(industry);
CREATE INDEX idx_examples_embedding ON example_conversations USING ivfflat (embedding vector_cosine_ops);

-- Create vector search function
CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(1536),
  match_industry TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  assistant_response TEXT,
  problem_detected TEXT,
  solution_presented TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_message,
    c.assistant_response,
    c.problem_detected,
    c.solution_presented,
    c.outcome,
    c.conversion_score,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM conversations c
  WHERE c.industry = match_industry
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Similar function for examples
CREATE OR REPLACE FUNCTION match_examples(
  query_embedding vector(1536),
  match_industry TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_input TEXT,
  assistant_response TEXT,
  problem_type TEXT,
  solution_type TEXT,
  outcome TEXT,
  conversion_score FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.user_input,
    e.assistant_response,
    e.problem_type,
    e.solution_type,
    e.outcome,
    e.conversion_score,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM example_conversations e
  WHERE e.industry = match_industry
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 📋 Migration Roadmap

### Week 1: Foundation
- [ ] Delete duplicate files (page1.tsx, layout1.tsx, globals1.css)
- [ ] Move app/utils/ to lib/utils/
- [ ] Merge tailwind.config.ts and tsconfig.json
- [ ] Add Prisma schema for conversations
- [ ] Run database migration
- [ ] Set up environment variables
- [ ] Run seed script to populate examples

### Week 2: Core Refactoring
- [ ] Split useChat.ts into 4 files (< 500 lines total)
- [ ] Convert API route to Server Action
- [ ] Update RAG service to use Prisma
- [ ] Add Zod validation schemas
- [ ] Implement rate limiting
- [ ] Add authentication checks

### Week 3: Component Refactoring
- [ ] Split ChatContainer into 5 components
- [ ] Split ChatInput into 3 components
- [ ] Split ChatMessage into 3 components
- [ ] Extract animation utilities
- [ ] Optimize Avatars component

### Week 4: Testing
- [ ] Write unit tests (80% coverage minimum)
- [ ] Write integration tests
- [ ] Write E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add test coverage reporting

### Week 5: Production Readiness
- [ ] Add Error Boundaries
- [ ] Implement logging service
- [ ] Add performance monitoring
- [ ] Configure security headers
- [ ] Set up Redis for caching
- [ ] Add CORS configuration
- [ ] Security audit
- [ ] Performance audit (Lighthouse 90+)

### Week 6: Documentation & Launch
- [ ] Write API documentation
- [ ] Create component Storybook
- [ ] Write developer guide
- [ ] Create user guide
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Load testing
- [ ] Soft launch to beta users
- [ ] Collect feedback and iterate

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ 0 ESLint errors/warnings
- ✅ 0 TypeScript errors
- ✅ 80%+ test coverage
- ✅ All files < 500 lines (hard limit)
- ✅ All files < 200-300 lines (soft limits)
- ✅ Lighthouse score 90+ (Performance, Accessibility, Best Practices, SEO)
- ✅ No direct Supabase usage (Prisma only)
- ✅ No API routes for data (Server Actions only)
- ✅ All inputs validated with Zod

### Performance Metrics
- ✅ Initial load < 2.5s (LCP)
- ✅ First Input Delay < 100ms (FID)
- ✅ Cumulative Layout Shift < 0.1 (CLS)
- ✅ Bundle size < 500kb
- ✅ 90%+ cache hit rate for embeddings
- ✅ Avg response time < 3s

### Business Metrics
- ✅ 40%+ conversation → consultation booking rate
- ✅ 80%+ user satisfaction (from feedback)
- ✅ < 5% error rate
- ✅ Support cost reduction (fewer manual inquiries)

---

## 🚀 Quick Start (After Migration)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Run migrations
npx prisma migrate dev

# Seed with examples
npm run seed
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Fill in API keys
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📚 Additional Resources

### Documentation
- **Groq API:** https://console.groq.com/docs
- **OpenAI Embeddings:** https://platform.openai.com/docs/guides/embeddings
- **Supabase pgvector:** https://supabase.com/docs/guides/ai
- **Next.js 15:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs

### Tools
- **Prisma Studio:** View/edit database (`npx prisma studio`)
- **Groq Console:** Monitor usage (https://console.groq.com)
- **Supabase Dashboard:** View vector data (https://app.supabase.com)
- **Upstash Console:** View cache stats (https://console.upstash.com)

---

## 🤝 Contributing

### Before Committing
```bash
# MANDATORY checklist
npm run lint        # Zero warnings
npx tsc --noEmit    # Zero errors
npm test            # 80%+ coverage

# Check file sizes
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -20
```

### Git Hooks
```bash
# .husky/pre-commit
npm run lint
npx tsc --noEmit
npm test -- --coverage --watchAll=false
```

---

## ⚠️ Critical Reminders

1. **NEVER expose SUPABASE_SERVICE_KEY to client**
2. **ALWAYS validate inputs with Zod**
3. **NEVER exceed 500-line hard limit**
4. **ALWAYS use Prisma (not direct Supabase)**
5. **NEVER use API routes for data (Server Actions only)**
6. **ALWAYS write tests (80% minimum coverage)**
7. **NEVER commit without passing lint + typecheck + tests**

---

## 📞 Support

For questions about this implementation:
- Review CLAUDE.md for architecture rules
- Check existing documentation in docs/
- Review test files for usage examples
- Contact: garrettholland@strivetech.ai

---

**Document Version:** 1.0
**Last Updated:** 2025-09-30
**Author:** Claude Code Analysis
**Status:** Ready for Implementation
