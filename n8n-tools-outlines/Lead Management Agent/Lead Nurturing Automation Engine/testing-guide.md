# Lead Nurturing System - Complete Testing Guide

## Overview
This guide provides comprehensive test procedures for all 6 workflows in the Lead Nurturing Automation Engine.

---

## Prerequisites

### 1. Test Organization & Users
```sql
-- Create test organization
INSERT INTO organizations (id, name, tier, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Organization',
  'professional',
  '{"timezone": "America/Chicago"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create test user
INSERT INTO users (id, email, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'test@example.com',
  'Test Agent'
) ON CONFLICT (id) DO NOTHING;

-- Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role, permissions)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  '["all"]'::jsonb
) ON CONFLICT DO NOTHING;
```

### 2. Test Leads
```sql
-- Create test leads
INSERT INTO leads (id, organization_id, name, email, phone, lead_type, score, timeline, budget_min, budget_max, location_preferences, property_type_preferences, bedrooms_min, bathrooms_min, source, status)
VALUES 
(
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'John Buyer',
  'john.buyer@test.com',
  '555-0001',
  'buyer',
  65,
  '0-3 months',
  300000,
  500000,
  'Austin,Round Rock',
  'single_family,townhouse',
  3,
  2,
  'website',
  'active'
),
(
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'Sarah Seller',
  'sarah.seller@test.com',
  '555-0002',
  'seller',
  45,
  '3-6 months',
  NULL,
  NULL,
  'Austin',
  NULL,
  NULL,
  NULL,
  'referral',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Create preferences for test leads
INSERT INTO lead_preferences (organization_id, lead_id, email_subscribed, max_emails_per_week, timezone)
VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  true,
  3,
  'America/Chicago'
),
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000011',
  true,
  5,
  'America/Chicago'
)
ON CONFLICT (lead_id) DO NOTHING;
```

### 3. Test Campaign Structure
```sql
-- Create test campaign
INSERT INTO nurture_campaigns (
  id, organization_id, name, description, status, campaign_type, 
  target_audience, trigger_type, trigger_conditions, ab_test_enabled
)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'New Buyer Welcome Series',
  'Automated welcome series for new buyer leads',
  'active',
  'new_lead',
  '{"lead_types": ["buyer"], "score_min": 50}'::jsonb,
  'immediate',
  '{}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Create sequences
INSERT INTO campaign_sequences (id, campaign_id, organization_id, name, sequence_order, delay_value, delay_unit, send_time_preference)
VALUES 
(
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Welcome Email',
  1,
  0,
  'minutes',
  'optimal'
),
(
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Day 2 Follow-up',
  2,
  2,
  'days',
  'optimal'
),
(
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Property Recommendations',
  3,
  3,
  'days',
  'morning'
)
ON CONFLICT (id) DO NOTHING;

-- Create message templates
INSERT INTO campaign_messages (id, sequence_id, organization_id, name, variant, subject_line, preview_text, body_html, body_text, status)
VALUES 
-- Sequence 1, Variant A
(
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'Welcome Email - Variant A',
  'A',
  'Welcome to {{agent_name}}''s Home Search, {{first_name}}! 🏠',
  'Start your home search journey with us',
  '<html><body><h1>Welcome, {{name}}!</h1><p>I''m excited to help you find your perfect home in {{location}}.</p><p>Your budget: {{budget}}</p><p>Timeline: {{timeline}}</p><p>Let''s get started!</p><p>Best regards,<br>{{agent_name}}</p></body></html>',
  'Welcome, {{name}}! I''m excited to help you find your perfect home.',
  'active'
),
-- Sequence 1, Variant B
(
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'Welcome Email - Variant B',
  'B',
  '🎉 Your Home Search Journey Starts Now, {{first_name}}!',
  'Let''s find your dream home together',
  '<html><body><h1>Hi {{name}}!</h1><p>Ready to find an amazing home? I''m here to guide you every step of the way.</p><p>Searching in: {{location}}</p><p>Budget: {{budget}}</p><p>Cheers,<br>{{agent_name}}</p></body></html>',
  'Hi {{name}}! Ready to find an amazing home?',
  'active'
),
-- Sequence 2, Variant A
(
  '00000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000001',
  'Day 2 Follow-up',
  'A',
  'Quick check-in about your home search, {{first_name}}',
  'Have questions? I''m here to help',
  '<html><body><h2>Hi {{name}},</h2><p>Just checking in to see if you have any questions about your home search.</p><p>I''m here to help with:</p><ul><li>Understanding the buying process</li><li>Financing options</li><li>Neighborhood insights</li></ul><p>Reply anytime!</p><p>{{agent_name}}</p></body></html>',
  'Hi {{name}}, just checking in!',
  'active'
),
-- Sequence 3, Variant A (with property recommendations)
(
  '00000000-0000-0000-0000-000000000043',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000001',
  'Property Recommendations',
  'A',
  '🏡 {{property_count}} Perfect Homes for {{first_name}}',
  'Check out these handpicked properties',
  '<html><body><h1>Hi {{name}},</h1><p>I found some amazing properties that match your criteria!</p>{{property_recommendations}}<p>Want to schedule a viewing? Just reply to this email.</p><p>Best,<br>{{agent_name}}</p></body></html>',
  'Hi {{name}}, I found some properties for you!',
  'active'
)
ON CONFLICT (id) DO NOTHING;
```

