# 🚀 CRM Activity Feed AI System - Deployment Guide

## ✅ Implementation Status

**COMPLETED:**
- ✅ Database schema created (6 tables + RLS policies)
- ✅ Workflow 1: `activity-stream-aggregator-v1` (ID: 1WCJNRVJ9ZMecuot)
- ✅ Workflow 2: `activity-feed-api-v1` (ID: YOm1FalAEgcYkqTN)
- ✅ Workflow 3: `behavioral-pattern-analyzer-v1` (ID: RBsxcbb7aV0eG4h9)
- ✅ Workflow 4: `opportunity-detector-v1` (ID: h2Rd4VpJ7Oh5vpIX)
- ✅ Workflow 5: `engagement-score-updater-v1` (ID: N2GYc3h7hpMUcNgF)
- ✅ Workflow 6: `activity-analytics-pipeline-v1` (ID: BdVvBk9ihddIbj3a)

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup
```bash
# Run the SQL schema in Supabase SQL Editor
# Already provided in the first artifact: "Supabase Database Schema - CRM Activity Feed"
```

**Verify tables created:**
- [ ] activities
- [ ] client_insights
- [ ] opportunities
- [ ] behavioral_patterns
- [ ] workflow_executions
- [ ] activity_metrics

### 2. N8n Credentials Configuration

Go to N8n → Settings → Credentials and add:

**Required Credentials:**

1. **Supabase** (use service_role key, NOT anon key)
   - URL: `https://your-project.supabase.co`
   - Service Role Key: `eyJhbGc...` (from Supabase Settings → API)

2. **PostgreSQL** (for direct queries)
   - Host: `db.your-project.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: Your Supabase database password
   - SSL: Enabled (required)

3. **Google Gemini API**
   - Go to: https://aistudio.google.com/app/apikey
   - Create API key
   - Add to N8n credentials

4. **Email SMTP** (for alerts)
   - SMTP Host: Your email provider
   - Port: 587 (TLS) or 465 (SSL)
   - Username: Your email
   - Password: App password

---

## 🔧 Configuration Steps

### Step 1: Configure Database Credentials

In **each workflow**, update the Supabase and Postgres nodes with your credentials:

```
1. Open workflow in N8n
2. Click on Supabase nodes
3. Select your Supabase credential from dropdown
4. Click on Postgres nodes  
5. Select your Postgres credential from dropdown
6. Save workflow
```

### Step 2: Test Database Connection

Run this in Supabase SQL Editor:
```sql
-- Test query to verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'activities', 
  'client_insights', 
  'opportunities', 
  'behavioral_patterns', 
  'workflow_executions', 
  'activity_metrics'
);

-- Should return 6 rows
```

### Step 3: Insert Test Organization

```sql
-- Create test organization
INSERT INTO organizations (id, name, tier, settings) 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Organization',
  'professional',
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- Create test user
INSERT INTO users (id, email, full_name)
VALUES (
  '223e4567-e89b-12d3-a456-426614174001',
  'test@strivetec.com',
  'Test User'
) ON CONFLICT (id) DO NOTHING;

-- Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role, permissions)
VALUES (
  '223e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  'admin',
  '["read", "write", "admin"]'
) ON CONFLICT DO NOTHING;
```

---

## 🧪 Testing Procedures

### Test 1: Activity Stream Aggregator

**Endpoint:** `POST https://your-n8n-instance.app.n8n.cloud/webhook/activity-stream`

**Test Payload:**
```json
{
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "client_id": "323e4567-e89b-12d3-a456-426614174002",
  "type": "email",
  "channel": "email",
  "direction": "inbound",
  "content": "Hi, I'm very interested in properties in the downtown area. My budget is around $500,000. I'm looking to move in about 3 months. Can you help me find something?",
  "agent_id": "423e4567-e89b-12d3-a456-426614174003",
  "metadata": {
    "email_subject": "Property Inquiry - Downtown",
    "email_from": "client@example.com"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "activity_id": "UUID",
  "message": "Activity processed and stored successfully",
  "insights": {
    "sentiment": "positive",
    "urgency": 4,
    "intent": "property_search"
  }
}
```

**Verify in Database:**
```sql
SELECT * FROM activities 
WHERE client_id = '323e4567-e89b-12d3-a456-426614174002'
ORDER BY created_at DESC LIMIT 1;

-- Check that sentiment, intent, and topics were populated by AI
```

