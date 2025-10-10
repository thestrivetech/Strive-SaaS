-- =====================================================
-- SUPABASE MIGRATION: Add first_name and last_name to leads
-- =====================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
--
-- This adds first_name and last_name columns to the leads table
-- for better lead organization from chatbot conversations.

-- =====================================================
-- STEP 1: Add new columns
-- =====================================================
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- =====================================================
-- STEP 2: Create indexes for searching
-- =====================================================
CREATE INDEX IF NOT EXISTS leads_first_name_idx ON leads(first_name);
CREATE INDEX IF NOT EXISTS leads_last_name_idx ON leads(last_name);

-- =====================================================
-- STEP 3: Migrate existing data (optional)
-- =====================================================
-- This splits existing 'name' field into first_name/last_name
-- Only runs on leads where first_name is still NULL

UPDATE leads
SET
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1
    THEN TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
    ELSE NULL
  END
WHERE first_name IS NULL
  AND name IS NOT NULL
  AND name != ''
  AND name != 'Chatbot Lead';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check if columns were added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('first_name', 'last_name');

-- Check if indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'leads'
  AND indexname IN ('leads_first_name_idx', 'leads_last_name_idx');

-- Preview migrated data (first 10 rows)
SELECT
  id,
  name,
  first_name,
  last_name,
  email,
  source,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- If you see the columns and indexes above, the migration is complete.
-- You can now run: npx prisma generate