### 4. Test Properties (Optional)
```sql
INSERT INTO properties (organization_id, mls_id, address, city, state, zip, price, bedrooms, bathrooms, square_feet, property_type, listing_status, description, photos_urls)
VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'MLS-001',
  '123 Main Street',
  'Austin',
  'TX',
  '78701',
  425000,
  3,
  2,
  1800,
  'single_family',
  'active',
  'Beautiful 3-bedroom home in a quiet neighborhood with modern updates.',
  '["https://via.placeholder.com/800x600?text=Home+Front", "https://via.placeholder.com/800x600?text=Kitchen"]'::jsonb
),
(
  '00000000-0000-0000-0000-000000000001',
  'MLS-002',
  '456 Oak Avenue',
  'Round Rock',
  'TX',
  '78664',
  385000,
  3,
  2.5,
  2100,
  'townhouse',
  'active',
  'Spacious townhouse with a great location near shopping and dining.',
  '["https://via.placeholder.com/800x600?text=Townhouse"]'::jsonb
)
ON CONFLICT DO NOTHING;
```

---

## Test Suite

### TEST 1: End-to-End Campaign Flow

**Objective:** Verify complete workflow from enrollment to email delivery

#### Step 1: Enroll Lead in Campaign
```bash
curl -X POST https://your-n8n-instance.com/webhook/nurture/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "00000000-0000-0000-0000-000000000001",
    "lead_id": "00000000-0000-0000-0000-000000000010",
    "trigger_type": "new_lead"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "enrollments_created": 1,
  "enrollment_ids": ["uuid"],
  "message": "Successfully enrolled lead in 1 campaign(s)"
}
```

**Verification Queries:**
```sql
-- Check enrollment created
SELECT * FROM lead_campaign_enrollments 
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: 1 row with status='active', next_send_at=NOW()

-- Check variant assigned
SELECT variant_assigned FROM lead_campaign_enrollments 
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: 'A' or 'B' (50/50 split)
```

#### Step 2: Wait for Scheduler (or trigger manually)
Wait 5 minutes for scheduler to run, or manually trigger the workflow.

**Verification Queries:**
```sql
-- Check email_sends created
SELECT * FROM email_sends 
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
ORDER BY created_at DESC;

-- Expected: 1 row with send_status='queued', scheduled_send_time set

-- Check enrollment updated
SELECT current_sequence_order, next_send_at 
FROM lead_campaign_enrollments 
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: current_sequence_order=2, next_send_at = NOW() + 2 days
```

#### Step 3: Wait for Sender (or trigger manually)
Wait 1 minute for sender to run.

**Verification Queries:**
```sql
-- Check email sent
SELECT send_status, actual_send_time, provider_message_id 
FROM email_sends 
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
ORDER BY created_at DESC LIMIT 1;

-- Expected: send_status='sent', actual_send_time populated, provider_message_id populated

-- Check campaign stats updated
SELECT emails_sent, leads_enrolled 
FROM nurture_campaigns 
WHERE id = '00000000-0000-0000-0000-000000000020';

-- Expected: emails_sent=1, leads_enrolled=1
```

#### Step 4: Simulate Email Open Event
```bash
curl -X POST https://your-n8n-instance.com/webhook/email-events \
  -H "Content-Type: application/json" \
  -d '[{
    "event": "open",
    "timestamp": '$(date +%s)',
    "email": "john.buyer@test.com",
    "tracking_pixel_id": "REPLACE_WITH_ACTUAL_TRACKING_ID",
    "ip": "192.168.1.1",
    "useragent": "Mozilla/5.0..."
  }]'
```

