# 🚀 Campaign ROI Tracker - Complete Deployment Guide

## 📦 Package Contents

### Workflows Delivered
1. ✅ **campaign-touchpoint-capture-v1** - Real-time touchpoint tracking
2. ✅ **campaign-metrics-sync-v1** - Scheduled metrics aggregation
3. ✅ **campaign-attribution-engine-v1** - Multi-touch attribution (6 models)
4. ✅ **campaign-dashboard-api-v1** - High-performance dashboard API
5. ✅ **campaign-budget-optimizer-v1** - ML-powered budget recommendations

### Database Schema
- Complete SQL schema with RLS policies
- 10 core tables with proper indexes
- Helper functions for common operations
- Version tracking system

---

## 🛠️ Installation Steps

### Step 1: Database Setup

```sql
-- Run the complete schema from the "Campaign ROI Tracker - Database Schema" artifact
-- This creates all tables, indexes, RLS policies, and helper functions

-- Verify installation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'campaign%';

-- Expected output: 10 tables
-- campaigns
-- campaign_touchpoints
-- campaign_conversions
-- campaign_attribution
-- campaign_metrics
-- campaign_predictions
-- campaign_recommendations
-- workflow_executions
```

### Step 2: Environment Variables

Configure these in your N8n instance (Settings → Environment Variables):

```bash
# Supabase (REQUIRED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Ads API (Optional - for metrics sync)
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890

# Facebook Marketing API (Optional - for metrics sync)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_ACCESS_TOKEN=your-long-lived-token
FACEBOOK_AD_ACCOUNT_ID=act_1234567890

# Google Analytics 4 (Optional - for web analytics)
GA4_PROPERTY_ID=123456789
GA4_CREDENTIALS={"type":"service_account",...}
```

### Step 3: N8n Credentials Setup

1. **Supabase Credentials**
   - Go to N8n → Credentials → Add Credential
   - Select "Supabase API"
   - Name: `Supabase Account`
   - Host: Your Supabase URL
   - Service Role Secret: Your service role key

2. **Google Ads** (if using)
   - Type: OAuth2 API
   - Grant Type: Authorization Code
   - Authorization URL: `https://accounts.google.com/o/oauth2/auth`
   - Access Token URL: `https://oauth2.googleapis.com/token`
   - Scopes: `https://www.googleapis.com/auth/adwords`

3. **Facebook Marketing** (if using)
   - Type: OAuth2 API
   - Authorization URL: `https://www.facebook.com/v18.0/dialog/oauth`
   - Access Token URL: `https://graph.facebook.com/v18.0/oauth/access_token`
   - Scopes: `ads_read,ads_management`

### Step 4: Import Workflows

For each workflow JSON artifact:

1. Copy the entire JSON content
2. In N8n, click "+ Add workflow"
3. Click the three dots menu → "Import from File"
4. Paste JSON content
5. Click "Import"
6. **IMPORTANT**: Update any credential references to match your configured credentials
7. Save the workflow

**Import Order** (important for dependencies):
1. campaign-touchpoint-capture-v1
2. campaign-metrics-sync-v1
3. campaign-attribution-engine-v1
4. campaign-dashboard-api-v1
5. campaign-budget-optimizer-v1

### Step 5: Activate Workflows

Start with core infrastructure:
1. Activate "campaign-touchpoint-capture-v1"
2. Activate "campaign-metrics-sync-v1" (verify it runs successfully first)
3. Activate "campaign-attribution-engine-v1" (after some conversions exist)

Then advanced features:
4. Activate "campaign-dashboard-api-v1"
5. Activate "campaign-budget-optimizer-v1"

---

## 🧪 Testing Procedures

### Test 1: Touchpoint Capture (Critical)

