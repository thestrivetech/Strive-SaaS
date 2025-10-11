# Lead Nurturing System - Configuration & Setup Guide

## Table of Contents
1. [Database Setup](#database-setup)
2. [N8n Configuration](#n8n-configuration)
3. [SendGrid Setup](#sendgrid-setup)
4. [Environment Variables](#environment-variables)
5. [Workflow Import](#workflow-import)
6. [Verification](#verification)

---

## 1. Database Setup

### Step 1: Deploy Schema
```bash
# Connect to your Supabase PostgreSQL database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Or via Supabase SQL Editor
# Copy and paste the entire nurture-campaign-schema.sql file

\i nurture-campaign-schema.sql
```

### Step 2: Verify Tables Created
```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%campaign%' OR table_name LIKE '%email%' OR table_name LIKE '%preference%')
ORDER BY table_name;
```

**Expected Output:**
```
campaign_analytics
campaign_messages
campaign_sequences
email_events
email_sends
lead_campaign_enrollments
lead_preferences
nurture_campaigns
```

### Step 3: Verify RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('nurture_campaigns', 'email_sends', 'email_events')
ORDER BY tablename;
```

**Expected:** All tables should have `rowsecurity = true`

### Step 4: Verify Functions Created
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('calculate_next_send_time', 'adjust_to_optimal_time')
ORDER BY routine_name;
```

---

## 2. N8n Configuration

### Prerequisites
- N8n cloud instance OR self-hosted N8n (v1.0+)
- Admin access to N8n
- Base URL configured (e.g., https://n8n.yourcompany.com)

### Step 1: Configure N8n Credentials

#### A. Supabase PostgreSQL Credential
1. Go to N8n → **Credentials** → **New**
2. Select **PostgreSQL**
3. Name: `supabase_main`
4. Fill in:
   ```
   Host: [your-project].supabase.co
   Database: postgres
   User: postgres
   Password: [your-supabase-password]
   Port: 5432
   SSL: Require
   ```
5. Click **Test** → Should see "Connection successful"
6. Click **Save**

#### B. SendGrid API Credential
1. Go to N8n → **Credentials** → **New**
2. Select **SendGrid API**
3. Name: `sendgrid_api`
4. API Key: [Your SendGrid API Key]
5. Click **Save**

**To get SendGrid API Key:**
1. Log into SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `N8n Lead Nurture`
5. Select **Full Access** (or restricted access with Mail Send permissions)
6. Copy the key (only shown once!)

### Step 2: Set Environment Variables

#### N8n Cloud
1. Go to your N8n cloud settings
2. Add environment variables:

```bash
N8N_EMAIL_PROVIDER=sendgrid
N8N_SENDGRID_API_KEY=[your-key]
N8N_TRACKING_DOMAIN=track.yourcompany.com
N8N_EMAIL_FROM_ADDRESS=noreply@yourcompany.com
N8N_EMAIL_FROM_NAME=Your Company Name
N8N_MAX_EMAILS_PER_MINUTE=100
N8N_OPTIMAL_SEND_HOUR=10
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com
```

#### Self-Hosted N8n
Add to your `.env` file or docker-compose environment:

```bash
# Email Configuration
N8N_EMAIL_PROVIDER=sendgrid
N8N_SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
N8N_TRACKING_DOMAIN=track.yourcompany.com
N8N_EMAIL_FROM_ADDRESS=noreply@yourcompany.com
N8N_EMAIL_FROM_NAME=Your Company Name
N8N_MAX_EMAILS_PER_MINUTE=100
N8N_OPTIMAL_SEND_HOUR=10

# Webhook Configuration
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com
WEBHOOK_URL=https://your-n8n-instance.com/

# Database
DATABASE_TYPE=postgresdb
DATABASE_HOST=your-project.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_SSL_CA=
DATABASE_SSL_CERT=
DATABASE_SSL_KEY=
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

Restart N8n after adding environment variables:
```bash
docker-compose restart n8n
# OR
pm2 restart n8n
```

---

## 3. SendGrid Setup

### Step 1: Domain Authentication
1. Log into SendGrid
2. Go to **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain**
4. Follow wizard to add DNS records to your domain
5. Wait for verification (usually 24-48 hours)

### Step 2: Configure Event Webhook

1. Go to **Settings** → **Mail Settings** → **Event Webhook**
2. Click **Enable**
3. **HTTP POST URL:** `https://your-n8n-instance.com/webhook/email-events`
4. Select events to post:
   - ✅ Delivered
   - ✅ Opened
   - ✅ Clicked
   - ✅ Bounced
   - ✅ Spam Reports
   - ✅ Unsubscribes
5. **OAuth Security:** Off (for simplicity, or configure if needed)
6. Click **Save**

### Step 3: Test Event Webhook
```bash
# SendGrid provides a test button - click it and verify event appears in N8n
```

Check N8n workflow "Event Tracker" execution history - should see test event.

### Step 4: Configure Unsubscribe Group (Optional)
1. Go to **Suppressions** → **Unsubscribe Groups**
2. Create group: "Lead Nurture Emails"
3. Note the group ID
4. Add to email sends:
   ```json
   "asm": {
     "group_id": [YOUR_GROUP_ID]
   }
   ```

---

## 4. Workflow Import

### Method 1: Import via N8n UI

1. Download all 6 workflow JSON files
2. Go to N8n → **Workflows**
3. Click **Import from File**
4. Select `workflow-1-enrollment-trigger.json`
5. Click **Import**
6. Repeat for workflows 2-6

### Method 2: Import via API
```bash
# Set your API credentials
N8N_API_KEY="your-api-key"
N8N_URL="https://your-n8n-instance.com"

# Import all workflows
for file in workflow-*.json; do
  curl -X POST "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$file"
  echo "Imported $file"
done
```

### Step 2: Activate Workflows

After importing, activate each workflow:

1. **Workflow 1: Enrollment Trigger**
   - Click workflow → Click **Activate** toggle (top right)
   - Webhook URL will appear - copy it

2. **Workflow 2: Message Scheduler**
   - Click workflow → Click **Activate** toggle
   - Runs automatically every 5 minutes

3. **Workflow 3: Email Sender**
   - Click workflow → Click **Activate** toggle
   - Runs automatically every 1 minute

4. **Workflow 4: Event Tracker**
   - Click workflow → Click **Activate** toggle
   - Webhook URL will appear - use this in SendGrid

5. **Workflow 5: Analytics Updater**
   - Click workflow → Click **Activate** toggle
   - Runs automatically daily at midnight

6. **Workflow 6: Content Personalizer**
   - Click workflow → Click **Activate** toggle
   - Internal webhook, called by other workflows

### Step 3: Record Webhook URLs

You should have 3 webhook URLs:

1. **Enrollment Trigger:** 
   ```
   https://your-n8n-instance.com/webhook/nurture/enroll
   ```

2. **Event Tracker:**
   ```
   https://your-n8n-instance.com/webhook/email-events
   ```
   → Use this in SendGrid webhook configuration

3. **Content Personalizer:**
   ```
   https://your-n8n-instance.com/webhook/nurture/personalize
   ```
   → Internal use only

---

## 5. Environment Variables Reference

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `N8N_EMAIL_PROVIDER` | Email service provider | `sendgrid` | Yes |
| `N8N_SENDGRID_API_KEY` | SendGrid API key | `SG.xxx...` | Yes |
| `N8N_EMAIL_FROM_ADDRESS` | Sender email address | `noreply@company.com` | Yes |
| `N8N_EMAIL_FROM_NAME` | Sender name | `Acme Real Estate` | Yes |
| `N8N_WEBHOOK_BASE_URL` | Base URL for webhooks | `https://n8n.company.com` | Yes |

### Optional Variables

| Variable | Description | Default | Optional |
|----------|-------------|---------|----------|
| `N8N_TRACKING_DOMAIN` | Custom tracking domain | `track.strivetech.io` | Yes |
| `N8N_MAX_EMAILS_PER_MINUTE` | Rate limit for sending | `100` | Yes |
| `N8N_OPTIMAL_SEND_HOUR` | Default optimal send time | `10` (10 AM) | Yes |

---

## 6. Verification

### Checklist

#### ✅ Database
```sql
-- Run verification queries
SELECT COUNT(*) FROM nurture_campaigns; -- Should return 0 or test data
SELECT COUNT(*) FROM campaign_sequences; -- Should return 0 or test data
SELECT COUNT(*) FROM campaign_messages; -- Should return 0 or test data
```

#### ✅ N8n Credentials
- [ ] Supabase PostgreSQL credential created and tested
- [ ] SendGrid API credential created and saved

#### ✅ Environment Variables
Run this in N8n Code node:
```javascript
return {
  json: {
    provider: process.env.N8N_EMAIL_PROVIDER,
    from_address: process.env.N8N_EMAIL_FROM_ADDRESS,
    webhook_base: process.env.N8N_WEBHOOK_BASE_URL,
    all_set: !!(
      process.env.N8N_EMAIL_PROVIDER &&
      process.env.N8N_SENDGRID_API_KEY &&
      process.env.N8N_EMAIL_FROM_ADDRESS
    )
  }
};
```

#### ✅ Workflows
- [ ] All 6 workflows imported
- [ ] All workflows activated (green toggle)
- [ ] No error badges on any workflows
- [ ] Webhook URLs copied

#### ✅ SendGrid
- [ ] Domain authenticated
- [ ] Event webhook configured with correct URL
- [ ] Test event received in N8n

### Quick Test

Run this end-to-end test:

```bash
# 1. Create test campaign (via SQL - see testing guide)
# 2. Enroll test lead
curl -X POST https://your-n8n-instance.com/webhook/nurture/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "test-org-id",
    "lead_id": "test-lead-id",
    "trigger_type": "new_lead"
  }'

# 3. Check response
# Expected: {"success": true, "enrollments_created": 1, ...}

# 4. Wait 5 minutes for scheduler
# 5. Wait 1 minute for sender
# 6. Check your email inbox for test email
```

---

## Troubleshooting

### Issue: "Credential not found" error
**Solution:** Ensure credential names match exactly:
- `supabase_main` for PostgreSQL
- `sendgrid_api` for SendGrid

### Issue: Workflows not triggering
**Solution:** 
1. Check workflows are activated (green toggle)
2. For schedule triggers, check execution history
3. For webhooks, test with curl

### Issue: Emails not sending
**Solution:**
1. Check SendGrid API key is valid
2. Verify domain is authenticated in SendGrid
3. Check sender email is verified
4. Review workflow execution logs for errors

### Issue: Events not being tracked
**Solution:**
1. Verify SendGrid webhook URL is correct
2. Check Event Tracker workflow is active
3. Test webhook from SendGrid settings
4. Review Event Tracker execution history

---

## Security Recommendations

### 1. Webhook Security
Add basic authentication to webhook endpoints:
```javascript
// At start of webhook workflows
const auth = $input.first().json.auth_token;
if (auth !== process.env.WEBHOOK_AUTH_TOKEN) {
  return { json: { error: 'Unauthorized', code: 401 } };
}
```

### 2. Database Access
- Use read-only credentials for SELECT-only operations
- Implement RLS policies (already done in schema)
- Regular backups

### 3. API Keys
- Store all API keys as environment variables
- Never commit keys to version control
- Rotate keys quarterly

### 4. SendGrid
- Use restricted API keys with minimal permissions
- Enable webhook signature verification
- Monitor for unusual sending patterns

---

## Support & Resources

- **N8n Documentation:** https://docs.n8n.io
- **SendGrid Documentation:** https://docs.sendgrid.com
- **Supabase Documentation:** https://supabase.com/docs
- **Project GitHub:** [Your repo link]

---

## Next Steps

Once setup is complete:
1. Run complete test suite (see testing-guide.md)
2. Create your first campaign
3. Configure monitoring and alerts
4. Review operational runbook