**Verification Queries:**
```sql
-- Check event recorded
SELECT * FROM email_events 
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
AND event_type = 'open';

-- Expected: 1 row with event_type='open'

-- Check email_sends updated
SELECT opened_at, open_count 
FROM email_sends 
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
ORDER BY created_at DESC LIMIT 1;

-- Expected: opened_at populated, open_count=1

-- Check enrollment engagement
SELECT emails_opened, last_engagement_at 
FROM lead_campaign_enrollments 
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: emails_opened=1, last_engagement_at populated
```

---

### TEST 2: A/B Testing Variant Distribution

**Objective:** Verify 50/50 split of A/B test variants

```bash
# Enroll 100 test leads
for i in {1..100}; do
  curl -X POST https://your-n8n-instance.com/webhook/nurture/enroll \
    -H "Content-Type: application/json" \
    -d "{
      \"organization_id\": \"00000000-0000-0000-0000-000000000001\",
      \"lead_id\": \"lead-test-$i\",
      \"trigger_type\": \"new_lead\"
    }"
  sleep 0.5
done
```

**Verification Query:**
```sql
-- Check variant distribution
SELECT 
  variant_assigned,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM lead_campaign_enrollments
WHERE campaign_id = '00000000-0000-0000-0000-000000000020'
GROUP BY variant_assigned;

-- Expected: Approximately 50% A, 50% B (±5% acceptable)
```

---

### TEST 3: Frequency Cap Enforcement

**Objective:** Ensure leads don't receive more emails than their frequency cap

#### Setup
```sql
-- Set strict frequency cap
UPDATE lead_preferences
SET max_emails_per_week = 2
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Create 5 queued emails for this lead
INSERT INTO email_sends (organization_id, lead_id, enrollment_id, message_id, recipient_email, subject_line, body_html, scheduled_send_time, send_status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  lce.id,
  '00000000-0000-0000-0000-000000000040',
  'john.buyer@test.com',
  'Test Email ' || generate_series,
  '<html><body>Test</body></html>',
  NOW() - INTERVAL '1 hour',
  'queued'
FROM generate_series(1, 5),
     lead_campaign_enrollments lce
WHERE lce.lead_id = '00000000-0000-0000-0000-000000000010'
LIMIT 5;
```

#### Test
Trigger the scheduler workflow.

**Verification:**
```sql
-- Check that only 2 emails were scheduled (not all 5)
SELECT COUNT(*) 
FROM email_sends 
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
  AND send_status IN ('sent', 'sending')
  AND created_at >= NOW() - INTERVAL '7 days';

-- Expected: COUNT = 2 (matching frequency cap)
```

---

### TEST 4: Unsubscribe Workflow

**Objective:** Verify unsubscribe stops all future emails

#### Step 1: Simulate Unsubscribe Event
```bash
curl -X POST https://your-n8n-instance.com/webhook/email-events \
  -H "Content-Type: application/json" \
  -d '[{
    "event": "unsubscribe",
    "timestamp": '$(date +%s)',
    "email": "john.buyer@test.com",
    "tracking_pixel_id": "REPLACE_WITH_ACTUAL_TRACKING_ID"
  }]'
```

**Verification Queries:**
```sql
-- Check preferences updated
SELECT email_subscribed, unsubscribed_at, unsubscribe_reason
FROM lead_preferences
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: email_subscribed=false, unsubscribed_at populated

-- Check all enrollments stopped
SELECT status, completion_reason
FROM lead_campaign_enrollments
WHERE lead_id = '00000000-0000-0000-0000-000000000010';

-- Expected: status='unsubscribed', completion_reason='unsubscribed'

-- Check queued emails cancelled
SELECT COUNT(*)
FROM email_sends
WHERE lead_id = '00000000-0000-0000-0000-000000000010'
  AND send_status = 'queued';

-- Expected: COUNT = 0 (all cancelled)
```

---

### TEST 5: Content Personalization

**Objective:** Verify all tokens are properly replaced

#### Test Request
```bash
curl -X POST https://your-n8n-instance.com/webhook/nurture/personalize \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "00000000-0000-0000-0000-000000000010",
    "organization_id": "00000000-0000-0000-0000-000000000001",
    "subject_line": "Hi {{first_name}}, homes in {{location}}!",
    "body_html": "<html><body><h1>Hi {{name}}</h1><p>Budget: {{budget}}</p><p>Agent: {{agent_name}}</p>{{property_recommendations}}</body></html>",
    "lead_name": "John Buyer",
    "lead_email": "john.buyer@test.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "subject_line": "Hi John, homes in Austin,Round Rock!",
  "body_html": "<html><body><h1>Hi John Buyer</h1><p>Budget: $300,000 - $500,000</p><p>Agent: Test Agent</p>[PROPERTY HTML CARDS HERE]</body></html>",
  "tokens_replaced": ["first_name", "name", "budget", "agent_name", "property_recommendations"]
}
```

