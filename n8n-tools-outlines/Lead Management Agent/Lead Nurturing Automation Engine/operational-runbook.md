# Lead Nurturing System - Operational Runbook

## Table of Contents
1. [Daily Operations](#daily-operations)
2. [Monitoring & Alerts](#monitoring--alerts)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Performance Optimization](#performance-optimization)
5. [Scaling Guidelines](#scaling-guidelines)
6. [Backup & Recovery](#backup--recovery)
7. [Maintenance Schedule](#maintenance-schedule)

---

## 1. Daily Operations

### Morning Health Check (10 minutes)

Run these queries in your database daily:

```sql
-- 1. Check yesterday's email volume
SELECT 
  COUNT(*) as emails_sent,
  COUNT(*) FILTER (WHERE send_status = 'sent') as successful,
  COUNT(*) FILTER (WHERE send_status = 'failed') as failed,
  ROUND(AVG(EXTRACT(EPOCH FROM (actual_send_time - scheduled_send_time)))) as avg_delay_seconds
FROM email_sends
WHERE DATE(created_at) = CURRENT_DATE - 1;

-- Expected: failed < 1% of total, avg_delay_seconds < 60

-- 2. Check active enrollments
SELECT 
  COUNT(*) as active_enrollments,
  COUNT(*) FILTER (WHERE next_send_at <= NOW()) as overdue,
  COUNT(*) FILTER (WHERE next_send_at <= NOW() + INTERVAL '1 hour') as due_soon
FROM lead_campaign_enrollments
WHERE status = 'active';

-- Expected: overdue should be 0

-- 3. Check workflow execution errors
SELECT 
  workflow_name,
  COUNT(*) as error_count,
  MAX(created_at) as last_error
FROM workflow_errors
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY workflow_name
ORDER BY error_count DESC;

-- Expected: All counts should be 0

-- 4. Check email engagement rates
SELECT 
  campaign_id,
  analytics_date,
  open_rate,
  click_rate,
  unsubscribe_rate
FROM campaign_analytics
WHERE analytics_date = CURRENT_DATE - 1
ORDER BY campaign_id;

-- Expected: open_rate > 30%, click_rate > 5%, unsubscribe_rate < 0.5%
```

### Review Dashboard Metrics

Check these KPIs daily:

| Metric | Target | Alert If |
|--------|--------|----------|
| Email Delivery Rate | > 95% | < 90% |
| Open Rate | > 30% | < 20% |
| Click Rate | > 5% | < 2% |
| Unsubscribe Rate | < 0.5% | > 1% |
| Bounce Rate | < 5% | > 10% |
| Scheduler Success Rate | > 99% | < 95% |
| Sender Success Rate | > 98% | < 95% |

---

## 2. Monitoring & Alerts

### Critical Alerts (Immediate Action Required)

#### Alert: High Email Failure Rate
```sql
-- Detection query (run every 5 minutes)
SELECT 
  COUNT(*) FILTER (WHERE send_status = 'failed') * 100.0 / COUNT(*) as failure_rate
FROM email_sends
WHERE created_at >= NOW() - INTERVAL '5 minutes';

-- Alert if: failure_rate > 10%
```

**Action:**
1. Check SendGrid API status: https://status.sendgrid.com
2. Verify API key hasn't been revoked
3. Check rate limits haven't been exceeded
4. Review error logs in Email Sender workflow
5. If SendGrid is down, pause sender workflow temporarily

#### Alert: Workflow Execution Stopped
```sql
-- Detection query (run every 15 minutes)
SELECT 
  workflow_name,
  MAX(created_at) as last_run
FROM workflow_executions
WHERE workflow_name IN (
  'Lead Nurture - Message Scheduler',
  'Lead Nurture - Email Sender'
)
GROUP BY workflow_name
HAVING MAX(created_at) < NOW() - INTERVAL '15 minutes';

-- Alert if: any workflow hasn't run in 15+ minutes
```

**Action:**
1. Check N8n service is running
2. Verify workflows are activated (green toggle)
3. Check N8n logs for errors
4. Restart N8n if necessary
5. Manually trigger workflows to catch up

#### Alert: Database Connection Lost
**Symptoms:** All workflows failing with database errors

**Action:**
1. Check Supabase status
2. Verify database credentials haven't changed
3. Test connection from N8n credentials page
4. Check database connection pool not exhausted
5. Restart N8n to reset connections

### Warning Alerts (Action Within 1 Hour)

#### Alert: Low Engagement Rate
```sql
-- Detection query (run daily)
SELECT 
  campaign_id,
  campaign_name,
  open_rate,
  click_rate
FROM campaign_analytics ca
JOIN nurture_campaigns nc ON nc.id = ca.campaign_id
WHERE analytics_date = CURRENT_DATE - 1
  AND (open_rate < 20 OR click_rate < 2);

-- Alert if: any campaign below thresholds
```

**Action:**
1. Review campaign subject lines
2. Check send times
3. Analyze audience targeting
4. Review content quality
5. Consider A/B test variants

#### Alert: High Unsubscribe Rate
```sql
-- Detection query (run daily)
SELECT 
  COUNT(*) as unsubscribes_today,
  COUNT(*) * 100.0 / (
    SELECT COUNT(*) FROM email_sends 
    WHERE DATE(actual_send_time) = CURRENT_DATE - 1
  ) as unsubscribe_rate
FROM email_events
WHERE event_type = 'unsubscribe'
  AND DATE(event_timestamp) = CURRENT_DATE - 1;

-- Alert if: unsubscribe_rate > 1%
```

**Action:**
1. Review recent campaign content
2. Check frequency caps
3. Verify content relevance to audience
4. Review feedback from unsubscribe reasons
5. Adjust campaign strategy

---

## 3. Common Issues & Solutions

### Issue 1: Emails Stuck in "Queued" Status

**Symptoms:**
```sql
SELECT COUNT(*) 
FROM email_sends 
WHERE send_status = 'queued' 
  AND scheduled_send_time < NOW() - INTERVAL '1 hour';
-- Returns > 0
```

**Diagnosis:**
1. Check if Email Sender workflow is active
2. Check SendGrid API key validity
3. Review sender workflow execution history
4. Check for rate limiting

**Solution:**
```sql
-- Check for specific errors
SELECT failure_reason, COUNT(*)
FROM email_sends
WHERE send_status = 'failed'
  AND created_at >= NOW() - INTERVAL '1 day'
GROUP BY failure_reason;

-- If rate limited: Reduce N8N_MAX_EMAILS_PER_MINUTE
-- If authentication failed: Update SendGrid API key
-- If workflow stopped: Reactivate workflow
-- If no clear issue: Manually trigger sender workflow
```

### Issue 2: Duplicate Email Events

**Symptoms:**
```sql
SELECT email_send_id, event_type, COUNT(*)
FROM email_events
GROUP BY email_send_id, event_type
HAVING COUNT(*) > 1;
-- Returns rows
```

**Diagnosis:**
SendGrid is sending duplicate webhook events

**Solution:**
```sql
-- Check deduplication is working
SELECT COUNT(*) as total_events,
       COUNT(DISTINCT event_hash) as unique_events
FROM email_events
WHERE DATE(created_at) = CURRENT_DATE;

-- If unique < total, deduplication is working correctly
-- Duplicates are being filtered out

-- If they match, event_hash may not be unique enough
-- Update hash algorithm in Event Tracker workflow
```

### Issue 3: High Bounce Rate

**Symptoms:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE send_status = 'bounced') * 100.0 / COUNT(*) as bounce_rate
FROM email_sends
WHERE DATE(actual_send_time) = CURRENT_DATE - 1;
-- Returns > 5%
```

**Diagnosis:**
1. Check bounce types (hard vs soft)
2. Review email validation at lead capture
3. Check for spam complaints

**Solution:**
```sql
-- Identify problematic leads
SELECT 
  lead_id,
  COUNT(*) as bounce_count,
  bounce_type
FROM email_sends
WHERE send_status = 'bounced'
GROUP BY lead_id, bounce_type
HAVING COUNT(*) >= 2
ORDER BY bounce_count DESC;

-- Mark emails as invalid for hard bounces
UPDATE leads l
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{email_invalid}',
  'true'::jsonb
)
WHERE id IN (
  SELECT lead_id FROM email_sends 
  WHERE bounce_type = 'hard'
);

-- Stop campaigns for bounced leads
UPDATE lead_campaign_enrollments
SET status = 'completed', completion_reason = 'invalid_email'
WHERE lead_id IN (
  SELECT lead_id FROM leads 
  WHERE metadata->>'email_invalid' = 'true'
);
```

### Issue 4: Personalization Tokens Not Replaced

**Symptoms:**
Emails contain `{{token}}` in sent content

**Diagnosis:**
1. Check Content Personalizer workflow logs
2. Verify lead data exists
3. Check token spelling

**Solution:**
```sql
-- Check for leads missing critical data
SELECT 
  l.id,
  l.name,
  l.email,
  CASE WHEN l.name IS NULL THEN 'missing_name' END as issue
FROM leads l
LEFT JOIN lead_preferences lp ON lp.lead_id = l.id
WHERE l.organization_id = '[your-org-id]'
  AND (l.name IS NULL OR l.email IS NULL);

-- Fill in missing data or remove from campaigns
```

### Issue 5: Campaign Analytics Not Updating

**Symptoms:**
```sql
SELECT MAX(analytics_date)
FROM campaign_analytics;
-- Returns date before yesterday
```

**Diagnosis:**
1. Check Analytics Updater workflow is active
2. Check last execution time
3. Review workflow logs

**Solution:**
```bash
# Manually trigger Analytics Updater workflow
# Or run SQL directly:

INSERT INTO campaign_analytics (
  organization_id, campaign_id, analytics_date,
  emails_sent_today, unique_opens_today, unique_clicks_today,
  open_rate, click_rate
)
SELECT 
  lce.organization_id,
  lce.campaign_id,
  CURRENT_DATE - 1 as analytics_date,
  COUNT(DISTINCT es.id) as emails_sent_today,
  COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.lead_id END) as unique_opens_today,
  COUNT(DISTINCT CASE WHEN es.first_click_at IS NOT NULL THEN es.lead_id END) as unique_clicks_today,
  ROUND(COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.lead_id END) * 100.0 / NULLIF(COUNT(DISTINCT es.id), 0), 2) as open_rate,
  ROUND(COUNT(DISTINCT CASE WHEN es.first_click_at IS NOT NULL THEN es.lead_id END) * 100.0 / NULLIF(COUNT(DISTINCT es.id), 0), 2) as click_rate
FROM lead_campaign_enrollments lce
JOIN email_sends es ON es.enrollment_id = lce.id
WHERE DATE(es.actual_send_time) = CURRENT_DATE - 1
GROUP BY lce.organization_id, lce.campaign_id
ON CONFLICT (campaign_id, analytics_date) DO UPDATE SET
  emails_sent_today = EXCLUDED.emails_sent_today,
  unique_opens_today = EXCLUDED.unique_opens_today,
  unique_clicks_today = EXCLUDED.unique_clicks_today,
  open_rate = EXCLUDED.open_rate,
  click_rate = EXCLUDED.click_rate;
```

---

## 4. Performance Optimization

### Database Optimization

#### Index Maintenance (Monthly)
```sql
-- Rebuild indexes
REINDEX TABLE lead_campaign_enrollments;
REINDEX TABLE email_sends;
REINDEX TABLE email_events;

-- Update statistics
ANALYZE lead_campaign_enrollments;
ANALYZE email_sends;
ANALYZE email_events;
```

#### Query Performance Review (Weekly)
```sql
-- Find slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%email_sends%'
   OR query LIKE '%lead_campaign%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- If queries are slow, add indexes or optimize WHERE clauses
```

### Workflow Optimization

#### Scheduler Performance
Target: Process 1000 enrollments in < 10 seconds

```sql
-- Measure processing time
SELECT 
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) as enrollments_processed,
  MAX(updated_at) - MIN(created_at) as processing_duration
