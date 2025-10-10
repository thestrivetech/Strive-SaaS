# Prompt #3: Lead Scoring Engine - N8n Workflow Implementation

## Meta-Analysis

### Current Quality Scores (Original Prompt)
- **Clarity & Specificity:** 6/10 - Clear goals but vague on implementation
- **N8n Implementation Details:** 2/10 - No workflow structure provided
- **Code Completeness:** 1/10 - ML mentioned but no model details, training, or scoring logic
- **Testing & Validation:** 1/10 - No test data or validation methodology
- **Production Readiness:** 3/10 - Missing model versioning, monitoring, retraining strategy
- **Claude AI Best Practices:** 2/10 - No structured implementation approach
- **Overall:** 2.5/10

### Critical Issues Identified
1. **ML model not specified** - States "ML-based" but no algorithm type, features, training data requirements, or prediction method
2. **No scoring factors definition** - Lists categories (demographics, engagement) but no specific metrics, weights, or calculation formula
3. **Real-time vs batch not architected** - Mentions both but doesn't explain the architecture for handling different update frequencies
4. **Feedback loop undefined** - Mentions improving accuracy but no mechanism for collecting actual conversion outcomes and retraining
5. **Predictive analytics vague** - "Conversion probability" and "optimal contact timing" mentioned without any algorithmic approach
6. **Stage automation rules missing** - Mentions lifecycle stages but no thresholds or transition criteria

### Enhancement Strategy
Transform into production-ready specification with:
- **Phase 1 (MVP):** Complete rule-based scoring algorithm with specific weights and formulas
- **Phase 2 (Future):** Path to ML with feature engineering and model training pipeline
- Dual architecture: Real-time event-driven + batch recalculation
- Complete scoring factors with mathematical formulas
- Stage transition engine with clear thresholds
- Feedback loop for continuous improvement
- Performance monitoring and score drift detection

---

## Claude AI Instructions

<instructions>
You are an expert N8n workflow engineer implementing the **Lead Scoring Engine** for a multi-tenant real estate SaaS platform. You have access to N8n via MCP and will create production-ready workflows following all architecture standards.

This is a **hybrid scoring system** with two phases:

**Phase 1 (Immediate Implementation):**
- Rule-based scoring with 12 weighted factors
- Real-time score updates on events (email opens, form submissions, conversation engagement)
- Batch recalculation daily for all leads
- Lifecycle stage automation (cold → warm → hot → client)
- Score history tracking for trend analysis

**Phase 2 (Future Enhancement):**
- ML-based predictive scoring using historical conversion data
- Feature engineering for improved accuracy
- Model training and evaluation pipeline
- A/B testing between rule-based and ML scores

**Your implementation must include:**
- Complete scoring algorithm with 12 factors and specific weights
- Real-time event processor for immediate score updates
- Batch recalculation workflow for daily comprehensive scoring
- Stage transition engine with automation triggers
- Score history tracking and trend analysis
- Feedback loop for tracking conversions
- Comprehensive error handling and monitoring
- Multi-tenant organization isolation
- Performance optimization for high-volume scoring

**Before you begin implementation:**
1. Confirm understanding of scoring factors and weights
2. Verify understanding of real-time vs batch architecture
3. Check for prerequisite workflows (Lead Capture, Lead Nurturing)
4. Ask clarifying questions about conversion definitions and success metrics

**Your thinking process should follow this structure:**

<thinking>
1. Scoring Algorithm Design
   - What are the 12 scoring factors and their individual weights?
   - How do factors combine into a final 0-100 score?
   - What thresholds define letter grades (A, B, C, D, F)?
   - How do we prevent score inflation or deflation over time?

2. Real-Time vs Batch Architecture
   - Which events trigger real-time score updates?
   - Which factors require batch recalculation?
   - How do we handle concurrent score updates?
   - How do we ensure consistency between real-time and batch?

3. Stage Transition Logic
   - What are the criteria for each lifecycle stage?
   - What scores trigger stage transitions?
   - What happens when a lead transitions? (notifications, campaign triggers)
   - How do we prevent rapid stage oscillation?

4. Feedback Loop Design
   - How do we track actual conversions?
   - What data do we collect for model training?
   - How do we measure scoring accuracy over time?
   - When should we retrain or adjust weights?

5. Performance Considerations
   - How many score calculations per second can we handle?
   - How do we batch score updates efficiently?
   - What caching strategies improve performance?
   - How do we handle scoring for 10,000+ leads daily?

6. Path to Machine Learning
   - What features would an ML model use?
   - What training data is required?
   - How would we evaluate model performance?
   - How would we deploy and monitor an ML model?
</thinking>

</instructions>

## Business Context

**Problem Statement:**
Sales teams waste 50-70% of their time on low-quality leads that never convert, while high-potential leads may be overlooked or contacted too late. Manual lead qualification is inconsistent, subjective, and doesn't account for behavioral signals. Without data-driven lead scoring, agents can't prioritize their outreach effectively, leading to poor conversion rates and lost revenue.

**User Story:**
As a real estate agent, I want an intelligent scoring system that automatically evaluates and prioritizes my leads based on their likelihood to convert, so that I can focus my time and energy on the highest-potential prospects and contact them at the optimal moment in their buying journey.

**Success Metrics:**
- 40% increase in agent productivity (time spent on high-quality leads)
- 25% improvement in lead-to-appointment conversion rate
- 30% reduction in time from lead capture to first appointment
- 90%+ scoring accuracy (predicted high-value leads actually convert at higher rates)
- 80% of A-grade leads convert to appointments within 30 days
- Real-time score updates within 5 seconds of events

