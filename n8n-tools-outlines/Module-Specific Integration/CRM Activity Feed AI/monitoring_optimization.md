# 📊 Advanced Monitoring & Optimization Guide

## 🎯 System Health Dashboard

### Create Real-time Monitoring Views

Run these SQL queries in Supabase to create monitoring views:

```sql
-- ============================================
-- WORKFLOW HEALTH DASHBOARD
-- ============================================

-- View 1: Real-time Workflow Performance
CREATE OR REPLACE VIEW v_workflow_health AS
SELECT 
    workflow_name,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE status = 'completed') as successful,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) as success_rate,
    ROUND(AVG(duration_ms), 0) as avg_duration_ms,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0) as p95_duration_ms,
    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 0) as p99_duration_ms,
    MAX(started_at) as last_execution
FROM workflow_executions
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY workflow_name
ORDER BY total_executions DESC;

-- View 2: Error Analysis
CREATE OR REPLACE VIEW v_workflow_errors AS
SELECT 
    workflow_name,
    error_type,
    error_message,
    COUNT(*) as occurrence_count,
    MAX(started_at) as last_occurred,
    array_agg(DISTINCT organization_id) as affected_organizations
FROM workflow_executions
WHERE status = 'failed'
    AND started_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_name, error_type, error_message
ORDER BY occurrence_count DESC, last_occurred DESC
LIMIT 50;

-- View 3: Activity Processing Stats
CREATE OR REPLACE VIEW v_activity_processing_stats AS
SELECT 
    DATE(timestamp) as date,
    organization_id,
    COUNT(*) as total_activities,
    COUNT(*) FILTER (WHERE processed = true) as processed,
    COUNT(*) FILTER (WHERE processed = false) as unprocessed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE processed = true) / NULLIF(COUNT(*), 0), 2) as processing_rate,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time_seconds
FROM activities
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), organization_id
ORDER BY date DESC, organization_id;

-- View 4: Client Engagement Trends
CREATE OR REPLACE VIEW v_engagement_trends AS
SELECT 
    organization_id,
    DATE_TRUNC('day', last_analyzed_at) as analysis_date,
    COUNT(*) as total_clients,
    ROUND(AVG(engagement_score), 1) as avg_engagement_score,
    COUNT(*) FILTER (WHERE engagement_score >= 80) as high_engagement,
    COUNT(*) FILTER (WHERE engagement_score < 30) as low_engagement,
    COUNT(*) FILTER (WHERE churn_risk = 'high') as high_churn_risk,
    COUNT(*) FILTER (WHERE stage = 'committed') as committed_clients
FROM client_insights
WHERE last_analyzed_at > NOW() - INTERVAL '30 days'
GROUP BY organization_id, DATE_TRUNC('day', last_analyzed_at)
ORDER BY analysis_date DESC;

-- View 5: Opportunity Pipeline
CREATE OR REPLACE VIEW v_opportunity_pipeline AS
SELECT 
    organization_id,
    status,
    priority,
    COUNT(*) as count,
    ROUND(AVG(confidence), 3) as avg_confidence,
    ROUND(SUM(estimated_value), 2) as total_value,
    ROUND(AVG(estimated_value), 2) as avg_value
FROM opportunities
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY organization_id, status, priority
ORDER BY organization_id, status, priority;

-- View 6: AI Performance Metrics
CREATE OR REPLACE VIEW v_ai_performance AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_analyzed,
    ROUND(AVG(sentiment), 3) as avg_sentiment,
    COUNT(*) FILTER (WHERE sentiment > 0.5) as positive_count,
    COUNT(*) FILTER (WHERE sentiment < -0.5) as negative_count,
    COUNT(*) FILTER (WHERE urgency >= 4) as high_urgency_count,
    COUNT(DISTINCT intent) as unique_intents,
    ROUND(AVG(array_length(topics, 1)), 1) as avg_topics_per_activity
FROM activities
WHERE processed = true
    AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

## 🚨 Alert Configuration

### Critical Alerts (Immediate Action Required)

Create these as stored procedures that can be called periodically:

```sql
-- ============================================
-- ALERT: High Error Rate
-- ============================================
CREATE OR REPLACE FUNCTION check_error_rate()
RETURNS TABLE (
    workflow_name TEXT,
    error_rate NUMERIC,
    failed_count BIGINT,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        we.workflow_name::TEXT,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / NULLIF(COUNT(*), 0), 2) as error_rate,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        CASE 
            WHEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / NULLIF(COUNT(*), 0), 2) > 10 THEN 'CRITICAL'
            WHEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / NULLIF(COUNT(*), 0), 2) > 5 THEN 'WARNING'
            ELSE 'OK'
        END as alert_level
    FROM workflow_executions we
    WHERE started_at > NOW() - INTERVAL '1 hour'
    GROUP BY we.workflow_name
    HAVING COUNT(*) FILTER (WHERE status = 'failed') > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ALERT: Slow Performance
