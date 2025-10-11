# 🔧 Complete Troubleshooting Guide & FAQ

## 🚨 Common Issues & Solutions

### Issue 1: "Missing required fields" Error

**Error Message:**
```json
{
  "success": false,
  "error": "Missing required fields: organization_id, client_id"
}
```

**Causes:**
- Request body doesn't include required fields
- Field names are misspelled
- Fields are null or undefined

**Solutions:**
```javascript
// ✅ Correct request format
const payload = {
  organization_id: "123e4567-e89b-12d3-a456-426614174000", // Required
  client_id: "223e4567-e89b-12d3-a456-426614174001",       // Required
  type: "email",                                           // Required
  channel: "email",                                        // Required
  direction: "inbound",                                    // Required
  content: "Message content here"                          // Required
};

// ❌ Common mistakes to avoid
const badPayload = {
  organizationId: "...",  // Wrong: use organization_id
  clientId: "...",        // Wrong: use client_id
  type: null,             // Wrong: cannot be null
  channel: undefined      // Wrong: cannot be undefined
};
```

**Validation Checklist:**
- [ ] All field names use snake_case (underscore_separated)
- [ ] All required fields are present
- [ ] UUIDs are valid format (8-4-4-4-12)
- [ ] Enums match exact values (case-sensitive)

---

### Issue 2: Google Gemini API Errors

**Error Message:**
```
AI_ANALYSIS_FAILED: Failed to analyze activity
```

**Common Causes:**

#### A. Invalid or Missing API Key
```javascript
// Check N8n credentials
// Go to: N8n → Settings → Credentials → Google Gemini
// Verify: API key is correctly entered without spaces
```

**Fix:**
1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Update N8n credential
4. Test workflow again

#### B. Rate Limit Exceeded
```
Error: 429 Too Many Requests
```

**Fix:**
```javascript
// Add retry logic with exponential backoff in workflows
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    return await callGeminiAPI(prompt);
  } catch (error) {
    if (error.status === 429 && i < maxRetries - 1) {
      const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    throw error;
  }
}
```

#### C. Invalid JSON Response
```javascript
// Enhanced JSON parsing with fallback
function parseAIResponse(response) {
  try {
    // Try direct parse
    return JSON.parse(response);
  } catch (e1) {
    try {
      // Try extracting JSON from markdown
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]);
      
      // Try extracting any JSON object
      const objMatch = response.match(/\{[\s\S]*\}/);
      if (objMatch) return JSON.parse(objMatch[0]);
    } catch (e2) {
      console.error('Failed to parse AI response:', response);
      // Return safe defaults
      return {
        sentiment: 0,
        sentiment_label: 'neutral',
        intent: 'unknown',
        topics: [],
        entities: {},
        urgency: 3,
        summary: 'Unable to analyze'
      };
    }
  }
}
```

---

### Issue 3: Database Connection Failures

**Error Message:**
```
Database connection error: Could not connect to database
```

**Diagnosis Steps:**

```sql
-- 1. Test basic connectivity in Supabase SQL Editor
SELECT NOW();

-- 2. Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. Verify RLS is not blocking
SET ROLE anon; -- Test as anonymous user
SELECT * FROM activities LIMIT 1;

-- 4. Check service role can access
SET ROLE service_role;
SELECT * FROM activities LIMIT 1;
```

**Common Fixes:**

#### A. Wrong Credentials
```javascript
// N8n Supabase credential settings:
{
  url: "https://your-project.supabase.co",  // ✅ Correct format
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."    // ✅ Use service_role key
}

// ❌ Common mistakes:
{
  url: "https://your-project.supabase.co/rest/v1",  // Wrong: don't add /rest/v1
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."            // Wrong: using anon key
}
```

#### B. RLS Blocking Access
```sql
-- Temporarily disable RLS for testing (DON'T DO IN PRODUCTION)
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Test query
SELECT * FROM activities LIMIT 1;

-- Re-enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Fix: Ensure workflows use service_role key which bypasses RLS
```

#### C. Connection Pool Exhausted
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'postgres';

-- Kill idle connections older than 5 minutes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes'
  AND datname = 'postgres';
```

---

### Issue 4: Workflow Not Triggering

**Symptoms:**
- Webhook URL returns 404
- Workflow doesn't execute when triggered
- Schedule trigger not firing

**Solutions:**

#### A. Workflow Not Active
```
Check: N8n → Workflows → [Your Workflow]
Ensure: Toggle switch is ON (green)
```

#### B. Wrong Webhook URL
```javascript
// ✅ Correct format:
https://your-n8n-instance.app.n8n.cloud/webhook/activity-stream