```bash
# Get webhook URL from N8n workflow
WEBHOOK_URL="https://your-instance.app.n8n.cloud/webhook/campaign-touchpoint"

# Test 1: Valid touchpoint
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "campaign_id": "123e4567-e89b-12d3-a456-426614174001",
    "lead_id": "123e4567-e89b-12d3-a456-426614174002",
    "channel": "google_ads",
    "touchpoint_type": "click",
    "content_type": "ad",
    "engagement_score": 25,
    "device_type": "desktop",
    "location_country": "US",
    "session_id": "sess_abc123",
    "cost": 2.50
  }'

# Expected response:
# {
#   "success": true,
#   "touchpoint_id": "uuid",
#   "engagement_score": 25,
#   "timestamp": "2025-10-11T..."
# }

# Test 2: Missing required field (should fail gracefully)
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "touchpoint_type": "click"
  }'

# Expected response:
# {
#   "success": false,
#   "error": "Missing required fields: channel",
#   "error_code": 400
# }

# Test 3: Invalid organization_id format
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "invalid-uuid",
    "channel": "facebook",
    "touchpoint_type": "impression"
  }'

# Expected response:
# {
#   "success": false,
#   "error": "Invalid organization_id format",
#   "error_code": 400
# }
```

**Verification:**
```sql
-- Check if touchpoint was stored
SELECT * FROM campaign_touchpoints 
WHERE organization_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 2: Dashboard API

```bash
DASHBOARD_URL="https://your-instance.app.n8n.cloud/webhook/campaign-dashboard"

# Test with date range
curl -X POST $DASHBOARD_URL \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "metrics": ["roi", "spend", "revenue", "conversions"],
    "include_attribution": true
  }'

# Expected response structure:
# {
#   "success": true,
#   "data": {
#     "summary": {
#       "total_campaigns": 5,
#       "total_spend": 12500.00,
#       "total_revenue": 45000.00,
#       "overall_roi": 2.6
#     },
#     "campaigns": [...],
#     "channel_performance": {...},
#     "trends": {...}
#   },
#   "metadata": {
#     "query_time_ms": 145,
#     "timestamp": "..."
#   }
# }
```

### Test 3: Create Sample Campaign Data

```sql
-- Insert test organization (if not exists)
INSERT INTO organizations (id, name, tier, created_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Real Estate Co',
  'enterprise',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert test campaign
INSERT INTO campaigns (
  id, organization_id, name, platform, status, budget, spend, revenue, roi
) VALUES (
  '123e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  'Q1 Google Ads - Luxury Listings',
  'google_ads',
  'active',
  5000.00,
  3200.00,
  9800.00,
  2.06
);

-- Insert test lead
INSERT INTO leads (
  id, organization_id, email, name, status, source
) VALUES (
  '123e4567-e89b-12d3-a456-426614174002',
  '123e4567-e89b-12d3-a456-426614174000',
  'test.buyer@example.com',
  'John Test Buyer',
  'qualified',
  'google_ads'
);

-- Insert test metrics
INSERT INTO campaign_metrics (
  organization_id, campaign_id, date,
  impressions, clicks, spend, conversions, revenue, roi
) VALUES
  ('123e4567-e89b-12d3-a456-426614174000',
   '123e4567-e89b-12d3-a456-426614174001',
   CURRENT_DATE - INTERVAL '1 day',
   1500, 75, 150.00, 3, 450.00, 2.0),
  ('123e4567-e89b-12d3-a456-426614174000',
   '123e4567-e89b-12d3-a456-426614174001',
   CURRENT_DATE - INTERVAL '2 days',
   1800, 90, 180.00, 4, 560.00, 2.11);

-- Verify test data
SELECT 
  c.name,
  COUNT(m.id) as metric_days,
  SUM(m.spend) as total_spend,
  SUM(m.revenue) as total_revenue
FROM campaigns c
LEFT JOIN campaign_metrics m ON m.campaign_id = c.id
WHERE c.organization_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY c.name;
```

### Test 4: Attribution Engine

```sql
-- Insert test conversion
INSERT INTO campaign_conversions (
  organization_id, campaign_id, lead_id,
  conversion_type, conversion_value, timestamp
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174002',
  'closing',
  15000.00,
  NOW()
);

-- Manually trigger attribution workflow or wait for schedule

-- Verify attribution was calculated
SELECT 
  attribution_model,
  attribution_value,
  confidence_score,
  journey_length
FROM campaign_attribution
WHERE conversion_id = (
  SELECT id FROM campaign_conversions 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Should return 7 rows (6 models + ensemble)
```

---

## 📊 Performance Monitoring

### Key Metrics to Track

```sql
-- 1. Workflow execution success rate
SELECT 
  workflow_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'error') as failed,
  ROUND(COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*) * 100, 2) as success_rate,
  AVG(duration_ms) as avg_duration_ms