-- ============================================
CREATE OR REPLACE FUNCTION check_slow_performance()
RETURNS TABLE (
    workflow_name TEXT,
    p95_duration_ms NUMERIC,
    threshold_ms INTEGER,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        we.workflow_name::TEXT,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0) as p95_duration_ms,
        CASE 
            WHEN we.workflow_name LIKE '%aggregator%' THEN 2000
            WHEN we.workflow_name LIKE '%api%' THEN 2000
            WHEN we.workflow_name LIKE '%analyzer%' THEN 10000
            ELSE 5000
        END as threshold_ms,
        CASE 
            WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) > 
                CASE 
                    WHEN we.workflow_name LIKE '%aggregator%' THEN 5000
                    WHEN we.workflow_name LIKE '%api%' THEN 5000
                    ELSE 20000
                END THEN 'CRITICAL'
            WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) > 
                CASE 
                    WHEN we.workflow_name LIKE '%aggregator%' THEN 2000
                    WHEN we.workflow_name LIKE '%api%' THEN 2000
                    ELSE 10000
                END THEN 'WARNING'
            ELSE 'OK'
        END as alert_level
    FROM workflow_executions we
    WHERE started_at > NOW() - INTERVAL '1 hour'
        AND status = 'completed'
    GROUP BY we.workflow_name
    HAVING COUNT(*) > 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ALERT: Stale Data Detection
-- ============================================
CREATE OR REPLACE FUNCTION check_stale_insights()
RETURNS TABLE (
    organization_id UUID,
    stale_client_count BIGINT,
    oldest_analysis_hours NUMERIC,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.organization_id,
        COUNT(*) as stale_client_count,
        ROUND(EXTRACT(EPOCH FROM (NOW() - MIN(last_analyzed_at))) / 3600, 1) as oldest_analysis_hours,
        CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - MIN(last_analyzed_at))) / 3600 > 48 THEN 'CRITICAL'
            WHEN EXTRACT(EPOCH FROM (NOW() - MIN(last_analyzed_at))) / 3600 > 24 THEN 'WARNING'
            ELSE 'OK'
        END as alert_level
    FROM client_insights ci
    WHERE last_analyzed_at < NOW() - INTERVAL '12 hours'
    GROUP BY ci.organization_id
    HAVING COUNT(*) > 5;
END;
$$ LANGUAGE plpgsql;

-- Query all alerts
SELECT 'Error Rate' as alert_type, * FROM check_error_rate() WHERE alert_level != 'OK'
UNION ALL
SELECT 'Performance' as alert_type, workflow_name::TEXT, p95_duration_ms::TEXT, threshold_ms::TEXT, alert_level FROM check_slow_performance() WHERE alert_level != 'OK'
UNION ALL
SELECT 'Stale Data' as alert_type, organization_id::TEXT, stale_client_count::TEXT, oldest_analysis_hours::TEXT, alert_level FROM check_stale_insights() WHERE alert_level != 'OK';
```

---

## ⚡ Performance Optimization Strategies

### 1. Database Index Optimization

Add these indexes if experiencing slow queries:

```sql
-- Optimize activity queries by sentiment
CREATE INDEX CONCURRENTLY idx_activities_sentiment 
ON activities(organization_id, sentiment) 
WHERE sentiment IS NOT NULL;

