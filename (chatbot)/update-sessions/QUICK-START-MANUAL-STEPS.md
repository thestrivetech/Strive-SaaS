# 🚀 Quick Start: Manual Steps

**All code is updated! Here's what YOU need to do:**

---

## ✅ Step 1: Run SQL Migration (2 minutes)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Navigate to your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Copy the contents of `SUPABASE-MIGRATION.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected output:**
```
Success. No rows returned

-- Then verification results showing:
- first_name column added
- last_name column added
- 2 indexes created
- Preview of migrated data
```

---

## ✅ Step 2: Generate Prisma Client (1 minute)

```bash
cd ..
cd shared
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (5.x.x) to ../node_modules/@prisma/client
```

---

## ✅ Step 3: Test the Integration (5 minutes)

```bash
cd ../\(chatbot\)
npm run dev
```

Open http://localhost:3000/full and test:

```
You: "Hi, I'm Billy Bob"
Bot: [responds]

You: "I'm looking for a 3 bedroom house in Nashville for $500k with a pool and backyard"
Bot: [searches properties]
```

---

## ✅ Step 4: Verify Data in Supabase (2 minutes)

Go to Supabase Dashboard → **Table Editor** → `leads` table

**Check for your test lead:**
- `first_name` = "Billy"
- `last_name` = "Bob"
- `budget` = "500000"
- `custom_fields` → `has_pool` = true
- `custom_fields` → `has_backyard` = true

**Or run this SQL query:**
```sql
SELECT
  first_name,
  last_name,
  budget,
  custom_fields->>'has_pool' as has_pool,
  custom_fields->>'has_backyard' as has_backyard,
  custom_fields->'property_preferences'->>'location' as location
FROM leads
WHERE source = 'CHATBOT'
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎉 Done!

If you see Billy Bob's data in Supabase with proper first/last names, **you're all set!**

---

## 🔍 Query Examples

### View all chatbot leads:
```sql
SELECT
  first_name,
  last_name,
  email,
  phone,
  budget,
  score,
  custom_fields->'property_preferences'->>'location' as location,
  created_at
FROM leads
WHERE source = 'CHATBOT'
ORDER BY score_value DESC, created_at DESC;
```

### Find leads wanting a pool:
```sql
SELECT
  first_name || ' ' || last_name as name,
  phone,
  email,
  budget,
  custom_fields->'property_preferences'->>'location' as location
FROM leads
WHERE
  source = 'CHATBOT'
  AND (custom_fields->>'has_pool')::boolean = true;
```

### Hot leads ready for contact:
```sql
SELECT
  first_name,
  last_name,
  email,
  phone,
  budget,
  score,
  score_value,
  notes
FROM leads
WHERE
  source = 'CHATBOT'
  AND score IN ('HOT', 'QUALIFIED')
  AND (email IS NOT NULL OR phone IS NOT NULL)
ORDER BY score_value DESC;
```

---

## ⚠️ Troubleshooting

### Issue: Prisma generate fails
**Solution:**
```bash
# Make sure you're in the shared directory
cd ../shared
npm install
npx prisma generate
```

### Issue: Can't see new columns in Supabase
**Solution:**
- Refresh Supabase dashboard
- Check you ran the SQL in the correct project
- Verify migration with: `SELECT * FROM information_schema.columns WHERE table_name = 'leads';`

### Issue: Names not splitting correctly
**Solution:**
- Check the AI extraction is working: Look at console logs when testing
- Should see: `✅ Extracted: { fields: ['firstName', 'lastName'], ...}`
- If not, check your GROQ_API_KEY is set in .env.local

---

**Need help?** Check the full guide in `DATABASE-INTEGRATION-GUIDE.md`