FROM workflow_executions
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY workflow_name
ORDER BY total_executions DESC;

-- 2. Touchpoint capture volume
SELECT 
  DATE(timestamp) as date,
  channel,
  COUNT(*) as touchpoints,
  AVG(engagement_score) as avg_engagement
FROM campaign_touchpoints
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), channel
ORDER BY date DESC, touchpoints DESC;

-- 3. Attribution accuracy (compare models)
SELECT 
  attribution_model,
  COUNT(*) as conversions_attributed,
  AVG(confidence_score) as avg_confidence,
  AVG(journey_length) as avg_journey_length
FROM campaign_attribution
WHERE calculated_at > NOW() - INTERVAL '30 days'
GROUP BY attribution_model
ORDER BY avg_confidence DESC;

-- 4. Budget optimization impact
SELECT 
  r.recommendation_type,
  r.priority,
  COUNT(*) as total_recommendations,
  COUNT(*) FILTER (WHERE r.status = 'implemented') as implemented,
  AVG((r.actual_impact->>'roi_improvement')::numeric) as avg_roi_improvement
FROM campaign_recommendations r
WHERE r.created_at > NOW() - INTERVAL '30 days'
GROUP BY r.recommendation_type, r.priority
ORDER BY total_recommendations DESC;
```

### Create Monitoring Dashboard

```sql
-- View: Real-time system health
CREATE OR REPLACE VIEW v_system_health AS
SELECT 
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM campaign_touchpoints WHERE timestamp > NOW() - INTERVAL '1 hour') as touchpoints_last_hour,
  (SELECT COUNT(*) FROM workflow_executions WHERE status = 'error' AND started_at > NOW() - INTERVAL '1 hour') as errors_last_hour,
  (SELECT AVG(duration_ms) FROM workflow_executions WHERE started_at > NOW() - INTERVAL '1 hour') as avg_execution_time_ms,
  (SELECT COUNT(*) FROM campaign_conversions WHERE timestamp > NOW() - INTERVAL '24 hours') as conversions_last_24h;

-- Query it
SELECT * FROM v_system_health;
```

---

## 🔧 Troubleshooting

### Issue 1: Touchpoint Webhook Returns 500 Error

**Symptoms**: POST to webhook fails with internal server error

**Diagnosis**:
```sql
-- Check workflow execution logs
SELECT *
FROM workflow_executions
WHERE workflow_name = 'campaign-touchpoint-capture-v1'
AND status = 'error'
ORDER BY started_at DESC
LIMIT 5;
```

**Common Causes**:
1. Invalid organization_id (doesn't exist in database)
2. Database connection timeout
3. Missing Supabase credentials in N8n

**Solutions**:
- Verify organization exists: `SELECT * FROM organizations WHERE id = 'your-org-id'`
- Check N8n logs for detailed error messages
- Verify Supabase credentials are correctly configured

### Issue 2: Attribution Engine Not Running

**Symptoms**: No records in campaign_attribution table

**Diagnosis**:
```sql
-- Check if conversions exist
SELECT COUNT(*) FROM campaign_conversions;

-- Check if touchpoints exist for leads with conversions
SELECT 
  cc.lead_id,
  cc.conversion_type,
  COUNT(ct.id) as touchpoint_count
FROM campaign_conversions cc
LEFT JOIN campaign_touchpoints ct ON ct.lead_id = cc.lead_id
GROUP BY cc.lead_id, cc.conversion_type;
```

**Common Causes**:
1. No conversions in database yet
2. No touchpoints associated with converted leads
3. Workflow not activated
4. RPC function `get_lead_journey` not created

**Solutions**:
```sql
-- Create the RPC function if missing
CREATE OR REPLACE FUNCTION get_lead_journey(
  p_lead_id UUID,
  p_end_timestamp TIMESTAMPTZ
)
RETURNS TABLE (touchpoints JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'channel', channel,
      'touchpoint_type', touchpoint_type,
      'engagement_score', engagement_score,
      'timestamp', timestamp
    ) ORDER BY timestamp ASC
  )
  FROM campaign_touchpoints
  WHERE lead_id = p_lead_id
    AND timestamp <= p_end_timestamp;
