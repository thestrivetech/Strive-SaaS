# RAG Configuration Options & Architecture Decisions

**Purpose:** Document all configuration choices for the chatbot's RAG (Retrieval-Augmented Generation) system to inform future architectural decisions.

---

## Table of Contents
1. [Current Architecture](#current-architecture)
2. [Database Layer Options](#database-layer-options)
3. [Vector Storage Options](#vector-storage-options)
4. [Embedding Provider Options](#embedding-provider-options)
5. [Caching Strategies](#caching-strategies)
6. [Hybrid vs Pure Approaches](#hybrid-vs-pure-approaches)
7. [Decision Matrix](#decision-matrix)
8. [Migration Paths](#migration-paths)

---

## Current Architecture

### ✅ Active Configuration (As of October 2025)

```
┌─────────────────────────────────────────────────────────┐
│                    RAG Service Layer                     │
│            (lib/modules/chatbot/services/)               │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   OpenAI     │    │  Supabase    │    │   In-Memory  │
│  Embeddings  │    │  PostgreSQL  │    │    Cache     │
│              │    │  + pgvector  │    │   (Node.js)  │
└──────────────┘    └──────────────┘    └──────────────┘
    text-ada-002        Vector ops         LRU cache
    1536 dims          Search/Store        24hr TTL
```

**Stack:**
- **Database:** Supabase PostgreSQL (single source)
- **Client:** `@supabase/supabase-js` (100% of operations)
- **Vector Type:** JSONB → pgvector (post-setup)
- **Embeddings:** OpenAI text-embedding-ada-002
- **Cache:** In-memory LRU (CacheService)

**Why This Configuration:**
- ✅ Single client for all database operations
- ✅ Native vector search capabilities
- ✅ No ORM overhead for vector operations
- ✅ Simpler mental model for RAG-specific code

---

## Database Layer Options

### Option 1: Pure Supabase (✅ CURRENT CHOICE)

**Implementation:**
```typescript
// All operations use Supabase client
await supabase.from('conversations').insert({
  user_message: message,
  embedding: vector,
  // snake_case field names
});

await supabase.rpc('match_conversations', {
  query_embedding: vector,
});
```

**Pros:**
- ✅ Single client, single pattern
- ✅ Native vector search support
- ✅ Direct access to PostgreSQL functions
- ✅ No ORM abstraction overhead
- ✅ Better for ML/AI workloads

**Cons:**
- ❌ Manual type definitions required
- ❌ No autocomplete for table fields
- ❌ Snake_case vs camelCase inconsistency with app
- ❌ Schema changes need manual updates
- ❌ No built-in migrations

**Best For:**
- Vector-heavy operations
- AI/ML workloads
- When you need PostgreSQL functions
- Modules isolated from main app

---

### Option 2: Pure Prisma

**Implementation:**
```typescript
// All operations use Prisma ORM
await prisma.conversation.create({
  data: {
    userMessage: message,
    embedding: vector as Prisma.JsonValue,
    // camelCase field names
  }
});

// No native vector search - would need raw SQL
await prisma.$queryRaw`
  SELECT * FROM match_conversations(${vector})
`;
```

**Pros:**
- ✅ Type-safe autocomplete
- ✅ Consistent with rest of app
- ✅ Automatic migrations
- ✅ Relation handling built-in
- ✅ CamelCase consistency

**Cons:**
- ❌ No native vector type support
- ❌ Must use raw SQL for vector operations
- ❌ Stores embeddings as JSON (less efficient)
- ❌ ORM overhead for simple inserts
- ❌ Can't call PostgreSQL functions easily

**Best For:**
- CRUD-heavy applications
- When consistency with app is critical
- Relational data operations
- Traditional backend APIs

---

### Option 3: Hybrid (Prisma + Supabase)

**Implementation:**
```typescript
// CRUD via Prisma
await prisma.conversation.create({
  data: { userMessage, embedding }
});

// Vector search via Supabase
await supabase.rpc('match_conversations', {
  query_embedding: vector
});
```

**Pros:**
- ✅ Best of both worlds
- ✅ Type safety for CRUD
- ✅ Native vector search
- ✅ Consistent with app for non-vector ops

**Cons:**
- ❌ Two clients to maintain
- ❌ More complexity
- ❌ Snake_case vs camelCase mixing
- ❌ Need to keep schemas in sync
- ❌ Higher learning curve

**Best For:**
- Large applications with mixed workloads
- When you need both type safety and vector ops
- Teams with varied expertise

---

## Vector Storage Options

### Option A: JSONB (Current Initial State)

**Schema:**
```sql
CREATE TABLE conversations (
  embedding JSONB  -- Store as JSON array
);
```

**Pros:**
- ✅ Works immediately (no pgvector needed)
- ✅ Compatible with Prisma and Supabase
- ✅ Easy to debug (human-readable)

**Cons:**
- ❌ Slower similarity search
- ❌ No specialized indexes
- ❌ Higher storage overhead
- ❌ No distance operators

**Use When:**
- Getting started / prototyping
- pgvector not available
- Small dataset (< 10k vectors)

---

### Option B: pgvector (Recommended)

**Schema:**
```sql
CREATE EXTENSION vector;

CREATE TABLE conversations (
  embedding vector(1536)  -- Native vector type
);

CREATE INDEX ON conversations
USING ivfflat (embedding vector_cosine_ops);
```

**Pros:**
- ✅ 10-100x faster similarity search
- ✅ Specialized indexing (IVFFlat, HNSW)
- ✅ Native distance operators (<->, <#>, <=>)
- ✅ Lower storage overhead
- ✅ Industry standard for vector search

**Cons:**
- ❌ Requires extension installation
- ❌ Less portable (PostgreSQL-specific)
- ❌ Needs index maintenance
- ❌ Prisma stores as JSON (no native support)

**Use When:**
- Production workloads
- > 1000 vectors
- Performance is critical
- Using Supabase (has pgvector)

---

### Option C: External Vector DB

**Options:** Pinecone, Weaviate, Qdrant, Milvus

**Architecture:**
```
PostgreSQL → Stores conversation text
     +
Vector DB  → Stores embeddings only
```

**Pros:**
- ✅ Best-in-class vector performance
- ✅ Advanced features (filtering, metadata)
- ✅ Scales to billions of vectors
- ✅ Purpose-built for vectors

**Cons:**
- ❌ Additional service to manage
- ❌ Data split across two systems
- ❌ More complex sync logic
- ❌ Extra cost
- ❌ Network latency between services

**Use When:**
- > 1M vectors
- Need advanced vector features
- Budget for dedicated vector DB
- Multi-region deployments

---

## Embedding Provider Options

### Option 1: OpenAI (✅ CURRENT)

**Model:** text-embedding-ada-002

**Specs:**
- Dimensions: 1536
- Cost: $0.0001 / 1K tokens
- Max input: 8,191 tokens
- Quality: Excellent

**Pros:**
- ✅ High quality embeddings
- ✅ Battle-tested
- ✅ Good documentation
- ✅ Easy to use

**Cons:**
- ❌ Costs money
- ❌ External API dependency
- ❌ Slower than local models
- ❌ Data sent to OpenAI

---

### Option 2: Open Source Models

**Options:**
- all-MiniLM-L6-v2 (384 dims)
- BGE-base-en-v1.5 (768 dims)
- E5-large-v2 (1024 dims)

**Pros:**
- ✅ Free (no API costs)
- ✅ Run locally
- ✅ Data privacy
- ✅ Lower latency

**Cons:**
- ❌ Need to host models
- ❌ Lower quality than OpenAI
- ❌ Infrastructure costs
- ❌ Model management

---

### Option 3: Cohere / Voyage AI

**Alternative paid APIs**

**Pros:**
- ✅ Competitive pricing
- ✅ Good quality
- ✅ Specialized for search

**Cons:**
- ❌ Less proven
- ❌ Vendor lock-in
- ❌ Smaller ecosystem

---

## Caching Strategies

### Current Strategy: Two-Layer Cache

```typescript
// Layer 1: Embedding cache (24 hours)
const embedding = await generateEmbedding(text);
// Saves ~90% of embedding costs

// Layer 2: RAG result cache (1 hour)
const results = await searchSimilarConversations(query);
// Saves ~70% of vector searches
```

**Why This Works:**
- Same questions asked repeatedly (FAQ pattern)
- Embeddings are deterministic
- Trade memory for speed and cost

---

### Alternative: Redis Cache

**Implementation:**
```typescript
// External Redis cache
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

**Pros:**
- ✅ Persistent across restarts
- ✅ Shared across instances
- ✅ Better eviction policies
- ✅ Larger capacity

**Cons:**
- ❌ Extra infrastructure
- ❌ Network latency
- ❌ Additional cost
- ❌ More complexity

**Use When:**
- Multi-instance deployment
- Need cache persistence
- High traffic volume

---

### Alternative: No Cache

**Pros:**
- ✅ Simpler code
- ✅ Always fresh results
- ✅ No memory overhead

**Cons:**
- ❌ 10x higher costs
- ❌ Slower responses
- ❌ More API load

**Use When:**
- Low traffic
- Cost not a concern
- Results must be real-time

---

## Hybrid vs Pure Approaches

### Comparison Table

| Aspect | Pure Supabase | Pure Prisma | Hybrid |
|--------|---------------|-------------|---------|
| **Complexity** | Low | Low | Medium-High |
| **Type Safety** | Manual | Excellent | Excellent |
| **Vector Ops** | Native | Raw SQL | Native |
| **CRUD Ops** | Manual types | Auto-complete | Auto-complete |
| **Migrations** | Manual | Automatic | Both needed |
| **App Consistency** | Different | Same | Same |
| **Learning Curve** | Low | Low | Medium |
| **Maintenance** | Low | Low | Medium |
| **Performance** | Best for vectors | ORM overhead | Best overall |
| **Team Onboarding** | Easy (if know SQL) | Easy (if know ORMs) | Harder |

---

## Decision Matrix

### Choose **Pure Supabase** If:
- ✅ RAG is core functionality
- ✅ Team comfortable with SQL
- ✅ Vector operations > CRUD operations
- ✅ Performance is critical
- ✅ Small, focused module
- ✅ Want PostgreSQL functions

**Example Use Cases:**
- Search engines
- Recommendation systems
- AI chatbots (like Sai)
- ML-heavy applications

---

### Choose **Pure Prisma** If:
- ✅ CRUD operations > Vector operations
- ✅ Need strong typing everywhere
- ✅ Team prefers ORMs
- ✅ Consistency with app is critical
- ✅ Complex relational data
- ✅ Vector search is secondary

**Example Use Cases:**
- Traditional CRUD apps
- Admin dashboards
- CRM systems
- E-commerce platforms

---

### Choose **Hybrid** If:
- ✅ Large application
- ✅ Mixed workloads
- ✅ Need both benefits
- ✅ Team has both skill sets
- ✅ Can manage complexity
- ✅ Long-term investment

**Example Use Cases:**
- Enterprise platforms
- Multi-module apps
- Large teams
- Complex domains

---

## Migration Paths

### From Supabase → Prisma

**Steps:**
1. Create Prisma schema matching Supabase
2. Generate Prisma client
3. Replace Supabase calls with Prisma
4. Convert snake_case to camelCase
5. Handle vector type (JSONB workaround)

**Effort:** Medium
**Risk:** Medium (field name mismatches)
**Benefit:** Type safety, app consistency

---

### From Prisma → Supabase

**Steps:**
1. Create types for Supabase responses
2. Replace Prisma calls with Supabase
3. Convert camelCase to snake_case
4. Add error handling for Supabase
5. Remove Prisma from this module

**Effort:** Low
**Risk:** Low
**Benefit:** Better vector support

---

### From JSONB → pgvector

**Steps:**
1. Enable pgvector extension
2. Migrate embedding column type
3. Create vector indexes
4. Update RPC functions
5. Test similarity search

**SQL:**
```sql
-- 1. Enable extension
CREATE EXTENSION vector;

-- 2. Alter column
ALTER TABLE conversations
ALTER COLUMN embedding TYPE vector(1536)
USING (embedding::text::vector(1536));

-- 3. Create index
CREATE INDEX conversations_embedding_idx
ON conversations
USING ivfflat (embedding vector_cosine_ops);
```

**Effort:** Low
**Risk:** Low (can rollback)
**Benefit:** 10-100x faster search

---

## Current Decision Rationale

### Why We Chose: Pure Supabase + JSONB (transitioning to pgvector)

**Primary Reasons:**

1. **RAG-Specific Module**
   - This is the `chatbot` module, isolated from main app
   - Different concerns than CRUD operations
   - Vector operations are primary workload

2. **Performance**
   - Need fast vector similarity search
   - Supabase RPC functions are optimal
   - No ORM overhead

3. **Simplicity**
   - One client, one pattern
   - Easier to understand for AI/ML engineers
   - Clear separation from main app

4. **PostgreSQL Functions**
   - RAG needs `match_conversations()` function
   - Supabase makes this easy to call
   - Prisma would require raw SQL

5. **Future-Proof**
   - Easy to add pgvector
   - Can scale to millions of conversations
   - Can add advanced features (filtering, metadata)

**Trade-offs Accepted:**
- ❌ Manual typing (but AI-specific types anyway)
- ❌ Snake_case fields (contained to this module)
- ❌ Different from main app (intentional separation)

---

## Future Considerations

### When to Reconsider Architecture

**Switch to Hybrid (Prisma + Supabase) if:**
- Need strong relations to other app tables
- Team grows and needs more type safety
- CRUD operations become more common
- Want to use Prisma Studio for debugging

**Switch to External Vector DB if:**
- > 1M conversations stored
- Need multi-region deployment
- Advanced vector features required
- Budget allows dedicated service

**Switch to Local Embeddings if:**
- OpenAI costs become significant
- Data privacy becomes critical
- Have ML infrastructure already
- Can host models efficiently

---

## Configuration Checklist

### Current Setup Status

- [x] Supabase client configured
- [x] SUPABASE_SERVICE_ROLE_KEY set
- [ ] OPENAI_API_KEY set (required)
- [x] Conversation table created
- [ ] pgvector extension enabled
- [ ] Vector indexes created
- [ ] match_conversations() function created
- [ ] example_conversations table created
- [x] Cache service implemented
- [x] Error handling implemented

### Next Steps (In Order)

1. ✅ **Add OPENAI_API_KEY** to `.env.local`
2. ✅ **Run SUPABASE-RAG-SETUP.sql** in Supabase
3. ⏳ **Test vector search** with sample queries
4. ⏳ **Monitor performance** and costs
5. ⏳ **Add training examples** to example_conversations
6. ⏳ **Optimize indexes** based on usage patterns

---

## Monitoring & Optimization

### Key Metrics to Track

**Performance:**
- Vector search latency (target: < 100ms)
- Embedding generation time (target: < 500ms)
- Cache hit rate (target: > 80%)

**Costs:**
- OpenAI API costs (target: < $10/month initially)
- Supabase storage (track growth rate)
- Compute usage (watch for spikes)

**Quality:**
- Similarity score distribution
- RAG context relevance
- Conversation conversion rates

### Optimization Triggers

**If search is slow (> 200ms):**
1. Check if pgvector is enabled
2. Verify indexes exist
3. Consider HNSW instead of IVFFlat
4. Review threshold settings

**If costs are high:**
1. Increase cache TTL
2. Reduce embedding regeneration
3. Consider cheaper embedding model
4. Batch operations

**If accuracy is low:**
1. Add more training examples
2. Adjust similarity threshold
3. Fine-tune problem/solution extraction
4. Consider different embedding model

---

## Summary

**Current Architecture:** Pure Supabase
**Reasoning:** Optimal for vector-heavy RAG workloads
**Trade-offs:** Manual typing, different from main app
**Recommendation:** Keep as-is unless requirements change significantly

**This document should be updated when:**
- Architecture decisions are revisited
- New RAG technologies emerge
- Performance requirements change
- Team composition shifts
- Budget constraints change

---

**Last Updated:** October 2025
**Next Review:** When considering architectural changes or scaling issues