-- Optimize high-urgency activity queries
CREATE INDEX CONCURRENTLY idx_activities_high_urgency 
ON activities(organization_id, urgency, timestamp DESC) 
WHERE urgency >= 4;

-- Optimize client insights lookup by stage
CREATE INDEX CONCURRENTLY idx_client_insights_stage_score 
ON client_insights(organization_id, stage, engagement_score DESC);

-- Optimize opportunity queries by priority
CREATE INDEX CONCURRENTLY idx_opportunities_priority_status 
ON opportunities(organization_id, priority, status, score DESC);

-- Optimize pattern queries by type and confidence
CREATE INDEX CONCURRENTLY idx_behavioral_patterns_type_confidence 
ON behavioral_patterns(organization_id, client_id, pattern_type, confidence DESC);

-- Composite index for time-based queries
CREATE INDEX CONCURRENTLY idx_activities_org_client_time 
ON activities(organization_id, client_id, timestamp DESC);
```

### 2. Query Optimization Examples

**Before (Slow):**
```sql
-- This query scans entire table
SELECT * FROM activities 
WHERE organization_id = $1 
ORDER BY timestamp DESC;
```

**After (Fast):**
```sql
-- Optimized with LIMIT and proper index usage
SELECT 
    id, timestamp, type, channel, direction, 
    summary, sentiment_label, urgency
FROM activities 
WHERE organization_id = $1 
    AND timestamp > NOW() - INTERVAL '90 days'
ORDER BY timestamp DESC 
LIMIT 100;
```

### 3. Batch Processing Optimization

Update the engagement scorer workflow to use batching:

```javascript
// In engagement-score-updater-v1 workflow
// Instead of processing one by one, batch into groups

const BATCH_SIZE = 50;
const clients = $input.all().map(i => i.json);

// Process in parallel batches
const batches = [];
for (let i = 0; i < clients.length; i += BATCH_SIZE) {
    batches.push(clients.slice(i, i + BATCH_SIZE));
}

// Process all batches concurrently
const results = await Promise.all(
    batches.map(batch => processBatch(batch))
);

return results.flat().map(r => ({ json: r }));
```

### 4. Caching Strategy

Implement caching for frequently accessed data:

```sql
-- Create materialized view for dashboard queries
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT 
    organization_id,
    COUNT(DISTINCT client_id) as total_clients,
    ROUND(AVG(engagement_score), 1) as avg_engagement,
    COUNT(*) FILTER (WHERE churn_risk = 'high') as high_risk_clients,
    COUNT(*) FILTER (WHERE stage = 'committed') as committed_clients
FROM client_insights
GROUP BY organization_id;

-- Create index on materialized view
CREATE INDEX idx_mv_dashboard_stats_org ON mv_dashboard_stats(organization_id);

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (call from N8n schedule trigger)
SELECT refresh_dashboard_stats();
```

---

## 🔐 Security Hardening

### 1. Rate Limiting

Add rate limiting to webhook endpoints by updating workflows:

```javascript
// Add to activity-stream-aggregator-v1 at start of "Validate Input" node

const orgId = $input.item.json.organization_id;
const now = Date.now();
const rateLimitKey = `ratelimit:${orgId}`;

// Check rate limit (example: 100 requests per minute)
const requestCount = await $redis.incr(rateLimitKey);
if (requestCount === 1) {
    await $redis.expire(rateLimitKey, 60); // 60 seconds
}

if (requestCount > 100) {
    throw new Error('Rate limit exceeded. Maximum 100 requests per minute.');
}

// Continue with normal validation...
```

### 2. Input Sanitization

Add comprehensive input validation:

```javascript
// Enhanced validation in "Validate Input" nodes

function sanitizeInput(input) {
    // Remove potentially dangerous characters
    const sanitized = { ...input };
    
    // Sanitize text fields
    if (sanitized.content) {
        sanitized.content = sanitized.content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .trim()
            .substring(0, 10000); // Limit length
    }
    
    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sanitized.organization_id)) {
        throw new Error('Invalid organization_id format');
    }
    
    // Validate enums
    const validTypes = ['email', 'phone', 'sms', 'meeting', 'web_visit', 'property_view', 'social_message', 'form_submission', 'chat_message'];
    if (!validTypes.includes(sanitized.type)) {
        throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    return sanitized;
}