END;
$$ LANGUAGE plpgsql;
```

### Issue 3: Dashboard API Slow (>2 seconds)

**Symptoms**: Dashboard queries take too long

**Diagnosis**:
```sql
-- Check missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename LIKE 'campaign%'
ORDER BY tablename, attname;
```

**Solutions**:
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_org_date 
ON campaign_metrics(organization_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_touchpoints_lead_timestamp
ON campaign_touchpoints(lead_id, timestamp);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attribution_campaign
ON campaign_attribution(campaign_id, attribution_model);

-- Analyze tables
ANALYZE campaigns;
ANALYZE campaign_metrics;
ANALYZE campaign_touchpoints;
ANALYZE campaign_attribution;
```

---

## 🔗 Frontend Integration Examples

### Next.js 15 Integration

```typescript
// app/actions/campaigns.ts
'use server'

export async function fetchCampaignDashboard(
  organizationId: string,
  dateRange: { start: string; end: string }
) {
  const response = await fetch(
    process.env.N8N_WEBHOOK_BASE_URL + '/campaign-dashboard',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: organizationId,
        date_range: dateRange,
        metrics: ['roi', 'spend', 'revenue', 'conversions'],
        include_attribution: true
      }),
      next: { revalidate: 300 } // Cache for 5 minutes
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return response.json();
}

export async function trackTouchpoint(touchpoint: {
  organizationId: string;
  campaignId?: string;
  leadId?: string;
  channel: string;
  touchpointType: string;
  [key: string]: any;
}) {
  const response = await fetch(
    process.env.N8N_WEBHOOK_BASE_URL + '/campaign-touchpoint',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: touchpoint.organizationId,
        campaign_id: touchpoint.campaignId,
        lead_id: touchpoint.leadId,
        channel: touchpoint.channel,
        touchpoint_type: touchpoint.touchpointType,
        device_type: touchpoint.deviceType || 'unknown',
        timestamp: new Date().toISOString(),
        ...touchpoint
      })
    }
  );

  return response.json();
}
```

### React Component Example

```tsx
// components/CampaignDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { fetchCampaignDashboard } from '@/app/actions/campaigns'

export function CampaignDashboard({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const result = await fetchCampaignDashboard(organizationId, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      })
      setData(result.data)
      setLoading(false)
    }
    loadData()
  }, [organizationId])

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="Total Spend"
          value={`$${data.summary.total_spend.toLocaleString()}`}
        />
        <StatCard 
          title="Total Revenue"
          value={`$${data.summary.total_revenue.toLocaleString()}`}
        />
        <StatCard 
          title="ROI"
          value={`${data.summary.overall_roi}x`}
          trend={data.trends.roi_trend}
        />
        <StatCard 
          title="Conversions"
          value={data.summary.total_conversions}
        />
      </div>

      <CampaignTable campaigns={data.campaigns} />
      <ChannelPerformanceChart data={data.channel_performance} />
    </div>
  )
}
```

### Tracking Pixel for Website

```html
<!-- Add to website <head> -->
<script>
(function() {
  window.campaignTracker = {
    track: function(touchpointType, additionalData = {}) {
      // Get URL parameters for campaign tracking
      const params = new URLSearchParams(window.location.search);
      const campaignId = params.get('campaign_id') || localStorage.getItem('campaign_id');
      const leadId = localStorage.getItem('lead_id');

      // Determine channel from UTM parameters
      const utmSource = params.get('utm_source');
      const utmMedium = params.get('utm_medium');
      const channel = utmSource || document.referrer.includes('google') ? 'google_ads' 
        : document.referrer.includes('facebook') ? 'facebook' 
        : 'direct';

      // Save campaign_id for future tracking
      if (campaignId) {
        localStorage.setItem('campaign_id', campaignId);
      }

      // Send touchpoint
      fetch('https://your-instance.app.n8n.cloud/webhook/campaign-touchpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: 'YOUR_ORG_ID',
          campaign_id: campaignId,
          lead_id: leadId,
          channel: channel,
          touchpoint_type: touchpointType,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          referrer_url: document.referrer,
          landing_url: window.location.href,
          session_id: sessionStorage.getItem('session_id') || Math.random().toString(36),
          timestamp: new Date().toISOString(),
          ...additionalData
        })
      }).catch(console.error);
    }
  };

  // Auto-track page view
  window.campaignTracker.track('page_view', {
    page_title: document.title,
    time_spent_seconds: 0
  });

  // Track time on page
  let startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    if (timeSpent > 5) { // Only track if more than 5 seconds
      window.campaignTracker.track('page_exit', {
        time_spent_seconds: timeSpent
      });
    }
  });
})();
</script>

<!-- Example: Track form view -->
<form id="contact-form">
  <script>
    document.getElementById('contact-form').addEventListener('focus', function() {
      window.campaignTracker.track('form_view', {
        form_name: 'contact-form'
      });
    }, { once: true });
  </script>
</form>
```