### Test 2: Activity Feed API

**Endpoint:** `POST https://your-n8n-instance.app.n8n.cloud/webhook/activity-feed`

**Test Payload:**
```json
{
  "organization_id": "123e4567-e89b-12d3-a456-426614174000",
  "client_id": "323e4567-e89b-12d3-a456-426614174002",
  "limit": 50
}
```

**Expected Response (200 OK):**
```json
{
  "client": {
    "client_id": "323e4567-e89b-12d3-a456-426614174002",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "engagement_score": 75,
    "relationship_stage": "active",
    "churn_risk": "low",
    "lifetime_value": 0
  },
  "activities": [
    {
      "id": "UUID",
      "timestamp": "2025-10-11T03:00:00Z",
      "type": "email",
      "channel": "email",
      "direction": "inbound",
      "summary": "Client inquiring about downtown properties...",
      "sentiment": "positive",
      "urgency": 4,
      "intent": "property_search",
      "topics": ["downtown", "budget", "timeline"]
    }
  ],
  "insights": {
    "engagement_score": 75,
    "relationship_strength": 7.5,
    "stage": "active",
    "churn_risk": "low",
    "opportunity_score": 85,
    "preferred_channel": "email",
    "best_contact_time": "10:00:00",
    "interests": [],
    "behavioral_profile": {}
  },
  "recommendations": [
    {
      "action": "Send curated property list matching criteria",
      "priority": "high",
      "confidence": 0.85,
      "expectedOutcome": "Client engagement and property viewings",
      "suggestedChannel": "email",
      "rationale": "High urgency inquiry with specific criteria"
    }
  ],
  "opportunities": [],
  "metadata": {
    "generated_at": "2025-10-11T03:15:00Z",
    "activity_count": 1,
    "opportunity_count": 0,
    "pattern_count": 0,
    "response_time_ms": 850
  }
}
```

### Test 3: Behavioral Pattern Analyzer (Manual Trigger)

Since this runs every 6 hours, you can manually trigger it:

1. Go to N8n → Workflows → `behavioral-pattern-analyzer-v1`
2. Click "Execute Workflow" button
3. Check execution log for success
4. Verify patterns created:

```sql
SELECT * FROM behavioral_patterns 
WHERE client_id = '323e4567-e89b-12d3-a456-426614174002'
ORDER BY created_at DESC;
```

### Test 4: Opportunity Detector (Auto-triggered)

This is automatically triggered by Test 1. Check if opportunities were created:

```sql
SELECT * FROM opportunities 
WHERE client_id = '323e4567-e89b-12d3-a456-426614174002'
ORDER BY created_at DESC;
```

### Test 5: Engagement Score Updater (Manual Trigger)

1. Go to N8n → Workflows → `engagement-score-updater-v1`
2. Click "Execute Workflow"
3. Verify scores updated:

```sql
SELECT 
  client_id,
  engagement_score,
  relationship_strength,
  churn_risk,
  stage,
  last_analyzed_at
FROM client_insights 
WHERE client_id = '323e4567-e89b-12d3-a456-426614174002';
```

### Test 6: Analytics Pipeline (Manual Trigger)

1. Go to N8n → Workflows → `activity-analytics-pipeline-v1`
2. Click "Execute Workflow"
3. Verify metrics created:

```sql
SELECT * FROM activity_metrics 
WHERE organization_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY metric_date DESC;
```

---

## ⚡ Activation Order

Activate workflows in this specific order:

```bash
1. activity-stream-aggregator-v1 (Foundation - must be first)
2. opportunity-detector-v1 (Triggered by #1)
3. behavioral-pattern-analyzer-v1 (Scheduled - runs independently)
4. activity-feed-api-v1 (API endpoint - can be activated anytime)
5. engagement-score-updater-v1 (Scheduled - runs independently)
6. activity-analytics-pipeline-v1 (Scheduled - runs independently)
```

To activate:
1. Go to N8n → Workflows
2. Click on workflow name
3. Toggle "Active" switch to ON
4. Verify webhook URLs are generated

---

## 🔗 Webhook URLs

After activation, get your webhook URLs:

1. **Activity Stream Aggregator:**
   `https://your-n8n.app.n8n.cloud/webhook/activity-stream`

2. **Activity Feed API:**
   `https://your-n8n.app.n8n.cloud/webhook/activity-feed`

3. **Opportunity Detector** (internal only):
   `https://your-n8n.app.n8n.cloud/webhook/opportunity-detector`

Save these URLs for your Next.js frontend integration.

---

## 🏗️ Frontend Integration

### Next.js API Route Example

Create `/app/api/activity/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to N8n workflow
    const response = await fetch(`${N8N_BASE_URL}/webhook/activity-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: body.organizationId,
        client_id: body.clientId,
        type: body.type,
        channel: body.channel,
        direction: body.direction,
        content: body.content,
        agent_id: body.agentId,
        metadata: body.metadata
      })
    });
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Activity creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

export function useActivityFeed(clientId: string, organizationId: string) {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activity-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, organizationId, limit: 100 })
      });
      const data = await response.json();
      setFeed(data);
    } catch (error) {
      console.error('Failed to fetch activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { feed, loading, fetchFeed };
}
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

1. **Execution Success Rate**
   ```sql
   SELECT 
     workflow_name,
     COUNT(*) as total_executions,
     SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
     ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
   FROM workflow_executions
   WHERE started_at > NOW() - INTERVAL '24 hours'
   GROUP BY workflow_name;
   ```

2. **Average Response Times**
   ```sql
   SELECT 
     workflow_name,
     ROUND(AVG(duration_ms), 2) as avg_duration_ms,
     ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 2) as p95_duration_ms
   FROM workflow_executions
   WHERE started_at > NOW() - INTERVAL '24 hours'
   AND status = 'completed'
   GROUP BY workflow_name;
   ```

3. **Error Rate**
   ```sql
   SELECT 
     workflow_name,
     error_type,
     COUNT(*) as error_count
   FROM workflow_executions
   WHERE status = 'failed'
   AND started_at > NOW() - INTERVAL '24 hours'
   GROUP BY workflow_name, error_type
   ORDER BY error_count DESC;
   ```

### Set Up Alerts

Create alerts for:
- ❌ Workflow failure rate > 5%
- ⏱️ Response time > 5000ms (P95)
- 🚨 Critical errors in production
- 📉 Engagement score drop > 20% day-over-day

---

## 🐛 Troubleshooting

### Issue: "Missing required fields" error

**Cause:** Invalid input payload
**Solution:** Ensure all required fields are present:
- organization_id
- client_id
- type
- channel
- direction
- content

### Issue: Gemini API errors

**Cause:** API key not configured or rate limit exceeded
**Solution:** 
1. Verify Gemini API key in N8n credentials
2. Check quota at https://aistudio.google.com/
3. Implement retry logic for rate limits

### Issue: Database connection failures

**Cause:** Incorrect Supabase credentials or RLS policies blocking access
**Solution:**
1. Use service_role key (not anon key)
2. Verify RLS policies allow workflow access
3. Check Supabase logs for specific errors

### Issue: Workflows not triggering

**Cause:** Workflows not activated or webhook URLs incorrect
**Solution:**
1. Verify workflows are ACTIVE (green toggle)
2. Check webhook URLs are correct
3. Test with cURL to isolate issue

---

## 🎯 Success Criteria

✅ **System is working correctly when:**

1. Activities are processed in < 2 seconds (P95)
2. Sentiment analysis accuracy > 80%
3. Pattern detection running every 6 hours
4. Engagement scores updating hourly
5. Opportunity detection rate > 15% of activities
6. Error rate < 1%
7. Dashboard showing real-time metrics

---

## 📚 Additional Resources

- **N8n Documentation:** https://docs.n8n.io
- **Supabase Documentation:** https://supabase.com/docs
- **Google Gemini API:** https://ai.google.dev/docs

---

## 🎉 Next Steps

1. ✅ Run database schema
2. ✅ Configure credentials
3. ✅ Test each workflow
4. ✅ Activate workflows in order
5. ✅ Integrate with frontend
6. ✅ Set up monitoring
7. 🚀 **Go live!**

**Need help?** Check workflow execution logs in N8n for detailed error messages.

**Want to optimize?** Monitor performance metrics and adjust AI prompts or scoring algorithms based on real data.