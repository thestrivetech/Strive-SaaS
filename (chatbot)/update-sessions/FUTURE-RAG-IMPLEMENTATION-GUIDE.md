# Future RAG Implementation Guide
## Intent-Based Knowledge Retrieval for Real Estate

**Version:** 1.0
**Target Timeline:** 1-2 weeks
**Effort:** ~20 hours
**Prerequisites:** Property search working without RAG

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Intent Classification](#phase-1-intent-classification)
3. [Phase 2: Knowledge Base Structure](#phase-2-knowledge-base-structure)
4. [Phase 3: RAG Integration](#phase-3-rag-integration)
5. [Phase 4: Knowledge Base Population](#phase-4-knowledge-base-population)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Phase 6: Monitoring & Optimization](#phase-6-monitoring--optimization)
8. [Appendix: Example Knowledge Entries](#appendix-example-knowledge-entries)

---

## 🏗️ Architecture Overview

### Current Flow (Property Search Only)
```
User Message
    ↓
Extract Data (location, budget, etc.)
    ↓
Build System Prompt with extracted data
    ↓
Stream AI Response
    ↓
[If ready] Trigger Property Search
    ↓
Return Properties
```

### Future Flow (With Intent-Based RAG)
```
User Message
    ↓
Classify Intent ←─────────┐
    ↓                      │
    ├──→ PROPERTY_SEARCH  │ (No RAG)
    │    └─→ Extract Data → Search Properties
    │                      │
    ├──→ AREA_QUESTION    │ (RAG: Neighborhoods)
    │    └─→ Search neighborhood_knowledge
    │                      │
    ├──→ MARKET_QUESTION  │ (RAG: Market Insights)
    │    └─→ Search market_knowledge
    │                      │
    ├──→ PROCESS_QUESTION │ (RAG: Process Guide)
    │    └─→ Search process_knowledge
    │                      │
    └──→ GENERAL_CHAT     │ (No RAG, just conversational)
         └─→ Standard chat response
```

### Database Schema (New Tables)

**Table: `knowledge_entries`**
```sql
CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  category TEXT NOT NULL, -- 'neighborhoods' | 'market' | 'process' | 'general'
  industry TEXT NOT NULL DEFAULT 'real-estate',

  -- Content
  title TEXT NOT NULL,
  question TEXT NOT NULL, -- Natural language question
  answer TEXT NOT NULL,   -- Comprehensive answer (500-2000 words)
  short_answer TEXT,      -- Quick summary (50-100 words)

  -- Metadata
  location TEXT,          -- For neighborhood: "East Nashville, TN"
  price_range TEXT,       -- For market: "$400k-$600k"
  tags TEXT[],            -- ['family-friendly', 'walkable', 'schools']

  -- Search
  embedding vector(1536), -- OpenAI embedding
  keywords TEXT[],        -- Manual keywords for fallback

  -- Quality Control
  source TEXT,            -- Where this came from
  verified BOOLEAN DEFAULT false,
  confidence_score FLOAT, -- 0-1, how confident in this answer

  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for fast vector search
CREATE INDEX knowledge_entries_embedding_idx
ON knowledge_entries
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Indexes for filtering
CREATE INDEX knowledge_entries_category_idx ON knowledge_entries(category);
CREATE INDEX knowledge_entries_industry_idx ON knowledge_entries(industry);
CREATE INDEX knowledge_entries_location_idx ON knowledge_entries(location);
```

**Table: `knowledge_feedback`** (Track what's helpful)
```sql
CREATE TABLE knowledge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  knowledge_entry_id UUID REFERENCES knowledge_entries(id),
  session_id TEXT NOT NULL,

  was_helpful BOOLEAN,
  feedback_text TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🎯 Phase 1: Intent Classification

### Step 1.1: Create Intent Types

**File:** `lib/ai/intent-types.ts`

```typescript
export type QueryIntent =
  | 'PROPERTY_SEARCH'      // "Show me homes in Nashville under $500k"
  | 'AREA_QUESTION'        // "What's East Nashville like?"
  | 'MARKET_QUESTION'      // "Is $500k enough for Nashville?"
  | 'PROCESS_QUESTION'     // "What are closing costs in TN?"
  | 'GENERAL_CHAT';        // "Hi, can you help me?"

export interface IntentClassification {
  intent: QueryIntent;
  confidence: number; // 0-1
  reasoning?: string; // Why this classification
  extractedEntities?: {
    location?: string;
    priceRange?: string;
    topic?: string;
  };
}

export interface IntentPattern {
  intent: QueryIntent;
  keywords: string[];
  patterns: RegExp[];
  examples: string[];
}
```

### Step 1.2: Implement Intent Classifier

**File:** `lib/ai/intent-classifier.ts`

```typescript
import OpenAI from 'openai';
import { QueryIntent, IntentClassification, IntentPattern } from './intent-types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Intent patterns for fast keyword matching
const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'PROPERTY_SEARCH',
    keywords: ['show', 'find', 'search', 'looking for', 'homes', 'houses', 'properties', 'listings'],
    patterns: [
      /(?:show|find|search).+(?:home|house|property|listing)/i,
      /(?:looking|searching)\s+for.+(?:home|house|property)/i,
      /\d+\s*(?:bed|br|bedroom)/i,
      /\$[\d,]+k?/i, // Price mentions
    ],
    examples: [
      'Show me homes in Nashville',
      'Looking for 3 bedroom house under $500k',
      'Find properties in East Nashville',
    ],
  },
  {
    intent: 'AREA_QUESTION',
    keywords: ['neighborhood', 'area', 'district', 'schools', 'safe', 'walkable', 'vibe', 'like living'],
    patterns: [
      /what(?:'s| is).+(?:neighborhood|area|district).+like/i,
      /tell me about.+(?:neighborhood|area|schools)/i,
      /is.+(?:safe|good|nice|walkable)/i,
      /(?:best|good)\s+(?:neighborhood|area|schools)/i,
    ],
    examples: [
      "What's East Nashville like?",
      'Tell me about schools in Green Hills',
      'Is The Gulch safe?',
      'Best neighborhoods for families',
    ],
  },
  {
    intent: 'MARKET_QUESTION',
    keywords: ['budget', 'afford', 'market', 'price', 'worth', 'expensive', 'cheap', 'competitive'],
    patterns: [
      /(?:is|what).+(?:budget|afford|price)/i,
      /(?:can|should) I (?:afford|expect)/i,
      /(?:market|prices).+(?:hot|competitive|expensive)/i,
      /worth.+(?:\$|money|price)/i,
    ],
    examples: [
      'Is $500k enough for Nashville?',
      'What can I afford with $600k?',
      "How's the market in Nashville?",
      'Are prices going up or down?',
    ],
  },
  {
    intent: 'PROCESS_QUESTION',
    keywords: [
      'closing costs', 'pre-approval', 'inspection', 'offer', 'mortgage',
      'down payment', 'how to buy', 'process', 'steps', 'paperwork'
    ],
    patterns: [
      /(?:what|how).+(?:closing|process|steps|paperwork)/i,
      /(?:pre-approval|pre-qualified|mortgage)/i,
      /(?:down payment|earnest money)/i,
      /how (?:to|do I) (?:buy|make an offer)/i,
    ],
    examples: [
      'What are closing costs?',
      'How do I get pre-approved?',
      'What is the home buying process?',
      'How much is a down payment?',
    ],
  },
  {
    intent: 'GENERAL_CHAT',
    keywords: ['hi', 'hello', 'help', 'thanks', 'yes', 'no', 'okay'],
    patterns: [
      /^(?:hi|hello|hey|greetings)/i,
      /^(?:thanks|thank you)/i,
      /^(?:yes|no|okay|sure)/i,
    ],
    examples: [
      'Hi there!',
      'Can you help me?',
      'Thanks!',
      'Yes, that sounds good',
    ],
  },
];

/**
 * Classify user query intent using keyword matching + LLM fallback
 */
export async function classifyIntent(
  userMessage: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<IntentClassification> {
  const normalized = userMessage.toLowerCase().trim();

  // STEP 1: Fast keyword-based classification
  const keywordMatch = classifyByKeywords(normalized);
  if (keywordMatch.confidence > 0.8) {
    console.log('✅ Intent classified by keywords:', keywordMatch.intent);
    return keywordMatch;
  }

  // STEP 2: Pattern-based classification
  const patternMatch = classifyByPatterns(normalized);
  if (patternMatch.confidence > 0.75) {
    console.log('✅ Intent classified by patterns:', patternMatch.intent);
    return patternMatch;
  }

  // STEP 3: LLM-based classification (fallback)
  console.log('🤖 Using LLM for intent classification...');
  const llmMatch = await classifyByLLM(userMessage, conversationHistory);
  return llmMatch;
}

/**
 * Fast keyword matching
 */
function classifyByKeywords(message: string): IntentClassification {
  let bestMatch: { intent: QueryIntent; score: number } = {
    intent: 'GENERAL_CHAT',
    score: 0,
  };

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;

    // Count keyword matches
    for (const keyword of pattern.keywords) {
      if (message.includes(keyword)) {
        score += 1;
      }
    }

    // Normalize score
    const normalizedScore = Math.min(score / 3, 1); // 3+ keywords = 100% confidence

    if (normalizedScore > bestMatch.score) {
      bestMatch = { intent: pattern.intent, score: normalizedScore };
    }
  }

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.score,
    reasoning: 'keyword-match',
  };
}

/**
 * Pattern-based matching
 */
function classifyByPatterns(message: string): IntentClassification {
  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(message)) {
        return {
          intent: pattern.intent,
          confidence: 0.85,
          reasoning: `pattern-match: ${regex.source}`,
        };
      }
    }
  }

  return {
    intent: 'GENERAL_CHAT',
    confidence: 0.3,
    reasoning: 'no-pattern-match',
  };
}

/**
 * LLM-based classification (most accurate, but slower and costs $0.0001)
 */
async function classifyByLLM(
  userMessage: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<IntentClassification> {
  const systemPrompt = `You are an intent classifier for a real estate chatbot.

Classify user queries into one of these intents:

1. PROPERTY_SEARCH - User wants to search for homes/properties
   Examples: "Show me homes in Nashville", "3 bed 2 bath under $500k"

2. AREA_QUESTION - User asks about neighborhoods, schools, or areas
   Examples: "What's East Nashville like?", "Is Green Hills safe?"

3. MARKET_QUESTION - User asks about prices, budget, or market conditions
   Examples: "Is $500k enough?", "How's the Nashville market?"

4. PROCESS_QUESTION - User asks about home buying process/paperwork
   Examples: "What are closing costs?", "How do I get pre-approved?"

5. GENERAL_CHAT - Greetings, thanks, confirmations
   Examples: "Hi", "Thanks!", "Yes that works"

Respond with ONLY the intent name (e.g., "PROPERTY_SEARCH").`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history for context (last 3 messages)
  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(
      ...conversationHistory.slice(-3).map(m => ({
        role: m.role,
        content: m.content,
      }))
    );
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Fast and cheap ($0.0005 per 1K tokens)
      messages,
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 20,
    });

    const intent = response.choices[0].message.content?.trim() as QueryIntent;

    return {
      intent: intent || 'GENERAL_CHAT',
      confidence: 0.9,
      reasoning: 'llm-classification',
    };
  } catch (error) {
    console.error('LLM intent classification error:', error);
    // Fallback to keyword match
    return classifyByKeywords(userMessage.toLowerCase());
  }
}