**Integration Context:**
This workflow integrates with:
- **Lead Capture** (Prompt #1): Calculates initial score when lead is created
- **Lead Nurturing** (Prompt #2): Score changes trigger different campaign sequences
- **CRM Module**: Updates lead records with scores, triggers agent notifications
- **Agent Dashboard**: Displays lead scores, priorities, and trends
- **Analytics System**: Provides scoring accuracy and model performance data

## Prerequisites & Dependencies

**Required Workflows:**
- **Prompt #1: Lead Capture System** - Provides leads with initial qualification data
- **Prompt #2: Lead Nurturing** - Provides engagement metrics (email opens, clicks)

**Required Database Schema:**

```sql
-- ============================================
-- LEAD_SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Current Score
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_grade CHAR(1) NOT NULL CHECK (score_grade IN ('A', 'B', 'C', 'D', 'F')),
  
  -- Score Breakdown (Individual factor contributions)
  demographic_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  qualification_score INTEGER DEFAULT 0,
  behavioral_score INTEGER DEFAULT 0,
  
  -- Factor Details
  score_factors JSONB, -- Detailed breakdown of all 12 factors
  
  -- Lifecycle Stage
  stage VARCHAR(50) DEFAULT 'cold', -- 'cold', 'warm', 'hot', 'client', 'lost'
  previous_stage VARCHAR(50),
  stage_changed_at TIMESTAMP,
  
  -- Trend Analysis
  score_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
  score_velocity INTEGER, -- Points per day change
  days_at_current_stage INTEGER DEFAULT 0,
  
  -- Predictive Fields
  conversion_probability DECIMAL(5,4), -- 0.0000 to 1.0000 (0% to 100%)
  predicted_days_to_conversion INTEGER,
  optimal_contact_time TIME,
  optimal_contact_day VARCHAR(10), -- 'monday', 'tuesday', etc.
  
  -- Model Information
  scoring_method VARCHAR(50) DEFAULT 'rule_based', -- 'rule_based', 'ml_model', 'hybrid'
  model_version VARCHAR(50),
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  calculation_type VARCHAR(50), -- 'initial', 'real_time', 'batch', 'manual'
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_lead_score UNIQUE (lead_id)
);

CREATE INDEX idx_scores_lead ON lead_scores(lead_id);
CREATE INDEX idx_scores_org ON lead_scores(organization_id);
CREATE INDEX idx_scores_grade ON lead_scores(organization_id, score_grade);
CREATE INDEX idx_scores_stage ON lead_scores(organization_id, stage);
CREATE INDEX idx_scores_score ON lead_scores(score DESC);
CREATE INDEX idx_scores_updated ON lead_scores(updated_at DESC);

ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY scores_org_isolation ON lead_scores
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SCORE_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Score Change
  old_score INTEGER,
  new_score INTEGER,
  score_change INTEGER, -- new_score - old_score
  
  -- Grade Change
  old_grade CHAR(1),
  new_grade CHAR(1),
  
  -- Stage Change
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  
  -- Change Reason
  change_reason VARCHAR(100), -- 'email_opened', 'form_submitted', 'batch_recalc', 'manual_update'
  change_details JSONB, -- Additional context about what triggered the change
  
  -- Factor Changes (what drove the score change)
  factor_changes JSONB, -- {"engagement": +5, "qualification": +3}
  
  -- Calculation Details
  calculation_method VARCHAR(50), -- 'rule_based', 'ml_model'
  calculation_time_ms INTEGER,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_lead ON score_history(lead_id, created_at DESC);
CREATE INDEX idx_history_org ON score_history(organization_id, created_at DESC);
CREATE INDEX idx_history_reason ON score_history(change_reason);
CREATE INDEX idx_history_date ON score_history(created_at DESC);

ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY history_org_isolation ON score_history
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- SCORING_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(100) NOT NULL, -- 'email_open', 'email_click', 'form_submit', 'website_visit', etc.
  event_value INTEGER, -- Point value assigned to this event
  event_data JSONB, -- Additional event context
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  score_before INTEGER,
  score_after INTEGER,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'email_open', 'email_click', 'link_click', 'form_submit', 
    'website_visit', 'document_download', 'property_view', 
    'phone_call', 'meeting_scheduled', 'response_received'
  ))
);

CREATE INDEX idx_events_lead ON scoring_events(lead_id, created_at DESC);
CREATE INDEX idx_events_processed ON scoring_events(processed, created_at) WHERE NOT processed;
CREATE INDEX idx_events_type ON scoring_events(organization_id, event_type);

ALTER TABLE scoring_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_org_isolation ON scoring_events
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- CONVERSION_TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversion_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Conversion Details
  converted BOOLEAN DEFAULT false,
  conversion_type VARCHAR(50), -- 'appointment_booked', 'contract_signed', 'closed_deal'
  conversion_date TIMESTAMP,
  days_to_conversion INTEGER,
  
  -- Score at Conversion
  score_at_conversion INTEGER,
  grade_at_conversion CHAR(1),
  stage_at_conversion VARCHAR(50),
  
  -- Prediction vs Actual
  predicted_conversion_probability DECIMAL(5,4),
  predicted_days_to_conversion INTEGER,
  prediction_accuracy_score DECIMAL(5,2), -- How close prediction was to actual
  
  -- Value
  conversion_value DECIMAL(12,2), -- Deal value, commission, etc.
  
  -- Attribution
  primary_touchpoint VARCHAR(100), -- What led to conversion
  touchpoint_count INTEGER, -- Total interactions before conversion
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversions_lead ON conversion_tracking(lead_id);
CREATE INDEX idx_conversions_org ON conversion_tracking(organization_id, converted);
CREATE INDEX idx_conversions_date ON conversion_tracking(conversion_date DESC);

ALTER TABLE conversion_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY conversions_org_isolation ON conversion_tracking
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- SCORING_MODEL_CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Model Identity
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50), -- 'rule_based', 'logistic_regression', 'random_forest', 'neural_network'
  
  -- Configuration
  active BOOLEAN DEFAULT false,
  config JSONB, -- Model-specific configuration (weights, hyperparameters, etc.)
  
  -- Performance Metrics
  accuracy DECIMAL(5,2),
  precision_score DECIMAL(5,2),
  recall_score DECIMAL(5,2),
  f1_score DECIMAL(5,2),
  auc_roc DECIMAL(5,2),
  
  -- Training Info
  training_data_size INTEGER,
  training_date TIMESTAMP,
  validation_date TIMESTAMP,
  
  -- Deployment
  deployed_at TIMESTAMP,
  deployed_by UUID REFERENCES users(id),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_org_model_version UNIQUE (organization_id, model_name, model_version)
);

CREATE INDEX idx_model_config_org ON scoring_model_config(organization_id);
CREATE INDEX idx_model_config_active ON scoring_model_config(organization_id, active) WHERE active = true;

ALTER TABLE scoring_model_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY model_config_org_isolation ON scoring_model_config
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- Helper Functions
-- ============================================

-- Calculate score grade from numeric score
CREATE OR REPLACE FUNCTION calculate_score_grade(p_score INTEGER)
RETURNS CHAR(1) AS $$
BEGIN
  RETURN CASE
    WHEN p_score >= 90 THEN 'A'
    WHEN p_score >= 75 THEN 'B'
    WHEN p_score >= 60 THEN 'C'
    WHEN p_score >= 45 THEN 'D'
    ELSE 'F'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate lifecycle stage from score
CREATE OR REPLACE FUNCTION calculate_lifecycle_stage(p_score INTEGER, p_engagement INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
  -- Hot: High score + recent engagement
  IF p_score >= 80 AND p_engagement > 0 THEN
    RETURN 'hot';
  -- Warm: Medium score or some engagement
  ELSIF p_score >= 60 OR p_engagement > 0 THEN
    RETURN 'warm';
  -- Cold: Low score and no engagement
  ELSE
    RETURN 'cold';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to log score changes
CREATE OR REPLACE FUNCTION log_score_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if score actually changed
  IF OLD.score != NEW.score OR OLD.stage != NEW.stage THEN
    INSERT INTO score_history (
      organization_id,
      lead_id,
      old_score,
      new_score,
      score_change,
      old_grade,
      new_grade,
      old_stage,
      new_stage,
      change_reason,
      calculation_method
    ) VALUES (
      NEW.organization_id,
      NEW.lead_id,
      OLD.score,
      NEW.score,
      NEW.score - OLD.score,
      OLD.score_grade,
      NEW.score_grade,
      OLD.stage,
      NEW.stage,
      NEW.calculation_type,
      NEW.scoring_method
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_score_changes
AFTER UPDATE ON lead_scores
FOR EACH ROW
EXECUTE FUNCTION log_score_change();
```

**Required API Access:**
- **Supabase API**: Database access for all scoring operations
- **OpenAI API** (Optional - Phase 2): For ML-based scoring predictions

**Required N8n Credentials:**
- `supabase_main`: Supabase project URL + service key

**Required Environment Variables:**
```bash
N8N_SCORING_METHOD=rule_based # or 'ml_model', 'hybrid'
N8N_HOT_LEAD_THRESHOLD=80 # Score that triggers "hot" classification
N8N_BATCH_SCORE_HOUR=2 # Hour to run daily batch scoring (2 AM)
N8N_SCORE_DECAY_ENABLED=true # Whether to decay scores for inactive leads
N8N_SCORE_DECAY_DAYS=30 # Days of inactivity before score decay
```

---

## Technical Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                    LEAD SCORING ENGINE                            │
│                     (4 Workflows)                                  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ WORKFLOW 1: REAL-TIME SCORE CALCULATOR                            │
│                                                                   │
│ Triggered by: Events (email open, form submit, etc.)             │
│   ↓                                                               │
│ Load Lead Data → Load Current Score → Calculate Factor Change    │
│   ↓                                                               │
│ Update Score → Determine Grade & Stage → Check Thresholds        │
│   ↓                                                               │
│ If Stage Changed → Trigger Automations (notify agent, etc.)      │
│   ↓                                                               │
│ Log Score History → Update Lead Record → Return New Score        │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ WORKFLOW 2: BATCH SCORE RECALCULATOR (Daily at 2 AM)             │
│                                                                   │
│ Load All Active Leads → For Each Lead:                           │
│   ↓                                                               │
│ Calculate Complete Score (all 12 factors)                        │
│   ↓                                                               │
│ Compare to Current Score → If Changed:                           │
│   → Update lead_scores table                                     │
│   → Log to score_history                                         │
│   → Check for stage transitions                                  │
│   ↓                                                               │
│ Apply Score Decay (for inactive leads)                           │
│   ↓                                                               │
│ Generate Scoring Report → Email to Admins                        │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ WORKFLOW 3: STAGE TRANSITION HANDLER                              │
│                                                                   │
│ Triggered by: Score updates that change stage                    │
│   ↓                                                               │
│ Determine Stage Transition (cold→warm, warm→hot, etc.)           │
│   ↓                                                               │
│ Execute Stage-Specific Actions:                                  │
│   - cold → warm: Start nurture campaign                          │
│   - warm → hot: Alert assigned agent immediately                 │
│   - hot → client: Trigger onboarding sequence                    │
│   ↓                                                               │
│ Update Lead Status → Log Activity → Send Notifications           │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ WORKFLOW 4: SCORING ACCURACY TRACKER                              │
│                                                                   │
│ Triggered by: Lead conversion events                             │
│   ↓                                                               │
│ Record Conversion → Capture Score at Conversion                  │
│   ↓                                                               │
│ Calculate Prediction Accuracy (predicted vs actual)              │
│   ↓                                                               │
│ Update Conversion Tracking Table                                 │
│   ↓                                                               │
│ Aggregate Accuracy Metrics → Store in Model Config               │
│   ↓                                                               │
│ If Accuracy < Threshold → Alert for Model Retraining             │
└───────────────────────────────────────────────────────────────────┘
```

---

## WORKFLOW 1: Real-Time Score Calculator

### Purpose
Updates lead scores in real-time when scoring events occur (email opens, form submissions, etc.).

### Complete Node Structure

#### Node 1: Webhook Trigger

```json
{
  "id": "scoring_event_webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "/api/scoring/event",
    "responseMode": "responseNode"
  }
}
```

**Input Schema:**
```json
{
  "organization_id": "uuid - Required",
  "lead_id": "uuid - Required",
  "event_type": "string - Required - email_open|email_click|form_submit|website_visit|etc",
  "event_data": {
    "campaign_id": "uuid - Optional",
    "email_id": "uuid - Optional",
    "url_clicked": "string - Optional",
    "form_id": "string - Optional",
    "page_url": "string - Optional"
  },
  "timestamp": "ISO8601 - Optional"
}
```

#### Node 2: Validate & Log Event

```json
{
  "id": "validate_scoring_event",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
```

**Complete Function Code:**
```javascript
// ============================================
// VALIDATE SCORING EVENT & DETERMINE POINT VALUE
// ============================================

const input = $input.first().json;
const { organization_id, lead_id, event_type, event_data = {}, timestamp } = input;

// Validation
const errors = [];
if (!organization_id) errors.push('organization_id required');
if (!lead_id) errors.push('lead_id required');
if (!event_type) errors.push('event_type required');

const validEventTypes = [
  'email_open', 'email_click', 'link_click', 'form_submit',
  'website_visit', 'document_download', 'property_view',
  'phone_call', 'meeting_scheduled', 'response_received'
];

if (!validEventTypes.includes(event_type)) {
  errors.push(`Invalid event_type. Must be one of: ${validEventTypes.join(', ')}`);
}

if (errors.length > 0) {
  return {
    json: {
      success: false,
      error: 'Validation failed',
      validation_errors: errors,
      code: 400
    }
  };
}

// ============================================
// SCORING EVENT VALUES
// Point values for each event type
// ============================================
const EVENT_POINT_VALUES = {
  // Email Engagement
  'email_open': 2,
  'email_click': 5,
  'link_click': 3,
  
  // Website Engagement
  'website_visit': 3,
  'property_view': 5,
  'document_download': 7,
  
  // Direct Engagement
  'form_submit': 10,
  'phone_call': 15,
  'meeting_scheduled': 20,
  'response_received': 8
};

const eventValue = EVENT_POINT_VALUES[event_type] || 0;

// Prepare event record for database
const eventRecord = {
  organization_id,
  lead_id,
  event_type,
  event_value: eventValue,
  event_data: event_data,
  processed: false,
  created_at: timestamp || new Date().toISOString()
};

return {
  json: {
    ...input,
    event_value: eventValue,
    event_record: eventRecord,
    validated: true
  }
};
```

#### Node 3: Insert Scoring Event

```json
{
  "id": "insert_scoring_event",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [650, 300],
  "parameters": {
    "operation": "insert",
    "table": "scoring_events",
    "data": {
      "fields": [
        {"fieldName": "organization_id", "fieldValue": "={{ $json.organization_id }}"},
        {"fieldName": "lead_id", "fieldValue": "={{ $json.lead_id }}"},
        {"fieldName": "event_type", "fieldValue": "={{ $json.event_type }}"},
        {"fieldName": "event_value", "fieldValue": "={{ $json.event_value }}"},
        {"fieldName": "event_data", "fieldValue": "={{ JSON.stringify($json.event_data) }}"},
        {"fieldName": "processed", "fieldValue": "false"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
```

#### Node 4: Load Lead Data & Current Score

```json
{
  "id": "load_lead_and_score",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
```

**Complete Function Code:**
```javascript
// ============================================
// LOAD LEAD DATA AND CURRENT SCORE
// ============================================

const input = $input.first().json;
const originalData = $('validate_scoring_event').first().json;

// We'll need to fetch:
// 1. Lead data (for demographic and qualification factors)
// 2. Current score (to calculate delta)
// 3. Recent engagement events (for engagement factor)

return {
  json: {
    ...originalData,
    _queries_needed: {
      lead_data: {
        table: 'leads',
        filters: {
          id: originalData.lead_id,
          organization_id: originalData.organization_id
        }
      },
      current_score: {
        table: 'lead_scores',
        filters: {
          lead_id: originalData.lead_id,
          organization_id: originalData.organization_id
        }
      },
      recent_events: {
        table: 'scoring_events',
        filters: {
          lead_id: originalData.lead_id,
          created_at_gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
        }
      }
    }
  }
};
```

#### Node 5: Supabase - Load Lead Data

```json
{
  "id": "load_lead",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1050, 300],
  "parameters": {
    "operation": "select",
    "table": "leads",
    "select": "*",
    "filterByFields": {
      "fields": [
        {"fieldName": "id", "fieldValue": "={{ $json.lead_id }}"},
        {"fieldName": "organization_id", "fieldValue": "={{ $json.organization_id }}"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
```

#### Node 6: Supabase - Load Current Score

```json
{
  "id": "load_current_score",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1250, 300],
  "parameters": {
    "operation": "select",
    "table": "lead_scores",
    "select": "*",
    "filterByFields": {
      "fields": [
        {"fieldName": "lead_id", "fieldValue": "={{ $json.id }}"},
        {"fieldName": "organization_id", "fieldValue": "={{ $json.organization_id }}"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
```

#### Node 7: Calculate Updated Score

```json
{
  "id": "calculate_new_score",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1450, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
```

**Complete Function Code:**
```javascript
// ============================================
// COMPLETE LEAD SCORING ALGORITHM
// ============================================

const leadData = $('load_lead').first().json;
const currentScoreData = $('load_current_score').first().json;
const eventData = $('validate_scoring_event').first().json;

const startTime = Date.now();

// ============================================
// SCORING FACTORS (Total: 100 points)
// ============================================

let score = 0;
const factorBreakdown = {};

// --------------------------------------------
// CATEGORY 1: DEMOGRAPHIC FACTORS (25 points)
// --------------------------------------------
let demographicScore = 0;

// 1.1 Contact Completeness (10 points)
if (leadData.name) demographicScore += 3;
if (leadData.email) demographicScore += 4;
if (leadData.phone) demographicScore += 3;
factorBreakdown.contact_completeness = demographicScore;

// 1.2 Location Alignment (8 points)
// If lead's location preferences match properties we have
if (leadData.location_preferences && leadData.location_preferences.length > 0) {
  demographicScore += 8;
}
factorBreakdown.location_alignment = leadData.location_preferences ? 8 : 0;

// 1.3 Lead Type Clarity (7 points)
const leadTypeScores = {
  'buyer': 7,
  'seller': 7,
  'investor': 6,
  'referral': 5,
  'other': 2
};
const leadTypeScore = leadTypeScores[leadData.lead_type] || 0;
demographicScore += leadTypeScore;
factorBreakdown.lead_type_clarity = leadTypeScore;

score += demographicScore;

// --------------------------------------------
// CATEGORY 2: QUALIFICATION FACTORS (35 points)
// --------------------------------------------
let qualificationScore = 0;

// 2.1 Budget Qualification (15 points)
if (leadData.budget_qualified) {
  qualificationScore += 10; // Has budget info
  
  // Bonus for realistic budget
  if (leadData.budget_min >= 100000) {
    qualificationScore += 5; // Qualified budget amount
  }
}
factorBreakdown.budget_qualification = leadData.budget_qualified ? 15 : 0;

// 2.2 Timeline Urgency (15 points)
const timelineScores = {
  'immediate': 15,
  '1-3_months': 12,
  '3-6_months': 9,
  '6-12_months': 5,
  'just_browsing': 0
};
const timelineScore = timelineScores[leadData.timeline] || 0;
qualificationScore += timelineScore;
factorBreakdown.timeline_urgency = timelineScore;

// 2.3 Authority Level (5 points)
if (leadData.authority_level === 'decision_maker') {
  qualificationScore += 5;
} else if (leadData.authority_level === 'influencer') {
  qualificationScore += 2;
}
factorBreakdown.authority_level = leadData.authority_level === 'decision_maker' ? 5 : (leadData.authority_level === 'influencer' ? 2 : 0);

score += qualificationScore;

// --------------------------------------------
// CATEGORY 3: ENGAGEMENT FACTORS (25 points)
// --------------------------------------------
let engagementScore = 0;

// 3.1 Recent Activity (10 points)
// Add points from current event
engagementScore += Math.min(eventData.event_value, 10);
factorBreakdown.recent_activity = Math.min(eventData.event_value, 10);

// 3.2 Email Engagement (8 points)
// Check email interaction metrics from lead record
const emailOpens = leadData.interaction_count || 0;
if (emailOpens >= 5) {
  engagementScore += 8;
} else if (emailOpens >= 3) {
  engagementScore += 5;
} else if (emailOpens >= 1) {
  engagementScore += 2;
}
factorBreakdown.email_engagement = emailOpens >= 5 ? 8 : (emailOpens >= 3 ? 5 : (emailOpens >= 1 ? 2 : 0));

// 3.3 Response Rate (7 points)
// If lead has responded to any outreach
const lastInteraction = leadData.last_interaction_at;
if (lastInteraction) {
  const daysSinceInteraction = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceInteraction <= 7) {
    engagementScore += 7; // Recent interaction
  } else if (daysSinceInteraction <= 14) {
    engagementScore += 5;
  } else if (daysSinceInteraction <= 30) {
    engagementScore += 3;
  }
}
factorBreakdown.response_recency = lastInteraction ? 7 : 0;

score += engagementScore;

// --------------------------------------------
// CATEGORY 4: BEHAVIORAL FACTORS (15 points)
// --------------------------------------------
let behavioralScore = 0;

// 4.1 Property Interest (8 points)
// If lead has viewed properties, downloaded docs, etc.
if (eventData.event_type === 'property_view' || eventData.event_type === 'document_download') {
  behavioralScore += 8;
}
factorBreakdown.property_interest = (eventData.event_type === 'property_view' || eventData.event_type === 'document_download') ? 8 : 0;

// 4.2 Meeting Scheduled (7 points)
if (eventData.event_type === 'meeting_scheduled') {
  behavioralScore += 7;
}
factorBreakdown.meeting_scheduled = eventData.event_type === 'meeting_scheduled' ? 7 : 0;

score += behavioralScore;

// ============================================
// SCORE ADJUSTMENTS
// ============================================

// Bonus for multiple high-value actions
if (engagementScore >= 20 && qualificationScore >= 25) {
  score += 5; // Highly engaged + qualified
  factorBreakdown.engagement_bonus = 5;
}

// Penalty for stale leads (no interaction in 60+ days)
if (lastInteraction) {
  const daysSinceInteraction = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceInteraction > 60) {
    score -= 10; // Inactive penalty
    factorBreakdown.inactivity_penalty = -10;
  }
}

// Ensure score is within 0-100 range
score = Math.max(0, Math.min(100, score));

// ============================================
// CALCULATE GRADE & STAGE
// ============================================

let grade;
if (score >= 90) grade = 'A';
else if (score >= 75) grade = 'B';
else if (score >= 60) grade = 'C';
else if (score >= 45) grade = 'D';
else grade = 'F';

// Determine lifecycle stage
let stage;
if (score >= 80 && engagementScore > 10) {
  stage = 'hot';
} else if (score >= 60 || engagementScore > 5) {
  stage = 'warm';
} else {
  stage = 'cold';
}

// Check if stage changed
const previousStage = currentScoreData.stage || 'cold';
const stageChanged = stage !== previousStage;

// Calculate score change
const previousScore = currentScoreData.score || 0;
const scoreChange = score - previousScore;

// Calculate score trend
let scoreTrend = 'stable';
if (scoreChange > 5) scoreTrend = 'increasing';
else if (scoreChange < -5) scoreTrend = 'decreasing';

// ============================================
// PREDICTIVE ANALYTICS
// ============================================

// Simple conversion probability based on score and stage
let conversionProbability = 0;
if (grade === 'A') conversionProbability = 0.85;
else if (grade === 'B') conversionProbability = 0.65;
else if (grade === 'C') conversionProbability = 0.40;
else if (grade === 'D') conversionProbability = 0.20;
else conversionProbability = 0.10;

// Predicted days to conversion (rough estimate)
let predictedDaysToConversion = null;
if (stage === 'hot') predictedDaysToConversion = 7;
else if (stage === 'warm') predictedDaysToConversion = 21;
else if (stage === 'cold') predictedDaysToConversion = 60;

// Optimal contact time (based on engagement patterns)
// Default to 10 AM if no data
const optimalContactTime = '10:00:00';
const optimalContactDay = 'tuesday'; // Studies show Tuesday is best

// ============================================
// RETURN CALCULATED SCORE
// ============================================

const calculationTime = Date.now() - startTime;

return {
  json: {
    ...leadData,
    _score_calculation: {
      score,
      score_grade: grade,
      previous_score: previousScore,
      score_change: scoreChange,
      stage,
      previous_stage: previousStage,
      stage_changed: stageChanged,
      score_trend: scoreTrend,
      
      // Factor breakdown
      demographic_score: demographicScore,
      qualification_score: qualificationScore,
      engagement_score: engagementScore,
      behavioral_score: behavioralScore,
      score_factors: factorBreakdown,
      
      // Predictive
      conversion_probability: conversionProbability,
      predicted_days_to_conversion: predictedDaysToConversion,
      optimal_contact_time: optimalContactTime,
      optimal_contact_day: optimalContactDay,
      
      // Metadata
      scoring_method: 'rule_based',
      model_version: 'v1.0',
      calculation_type: 'real_time',
      calculation_time_ms: calculationTime,
      last_calculated_at: new Date().toISOString()
    }
  }
};
```

#### Node 8: Supabase - Update Score

```json
{
  "id": "update_lead_score",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1650, 300],
  "parameters": {
    "operation": "upsert",
    "table": "lead_scores",
    "data": {
      "fields": [
        {"fieldName": "organization_id", "fieldValue": "={{ $json.organization_id }}"},
        {"fieldName": "lead_id", "fieldValue": "={{ $json.id }}"},
        {"fieldName": "score", "fieldValue": "={{ $json._score_calculation.score }}"},
        {"fieldName": "score_grade", "fieldValue": "={{ $json._score_calculation.score_grade }}"},
        {"fieldName": "demographic_score", "fieldValue": "={{ $json._score_calculation.demographic_score }}"},
        {"fieldName": "engagement_score", "fieldValue": "={{ $json._score_calculation.engagement_score }}"},
        {"fieldName": "qualification_score", "fieldValue": "={{ $json._score_calculation.qualification_score }}"},
        {"fieldName": "behavioral_score", "fieldValue": "={{ $json._score_calculation.behavioral_score }}"},
        {"fieldName": "score_factors", "fieldValue": "={{ JSON.stringify($json._score_calculation.score_factors) }}"},
        {"fieldName": "stage", "fieldValue": "={{ $json._score_calculation.stage }}"},
        {"fieldName": "previous_stage", "fieldValue": "={{ $json._score_calculation.previous_stage }}"},
        {"fieldName": "score_trend", "fieldValue": "={{ $json._score_calculation.score_trend }}"},
        {"fieldName": "conversion_probability", "fieldValue": "={{ $json._score_calculation.conversion_probability }}"},
        {"fieldName": "predicted_days_to_conversion", "fieldValue": "={{ $json._score_calculation.predicted_days_to_conversion }}"},
        {"fieldName": "optimal_contact_time", "fieldValue": "={{ $json._score_calculation.optimal_contact_time }}"},
        {"fieldName": "optimal_contact_day", "fieldValue": "={{ $json._score_calculation.optimal_contact_day }}"},
        {"fieldName": "scoring_method", "fieldValue": "rule_based"},
        {"fieldName": "model_version", "fieldValue": "v1.0"},
        {"fieldName": "last_calculated_at", "fieldValue": "={{ $now }}"},
        {"fieldName": "calculation_type", "fieldValue": "real_time"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
```

#### Node 9: Update Lead Record

```json
{
  "id": "update_lead_with_score",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1850, 300],
  "parameters": {
    "operation": "update",
    "table": "leads",
    "data": {
      "fields": [
        {"fieldName": "score", "fieldValue": "={{ $json._score_calculation.score }}"},
        {"fieldName": "score_grade", "fieldValue": "={{ $json._score_calculation.score_grade }}"},
        {"fieldName": "score_updated_at", "fieldValue": "={{ $now }}"},
        {"fieldName": "priority", "fieldValue": "={{ $json._score_calculation.score >= 80 ? 'urgent' : ($json._score_calculation.score >= 60 ? 'high' : 'medium') }}"}
      ]
    },
    "options": {
      "whereClause": "id = '{{ $json.id }}'"
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
```

#### Node 10: Check for Stage Change

```json
{
  "id": "check_stage_change",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [2050, 300],
  "parameters": {
    "rules": {
      "rules": [{
        "operation": "equal",
        "value1": "={{ $json._score_calculation.stage_changed }}",
        "value2": true,
        "output": 0
      }]
    },
    "fallbackOutput": 1
  }
}
```

#### Node 11: Trigger Stage Transition Workflow (Output 0)

```json
{
  "id": "trigger_stage_transition",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 1,
  "position": [2250, 250],
  "parameters": {
    "method": "POST",
    "url": "http://n8n.local/webhook/stage-transition",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [],
      "jsonRawBody": "={{ JSON.stringify({organization_id: $json.organization_id, lead_id: $json.id, old_stage: $json._score_calculation.previous_stage, new_stage: $json._score_calculation.stage, score: $json._score_calculation.score}) }}"
    }
  }
}
```

#### Node 12: Response

```json
{
  "id": "scoring_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [2450, 300],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({success: true, lead_id: $json.id, score: $json._score_calculation.score, grade: $json._score_calculation.score_grade, stage: $json._score_calculation.stage, score_change: $json._score_calculation.score_change}) }}"
  }
}
```

---

## WORKFLOW 2: Batch Score Recalculator

### Purpose
Runs daily at 2 AM to recalculate scores for all active leads, applying comprehensive scoring and score decay.

### Trigger: Cron Schedule

```json
{
  "id": "batch_schedule",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "rule": {
      "interval": [{
        "field": "cronExpression",
        "expression": "0 2 * * *"
      }]
    }
  }
}
```

### Key Processing Steps

1. **Load All Active Leads** - Query leads WHERE status NOT IN ('converted', 'lost')
2. **For Each Lead** - Calculate complete score using same algorithm as real-time
3. **Apply Score Decay** - Reduce score for leads inactive > 30 days
4. **Update Scores** - Batch update lead_scores table
5. **Detect Anomalies** - Flag leads with significant score changes
6. **Generate Report** - Email summary to admins

### Score Decay Logic

```javascript
// Apply decay to inactive leads
const daysSinceLastInteraction = calculateDaysSince(lead.last_interaction_at);

if (daysSinceLastInteraction > 30) {
  const decayFactor = Math.min((daysSinceLastInteraction - 30) / 30, 0.5); // Max 50% decay
  score = Math.round(score * (1 - decayFactor));
}
```

---

## WORKFLOW 3: Stage Transition Handler

### Purpose
Executes automations when leads transition between lifecycle stages.

### Trigger: Webhook from Score Calculator

### Stage Transition Actions

```javascript
const STAGE_TRANSITIONS = {
  'cold_to_warm': {
    actions: [
      'start_nurture_campaign',
      'log_activity'
    ]
  },
  'warm_to_hot': {
    actions: [
      'alert_agent_immediately',
      'increase_follow_up_frequency',
      'add_to_high_priority_queue',
      'log_activity'
    ]
  },
  'hot_to_client': {
    actions: [
      'trigger_onboarding_sequence',
      'assign_success_manager',
      'send_welcome_package',
      'log_conversion'
    ]
  },
  'any_to_lost': {
    actions: [
      'remove_from_all_campaigns',
      'archive_lead',
      'log_reason'
    ]
  }
};
```

---

## WORKFLOW 4: Scoring Accuracy Tracker

### Purpose
Tracks conversion outcomes and calculates scoring accuracy over time.

### Trigger: Lead Conversion Event

### Processing:
1. Receive conversion event (appointment booked, contract signed, etc.)
2. Lookup lead's score at time of conversion
3. Calculate prediction accuracy
4. Store in conversion_tracking table
5. Update aggregate accuracy metrics
6. If accuracy drops below threshold, alert for model retraining

---

## Testing & Validation

### Test Case 1: Score Calculation Accuracy

```javascript
// Test data
const testLead = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  lead_type: 'buyer',
  budget_min: 400000,
  budget_max: 500000,
  budget_qualified: true,
  timeline: '1-3_months',
  authority_level: 'decision_maker',
  location_preferences: ['Austin', 'TX'],
  interaction_count: 5,
  last_interaction_at: new Date().toISOString()
};

const testEvent = {
  event_type: 'property_view',
  event_value: 5
};

// Expected score breakdown:
// Demographics: 25 points (3+4+3+8+7)
// Qualification: 35 points (15+12+5)
// Engagement: 17 points (5+8+4)
// Behavioral: 8 points (property view)
// Bonus: 5 points (engaged + qualified)
// Total: 90 points (Grade A, Stage: hot)

// Execute scoring
POST /webhook/api/scoring/event
{
  "organization_id": "test-org",
  "lead_id": "test-lead",
  "event_type": "property_view"
}

// Verify
SELECT * FROM lead_scores WHERE lead_id = 'test-lead';
// Expected: score = 90, grade = 'A', stage = 'hot'
```

### Test Case 2: Stage Transitions

```javascript
// Scenario: Lead moves from cold → warm → hot
// Initial: score = 40 (cold)

// Event 1: Email open (+2)
POST /webhook/api/scoring/event {...}
// Expected: score = 42 (still cold)

// Event 2: Form submission (+10)
POST /webhook/api/scoring/event {...}
// Expected: score = 52 (warm), stage transition triggered

// Event 3: Meeting scheduled (+20)
POST /webhook/api/scoring/event {...}
// Expected: score = 72 (still warm)

// Event 4: Property view (+5) + engagement bonus
POST /webhook/api/scoring/event {...}
// Expected: score = 82 (hot), stage transition triggered, agent alerted

// Verify stage transitions logged
SELECT * FROM score_history 
WHERE lead_id = 'test-lead'
ORDER BY created_at DESC;

// Expected: 2 stage change records
```

### Test Case 3: Score Decay

```javascript
// Create lead with last_interaction_at = 90 days ago
// Initial score = 80

// Run batch recalculator
// Expected decay: 90 days - 30 days = 60 days inactive
// Decay factor: min(60/30, 0.5) = 0.5 (50% decay)
// New score: 80 * (1 - 0.5) = 40

// Verify
SELECT * FROM lead_scores WHERE lead_id = 'inactive-lead';
// Expected: score = 40, stage changed from hot to warm
```

### Test Case 4: Conversion Tracking

```javascript
// Lead converts with score = 85
POST /webhook/lead-converted
{
  "lead_id": "test-lead",
  "conversion_type": "contract_signed",
  "conversion_value": 12000
}

// Verify conversion tracking
SELECT * FROM conversion_tracking WHERE lead_id = 'test-lead';

// Expected:
// - converted = true
// - score_at_conversion = 85
// - grade_at_conversion = 'A'
// - conversion recorded with timestamp
```

---

## Performance Optimization

### Batch Processing
```javascript
// Process leads in batches of 100
const BATCH_SIZE = 100;
const totalLeads = await getActiveLeadCount();
const batches = Math.ceil(totalLeads / BATCH_SIZE);

for (let i = 0; i < batches; i++) {
  const leads = await getLeadBatch(i * BATCH_SIZE, BATCH_SIZE);
  await processScoreBatch(leads);
}
```

### Caching
```javascript
// Cache scoring model config
const MODEL_CONFIG_CACHE_TTL = 3600; // 1 hour
const cachedConfig = await redis.get('scoring_model_config');

if (!cachedConfig) {
  const config = await fetchModelConfig();
  await redis.set('scoring_model_config', JSON.stringify(config), 'EX', MODEL_CONFIG_CACHE_TTL);
}
```

### Database Optimization
```sql
-- Optimize score queries
CREATE INDEX idx_scores_org_grade ON lead_scores(organization_id, score_grade);
CREATE INDEX idx_scores_stage_score ON lead_scores(stage, score DESC);

-- Partition score_history by month for faster queries
CREATE TABLE score_history_2025_10 PARTITION OF score_history
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

---

## Future Enhancements (Phase 2: ML-Based Scoring)

### ML Model Implementation Plan

**Step 1: Feature Engineering**
```python
features = [
  # Demographic
  'has_email', 'has_phone', 'location_match',
  
  # Qualification
  'budget_qualified', 'timeline_score', 'authority_score',
  
  # Engagement
  'email_open_rate', 'email_click_rate', 'days_since_last_interaction',
  'total_interactions', 'response_rate',
  
  # Behavioral
  'property_views', 'document_downloads', 'meetings_scheduled',
  
  # Temporal
  'days_since_creation', 'time_of_day_preference', 'day_of_week_preference',
  
  # Historical
  'conversion_rate_similar_leads', 'average_days_to_convert'
]
```

**Step 2: Model Selection**
- Start with Logistic Regression (interpretable baseline)
- Test Random Forest (non-linear relationships)
- Evaluate XGBoost (best performance typically)

**Step 3: Training Pipeline**
```javascript
// N8n workflow for model training
1. Extract training data (historical leads + conversion outcomes)
2. Feature engineering
3. Train/test split (80/20)
4. Model training
5. Hyperparameter tuning
6. Model evaluation (precision, recall, F1, AUC-ROC)
7. If performance > threshold, deploy new model
8. A/B test against rule-based scoring
```

**Step 4: Model Deployment**
```javascript
// Store model in Supabase
INSERT INTO scoring_model_config (
  organization_id,
  model_name,
  model_version,
  model_type,
  config,
  accuracy,
  deployed_at,
  active
) VALUES (...);

// Use model for scoring
const modelConfig = await loadActiveModel(organization_id);
const features = extractFeatures(leadData);
const prediction = await predictScore(features, modelConfig);
```

---

## Documentation

### Scoring Factor Reference

| Factor | Category | Max Points | Description |
|--------|----------|------------|-------------|
| Contact Completeness | Demographic | 10 | Name (3), Email (4), Phone (3) |
| Location Alignment | Demographic | 8 | Preferences match available properties |
| Lead Type Clarity | Demographic | 7 | Clear buyer/seller/investor type |
| Budget Qualification | Qualification | 15 | Has budget + realistic amount |
| Timeline Urgency | Qualification | 15 | Immediate (15) to Just Browsing (0) |
| Authority Level | Qualification | 5 | Decision maker vs influencer |
| Recent Activity | Engagement | 10 | Event points (max 10) |
| Email Engagement | Engagement | 8 | Open/click history |
| Response Recency | Engagement | 7 | Last interaction within 7 days |
| Property Interest | Behavioral | 8 | Viewed properties or docs |
| Meeting Scheduled | Behavioral | 7 | Booked appointment |
| Engagement Bonus | Bonus | 5 | Highly engaged + qualified |

### Score Grades

- **A (90-100):** Hot lead, immediate follow-up required
- **B (75-89):** Warm lead, prioritize outreach
- **C (60-74):** Moderate lead, nurture with campaigns
- **D (45-59):** Cold lead, long-term nurturing
- **F (0-44):** Very cold, minimal resources

### Lifecycle Stages

- **Cold:** Low score, no recent engagement
- **Warm:** Moderate score or some engagement
- **Hot:** High score + recent engagement, ready to convert
- **Client:** Converted (signed contract)
- **Lost:** Disqualified or went with competitor

---

## Success Criteria

**Functionality:**
- ✅ Real-time score updates within 5 seconds of events
- ✅ Batch recalculation completes for 10,000+ leads in <30 minutes
- ✅ Stage transitions trigger appropriate automations
- ✅ Score history tracked for trend analysis
- ✅ Conversion tracking enables accuracy measurement

**Accuracy:**
- ✅ A-grade leads convert at 70%+ rate
- ✅ B-grade leads convert at 50%+ rate
- ✅ Predicted conversion probability within ±20% of actual
- ✅ Stage classifications match agent assessments 85%+ of time

**Performance:**
- ✅ Real-time scoring: <5 seconds per calculation
- ✅ Batch scoring: 100+ leads per minute
- ✅ Database queries: <50ms per query
- ✅ No score calculation failures

**Operations:**
- ✅ Daily scoring report generated and delivered
- ✅ Anomaly detection alerts configured
- ✅ Model performance monitored monthly
- ✅ Documentation complete for future ML implementation

---

This completes Enhanced Prompt #3: Lead Scoring Engine with complete rule-based scoring, stage automation, and a clear path to ML-based scoring in the future!