const validated = sanitizeInput($input.item.json);
return { json: validated };
```

### 3. Audit Logging

Create audit trail for sensitive operations:

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org_time ON audit_log(organization_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- Function to log changes
CREATE OR REPLACE FUNCTION log_audit_event(
    p_org_id UUID,
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID,
    p_changes JSONB
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_log (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        changes
    ) VALUES (
        p_org_id,
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_changes
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 AI Model Optimization

### 1. Prompt Engineering for Better Results

Update Gemini prompts in workflows for improved accuracy:

```javascript
// Enhanced prompt for sentiment analysis in activity-stream-aggregator-v1

const enhancedPrompt = `You are an expert real estate CRM analyst. Analyze this client communication carefully.

Activity Details:
- Type: ${$json.type}
- Channel: ${$json.channel}
- Direction: ${$json.direction}
- Content: ${$json.content}

Instructions:
1. Analyze the ACTUAL sentiment expressed (not just polite language)
2. Consider real estate context (urgency, seriousness of intent)
3. Identify specific property interests and requirements
4. Detect life events or triggers (job change, family growth, etc.)

Return ONLY valid JSON (no markdown, no explanations):
{
  "sentiment": -0.8 to 0.8 (be precise, avoid 0),
  "sentiment_label": "negative" | "neutral" | "positive",
  "intent": "brief, specific intent like 'urgent_purchase' or 'casual_browsing'",
  "topics": ["specific", "actionable", "topics"],
  "entities": {
    "names": ["person names mentioned"],
    "locations": ["specific neighborhoods/cities"],
    "properties": ["addresses or property types"],
    "price_points": ["budget mentions"]
  },
  "urgency": 1-5 (1=casual inquiry, 5=immediate need),
  "summary": "One sentence capturing key information",
  "confidence": 0.0-1.0 (how confident are you in this analysis)
}`;
```

### 2. Model Selection Strategy

Create a model router based on task complexity:

```javascript
// Add to workflow for dynamic model selection

function selectModel(task, contentLength) {
    if (task === 'sentiment' && contentLength < 500) {
        return 'gemini-2.0-flash-exp'; // Fast for simple tasks
    } else if (task === 'pattern_analysis' && contentLength > 2000) {
        return 'gemini-2.0-flash-thinking-exp'; // Better for complex reasoning
    } else if (task === 'opportunity_detection') {
        return 'gemini-2.0-flash-exp'; // Good balance
    }
    return 'gemini-2.0-flash-exp'; // Default
}

const model = selectModel('sentiment', $json.content.length);
```

### 3. Response Validation

Add validation for AI responses:

```javascript
// Enhanced AI response validation

