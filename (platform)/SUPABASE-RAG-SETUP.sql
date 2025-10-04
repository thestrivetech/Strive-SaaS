-- =====================================================
-- SUPABASE RAG SETUP for Chatbot
-- =====================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bztkedvdjbxffpjxihtc/sql
--
-- This sets up the vector search functionality for the RAG system

-- =====================================================
-- STEP 1: Enable pgvector extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- STEP 2: Update conversations table to use vector type
-- =====================================================
-- Note: Currently embedding is stored as JSONB
-- Optionally convert to native vector type for better performance

-- Check current column type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name = 'embedding';

-- OPTIONAL: Convert JSONB to vector type (1536 dimensions for OpenAI ada-002)
-- Uncomment if you want to use native vector type:
-- ALTER TABLE conversations
-- ALTER COLUMN embedding TYPE vector(1536)
-- USING (embedding::text::vector(1536));

-- =====================================================
-- STEP 3: Create vector similarity search function
-- =====================================================
-- This function searches for similar conversations using cosine similarity

CREATE OR REPLACE FUNCTION match_conversations(
  query_embedding vector(1536),
  match_industry text,
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  session_id text,
  user_message text,
  assistant_response text,
  problem_detected text,
  solution_presented text,
  conversation_stage text,
  outcome text,
  conversion_score float,
  booking_completed boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.session_id,
    c.user_message,
    c.assistant_response,
    c.problem_detected,
    c.solution_presented,
    c.conversation_stage,
    c.outcome,
    c.conversion_score,
    c.booking_completed,
    1 - (c.embedding <=> query_embedding) as similarity
  FROM conversations c
  WHERE
    c.industry = match_industry
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- STEP 4: Create example conversations table (optional)
-- =====================================================
-- This stores pre-built training examples for better RAG performance

CREATE TABLE IF NOT EXISTS example_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL DEFAULT 'strive',
  user_input text NOT NULL,
  assistant_response text NOT NULL,
  problem_type text,
  solution_type text,
  outcome text,
  conversion_score float,
  embedding vector(1536),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS example_conversations_embedding_idx
ON example_conversations
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for industry filtering
CREATE INDEX IF NOT EXISTS example_conversations_industry_idx
ON example_conversations(industry);

-- =====================================================
-- STEP 5: Create example search function
-- =====================================================

CREATE OR REPLACE FUNCTION match_examples(
  query_embedding vector(1536),
  match_industry text,
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  user_input text,
  assistant_response text,
  problem_type text,
  solution_type text,
  outcome text,
  conversion_score float,
  similarity float
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
    1 - (e.embedding <=> query_embedding) as similarity
  FROM example_conversations e
  WHERE
    e.industry = match_industry
    AND e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =====================================================
-- STEP 6: Create vector search index on conversations
-- =====================================================
-- This speeds up similarity searches

CREATE INDEX IF NOT EXISTS conversations_embedding_idx
ON conversations
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS conversations_industry_idx ON conversations(industry);
CREATE INDEX IF NOT EXISTS conversations_session_idx ON conversations(session_id);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);

-- =====================================================
-- STEP 7: Insert sample training data (optional)
-- =====================================================
-- Example high-quality conversation for training

INSERT INTO example_conversations (
  industry,
  user_input,
  assistant_response,
  problem_type,
  solution_type,
  outcome,
  conversion_score
) VALUES
(
  'strive',
  'We are losing customers due to poor data quality and cannot track our sales pipeline effectively',
  'It sounds like you are facing challenges with data integrity and pipeline visibility. Many of our clients experienced similar issues before implementing our AI-powered CRM solution. Our platform can help you: 1) Automatically clean and validate customer data, 2) Provide real-time pipeline visibility with AI insights, 3) Reduce customer churn by up to 40%. Would you like to see a demo of how this works for companies in your industry?',
  'data_quality_churn',
  'ai_crm_automation',
  'booking_scheduled',
  0.95
),
(
  'strive',
  'How much does your solution cost?',
  'Great question! Our pricing is designed to scale with your business. We offer three tiers: Basic at $299/month (3 AI tools), Pro at $699/month (10 tools), and Enterprise (custom pricing for unlimited tools). However, before discussing pricing, I would love to understand your specific challenges better. What is your biggest pain point right now - is it customer retention, sales efficiency, or something else? This will help me show you the ROI you can expect.',
  'pricing_inquiry',
  'value_first_approach',
  'discovery_deepened',
  0.75
);

-- Note: Embeddings will need to be generated via OpenAI API and inserted separately
-- The RAG service will automatically generate and store embeddings for new conversations

-- =====================================================
-- STEP 8: Grant permissions (if needed)
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION match_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION match_conversations TO anon;
GRANT EXECUTE ON FUNCTION match_examples TO authenticated;
GRANT EXECUTE ON FUNCTION match_examples TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the match_conversations function (will return empty until conversations exist)
-- SELECT * FROM match_conversations(
--   array_fill(0.1, ARRAY[1536])::vector(1536),  -- dummy embedding
--   'strive',
--   0.5,
--   5
-- );

-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name = 'embedding';

-- =====================================================
-- NOTES
-- =====================================================

-- 1. Embeddings are 1536 dimensions (OpenAI text-embedding-ada-002)
-- 2. Similarity is calculated using cosine distance (<=> operator)
-- 3. Higher similarity values (closer to 1.0) indicate better matches
-- 4. Indexes use IVFFlat for fast approximate nearest neighbor search
-- 5. The RAG service caches embeddings and search results for performance

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get "function does not exist" errors:
-- 1. Make sure pgvector extension is enabled
-- 2. Make sure you are in the correct schema (usually 'public')
-- 3. Check function exists: SELECT * FROM pg_proc WHERE proname = 'match_conversations';

-- If vector type conversion fails:
-- Keep embedding as JSONB for now - it will still work
-- The RAG service handles both vector and JSONB types

-- If similarity search is slow:
-- 1. Make sure indexes are created
-- 2. Increase lists parameter in index: WITH (lists = 200)
-- 3. Consider using HNSW index instead of IVFFlat for better accuracy