**Validation:**
- No tokens remain in response (no `{{...}}`)
- All values are properly replaced
- Property recommendations HTML is generated
- Agent info is correct

---

### TEST 6: Analytics Daily Calculation

**Objective:** Verify daily analytics are calculated correctly

#### Setup: Create test data for yesterday
```sql
-- Create some sent emails from yesterday
INSERT INTO email_sends (organization_id, lead_id, enrollment_id, message_id, recipient_email, subject_line, body_html, scheduled_send_time, actual_send_time, send_status, opened_at, first_click_at)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  lce.id,
  '00000000-0000-0000-0000-000000000040',
  'john.buyer@test.com',
  'Test',
  '<html>Test</html>',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  'sent',
  CASE WHEN generate_series % 2 = 0 THEN NOW() - INTERVAL '1 day' ELSE NULL END,
  CASE WHEN generate_series % 4 = 0 THEN NOW() - INTERVAL '1 day' ELSE NULL END
FROM generate_series(1, 10),
     lead_campaign_enrollments lce
WHERE lce.lead_id = '00000000-0000-0000-0000-000000000010'
LIMIT 10;

-- Insert corresponding open/click events
INSERT INTO email_events (organization_id, email_send_id, lead_id, event_type, event_timestamp)
SELECT 
  organization_id,
  id,
  lead_id,
  CASE WHEN opened_at IS NOT NULL THEN 'open' ELSE NULL END,
  opened_at
FROM email_sends
WHERE opened_at IS NOT NULL
  AND DATE(actual_send_time) = CURRENT_DATE - 1;
```

#### Test: Trigger Analytics Workflow
Manually trigger the "Analytics Updater" workflow.

**Verification Query:**
```sql
-- Check analytics record created
SELECT 
  analytics_date,
  emails_sent_today,
  unique_opens_today,
  unique_clicks_today,
  open_rate,
  click_rate
FROM campaign_analytics
WHERE campaign_id = '00000000-0000-0000-0000-000000000020'
  AND analytics_date = CURRENT_DATE - 1;

-- Expected: 
-- emails_sent_today = 10
-- unique_opens_today = 5 (50%)
-- unique_clicks_today = 3 (30% of opens)
-- open_rate = 50.00
-- click_rate = 30.00
```

---

## Performance Testing

### Load Test: 1000 Concurrent Enrollments
```bash
#!/bin/bash
# Save as test_load.sh

WEBHOOK_URL="https://your-n8n-instance.com/webhook/nurture/enroll"
ORG_ID="00000000-0000-0000-0000-000000000001"

# Run 1000 enrollments in parallel (100 at a time)
for batch in {1..10}; do
  for i in {1..100}; do
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"organization_id\": \"$ORG_ID\",
        \"lead_id\": \"load-test-$((batch * 100 + i))\",
        \"trigger_type\": \"new_lead\"
      }" &
  done
  wait
  echo "Batch $batch complete"
  sleep 2
done

echo "Load test complete"
```

**Success Criteria:**
- All 1000 enrollments succeed
- No database deadlocks
- Average response time < 2 seconds
- Error rate < 1%

---

## Troubleshooting Common Issues

### Issue: Emails not being scheduled
**Check:**
1. Is enrollment status = 'active'?
2. Is next_send_at <= NOW()?
3. Is lead email_subscribed = true?
4. Check scheduler workflow logs

### Issue: Emails stuck in 'queued' status
**Check:**
1. Is sender workflow running?
2. Check SendGrid API key validity
3. Check rate limit not exceeded
4. Look for error in workflow logs

### Issue: Events not being recorded
**Check:**
1. Webhook URL correctly configured in SendGrid
2. Webhook signature validation (if enabled)
3. Check for duplicate event_hash
4. Review event tracker workflow logs

---

## Success Checklist

- [ ] All 6 workflows imported successfully
- [ ] Database schema deployed
- [ ] Test data created
- [ ] Test 1 (E2E flow) passes
- [ ] Test 2 (A/B testing) passes
- [ ] Test 3 (Frequency cap) passes
- [ ] Test 4 (Unsubscribe) passes
- [ ] Test 5 (Personalization) passes
- [ ] Test 6 (Analytics) passes
- [ ] Performance test passes
- [ ] No errors in workflow logs
- [ ] All metrics tracked correctly