FROM email_sends
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY DATE_TRUNC('minute', created_at)
ORDER BY minute DESC
LIMIT 10;

-- If > 10 seconds per batch:
-- 1. Increase batch size
-- 2. Add database read replicas
-- 3. Optimize personalization queries
```

#### Sender Performance
Target: Send 100 emails per minute

```sql
-- Measure send rate
SELECT 
  DATE_TRUNC('minute', actual_send_time) as minute,
  COUNT(*) as emails_sent,
  COUNT(*) / 60.0 as emails_per_second
FROM email_sends
WHERE send_status = 'sent'
  AND DATE(actual_send_time) = CURRENT_DATE
GROUP BY DATE_TRUNC('minute', actual_send_time)
ORDER BY minute DESC
LIMIT 10;

-- If < 100/minute:
-- 1. Check SendGrid rate limits
-- 2. Increase N8N_MAX_EMAILS_PER_MINUTE
-- 3. Optimize tracking pixel/link generation
```

---

## 5. Scaling Guidelines

### Current Capacity
- **Leads:** Up to 100,000 active enrollments
- **Emails:** Up to 100,000 per day
- **Organizations:** Up to 100

### When to Scale

#### Scale Database (Supabase)
**Trigger:** Query response time > 500ms consistently

**Action:**
1. Upgrade Supabase plan (more resources)
2. Add read replicas for reporting
3. Implement connection pooling
4. Archive old data (> 1 year)

#### Scale N8n
**Trigger:** Workflow execution queue > 100 items

**Action:**
1. Upgrade to N8n Pro (more resources)
2. Deploy multiple N8n instances
3. Use queue mode for workflows
4. Implement workflow-specific scaling

#### Scale SendGrid
**Trigger:** Hitting rate limits or want to send > 100K/day

**Action:**
1. Upgrade SendGrid plan
2. Implement multiple API keys
3. Load balance across keys
4. Consider dedicated IP addresses

---

## 6. Backup & Recovery

### Automated Backups

#### Database (Daily)
Supabase provides automatic backups. Verify:
```sql
-- Check backup status (via Supabase dashboard)
```

#### Workflow Definitions (Weekly)
```bash
# Export all workflows
for wf in $(curl -H "X-N8N-API-KEY: $API_KEY" $N8N_URL/api/v1/workflows | jq -r '.data[].id'); do
  curl -H "X-N8N-API-KEY: $API_KEY" \
    "$N8N_URL/api/v1/workflows/$wf" \
    > "backup/workflow-$wf-$(date +%Y%m%d).json"
