# Supabase RAG Setup - Complete Guide

**Status:** ✅ COMPLETE
**Date:** October 1, 2025

---

## What Was Done

The Supabase database has been fully configured for RAG (Retrieval-Augmented Generation) with vector similarity search.

### Components Installed

1. **pgvector Extension** - PostgreSQL extension for vector operations
2. **Vector Search Functions** - `match_conversations()` and `match_examples()`
3. **Training Data Table** - `example_conversations` with 3 initial examples
4. **Vector Indexes** - IVFFlat indexes for fast similarity search
5. **Embeddings** - OpenAI ada-002 embeddings (1536 dimensions) generated for all training data

---

## Database Schema

### Conversations Table (Updated)

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  organization_id text NOT NULL,
  industry text DEFAULT 'strive',
  session_id text NOT NULL,
  user_message text NOT NULL,
  assistant_response text NOT NULL,
  embedding vector(1536),  -- ✅ NOW VECTOR TYPE
  problem_detected text,
  solution_presented text,
  conversation_stage text NOT NULL,
  outcome text,
  conversion_score float,
  booking_completed boolean DEFAULT false,
  response_time_ms integer,
  user_satisfaction integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Example Conversations Table (New)

```sql
CREATE TABLE example_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text DEFAULT 'strive',
  user_input text NOT NULL,
  assistant_response text NOT NULL,
  problem_type text,
  solution_type text,
  outcome text,
  conversion_score float,
  embedding vector(1536),  -- Vector embeddings
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

---

## Vector Search Functions

### 1. match_conversations()

Searches for similar conversations in the main conversations table.

**Usage:**
```sql
SELECT * FROM match_conversations(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_industry := 'strive',
  match_threshold := 0.75,  -- 75% similarity minimum
  match_count := 5           -- Return top 5 results
);
```

**Returns:**
- id, session_id, user_message, assistant_response
- problem_detected, solution_presented, conversation_stage
- outcome, conversion_score, booking_completed
- similarity (0-1, higher is better)

### 2. match_examples()

Searches for similar training examples.

**Usage:**
```sql
SELECT * FROM match_examples(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_industry := 'strive',
  match_threshold := 0.75,
  match_count := 5
);
```

**Returns:**
- id, user_input, assistant_response
- problem_type, solution_type, outcome
- conversion_score, similarity

---

## Indexes Created

Performance optimization for vector searches:

```sql
-- Vector similarity indexes (IVFFlat)
CREATE INDEX conversations_embedding_idx
  ON conversations USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX example_conversations_embedding_idx
  ON example_conversations USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Filtering indexes
CREATE INDEX conversations_industry_idx ON conversations(industry);
CREATE INDEX conversations_session_idx ON conversations(session_id);
CREATE INDEX conversations_created_at_idx ON conversations(created_at DESC);
CREATE INDEX example_conversations_industry_idx ON example_conversations(industry);
```

---

## Training Data

### Current Examples (3)

1. **Data Quality & Churn Problem**
   - Conversion Score: 0.95
   - Embedding: ✅ Generated

2. **Pricing Inquiry**
   - Conversion Score: 0.75
   - Embedding: ✅ Generated

3. **Sales Inefficiency**
   - Conversion Score: 0.88
   - Embedding: ✅ Generated

All embeddings are 1536-dimensional vectors from OpenAI's `text-embedding-ada-002` model.

---

## NPM Scripts Available

```bash
# Test vector search setup
npm run chatbot:test-vector-search

# Generate embeddings for new training examples
npm run chatbot:generate-embeddings

# Re-run full RAG setup (if needed)
npm run chatbot:setup-rag

# View database in GUI
npm run chatbot:studio
```

---

## How the RAG Service Uses This

### 1. User Sends Message

```
User: "We're losing customers and can't track our pipeline"
```

### 2. RAG Service Generates Embedding

```typescript
const openai = new OpenAI();
const response = await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: userMessage,
});
const queryEmbedding = response.data[0].embedding; // 1536 dimensions
```

### 3. Vector Search

```typescript
const { data } = await supabase.rpc('match_examples', {
  query_embedding: queryEmbedding,
  match_industry: 'strive',
  match_threshold: 0.75,
  match_count: 5,
});
```

### 4. Returns Similar Examples

```json
[
  {
    "user_input": "We are losing customers due to poor data quality...",
    "assistant_response": "It sounds like you are facing challenges...",
    "similarity": 0.92,
    "conversion_score": 0.95
  }
]
```

### 5. RAG Context Built

The similar conversations are used to enhance the system prompt:

```
You are Sai, the AI sales assistant for Strive Tech.