---

## 📈 Success Metrics & KPIs

Track these metrics to measure system success:

### System Performance
- ✅ Touchpoint capture: <500ms P95 response time
- ✅ Attribution calculation: <2s per conversion
- ✅ Dashboard API: <500ms P95 response time
- ✅ Error rate: <1% across all workflows
- ✅ Uptime: >99.9%

### Business Impact
- ✅ Attribution accuracy: >95% validated accuracy
- ✅ Budget optimization: 3x ROI improvement target
- ✅ Data coverage: >98% touchpoint tracking
- ✅ Recommendation adoption: >75% implementation rate

### Data Quality
- ✅ Complete customer journeys: >90% of conversions
- ✅ Attribution confidence: >0.85 average score
- ✅ Cross-platform matching: >90% accuracy

---

## 🎓 Training & Documentation

### For Marketing Teams

**Dashboard Usage**:
1. Access dashboard at `/campaigns/dashboard`
2. Filter by date range to analyze periods
3. Sort campaigns by ROI to identify top performers
4. Review channel performance breakdown
5. Check attribution models for budget insights

**Understanding Attribution**:
- **First Touch**: Credit to initial interaction (good for awareness)
- **Last Touch**: Credit to final touchpoint (good for direct response)
- **Ensemble**: Weighted combination (recommended for accuracy)

### For Developers

**API Endpoints**:
```
POST /webhook/campaign-touchpoint    - Track touchpoints
POST /webhook/campaign-dashboard     - Get dashboard data
```

**Database Schema**: See artifact "Campaign ROI Tracker - Database Schema"

**Extending the System**:
1. Add new attribution models in attribution-engine workflow
2. Create custom metrics in metrics-sync workflow
3. Add platform integrations via HTTP Request nodes

---

## 🔒 Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key stored securely in environment variables
- [ ] Webhook endpoints use HTTPS only
- [ ] API rate limiting configured (if applicable)
- [ ] Database backups scheduled daily
- [ ] Audit logs enabled for sensitive operations
- [ ] Organization isolation tested and verified

---

## 📞 Support & Maintenance

### Monthly Tasks
- Review attribution model accuracy
- Optimize database queries and indexes
- Update prediction models with new data
- Review and archive old workflow executions

### Quarterly Tasks
- Validate ROI calculations against accounting records
- Retrain ML models with historical data
- Review and update business rules
- Performance optimization review

### Annual Tasks
- Major version upgrades
- Comprehensive security audit
- Data retention policy review
- System architecture evaluation

---

## ✅ Deployment Checklist

Final checklist before going live:

- [ ] Database schema installed and verified
- [ ] All 5 workflows imported successfully
- [ ] Environment variables configured
- [ ] Credentials created and linked
- [ ] Test campaigns created
- [ ] Touchpoint capture tested (3 tests passed)
- [ ] Dashboard API tested
- [ ] Attribution engine tested
- [ ] Frontend integration implemented
- [ ] Tracking pixels deployed
- [ ] Monitoring dashboard created
- [ ] Team trained on dashboard usage
- [ ] Documentation distributed
- [ ] Backup and recovery tested
- [ ] Go-live date scheduled
- [ ] Post-launch monitoring plan in place

**Congratulations! Your Campaign ROI Tracker is ready for production! 🎉**