done
```

### Disaster Recovery Procedures

#### Complete System Recovery (RTO: 4 hours)

1. **Restore Database** (30 minutes)
   - Restore from Supabase backup
   - Verify all tables present
   - Run schema validation queries

2. **Restore N8n** (30 minutes)
   - Deploy new N8n instance
   - Import workflow definitions
   - Configure credentials
   - Set environment variables

3. **Reconfigure SendGrid** (30 minutes)
   - Update webhook URLs
   - Verify domain authentication
   - Test email sending

4. **Verification** (1 hour)
   - Run complete test suite
   - Process backlog of queued emails
   - Monitor for 1 hour

5. **Communication** (ongoing)
   - Notify team of recovery
   - Document incident
   - Update runbook if needed

---

## 7. Maintenance Schedule

### Daily
- [ ] Run morning health check queries
- [ ] Review dashboard metrics
- [ ] Check for critical alerts

### Weekly
- [ ] Review query performance
- [ ] Export workflow definitions
- [ ] Check SendGrid deliverability stats
- [ ] Review unsubscribe feedback

### Monthly
- [ ] Rebuild database indexes
- [ ] Review and optimize slow workflows
- [ ] Clean up completed enrollments > 90 days
- [ ] Review and update documentation
- [ ] Rotate API keys (if security policy requires)

### Quarterly
- [ ] Full system performance audit
- [ ] Review capacity and scaling needs
- [ ] Test disaster recovery procedures
- [ ] Update dependencies (N8n, libraries)
- [ ] Review and optimize campaign strategy

### Annually
- [ ] Archive old data (> 1 year)
- [ ] Comprehensive security audit
- [ ] Review and renew SendGrid plan
- [ ] Team training on system operations

---

## Quick Reference

### Important URLs
- N8n Instance: `https://your-n8n-instance.com`
- Supabase Dashboard: `https://app.supabase.com`
- SendGrid Dashboard: `https://app.sendgrid.com`

### Emergency Contacts
- N8n Support: support@n8n.io
- SendGrid Support: https://support.sendgrid.com
- Supabase Support: support@supabase.com
- Internal Team: [Your team contact]

### Useful Commands
```bash
# Check N8n service status
systemctl status n8n
# OR
pm2 status n8n

# View N8n logs
journalctl -u n8n -f
# OR
pm2 logs n8n

# Restart N8n
systemctl restart n8n
# OR
pm2 restart n8n

# Test database connection
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres" -c "SELECT 1;"

# Test SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"from@example.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

---

## Escalation Matrix

| Issue Severity | Response Time | Escalation Path |
|----------------|---------------|-----------------|
| **Critical** (System down) | Immediate | On-call engineer → CTO |
| **High** (Degraded service) | 1 hour | Team lead → Engineering manager |
| **Medium** (Performance issue) | 4 hours | Engineering team |
| **Low** (Minor bug) | Next business day | Ticket queue |

---

*Last Updated: 2025-10-10*  
*Document Owner: Engineering Team*  
*Review Frequency: Quarterly*