**CONTEXTUAL INTELLIGENCE (RAG-Enhanced)**

Similar conversations detected these problems:
- Data quality and customer churn
- Pipeline tracking difficulties

Proven Approach (95% conversion rate):
Focus on quantifying problem impact and showing clear ROI.

Recommended Strategy:
Ask discovery questions about their specific data challenges...
```

---

## Verification

Run the test script to verify everything works:

```bash
npm run chatbot:test-vector-search
```

**Expected Output:**
```
✅ pgvector: Enabled
✅ example_conversations: Created with 3 examples
✅ conversations: Ready for vector embeddings
✅ match_examples: Function available
✅ match_conversations: Function available
```

---

## Adding More Training Examples

### Option 1: Insert via SQL

```sql
INSERT INTO example_conversations (
  industry,
  user_input,
  assistant_response,
  problem_type,
  solution_type,
  outcome,
  conversion_score
) VALUES (
  'strive',
  'User question here...',
  'Assistant response here...',
  'problem_category',
  'solution_category',
  'booking_scheduled',
  0.85
);
```

Then run:
```bash
npm run chatbot:generate-embeddings
```

### Option 2: Let the Chatbot Learn

As real conversations happen:
1. Chatbot stores them in `conversations` table
2. RAG service generates embeddings automatically
3. Future queries use these real conversations as context

---

## Performance Notes

- **Vector Search Speed:** ~10-50ms for 1000 conversations
- **Embedding Generation:** ~100-200ms per message (OpenAI API)
- **Cache:** Embeddings cached in Redis (15 min TTL)
- **Index Type:** IVFFlat (good balance of speed/accuracy)

### For Better Performance

```sql
-- Increase lists for more precision (slower)
CREATE INDEX ... WITH (lists = 200);

-- Or use HNSW for better accuracy (requires pgvector 0.5.0+)
CREATE INDEX ... USING hnsw (embedding vector_cosine_ops);
```

---

## Troubleshooting

### "Function does not exist"

```bash
# Re-run setup
npm run chatbot:setup-rag
```

### "Embedding is NULL"

```bash
# Generate embeddings
npm run chatbot:generate-embeddings
```

### "No similar results found"

- Check that embeddings are generated
- Lower the `match_threshold` (try 0.5 instead of 0.75)
- Add more training examples

### "Slow vector search"

- Check indexes exist: `\d example_conversations` in psql
- Increase lists parameter
- Consider HNSW index

---

## Security

✅ **Permissions Granted:**
- `authenticated` role can execute vector search functions
- `anon` role can execute vector search functions (for public chatbot)

⚠️ **Note:** Only search functions are exposed, not direct table access.

---

## Next Steps (Optional)

### 1. Add Industry-Specific Examples

Create training examples for different industries:

```sql
INSERT INTO example_conversations (industry, ...) VALUES ('healthcare', ...);
INSERT INTO example_conversations (industry, ...) VALUES ('finance', ...);
```

### 2. Implement Conversation Rating

Add user feedback to improve training:

```sql
ALTER TABLE conversations ADD COLUMN user_rating INTEGER;
```

Use high-rated conversations as training examples.

### 3. A/B Test Prompts

Track which RAG-enhanced prompts lead to better conversions.

### 4. Auto-Learning Pipeline

Build a cron job that:
1. Finds high-conversion conversations
2. Automatically adds them to `example_conversations`
3. Generates embeddings nightly

---

## Summary

✅ **Vector Search:** Fully functional
✅ **Training Data:** 3 examples with embeddings
✅ **Functions:** match_conversations, match_examples
✅ **Indexes:** Optimized for fast search
✅ **Scripts:** Automated embedding generation

**The RAG system is production-ready!**

🚀 The chatbot can now use semantic search to find similar past conversations and provide better, context-aware responses.

---

**Documentation Updated:** October 1, 2025
**Setup Time:** ~15 minutes (automated)
**Status:** Production Ready ✅