function validateAIResponse(response, expectedFields) {
    const parsed = JSON.parse(response);
    
    // Check all required fields exist
    for (const field of expectedFields) {
        if (!(field in parsed)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Validate ranges
    if (parsed.sentiment < -1 || parsed.sentiment > 1) {
        console.warn('Sentiment out of range, clamping');
        parsed.sentiment = Math.max(-1, Math.min(1, parsed.sentiment));
    }
    
    if (parsed.urgency < 1 || parsed.urgency > 5) {
        console.warn('Urgency out of range, clamping');
        parsed.urgency = Math.max(1, Math.min(5, parsed.urgency));
    }
    
    // Validate sentiment_label matches sentiment value
    const expectedLabel = parsed.sentiment > 0.2 ? 'positive' 
                        : parsed.sentiment < -0.2 ? 'negative' 
                        : 'neutral';
    if (parsed.sentiment_label !== expectedLabel) {
        console.warn(`Sentiment label mismatch, correcting to ${expectedLabel}`);
        parsed.sentiment_label = expectedLabel;
    }
    
    return parsed;
}
```

---

## 🎯 Advanced Features

### 1. Multi-Language Support

Add language detection and translation:

```javascript
// Add language detection node before AI analysis

async function detectAndTranslate(content) {
    // Detect language using Google Translate API or similar
    const detectedLang = await detectLanguage(content);
    
    if (detectedLang !== 'en') {
        // Translate to English for analysis
        const translated = await translateText(content, detectedLang, 'en');
        return {
            original_content: content,
            content: translated,
            detected_language: detectedLang,
            translated: true
        };
    }
    
    return {
        content: content,
        detected_language: 'en',
        translated: false
    };
}
```

### 2. Predictive Lead Scoring

Enhance lead scoring with ML predictions:

```sql
-- Create lead score history table
CREATE TABLE lead_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    score INTEGER NOT NULL,
    factors JSONB NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_score_history_client ON lead_score_history(client_id, created_at DESC);

-- Track score changes over time
CREATE OR REPLACE FUNCTION track_score_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.engagement_score IS DISTINCT FROM NEW.engagement_score THEN
        INSERT INTO lead_score_history (
            client_id,
            organization_id,
            score,
            factors,
            model_version
        ) VALUES (
            NEW.client_id,
            NEW.organization_id,
            NEW.engagement_score,
            jsonb_build_object(
                'previous_score', OLD.engagement_score,
                'change', NEW.engagement_score - OLD.engagement_score,
                'churn_risk', NEW.churn_risk,
                'stage', NEW.stage
            ),
            'v1.0'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_engagement_score_changes
AFTER UPDATE ON client_insights
FOR EACH ROW
EXECUTE FUNCTION track_score_change();
```

### 3. A/B Testing Framework

Test different AI prompts and algorithms:

```sql
-- Create experiment tracking table
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE experiment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id),
    variant VARCHAR(1) NOT NULL, -- 'A' or 'B'
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example: Test different sentiment analysis prompts
INSERT INTO experiments (name, description, variant_a, variant_b) VALUES (
    'sentiment_prompt_test_v1',
    'Test concise vs detailed sentiment analysis prompts',
    '{"prompt": "Analyze sentiment: ${content}"}',
    '{"prompt": "You are an expert analyst. Carefully analyze..."}'
);
```

---

## 🚀 Next-Level Optimizations

### Database Connection Pooling

```javascript
// In workflow settings, configure connection pooling
const poolConfig = {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    idle: 10000, // Close idle connections after 10s
    acquire: 30000, // Max time to acquire connection
    evict: 1000 // Check for idle connections every second
};
```

### Async Processing Queue

For heavy workloads, implement queue system:

```sql
-- Create job queue table
CREATE TABLE job_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_queue_pending ON job_queue(status, scheduled_for) 
WHERE status = 'pending';
```

---

## 📊 Success Metrics Dashboard

Create a comprehensive metrics query:

```sql
SELECT 
    'System Health' as category,
    json_build_object(
        'workflow_success_rate', (
            SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2)
            FROM workflow_executions
            WHERE started_at > NOW() - INTERVAL '24 hours'
        ),
        'avg_response_time_ms', (
            SELECT ROUND(AVG(duration_ms), 0)
            FROM workflow_executions
            WHERE status = 'completed' AND started_at > NOW() - INTERVAL '24 hours'
        ),
        'activities_processed_today', (
            SELECT COUNT(*) FROM activities WHERE DATE(created_at) = CURRENT_DATE
        ),
        'ai_analysis_accuracy', (
            SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE processed = true AND processing_error IS NULL) / COUNT(*), 2)
            FROM activities WHERE created_at > NOW() - INTERVAL '24 hours'
        )
    ) as metrics
UNION ALL
SELECT 
    'Business Impact',
    json_build_object(
        'total_opportunities', (SELECT COUNT(*) FROM opportunities WHERE created_at > NOW() - INTERVAL '7 days'),
        'high_priority_opportunities', (SELECT COUNT(*) FROM opportunities WHERE priority = 'critical' AND status IN ('identified', 'reviewed')),
        'avg_engagement_score', (SELECT ROUND(AVG(engagement_score), 1) FROM client_insights),
        'high_risk_clients', (SELECT COUNT(*) FROM client_insights WHERE churn_risk = 'high')
    );
```

---

**Ready to take your CRM Activity Feed system to production? Follow this guide for enterprise-grade performance and reliability!** 🚀