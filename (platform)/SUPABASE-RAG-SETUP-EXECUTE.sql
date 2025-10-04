-- =====================================================
-- SUPABASE RAG SETUP - STEP BY STEP EXECUTION
-- =====================================================
-- This version handles the embedding column conversion properly

-- =====================================================
-- STEP 1: Enable pgvector extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- STEP 2: Convert embedding column from Json to vector
-- =====================================================

-- First, check if column needs conversion
DO $$
BEGIN
    -- Drop existing embedding column if it's JSONB/JSON
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations'
        AND column_name = 'embedding'
        AND data_type IN ('json', 'jsonb')
    ) THEN
        ALTER TABLE conversations DROP COLUMN embedding;
        ALTER TABLE conversations ADD COLUMN embedding vector(1536);
    END IF;

    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'conversations'
        AND column_name = 'embedding'
    ) THEN
        ALTER TABLE conversations ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create example_conversations table
-- =====================================================

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

-- =====================================================
-- STEP 4: Create vector search functions
-- =====================================================

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
    c.id::uuid,
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
-- STEP 5: Create indexes
-- =====================================================

-- Create vector indexes (IVFFlat for fast approximate search)
CREATE INDEX IF NOT EXISTS conversations_embedding_idx
ON conversations
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS example_conversations_embedding_idx
ON example_conversations
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create filtering indexes
CREATE INDEX IF NOT EXISTS conversations_industry_idx ON conversations(industry);
CREATE INDEX IF NOT EXISTS conversations_session_idx ON conversations(session_id);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS example_conversations_industry_idx ON example_conversations(industry);

-- =====================================================
-- STEP 6: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION match_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION match_conversations TO anon;
GRANT EXECUTE ON FUNCTION match_examples TO authenticated;
GRANT EXECUTE ON FUNCTION match_examples TO anon;

-- =====================================================
-- STEP 7: Insert sample training data
-- =====================================================

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
),
(
  'strive',
  'Our sales team is overwhelmed with manual tasks and missing follow-ups',
  'That is a challenge many growing teams face. Strive Tech''s AI automation can eliminate up to 80% of repetitive sales tasks. Our clients typically see sales productivity increase by 3x within the first month. The system automatically handles: follow-up reminders, email sequences, data entry, and lead scoring. This frees your team to focus on building relationships and closing deals. Would you like to see how we automated this for a company similar to yours?',
  'sales_inefficiency',
  'ai_automation',
  'booking_scheduled',
  0.88
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check pgvector extension
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'vector'
) as pgvector_enabled;

-- Check embedding column type
SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('conversations', 'example_conversations')
  AND column_name = 'embedding';

-- Check functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('match_conversations', 'match_examples')
  AND routine_schema = 'public';

-- Count indexes
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('conversations', 'example_conversations')
  AND schemaname = 'public';

-- Count training examples
SELECT COUNT(*) as training_examples_count FROM example_conversations;