// ❌ Common mistakes:
https://your-n8n-instance.app.n8n.cloud/webhook-test/activity-stream  // Wrong path
http://your-n8n-instance.app.n8n.cloud/webhook/activity-stream       // Wrong protocol (http vs https)
https://n8n.io/webhook/activity-stream                               // Wrong domain
```

#### C. Schedule Configuration Issues
```javascript
// ✅ Correct cron expression for "Every 6 hours"
{
  "rule": {
    "interval": [{
      "field": "hours",
      "hoursInterval": 6
    }]
  }
}

// ✅ Correct cron expression for "Daily at 2 AM"
{
  "rule": {
    "interval": [{
      "field": "cronExpression",
      "cronExpression": "0 2 * * *"
    }]
  }
}
```

**Test Schedule Manually:**
1. Open workflow in N8n
2. Click "Execute Workflow" button
3. Check execution log for errors

---

### Issue 5: Slow Performance

**Symptom:** Workflows taking >5 seconds to complete

**Diagnosis:**

```sql
-- Check slow queries
SELECT 
  workflow_name,
  ROUND(AVG(duration_ms), 0) as avg_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0) as p95_ms,
  COUNT(*) as executions
FROM workflow_executions
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY workflow_name
ORDER BY p95_ms DESC;
```

**Optimization Steps:**

#### A. Add Database Indexes
```sql
-- Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Add indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_org_time 
ON activities(organization_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_insights_org 
ON client_insights(organization_id, engagement_score DESC);
```

#### B. Optimize Workflow Queries
```javascript
// ❌ Slow: Fetching all data
const activities = await supabase
  .from('activities')
  .select('*')
  .eq('organization_id', orgId);

// ✅ Fast: Fetch only needed fields with limit
const activities = await supabase
  .from('activities')
  .select('id, timestamp, type, channel, sentiment_label, urgency')
  .eq('organization_id', orgId)
  .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
  .order('timestamp', { ascending: false })
  .limit(100);
```

#### C. Implement Caching
```javascript
// Cache frequently accessed data
const cacheKey = `feed:${orgId}:${clientId}`;
const cached = await getCached(cacheKey);

if (cached) {
  return cached; // Return from cache
}

const data = await fetchFromDatabase();
await setCache(cacheKey, data, 300); // Cache for 5 minutes
return data;
```

---

### Issue 6: Opportunities Not Being Detected

**Symptom:** No opportunities showing up despite active clients

**Diagnosis:**

```sql
-- Check if activities are being processed
SELECT 
  COUNT(*) as total_activities,
  COUNT(*) FILTER (WHERE processed = true) as processed,
  COUNT(*) FILTER (WHERE processed = false) as unprocessed
FROM activities
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Check if opportunity detector is running
SELECT * FROM workflow_executions
WHERE workflow_name = 'opportunity-detector-v1'
ORDER BY started_at DESC
LIMIT 10;

-- Check for errors in opportunity detection
SELECT error_message, COUNT(*) as count
FROM workflow_executions
WHERE workflow_name = 'opportunity-detector-v1'
  AND status = 'failed'
GROUP BY error_message;
```

**Fixes:**

#### A. Ensure Workflow Chain is Active
```
1. activity-stream-aggregator-v1 → Must be ACTIVE
2. opportunity-detector-v1 → Must be ACTIVE
3. Check HTTP Request node connects to correct webhook URL
```

#### B. Improve AI Prompt
```javascript
// Update opportunity detection prompt with more specific instructions
const enhancedPrompt = `
Analyze this client profile and ACTIVELY look for opportunities:

CRITICAL: You MUST identify at least one opportunity if ANY of these signals exist:
- Timeline mentioned (moving date, urgency words)
- Life changes (job, family, marriage, divorce, relocation)
- Property interest (viewing, asking questions, specific criteria)
- Financial signals (budget, pre-approval, selling current home)
- Referral potential (mentions friends, family looking)

Client Data:
${clientData}

Return opportunities even with medium confidence (>0.6) if signals exist.
`;
```

#### C. Lower Confidence Threshold
```javascript
// In opportunity-detector-v1 parsing node
const opportunities = aiResponse.opportunities.filter(opp => 
  opp.confidence > 0.5  // Changed from 0.7 to 0.5
);
```

---

### Issue 7: Behavioral Patterns Not Updating

**Symptom:** Pattern analysis hasn't run or patterns are stale

**Diagnosis:**

```sql
-- Check when patterns were last analyzed
SELECT 
  client_id,
  MAX(detected_at) as last_pattern_detected,
  COUNT(*) as pattern_count
FROM behavioral_patterns
GROUP BY client_id
ORDER BY last_pattern_detected DESC;

-- Check analyzer workflow executions
SELECT * FROM workflow_executions
WHERE workflow_name = 'behavioral-pattern-analyzer-v1'
ORDER BY started_at DESC
LIMIT 5;
```

**Fixes:**

#### A. Manually Trigger Analysis
```
1. Go to N8n → behavioral-pattern-analyzer-v1
2. Click "Execute Workflow"
3. Monitor execution log
```

#### B. Check Minimum Activity Threshold
```sql
-- Workflow only analyzes clients with 5+ activities
-- Check if clients meet threshold
SELECT 
  client_id,
  COUNT(*) as activity_count
FROM activities
WHERE timestamp > NOW() - INTERVAL '90 days'
GROUP BY client_id
HAVING COUNT(*) >= 5
ORDER BY activity_count DESC;
```

#### C. Verify Schedule is Correct
```javascript
// Should run every 6 hours
// Check in workflow's Schedule Trigger node
{
  "rule": {
    "interval": [{
      "field": "hours",
      "hoursInterval": 6
    }]
  }
}
```

---

## 📚 Frequently Asked Questions

### Q1: Can I use a different AI model instead of Gemini?

**A:** Yes! You can replace Gemini with:

**OpenAI GPT-4:**
```javascript
// Replace Google Gemini node with OpenAI node
// Type: @n8n/n8n-nodes-langchain.openAi
{
  model: "gpt-4-turbo-preview",
  prompt: "Your prompt here",
  options: {
    temperature: 0.3,
    max_tokens: 1500
  }
}
```

**Anthropic Claude:**
```javascript
// Use Anthropic Chat Model node
// Type: @n8n/n8n-nodes-langchain.lmChatAnthropic
{
  model: "claude-sonnet-4",
  prompt: "Your prompt here"
}
```

### Q2: How do I handle multiple organizations?

**A:** The system is already multi-tenant ready:

```javascript
// Each request MUST include organization_id
const activity = {
  organization_id: "org-123",  // Isolates data per organization
  client_id: "client-456",
  // ... other fields
};

// Database RLS ensures data isolation
// Workflows filter all queries by organization_id
```

### Q3: Can I customize the engagement scoring algorithm?

**A:** Yes! Update the calculation in `engagement-score-updater-v1`:

```javascript
// Default weights
const recencyScore = recencyValue * 0.4;
const frequencyScore = frequencyValue * 0.3;
const sentimentScore = sentimentValue * 0.2;
const responseScore = responseValue * 0.1;

// Customize for your business
// Example: Emphasize frequency for real estate
const customScore = 
  recencyValue * 0.3 +    // Reduced recency weight
  frequencyValue * 0.4 +   // Increased frequency weight
  sentimentValue * 0.2 +
  responseValue * 0.1;
```

### Q4: How do I export activity data for reporting?

**A:** Use these queries:

```sql
-- Export all activities for an organization
COPY (
  SELECT 
    a.timestamp,
    a.client_id,
    a.type,
    a.channel,
    a.direction,
    a.summary,
    a.sentiment_label,
    a.urgency
  FROM activities a
  WHERE organization_id = 'your-org-id'
    AND timestamp > NOW() - INTERVAL '30 days'
  ORDER BY timestamp DESC
) TO '/tmp/activities_export.csv' WITH CSV HEADER;

-- Or use Supabase Dashboard → SQL Editor → Run query → Download CSV
```

### Q5: What happens if the AI service goes down?

**A:** Fallback mechanisms are in place:

```javascript
// In parse_ai_response nodes
try {
  analysis = JSON.parse(aiResponse);
} catch (error) {
  // Fallback to safe defaults
  analysis = {
    sentiment: 0,
    sentiment_label: 'neutral',
    intent: 'unknown',
    topics: [],
    urgency: 3,
    summary: contentSubstring
  };
  // Activity still gets stored, just without AI enrichment
  // Mark for reprocessing later
  markForReprocessing(activityId);
}
```

### Q6: How do I add custom activity types?

**A:** Update the validation and database:

```sql
-- 1. Update database comment
COMMENT ON COLUMN activities.type IS 'Valid types: email, phone, sms, meeting, web_visit, property_view, social_message, form_submission, chat_message, showing, open_house, contract_signed';

-- 2. Update workflow validation
const validTypes = [
  'email', 'phone', 'sms', 'meeting', 'web_visit', 
  'property_view', 'social_message', 'form_submission', 
  'chat_message',
  'showing',        // NEW
  'open_house',     // NEW  
  'contract_signed' // NEW
];
```

### Q7: Can I integrate with external CRM systems?

**A:** Yes! Add sync workflows:

```javascript
// Example: Sync to Salesforce
// Create new workflow: crm-sync-salesforce-v1

// 1. Listen for new activities
// Trigger: Supabase Database Trigger on 'activities' table

// 2. Transform to Salesforce format
const sfActivity = {
  Subject: activity.summary,
  ActivityDate: activity.timestamp,
  Type: mapActivityType(activity.type),
  WhoId: activity.client_id,
  // ... other Salesforce fields
};

// 3. Create in Salesforce
await salesforce.create('Task', sfActivity);
```

### Q8: How do I handle GDPR data deletion requests?

**A:** Create a data deletion workflow:

```sql
-- Function to delete all client data
CREATE OR REPLACE FUNCTION delete_client_data(
  p_client_id UUID,
  p_organization_id UUID
) RETURNS void AS $$
BEGIN
  -- Delete from all tables
  DELETE FROM activities WHERE client_id = p_client_id AND organization_id = p_organization_id;
  DELETE FROM client_insights WHERE client_id = p_client_id AND organization_id = p_organization_id;
  DELETE FROM opportunities WHERE client_id = p_client_id AND organization_id = p_organization_id;
  DELETE FROM behavioral_patterns WHERE client_id = p_client_id AND organization_id = p_organization_id;
  
  -- Log deletion for audit
  INSERT INTO audit_log (
    organization_id,
    action,
    resource_type,
    resource_id
  ) VALUES (
    p_organization_id,
    'gdpr_deletion',
    'client',
    p_client_id
  );
END;
$$ LANGUAGE plpgsql;

-- Execute deletion
SELECT delete_client_data(
  '223e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000'
);
```

### Q9: What's the cost of running this system?

**A:** Approximate monthly costs:

```
Supabase (Pro): $25/month
N8n Cloud (Starter): $20/month  
Google Gemini API: ~$10/month (10K activities)
----------------------------------------
Total: ~$55/month for small deployment

For 100K+ activities/month:
- Supabase (Pro): $25-100/month
- N8n Cloud (Pro): $50/month
- Gemini API: ~$50-100/month
----------------------------------------
Total: ~$125-250/month for enterprise scale
```

### Q10: How do I backup my data?

**A:** Use Supabase's built-in backups + custom exports:

```bash
# Supabase automatic backups (included in Pro plan)
# Restore via Dashboard → Database → Backups

# Manual backup script
pg_dump "postgresql://postgres:password@db.project.supabase.co:5432/postgres" \
  --table=activities \
  --table=client_insights \
  --table=opportunities \
  --table=behavioral_patterns \
  > backup_$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://postgres:password@db.project.supabase.co:5432/postgres" \
  < backup_20251011.sql
```

---

## 🆘 Getting Additional Help

### 1. Check Logs
```
N8n → Executions → [Click on failed execution] → View details
Supabase → Logs → Postgres Logs
```

### 2. Enable Debug Mode
```javascript
// Add to workflow function nodes
console.log('DEBUG: Input data:', JSON.stringify($input.item.json, null, 2));
console.log('DEBUG: Processing step X');
// Check execution log for output
```

### 3. Test in Isolation
```
1. Deactivate all workflows
2. Activate one workflow at a time
3. Test with sample data
4. Monitor for errors
5. Move to next workflow
```

### 4. Community Resources
- **N8n Community Forum:** https://community.n8n.io
- **Supabase Discord:** https://discord.supabase.com
- **Stack Overflow:** Tag questions with `n8n` and `supabase`

---

## ✅ System Health Checklist

Run this checklist weekly:

```sql
-- 1. Check workflow success rate
SELECT * FROM v_workflow_health;
-- Target: >95% success rate

-- 2. Check processing lag
SELECT 
  COUNT(*) FILTER (WHERE processed = false) as unprocessed,
  ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60), 1) as avg_age_minutes
FROM activities
WHERE created_at > NOW() - INTERVAL '1 hour';
-- Target: <10 unprocessed, <5 minutes age

-- 3. Check engagement scores freshness
SELECT 
  COUNT(*) FILTER (WHERE last_analyzed_at < NOW() - INTERVAL '24 hours') as stale_count
FROM client_insights;
-- Target: <5% stale

-- 4. Check database size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
-- Monitor growth trends

-- 5. Check AI accuracy
SELECT 
  ROUND(100.0 * COUNT(*) FILTER (WHERE processed = true AND processing_error IS NULL) / COUNT(*), 2) as success_rate
FROM activities
WHERE created_at > NOW() - INTERVAL '7 days';
-- Target: >90% success rate
```

---

**Still stuck? Document your issue with:**
1. Error message (full text)
2. Workflow name
3. Input payload (sanitized)
4. Execution ID
5. What you've tried so far

Then post in the N8n community forum or create a GitHub issue. The community is very responsive! 🚀