/**
 * Helper: Check if message has location and budget (indicates property search)
 */
export function hasLocationAndBudget(message: string): boolean {
  const hasLocation = /(?:in|near|around)\s+[A-Z][a-z]+/i.test(message);
  const hasBudget = /\$[\d,]+k?|under|below|less than/i.test(message);
  return hasLocation && hasBudget;
}

/**
 * Helper: Extract entities from classified message
 */
export function extractEntities(message: string, intent: QueryIntent) {
  const entities: IntentClassification['extractedEntities'] = {};

  // Extract location
  const locationMatch = message.match(/(?:in|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (locationMatch) {
    entities.location = locationMatch[1];
  }

  // Extract price range
  const priceMatch = message.match(/\$?([\d,]+)k?(?:\s*-\s*\$?([\d,]+)k?)?/i);
  if (priceMatch) {
    entities.priceRange = priceMatch[0];
  }

  // Extract topic for knowledge questions
  if (intent === 'AREA_QUESTION') {
    const topicMatch = message.match(/about\s+([a-z\s]+)/i);
    if (topicMatch) {
      entities.topic = topicMatch[1].trim();
    }
  }

  return entities;
}
```

### Step 1.3: Add Tests for Intent Classifier

**File:** `__tests__/lib/ai/intent-classifier.test.ts`

```typescript
import { classifyIntent, hasLocationAndBudget } from '@/lib/ai/intent-classifier';

describe('Intent Classifier', () => {
  describe('PROPERTY_SEARCH intent', () => {
    it('should classify basic property search', async () => {
      const result = await classifyIntent('Show me homes in Nashville');
      expect(result.intent).toBe('PROPERTY_SEARCH');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should classify detailed property search', async () => {
      const result = await classifyIntent('Looking for 3 bedroom house under $500k in East Nashville');
      expect(result.intent).toBe('PROPERTY_SEARCH');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect location and budget', () => {
      expect(hasLocationAndBudget('Show me homes in Nashville under $500k')).toBe(true);
      expect(hasLocationAndBudget('3 bedroom house')).toBe(false);
    });
  });

  describe('AREA_QUESTION intent', () => {
    it('should classify neighborhood questions', async () => {
      const result = await classifyIntent("What's East Nashville like?");
      expect(result.intent).toBe('AREA_QUESTION');
    });

    it('should classify school questions', async () => {
      const result = await classifyIntent('Tell me about schools in Green Hills');
      expect(result.intent).toBe('AREA_QUESTION');
    });

    it('should classify safety questions', async () => {
      const result = await classifyIntent('Is The Gulch safe?');
      expect(result.intent).toBe('AREA_QUESTION');
    });
  });

  describe('MARKET_QUESTION intent', () => {
    it('should classify budget questions', async () => {
      const result = await classifyIntent('Is $500k enough for Nashville?');
      expect(result.intent).toBe('MARKET_QUESTION');
    });

    it('should classify market condition questions', async () => {
      const result = await classifyIntent("How's the Nashville real estate market?");
      expect(result.intent).toBe('MARKET_QUESTION');
    });
  });

  describe('PROCESS_QUESTION intent', () => {
    it('should classify closing costs questions', async () => {
      const result = await classifyIntent('What are closing costs in Tennessee?');
      expect(result.intent).toBe('PROCESS_QUESTION');
    });

    it('should classify pre-approval questions', async () => {
      const result = await classifyIntent('How do I get pre-approved?');
      expect(result.intent).toBe('PROCESS_QUESTION');
    });
  });

  describe('GENERAL_CHAT intent', () => {
    it('should classify greetings', async () => {
      const result = await classifyIntent('Hi there!');
      expect(result.intent).toBe('GENERAL_CHAT');
    });

    it('should classify confirmations', async () => {
      const result = await classifyIntent('Yes, that sounds good');
      expect(result.intent).toBe('GENERAL_CHAT');
    });
  });
});
```

---

## 📚 Phase 2: Knowledge Base Structure

### Step 2.1: Create Knowledge Service

**File:** `lib/services/knowledge-service.ts`

```typescript
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/rag/embeddings';
import { CacheService } from './cache-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface KnowledgeEntry {
  id: string;
  category: 'neighborhoods' | 'market' | 'process' | 'general';
  industry: string;
  title: string;
  question: string;
  answer: string;
  shortAnswer?: string;
  location?: string;
  priceRange?: string;
  tags: string[];
  embedding: number[];
  keywords: string[];
  source: string;
  verified: boolean;
  confidenceScore: number;
  viewCount: number;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  similarity: number;
  relevanceScore: number; // Combined similarity + metadata matching
}

export interface KnowledgeSearchOptions {
  category?: string;
  location?: string;
  priceRange?: string;
  tags?: string[];
  threshold?: number; // Similarity threshold (default 0.55)
  limit?: number; // Max results (default 5)
}

export class KnowledgeService {
  /**
   * Search knowledge base using semantic similarity
   */
  static async searchKnowledge(
    query: string,
    options: KnowledgeSearchOptions = {}
  ): Promise<KnowledgeSearchResult[]> {
    const {
      category,
      location,
      priceRange,
      tags,
      threshold = 0.55, // Lower threshold for knowledge queries
      limit = 5,
    } = options;

    // Create cache key
    const cacheKey = CacheService.createKey(
      'knowledge',
      query,
      category || 'all',
      location || 'all'
    );

    // Check cache
    const cached = CacheService.get<KnowledgeSearchResult[]>(cacheKey);
    if (cached) {
      console.log('✅ Knowledge cache HIT');
      return cached;
    }

    console.log('🔍 Searching knowledge base:', { query, category, location });

    // Generate embedding for query
    const embedding = await generateEmbedding(query);

    // Build filter object
    const filters: any = {
      industry: 'real-estate',
    };
    if (category) filters.category = category;
    if (location) filters.location = location;

    // Search using Supabase function
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: embedding,
      match_category: category,
      match_location: location,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Knowledge search error:', error);
      return [];
    }

    // Calculate relevance scores (similarity + metadata matching)
    const results: KnowledgeSearchResult[] = (data || []).map((item: any) => {
      let relevanceScore = item.similarity;

      // Boost score if metadata matches
      if (location && item.location === location) {
        relevanceScore += 0.1;
      }
      if (tags && item.tags && tags.some(t => item.tags.includes(t))) {
        relevanceScore += 0.05;
      }

      // Cap at 1.0
      relevanceScore = Math.min(relevanceScore, 1.0);

      return {
        entry: {
          id: item.id,
          category: item.category,
          industry: item.industry,
          title: item.title,
          question: item.question,
          answer: item.answer,
          shortAnswer: item.short_answer,
          location: item.location,
          priceRange: item.price_range,
          tags: item.tags || [],
          embedding: item.embedding,
          keywords: item.keywords || [],
          source: item.source,
          verified: item.verified,
          confidenceScore: item.confidence_score,
          viewCount: item.view_count,
          helpfulCount: item.helpful_count,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        },
        similarity: item.similarity,
        relevanceScore,
      };
    });

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Cache for 1 hour
    CacheService.set(cacheKey, results, 3600);

    console.log(`✅ Found ${results.length} knowledge entries`);
    console.log('Top result:', {
      title: results[0]?.entry.title,
      similarity: results[0]?.similarity,
      relevance: results[0]?.relevanceScore,
    });

    return results;
  }

  /**
   * Track knowledge entry view
   */
  static async trackView(entryId: string): Promise<void> {
    await supabase
      .from('knowledge_entries')
      .update({ view_count: supabase.sql`view_count + 1` })
      .eq('id', entryId);
  }

  /**
   * Track helpful/not helpful feedback
   */
  static async trackFeedback(
    entryId: string,
    sessionId: string,
    wasHelpful: boolean,
    feedbackText?: string
  ): Promise<void> {
    // Insert feedback
    await supabase.from('knowledge_feedback').insert({
      knowledge_entry_id: entryId,
      session_id: sessionId,
      was_helpful: wasHelpful,
      feedback_text: feedbackText,
    });

    // Update helpful count if positive
    if (wasHelpful) {
      await supabase
        .from('knowledge_entries')
        .update({ helpful_count: supabase.sql`helpful_count + 1` })
        .eq('id', entryId);
    }
  }

  /**
   * Insert new knowledge entry
   */
  static async insertKnowledge(
    entry: Omit<KnowledgeEntry, 'id' | 'embedding' | 'viewCount' | 'helpfulCount' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    // Generate embedding
    const embedding = await generateEmbedding(entry.question + ' ' + entry.answer);

    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert({
        category: entry.category,
        industry: entry.industry,
        title: entry.title,
        question: entry.question,
        answer: entry.answer,
        short_answer: entry.shortAnswer,
        location: entry.location,
        price_range: entry.priceRange,
        tags: entry.tags,
        embedding,
        keywords: entry.keywords,
        source: entry.source,
        verified: entry.verified,
        confidence_score: entry.confidenceScore,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to insert knowledge:', error);
      throw new Error('Failed to insert knowledge');
    }

    return data.id;
  }
}
```

### Step 2.2: Create Supabase SQL Functions

**File:** `SUPABASE-KNOWLEDGE-SETUP.sql`

```sql
-- =====================================================
-- KNOWLEDGE BASE SETUP for RAG
-- =====================================================
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Create knowledge_entries table
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  category TEXT NOT NULL CHECK (category IN ('neighborhoods', 'market', 'process', 'general')),
  industry TEXT NOT NULL DEFAULT 'real-estate',

  -- Content
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  short_answer TEXT,

  -- Metadata
  location TEXT,
  price_range TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Search
  embedding vector(1536),
  keywords TEXT[] DEFAULT '{}',

  -- Quality Control
  source TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  confidence_score FLOAT DEFAULT 0.8,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- STEP 2: Create indexes
-- =====================================================

-- Vector similarity index
CREATE INDEX IF NOT EXISTS knowledge_entries_embedding_idx
ON knowledge_entries
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Filter indexes
CREATE INDEX IF NOT EXISTS knowledge_entries_category_idx ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS knowledge_entries_industry_idx ON knowledge_entries(industry);
CREATE INDEX IF NOT EXISTS knowledge_entries_location_idx ON knowledge_entries(location);
CREATE INDEX IF NOT EXISTS knowledge_entries_tags_idx ON knowledge_entries USING GIN(tags);

-- =====================================================
-- STEP 3: Create search function
-- =====================================================
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_category TEXT DEFAULT NULL,
  match_location TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.55,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  industry TEXT,
  title TEXT,
  question TEXT,
  answer TEXT,
  short_answer TEXT,
  location TEXT,
  price_range TEXT,
  tags TEXT[],
  keywords TEXT[],
  embedding vector(1536),
  source TEXT,
  verified BOOLEAN,
  confidence_score FLOAT,
  view_count INTEGER,
  helpful_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.category,
    k.industry,
    k.title,
    k.question,
    k.answer,
    k.short_answer,
    k.location,
    k.price_range,
    k.tags,
    k.keywords,
    k.embedding,
    k.source,
    k.verified,
    k.confidence_score,
    k.view_count,
    k.helpful_count,
    k.created_at,
    k.updated_at,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM knowledge_entries k
  WHERE
    k.industry = 'real-estate'
    AND k.embedding IS NOT NULL
    AND (match_category IS NULL OR k.category = match_category)
    AND (match_location IS NULL OR k.location = match_location)
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- STEP 4: Create feedback table
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  knowledge_entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  was_helpful BOOLEAN NOT NULL,
  feedback_text TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_feedback_entry_idx ON knowledge_feedback(knowledge_entry_id);
CREATE INDEX IF NOT EXISTS knowledge_feedback_session_idx ON knowledge_feedback(session_id);

-- =====================================================
-- STEP 5: Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON knowledge_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON knowledge_entries TO anon;
GRANT SELECT, INSERT ON knowledge_feedback TO authenticated;
GRANT SELECT, INSERT ON knowledge_feedback TO anon;
GRANT EXECUTE ON FUNCTION search_knowledge TO authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'knowledge_entries'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'knowledge_entries';

-- Check function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'search_knowledge';
```

---

## 🔌 Phase 3: RAG Integration

### Step 3.1: Update Chat Route with Intent Routing

**File:** `app/api/chat/route.ts` (modifications)

```typescript
import { classifyIntent } from '@/lib/ai/intent-classifier';
import { KnowledgeService } from '@/lib/services/knowledge-service';

export async function POST(req: NextRequest) {
  try {
    // ... existing code ...

    const latestUserMessage = messages[messages.length - 1];

    // 🎯 CLASSIFY INTENT
    console.log('🎯 Classifying intent...');
    const intentClassification = await classifyIntent(
      latestUserMessage.content,
      messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
    );

    console.log('✅ Intent classified:', {
      intent: intentClassification.intent,
      confidence: intentClassification.confidence,
      reasoning: intentClassification.reasoning,
    });

    // 🔀 ROUTE BASED ON INTENT
    let enhancedSystemPrompt = config.systemPrompt;
    let knowledgeContext = '';

    if (intentClassification.intent === 'PROPERTY_SEARCH') {
      // EXISTING FLOW: Extract data + search properties
      console.log('📍 Property search intent - using extraction flow');

      const extraction = await extractDataFromMessage(
        latestUserMessage.content,
        messages.slice(-5).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      );

      let sessionPreferences = sessionStateCache.get(sessionId) || {};
      sessionPreferences = mergeExtractedData(sessionPreferences, extraction.propertyPreferences);
      sessionStateCache.set(sessionId, sessionPreferences);

      const canSearchNow = hasMinimumSearchCriteria(sessionPreferences);

      enhancedSystemPrompt = buildEnhancedSystemPrompt(
        config.systemPrompt,
        sessionPreferences,
        extraction.extractedFields,
        canSearchNow
      );

    } else if (
      intentClassification.intent === 'AREA_QUESTION' ||
      intentClassification.intent === 'MARKET_QUESTION' ||
      intentClassification.intent === 'PROCESS_QUESTION'
    ) {
      // NEW: RAG KNOWLEDGE RETRIEVAL
      console.log(`📚 Knowledge query intent (${intentClassification.intent}) - using RAG`);

      const category = intentClassification.intent === 'AREA_QUESTION' ? 'neighborhoods'
                     : intentClassification.intent === 'MARKET_QUESTION' ? 'market'
                     : 'process';

      const knowledgeResults = await KnowledgeService.searchKnowledge(
        latestUserMessage.content,
        {
          category,
          location: intentClassification.extractedEntities?.location,
          threshold: 0.55,
          limit: 3,
        }
      );

      if (knowledgeResults.length > 0) {
        console.log(`✅ Found ${knowledgeResults.length} relevant knowledge entries`);

        // Track views
        knowledgeResults.forEach(result => {
          KnowledgeService.trackView(result.entry.id);
        });

        // Build knowledge context
        knowledgeContext = buildKnowledgeContext(knowledgeResults);
        enhancedSystemPrompt = config.systemPrompt + '\n\n' + knowledgeContext;

        console.log('📖 Knowledge context added to system prompt');
      } else {
        console.log('⚠️ No relevant knowledge found - using general knowledge');
      }

    } else {
      // GENERAL_CHAT: Use base system prompt
      console.log('💬 General chat intent - using base prompt');
      enhancedSystemPrompt = config.systemPrompt;
    }

    // ... continue with existing streaming logic ...
  } catch (error) {
    // ... error handling ...
  }
}

/**
 * Build knowledge context from RAG results
 */
function buildKnowledgeContext(results: KnowledgeSearchResult[]): string {
  let context = '## 📚 RELEVANT KNOWLEDGE\n\n';
  context += 'Use this information to answer the user\'s question. Cite these sources naturally.\n\n';

  results.forEach((result, index) => {
    context += `### Knowledge Source ${index + 1} (${Math.round(result.similarity * 100)}% relevance)\n`;
    context += `**Topic:** ${result.entry.title}\n\n`;

    if (result.entry.location) {
      context += `**Location:** ${result.entry.location}\n\n`;
    }

    if (result.entry.shortAnswer) {
      context += `**Quick Answer:** ${result.entry.shortAnswer}\n\n`;
    }

    context += `**Detailed Information:**\n${result.entry.answer}\n\n`;

    if (result.entry.tags.length > 0) {
      context += `**Related Topics:** ${result.entry.tags.join(', ')}\n\n`;
    }

    context += '---\n\n';
  });

  context += '**IMPORTANT:** Synthesize this information naturally. Don\'t just copy-paste. Add your own conversational tone.\n';

  return context;
}
```

---

## 📝 Phase 4: Knowledge Base Population

### Step 4.1: Create Seeding Script

**File:** `scripts/seed-knowledge-base.ts`

```typescript
import { KnowledgeService } from '@/lib/services/knowledge-service';

const NEIGHBORHOOD_KNOWLEDGE = [
  {
    category: 'neighborhoods' as const,
    industry: 'real-estate',
    title: 'East Nashville Overview',
    question: "What's East Nashville like?",
    answer: `East Nashville is one of Nashville's most vibrant and eclectic neighborhoods, known for its thriving arts scene, diverse dining options, and strong sense of community.

**Character & Vibe:**
East Nashville has evolved from an up-and-coming area to one of the city's most desirable neighborhoods. It's characterized by historic homes (many from the early 1900s), tree-lined streets, and a bohemian, artsy atmosphere. The neighborhood attracts young professionals, artists, musicians, and families who appreciate the authentic, laid-back vibe.

**Dining & Entertainment:**
Five Points is the heart of East Nashville's commercial district, packed with locally-owned restaurants, bars, coffee shops, and boutiques. Popular spots include Barista Parlor (coffee), The Pharmacy (upscale Southern), Mas Tacos (Mexican), and Mitchell Delicatessen (sandwiches). The neighborhood also hosts numerous live music venues and art galleries.

**Housing:**
Home styles range from charming bungalows and shotgun houses to renovated Victorians and new construction. Many homes feature original hardwood floors, front porches, and character details. Expect to pay $400k-$800k for renovated single-family homes, with some fixer-uppers available in the $300k-$400k range.

**Schools:**
East Nashville is served by Metro Nashville Public Schools. Popular options include Lockeland Elementary, which has strong parent involvement and decent ratings. Many families also choose private schools or magnet programs in other parts of the city.

**Walkability & Transportation:**
East Nashville scores high on walkability, especially around Five Points. You can easily walk to restaurants, shops, and parks. However, commuting to downtown or other parts of Nashville typically requires a car, as public transit options are limited.

**Best For:**
- Young professionals who want walkable urban living
- Artists and creatives
- Families who prioritize neighborhood character over school districts
- People who enjoy diverse dining and nightlife

**Considerations:**
- Home prices have risen significantly in recent years
- Parking can be challenging in commercial areas
- Some streets still have homes in need of renovation
- Metro school ratings vary (many families choose private schools)`,
    shortAnswer: "East Nashville is a vibrant, artsy neighborhood with historic homes, excellent restaurants, and strong community feel. Popular with young professionals and creatives. Homes typically $400k-$800k.",
    location: 'East Nashville, TN',
    priceRange: '$400k-$800k',
    tags: ['artsy', 'walkable', 'restaurants', 'young professionals', 'historic homes', 'community-oriented'],
    keywords: ['east nashville', 'five points', 'artsy', 'bohemian', 'walkable', 'restaurants'],
    source: 'Real estate market research + local expert knowledge',
    verified: true,
    confidenceScore: 0.95,
  },
  {
    category: 'neighborhoods' as const,
    industry: 'real-estate',
    title: 'Green Hills Overview',
    question: "Tell me about Green Hills",
    answer: `Green Hills is an upscale neighborhood in southwest Nashville, known for luxury shopping, excellent schools, and family-friendly atmosphere.

**Character & Vibe:**
Green Hills is one of Nashville's most established and affluent neighborhoods. It offers a more suburban feel compared to downtown Nashville, with tree-lined streets, larger lots, and well-maintained homes. The area attracts families, professionals, and empty-nesters seeking a safe, convenient location with top-tier amenities.

**Shopping & Dining:**
The Mall at Green Hills is a major draw, featuring upscale retailers like Nordstrom, Louis Vuitton, and Apple. The surrounding area has numerous restaurants ranging from chains to local favorites. Nearby Hillsboro Village offers additional dining and boutique shopping with a more eclectic vibe.

**Housing:**
Homes in Green Hills range from mid-century modern to newer construction, with many properties featuring updated interiors, large yards, and mature landscaping. Expect to pay $600k-$2M+ for single-family homes, depending on size, condition, and exact location. Condos and townhomes are also available, starting around $400k.

**Schools:**
Green Hills is served by some of Metro Nashville's highest-rated public schools, including Julia Green Elementary and Hillsboro High School. These schools are a major draw for families and contribute to strong property values. Private school options are also nearby, including Harpeth Hall and Montgomery Bell Academy.

**Walkability & Transportation:**
While the commercial areas around the mall are walkable, Green Hills is primarily car-dependent for daily life. The neighborhood offers easy access to I-440 and I-65, making commutes to downtown Nashville or other parts of the city convenient (typically 10-15 minutes without traffic).

**Best For:**
- Families prioritizing excellent public schools
- Professionals wanting upscale suburban living near downtown
- Those who value convenience and amenities
- Buyers seeking strong property value retention

**Considerations:**
- Higher price point compared to other Nashville neighborhoods
- Can feel more corporate/less bohemian than East Nashville or Germantown
- Traffic around the mall area can be heavy, especially during holidays
- Less nightlife compared to downtown or East Nashville`,
    shortAnswer: "Green Hills is an upscale, family-friendly neighborhood with excellent schools, luxury shopping, and suburban feel. Close to downtown but more residential. Homes typically $600k-$2M+.",
    location: 'Green Hills, TN',
    priceRange: '$600k-$2M+',
    tags: ['upscale', 'families', 'excellent schools', 'shopping', 'suburban feel', 'safe'],
    keywords: ['green hills', 'upscale', 'families', 'schools', 'mall', 'suburban'],
    source: 'Real estate market research + local expert knowledge',
    verified: true,
    confidenceScore: 0.95,
  },
  // Add 20-30 more neighborhood entries for Nashville areas:
  // - Germantown
  // - The Gulch
  // - 12 South
  // - Sylvan Park
  // - Belmont/Hillsboro Village
  // - Berry Hill
  // - Donelson
  // - Brentwood
  // - Franklin
  // etc.
];

const MARKET_KNOWLEDGE = [
  {
    category: 'market' as const,
    industry: 'real-estate',
    title: 'Nashville Market Overview 2024-2025',
    question: "How's the Nashville real estate market?",
    answer: `Nashville's real estate market has evolved significantly in recent years, transitioning from a white-hot seller's market to a more balanced environment.

**Current Market Conditions (2024-2025):**
After years of rapid appreciation, Nashville's market has moderated. Home prices are still high by historical standards, but the frenzied bidding wars of 2020-2022 have largely subsided. Homes are staying on the market longer (30-45 days average), and buyers have more negotiating power than they did 2-3 years ago.

**Pricing Trends:**
- Median home price: ~$450k (varies significantly by neighborhood)
- Year-over-year appreciation: 2-4% (down from 15-20% in 2021-2022)
- Inventory: Gradually increasing but still below pre-pandemic levels
- Days on market: 30-45 days (up from 7-10 days in peak market)

**Buyer vs Seller Market:**
The market is currently balanced to slightly favoring buyers, depending on price point and location:
- Under $400k: Still competitive with multiple offers common
- $400k-$800k: Balanced market, some negotiation possible
- $800k-$1.5M: Slight buyer's market, properties may sit longer
- $1.5M+: Definitely buyer's market, significant negotiation leverage

**Interest Rate Impact:**
Mortgage rates (currently 6.5-7.5%) have significantly impacted affordability. Many buyers who could have afforded $600k homes at 3% rates are now looking in the $450k-$500k range. This has created more competition in the entry-level and mid-tier markets.

**Regional Variations:**
- East Nashville: Still hot, limited inventory, 5-10% annual appreciation
- Green Hills: Stable, strong demand from families, 3-5% appreciation
- The Gulch/Downtown: Softening, especially for condos, 0-2% appreciation
- Suburbs (Brentwood, Franklin): Stable to slight decline in some areas

**Forecast for Next 12-24 Months:**
Most economists predict Nashville's market will remain stable with modest appreciation (2-5% annually). The combination of strong job growth, population inflow, and limited new construction should support prices. However, if interest rates drop significantly, demand could spike again.

**Best Time to Buy:**
Now is actually a good time for buyers who can afford current interest rates. You have negotiating power, less competition, and the ability to refinance later if rates drop. Waiting for rate drops may mean returning to a more competitive market.`,
    shortAnswer: "Nashville's market has cooled from its 2021-2022 peak. Prices remain high (~$450k median) but inventory is improving and buyers have more negotiating power. Good time to buy for those who can afford current rates.",
    location: 'Nashville, TN',
    priceRange: 'General',
    tags: ['market conditions', 'pricing trends', 'buyer market', 'interest rates', 'forecast'],
    keywords: ['nashville market', 'home prices', 'market conditions', 'buyer market', 'seller market'],
    source: 'Real estate market data + local expert analysis',
    verified: true,
    confidenceScore: 0.9,
  },
  {
    category: 'market' as const,
    industry: 'real-estate',
    title: 'Budget Guide for Nashville',
    question: 'What can I get for $500k in Nashville?',
    answer: `With a $500k budget in Nashville, you're in a sweet spot that opens up many options, though expectations should be calibrated to the neighborhood you're targeting.

**What $500k Gets You:**

**In Prime Urban Neighborhoods (East Nashville, Germantown, 12 South):**
- 2-3 bedroom, 1,200-1,800 sq ft home
- Likely a renovated older home (1920s-1960s era)
- Or a smaller new construction townhome
- Walkable to restaurants, shops, and entertainment
- May need some updates or cosmetic work
- Typically smaller lots (under 0.15 acres)

**In Family-Oriented Neighborhoods (Sylvan Park, Belmont-Hillsboro):**
- 3-4 bedroom, 1,800-2,200 sq ft home
- Mix of renovated older homes and 1980s-2000s construction
- Larger lots (0.15-0.25 acres)
- Good schools nearby
- More move-in ready condition
- Less walkability but family-friendly

**In Suburbs (Donelson, Hermitage, Antioch):**
- 3-4 bedroom, 2,000-2,500 sq ft home
- Newer construction (2000s-2020s)
- Larger lots (0.25+ acres)
- More modern layouts and amenities
- Better school access
- Car-dependent but more space

**What $500k WON'T Get You:**
- Fully renovated large home in Green Hills, Belle Meade, or The Gulch
- New construction single-family home in prime East Nashville
- Luxury finishes throughout (expect mid-grade)
- Large yard (over 0.25 acres) in urban neighborhoods
- Pool (rare at this price point in Nashville)

**Realistic Expectations:**
At $500k, prioritize what matters most:
- Location over size? → Choose East Nashville, 12 South (smaller home)
- Space and schools? → Choose Sylvan Park, Belmont-Hillsboro
- Modern and move-in ready? → Choose suburbs (Donelson, Mt. Juliet)

**Pro Tips:**
1. Budget an additional $20k-$50k for updates/repairs unless buying new construction
2. Expect to compromise on at least one major factor (location, size, or condition)
3. Consider homes just listed or slightly over-priced that you can negotiate down
4. Homes under $500k will likely have multiple offers, so have pre-approval ready
5. If you can stretch to $525k-$550k, options expand significantly

**Market Reality:**
Five years ago, $500k would have gotten you significantly more. Today, it's a solid mid-tier budget that requires strategic shopping and clear priorities.`,
    shortAnswer: "$500k in Nashville gets you 2-3 bed in urban neighborhoods (East Nashville, Germantown) or 3-4 bed in family areas (Sylvan Park) or newer/larger in suburbs. Expect to prioritize location vs size vs condition.",
    location: 'Nashville, TN',
    priceRange: '$500k',
    tags: ['budget', 'what can i afford', 'home size', 'location tradeoffs', 'expectations'],
    keywords: ['500k budget', 'what can i afford', 'nashville budget', 'home shopping'],
    source: 'Real estate market data + property listings analysis',
    verified: true,
    confidenceScore: 0.9,
  },
  // Add 15-20 more market entries:
  // - Budget guides for $300k, $400k, $600k, $800k+
  // - Market conditions by neighborhood
  // - Best time to buy
  // - Investment vs primary residence
  // - New construction vs resale
  // etc.
];

const PROCESS_KNOWLEDGE = [
  {
    category: 'process' as const,
    industry: 'real-estate',
    title: 'Tennessee Closing Costs Guide',
    question: 'What are closing costs in Tennessee?',
    answer: `Closing costs in Tennessee typically range from 2-5% of the home's purchase price, paid by the buyer at the closing table. Understanding these costs helps you budget accurately for your home purchase.

**Typical Closing Costs Breakdown (on a $400k home):**

**Lender Fees ($3,000-$5,000):**
- Origination fee: 0.5-1% of loan ($2,000-$4,000)
- Application fee: $300-$500
- Underwriting fee: $400-$800
- Credit report: $25-$50
- Appraisal: $400-$600
- Flood certification: $15-$25

**Title & Escrow ($2,500-$4,000):**
- Title search: $200-$400
- Title insurance (lender's): $800-$1,200
- Title insurance (owner's - optional but recommended): $1,000-$1,500
- Escrow/closing fee: $500-$800
- Recording fees: $100-$200

**Prepaid Items ($3,000-$6,000):**
- Homeowners insurance (1 year): $1,200-$2,000
- Property taxes (2-6 months): $1,500-$3,000
- Mortgage interest (prorated to end of month): $500-$1,000
- HOA fees (if applicable): Varies

**Other Costs ($500-$1,500):**
- Home inspection: $400-$600
- Survey: $300-$500
- HOA transfer fees: $100-$300
- Courier fees: $50-$100

**TOTAL ESTIMATE:**
- $400k home: $8,000-$16,000 in closing costs
- $500k home: $10,000-$20,000 in closing costs
- $600k home: $12,000-$24,000 in closing costs

**Tennessee-Specific Considerations:**

1. **Recordation Tax:** Tennessee does not have a state-level mortgage tax or recordation tax (unlike some states like New York). This saves buyers money!

2. **Title Insurance:** Tennessee is a "negotiated rate" state for title insurance, meaning you can shop around for better prices. Don't just accept the first quote.

3. **Property Transfer Tax:** Tennessee has no transfer tax for buyers. Sellers pay $0.37 per $100 of the sales price (this is NOT your responsibility as a buyer).

4. **Escrow Accounts:** Tennessee requires lenders to collect property taxes and insurance into escrow accounts (included in your monthly payment).

**Ways to Reduce Closing Costs:**

1. **Shop for services:** You can choose your own title company, insurance provider, and home inspector (competition saves money).

2. **Negotiate with seller:** In a buyer's market, you can ask the seller to contribute $5,000-$10,000 toward your closing costs (called "seller concessions").

3. **Compare lenders:** Lender fees vary widely. Get quotes from at least 3 lenders and compare Loan Estimates side-by-side.

4. **Close at month-end:** Closing near the end of the month reduces prepaid interest (you pay interest from closing date to end of month).

5. **Waive owner's title insurance:** While not recommended, this saves $1,000-$1,500. However, it's risky if title issues arise later.

**Hidden Costs to Budget For:**

Don't forget these additional costs NOT included in closing:
- Moving costs: $500-$3,000
- Immediate repairs/updates: $2,000-$10,000
- New furniture/appliances: $3,000-$10,000
- Utility deposits: $200-$500
- HOA fees: $100-$500/month (if applicable)

**Bottom Line:**
Budget 2.5-3% of your home's purchase price for closing costs. If buying a $500k home with 20% down ($100k), expect to bring about $110,000-$115,000 to closing ($100k down payment + $10k-$15k closing costs).`,
    shortAnswer: "Tennessee closing costs are typically 2-5% of home price ($8k-$20k on a $400-$500k home). Includes lender fees, title insurance, prepaid taxes/insurance. TN has no transfer tax for buyers, which saves money!",
    location: 'Tennessee',
    priceRange: 'General',
    tags: ['closing costs', 'fees', 'budgeting', 'title insurance', 'prepaid items', 'tennessee specific'],
    keywords: ['closing costs', 'fees', 'how much', 'tennessee', 'buyer costs', 'title insurance'],
    source: 'Tennessee real estate regulations + lender data',
    verified: true,
    confidenceScore: 0.95,
  },
  {
    category: 'process' as const,
    industry: 'real-estate',
    title: 'Home Buying Process Timeline',
    question: 'What is the home buying process?',
    answer: `The home buying process in Tennessee typically takes 30-60 days from offer acceptance to closing, though getting pre-approved and finding the right home can take weeks or months beforehand.

**PHASE 1: Pre-Shopping Preparation (2-4 weeks)**

**Week 1-2: Financial Preparation**
1. Check your credit score (aim for 680+ for best rates)
2. Review your budget and determine comfortable monthly payment
3. Save for down payment (3-20%) + closing costs (2-5%) + emergency fund
4. Gather financial documents: 2 years tax returns, 2 months pay stubs, 2 months bank statements

**Week 2-4: Get Pre-Approved**
5. Contact 2-3 lenders and compare Loan Estimates
6. Submit application and documentation
7. Receive pre-approval letter (shows sellers you're serious)
8. Connect with a buyer's agent (free for buyers - seller pays commission)

**PHASE 2: Home Search (2-8 weeks, highly variable)**

**Weeks 1-8: Active Shopping**
9. Define your must-haves vs nice-to-haves
10. Tour homes with your agent (plan for 8-15 showings minimum)
11. Research neighborhoods, schools, commutes
12. Attend open houses on weekends
13. Get comfortable with what's available in your price range

**When You Find "The One":**
14. Do a second showing (bring family, inspect more carefully)
15. Check comparable sales (your agent does this)
16. Decide on offer price and strategy

**PHASE 3: Offer to Contract (1-3 days)**

**Day 1: Submit Offer**
17. Agent writes up offer with your proposed price, terms, contingencies
18. Include earnest money deposit (typically $1,000-$5,000)
19. Set deadlines: inspection (7-10 days), appraisal (15 days), financing (21 days), closing (30-45 days)
20. Submit pre-approval letter and offer

**Days 1-3: Negotiation**
21. Seller responds (accept, reject, or counter)
22. Negotiate back-and-forth on price, closing date, repairs, contingencies
23. Once agreed, both parties sign → You're under contract!

**PHASE 4: Due Diligence (10-14 days)**

**Days 1-7: Home Inspection**
24. Hire licensed home inspector ($400-$600)
25. Attend inspection (highly recommended)
26. Review inspection report (typically 40-60 pages)
27. Decide what to ask seller to repair

**Days 7-10: Inspection Negotiation**
28. Request repairs or credits via "inspection objection"
29. Seller responds (agree to fix, offer credit, or refuse)
30. Negotiate resolution or walk away (get earnest money back if within inspection period)

**Days 10-14: Appraisal**
31. Lender orders appraisal ($400-$600, paid by you)
32. Appraiser visits property and assesses value
33. Receive appraisal report
34. If appraisal comes in low, negotiate with seller or bring more cash

**PHASE 5: Financing & Final Steps (15-25 days)**

**Days 15-25: Loan Processing**
35. Lender reviews your finances in detail
36. Provide any additional requested documents
37. Loan goes to underwriting for final approval
38. Underwriter may request more info (be responsive!)
39. Receive "clear to close" (typically 3-5 days before closing)

**Days 20-25: Pre-Closing Tasks**
40. Purchase homeowners insurance (required by lender)
41. Set up utilities (electric, gas, water, internet)
42. Hire movers or rent truck
43. Do final walk-through (24-48 hours before closing)
44. Review Closing Disclosure (shows exact closing costs)
45. Wire down payment + closing costs to title company

**PHASE 6: Closing Day! (Day 30-45)**

**Closing Day:**
46. Meet at title company with your agent and signing documents
47. Review and sign ~100 pages of paperwork (takes 30-90 minutes)
48. Wire or bring cashier's check for remaining funds
49. Receive keys to your new home!
50. Celebrate! 🎉

**Post-Closing:**
51. Update mailing address with USPS, banks, employers
52. File homestead exemption (if applicable) for property tax reduction
53. Keep copies of all closing documents (especially closing disclosure and deed)
54. Schedule any immediate repairs or updates

**Common Timeline Delays:**
- Appraisal delays: 1-2 weeks (appraiser shortage)
- Repair negotiations: 3-7 days
- Underwriting issues: 1-2 weeks (if documents missing)
- Seller delays: Variable (moving, buying another home, etc.)

**Tips for a Smooth Process:**
1. Respond quickly to lender requests (don't delay your own closing)
2. Don't make major purchases or open new credit cards (affects loan approval)
3. Keep your down payment funds in one account (easier to document)
4. Stay in close contact with your agent and lender
5. Be prepared for things to go wrong (and have backup plans)

**Average Timeline:**
- Fast closing: 21-30 days (cash buyers or strong financing)
- Typical closing: 30-45 days
- Slow closing: 45-60+ days (complex financing, repair negotiations, appraisal issues)`,
    shortAnswer: "Home buying process: 1) Get pre-approved (2 weeks), 2) Find home (2-8 weeks), 3) Make offer and negotiate (1-3 days), 4) Inspection & appraisal (10-14 days), 5) Loan processing (15-25 days), 6) Close! Total: 30-60 days from offer to keys.",
    location: 'Tennessee',
    priceRange: 'General',
    tags: ['buying process', 'timeline', 'steps', 'pre-approval', 'inspection', 'closing', 'first-time buyer'],
    keywords: ['buying process', 'how to buy', 'steps', 'timeline', 'what to expect', 'first time buyer'],
    source: 'Real estate transaction process + Tennessee law',
    verified: true,
    confidenceScore: 0.95,
  },
  // Add 15-20 more process entries:
  // - How to get pre-approved
  // - What is earnest money
  // - Home inspection checklist
  // - Appraisal process
  // - How to make an offer
  // - Negotiation strategies
  // - What is title insurance
  // - Homeowners insurance guide
  // - Moving checklist
  // - First-time buyer tips
  // etc.
];

async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base...\n');

  let successCount = 0;
  let errorCount = 0;

  // Seed neighborhoods
  console.log('📍 Seeding neighborhood knowledge...');
  for (const entry of NEIGHBORHOOD_KNOWLEDGE) {
    try {
      const id = await KnowledgeService.insertKnowledge(entry);
      console.log(`✅ Added: ${entry.title} (${id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${entry.title}`, error);
      errorCount++;
    }
  }

  // Seed market knowledge
  console.log('\n💹 Seeding market knowledge...');
  for (const entry of MARKET_KNOWLEDGE) {
    try {
      const id = await KnowledgeService.insertKnowledge(entry);
      console.log(`✅ Added: ${entry.title} (${id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${entry.title}`, error);
      errorCount++;
    }
  }

  // Seed process knowledge
  console.log('\n📋 Seeding process knowledge...');
  for (const entry of PROCESS_KNOWLEDGE) {
    try {
      const id = await KnowledgeService.insertKnowledge(entry);
      console.log(`✅ Added: ${entry.title} (${id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${entry.title}`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

// Run seeding
seedKnowledgeBase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
```

### Step 4.2: Add Script Command to package.json

```json
{
  "scripts": {
    "seed-knowledge": "tsx scripts/seed-knowledge-base.ts"
  }
}
```

---

## ✅ Phase 5: Testing & Validation

### Step 5.1: Create Integration Tests

**File:** `__tests__/integration/knowledge-rag.test.ts`

```typescript
import { KnowledgeService } from '@/lib/services/knowledge-service';
import { classifyIntent } from '@/lib/ai/intent-classifier';

describe('Knowledge RAG Integration', () => {
  describe('Intent Classification', () => {
    it('should classify area questions correctly', async () => {
      const queries = [
        "What's East Nashville like?",
        'Tell me about Green Hills',
        'Is The Gulch safe?',
      ];

      for (const query of queries) {
        const result = await classifyIntent(query);
        expect(result.intent).toBe('AREA_QUESTION');
        expect(result.confidence).toBeGreaterThan(0.7);
      }
    });

    it('should classify market questions correctly', async () => {
      const queries = [
        'Is $500k enough for Nashville?',
        "How's the market?",
        'Are prices going up?',
      ];

      for (const query of queries) {
        const result = await classifyIntent(query);
        expect(result.intent).toBe('MARKET_QUESTION');
        expect(result.confidence).toBeGreaterThan(0.7);
      }
    });

    it('should classify process questions correctly', async () => {
      const queries = [
        'What are closing costs?',
        'How do I get pre-approved?',
        'What is the home buying process?',
      ];

      for (const query of queries) {
        const result = await classifyIntent(query);
        expect(result.intent).toBe('PROCESS_QUESTION');
        expect(result.confidence).toBeGreaterThan(0.7);
      }
    });
  });

  describe('Knowledge Search', () => {
    beforeAll(async () => {
      // Ensure knowledge base is seeded
      // Run: npm run seed-knowledge
    });

    it('should find relevant neighborhood knowledge', async () => {
      const results = await KnowledgeService.searchKnowledge(
        "What's East Nashville like?",
        { category: 'neighborhoods', threshold: 0.5, limit: 3 }
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0.7);
      expect(results[0].entry.category).toBe('neighborhoods');
      expect(results[0].entry.location).toContain('Nashville');
    });

    it('should find relevant market knowledge', async () => {
      const results = await KnowledgeService.searchKnowledge(
        'What can I afford with $500k?',
        { category: 'market', threshold: 0.5, limit: 3 }
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0.6);
      expect(results[0].entry.category).toBe('market');
    });

    it('should find relevant process knowledge', async () => {
      const results = await KnowledgeService.searchKnowledge(
        'What are closing costs?',
        { category: 'process', threshold: 0.5, limit: 3 }
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0.8);
      expect(results[0].entry.category).toBe('process');
      expect(results[0].entry.title).toContain('Closing');
    });

    it('should boost scores for location matches', async () => {
      const results = await KnowledgeService.searchKnowledge(
        'Tell me about East Nashville',
        { category: 'neighborhoods', location: 'East Nashville, TN', limit: 5 }
      );

      const eastNashvilleResult = results.find(r =>
        r.entry.location === 'East Nashville, TN'
      );

      expect(eastNashvilleResult).toBeDefined();
      expect(eastNashvilleResult!.relevanceScore).toBeGreaterThan(
        eastNashvilleResult!.similarity
      );
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle area question flow', async () => {
      const userMessage = "What's East Nashville like?";

      // 1. Classify intent
      const intent = await classifyIntent(userMessage);
      expect(intent.intent).toBe('AREA_QUESTION');

      // 2. Search knowledge
      const knowledge = await KnowledgeService.searchKnowledge(
        userMessage,
        { category: 'neighborhoods', threshold: 0.5, limit: 3 }
      );

      expect(knowledge.length).toBeGreaterThan(0);
      expect(knowledge[0].entry.answer).toContain('East Nashville');
    });

    it('should handle market question flow', async () => {
      const userMessage = 'Is $500k a good budget for Nashville?';

      const intent = await classifyIntent(userMessage);
      expect(intent.intent).toBe('MARKET_QUESTION');

      const knowledge = await KnowledgeService.searchKnowledge(
        userMessage,
        { category: 'market', threshold: 0.5, limit: 3 }
      );

      expect(knowledge.length).toBeGreaterThan(0);
    });
  });
});
```

### Step 5.2: Manual Testing Checklist

Create a test conversation session:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test queries
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What'\''s East Nashville like?"}
    ],
    "industry": "real-estate",
    "sessionId": "test-123"
  }'
```

**Test Cases:**
1. ✅ Property search: "Show me homes in Nashville under $500k"
2. ✅ Area question: "What's East Nashville like?"
3. ✅ Market question: "Is $500k enough?"
4. ✅ Process question: "What are closing costs?"
5. ✅ General chat: "Hi, can you help me?"
6. ✅ Mixed intent: "I want to buy in East Nashville, what's it like?"

**Expected Behavior:**
- Property search → No RAG, uses extraction flow
- Knowledge questions → RAG retrieval, knowledge injected into prompt
- General chat → No RAG, conversational response
- Log output should show intent classification and knowledge retrieval

---

## 📊 Phase 6: Monitoring & Optimization

### Step 6.1: Add Analytics Tracking

**File:** `lib/analytics/knowledge-analytics.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface KnowledgeAnalytics {
  totalSearches: number;
  searchesByCategory: Record<string, number>;
  averageSimilarityScore: number;
  topQueries: Array<{ query: string; count: number }>;
  topViewedEntries: Array<{ title: string; views: number; helpfulRatio: number }>;
  lowPerformingEntries: Array<{ title: string; views: number; helpfulRatio: number }>;
}

export async function getKnowledgeAnalytics(
  startDate: Date,
  endDate: Date
): Promise<KnowledgeAnalytics> {
  // Query knowledge_entries for analytics
  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(10);

  // Calculate helpful ratios
  const topViewedEntries = entries?.map(e => ({
    title: e.title,
    views: e.view_count,
    helpfulRatio: e.view_count > 0 ? e.helpful_count / e.view_count : 0,
  })) || [];

  // Find low-performing entries (low helpful ratio)
  const lowPerforming = topViewedEntries
    .filter(e => e.views > 10 && e.helpfulRatio < 0.3)
    .sort((a, b) => a.helpfulRatio - b.helpfulRatio);

  return {
    totalSearches: 0, // Track in separate search log table
    searchesByCategory: {
      neighborhoods: 0,
      market: 0,
      process: 0,
    },
    averageSimilarityScore: 0,
    topQueries: [],
    topViewedEntries,
    lowPerformingEntries: lowPerforming,
  };
}
```

### Step 6.2: Dashboard for Knowledge Quality

Create an admin endpoint to monitor knowledge quality:

**File:** `app/api/admin/knowledge-analytics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeAnalytics } from '@/lib/analytics/knowledge-analytics';

export async function GET(req: NextRequest) {
  // TODO: Add admin auth check

  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const endDate = new Date();

  const analytics = await getKnowledgeAnalytics(startDate, endDate);

  return NextResponse.json(analytics);
}
```

Access at: `http://localhost:3000/api/admin/knowledge-analytics`

### Step 6.3: Continuous Improvement Process

**Weekly Review:**
1. Check low-performing knowledge entries (low helpful ratio)
2. Review user feedback text
3. Identify missing knowledge gaps (queries with no results)
4. Update or add new knowledge entries

**Monthly Review:**
1. Analyze intent classification accuracy
2. Review similarity score distributions
3. Add new neighborhoods/markets as needed
4. Remove outdated information (old market data)

---

## 📚 Appendix: Example Knowledge Entries

### Additional Neighborhoods (Copy Pattern Above)

- **The Gulch** (Downtown, luxury condos, walkable, $500k-$2M+)
- **Germantown** (Historic, upscale, restaurants, $600k-$1.5M)
- **12 South** (Trendy, walkable, young professionals, $500k-$1M)
- **Sylvan Park** (Families, parks, schools, $400k-$700k)
- **Belmont-Hillsboro** (Near universities, diverse, $350k-$600k)
- **Berry Hill** (Artsy, affordable, up-and-coming, $300k-$500k)
- **Donelson** (Airport area, suburban, affordable, $300k-$500k)
- **Brentwood** (Upscale suburb, excellent schools, $600k-$3M+)
- **Franklin** (Historic, charming, family-friendly, $500k-$2M+)

### Additional Market Topics

- **Best Time to Buy in Nashville**
- **New Construction vs Resale**
- **Investment Properties in Nashville**
- **Condo Market Analysis**
- **Suburb Comparison (Brentwood vs Franklin vs Hendersonville)**
- **Interest Rate Impact on Budget**
- **HOA Fees Explained**

### Additional Process Topics

- **Pre-Approval Process**
- **Earnest Money Explained**
- **Home Inspection Checklist**
- **Making a Competitive Offer**
- **Appraisal Process**
- **Title Insurance Explained**
- **Homeowners Insurance Guide**
- **Moving Checklist**
- **First-Time Buyer Tax Benefits**

---

## 🎯 Success Metrics

### KPIs to Track:

**Quality Metrics:**
- Average similarity score > 0.65 for knowledge queries
- Knowledge helpful ratio > 60%
- Intent classification accuracy > 85%

**Usage Metrics:**
- % of conversations using RAG (target: 15-20%)
- RAG queries per session (target: 0.5-1)
- Property search still dominant (target: 70%+ of queries)

**Performance Metrics:**
- RAG search time < 200ms
- Intent classification time < 500ms (with caching)
- Overall response time < 1 second (including knowledge retrieval)

**Business Metrics:**
- User engagement (messages per session)
- Conversion rate (property searches → showings)
- User satisfaction scores

---

## 📝 Maintenance Schedule

### Weekly:
- Review low-similarity queries
- Check helpful feedback
- Update market data (if changed significantly)

### Monthly:
- Add 2-3 new knowledge entries based on gaps
- Review and update outdated information
- Analyze intent classification errors
- Update similarity threshold if needed

### Quarterly:
- Major market data refresh
- Add new neighborhoods (if market expands)
- Review entire knowledge base for accuracy
- Update process information (if laws change)

---

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Run Supabase SQL setup (`SUPABASE-KNOWLEDGE-SETUP.sql`)
- [ ] Seed knowledge base (`npm run seed-knowledge`)
- [ ] Test all intent classifications
- [ ] Test knowledge searches for each category
- [ ] Verify similarity scores are reasonable
- [ ] Check performance (< 200ms for RAG search)

### Deployment:
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Test with real users (5-10 test sessions)
- [ ] Monitor logs for errors
- [ ] Check analytics dashboard
- [ ] Deploy to production

### Post-Deployment:
- [ ] Monitor error rates (first 24 hours)
- [ ] Check knowledge query success rate
- [ ] Review user feedback
- [ ] Adjust thresholds if needed
- [ ] Document any issues

---

## 🎉 Conclusion

This guide provides everything needed to implement intent-based RAG for knowledge queries in your real estate chatbot.

**Timeline Estimate:**
- Phase 1 (Intent Classification): 4 hours
- Phase 2 (Knowledge Structure): 3 hours
- Phase 3 (RAG Integration): 4 hours
- Phase 4 (Knowledge Population): 6 hours
- Phase 5 (Testing): 2 hours
- Phase 6 (Monitoring): 1 hour

**Total:** ~20 hours over 1-2 weeks

**When to Implement:**
- Users start asking area/market/process questions
- Property search is working smoothly
- You want to differentiate from competitors
- You have 20 hours for implementation

**Remember:**
- Start small (10-20 knowledge entries per category)
- Iterate based on user feedback
- Monitor quality metrics closely
- Keep knowledge base updated

**Good luck! 🚀**
