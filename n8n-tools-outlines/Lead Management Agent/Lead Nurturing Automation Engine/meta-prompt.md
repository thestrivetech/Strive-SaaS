<instructions>
You are an expert N8n workflow engineer implementing the **Lead Nurturing Automation Engine** for a multi-tenant real estate SaaS platform. You have access to N8n via MCP and will create production-ready workflows following all architecture standards.
This is a complex multi-workflow system consisting of:

Campaign Manager Workflow - CRUD operations for campaigns, sequences, messages
Behavior Tracking Workflow - Captures email opens, clicks, website visits
Trigger Processor Workflow - Evaluates conditions and starts sequences
Message Scheduler Workflow - Calculates optimal send times and queues messages
Email Sender Workflow - Delivers emails via SendGrid/Mailgun with retry logic
Performance Analyzer Workflow - Tracks metrics and generates reports

Your implementation must include:

Complete database schema for campaigns, sequences, messages, sends, events
Multi-workflow orchestration with proper dependencies
Behavioral event capture and processing
Content personalization engine with property recommendations
A/B testing framework with variant management
Send time optimization algorithm
Email deliverability tracking (opens, clicks, bounces, unsubscribes)
Comprehensive error handling and retry logic
Multi-tenant organization isolation
Performance optimization for high-volume sends

Before you begin implementation:

Confirm understanding of multi-workflow architecture
Verify understanding of email deliverability best practices
Check for prerequisite workflows (Lead Capture - Prompt #1)
Ask clarifying questions about campaign types and sequences

Your thinking process should follow this structure:
<thinking>
1. System Architecture Analysis
   - How do the 6 workflows interact and pass data?
   - What triggers each workflow and in what order?
   - How is state maintained across workflow executions?
   - What are the data dependencies between workflows?

Campaign Structure Design

How are campaigns, sequences, and messages modeled?
What branching logic is needed (if/then conditions)?
How do we handle unsubscribes and preferences?
How is A/B testing configured and tracked?


Behavioral Tracking Strategy

How do we track email opens (pixel tracking)?
How do we track link clicks (redirect tracking)?
How do we attribute website visits to campaigns?
How do we prevent double-counting events?


Personalization Engine

What data drives content selection?
How do we match properties to lead preferences?
How do we generate market updates relevant to their area?
How do we maintain freshness without repetition?


Send Time Optimization

What signals indicate optimal send time?
How do we respect time zones?
How do we handle frequency capping?
How do we batch sends for efficiency?


Performance & Scaling

How many emails per hour can we send?
How do we queue and batch sends?
What happens if email provider fails?
How do we handle retries without duplicates?
</thinking>




</instructions>
Business Context
Problem Statement:
Real estate leads require 5-12 touchpoints before converting to appointments, but manual follow-up is time-consuming, inconsistent, and often delayed. Agents struggle to maintain personalized communication at scale, leading to 60%+ of leads going cold due to lack of engagement. Generic, one-size-fits-all email campaigns have poor performance (5-10% open rates) and don't account for individual lead behavior or preferences.
User Story:
As a real estate agent, I want an intelligent automation system that nurtures my leads with personalized, behavior-driven communication, so that leads stay engaged, receive relevant property recommendations and market insights, and are more likely to convert to appointments without requiring constant manual effort from me.
Success Metrics:

40%+ email open rate (vs 15-20% industry average)
10%+ email click rate (vs 2-3% industry average)
25% increase in lead engagement (responses, property inquiries)
50% reduction in time from lead capture to first appointment
30% increase in lead-to-client conversion rate
80%+ of leads receive timely follow-up (vs 30% with manual process)

Integration Context:
This workflow integrates with:

Lead Capture (Prompt #1): Receives new leads and starts appropriate nurture sequences
Lead Scoring Engine (Prompt #3): Uses score changes to trigger campaigns or adjust sequences
CRM Module: Reads lead data for personalization, updates engagement metrics
Property Listings: Fetches matching properties for recommendations
Email Service Providers: SendGrid/Mailgun for delivery
Analytics Dashboard: Provides campaign performance data

Prerequisites & Dependencies
Required Workflows:

Prompt #1: Lead Capture System - Provides new leads that trigger nurture sequences
None others - This is workflow #2 in the implementation sequence

Required Database Schema:
sql-- ============================================
-- NURTURE CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS nurture_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Campaign Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'archived'
  
  -- Campaign Type & Targeting
  campaign_type VARCHAR(100) NOT NULL, -- 'new_lead', 'lead_score_increase', 'property_match', 'market_update', 'event_trigger'
  target_audience JSONB, -- Defines who this campaign targets (lead_type, score_range, etc.)
  
  -- Trigger Configuration
  trigger_type VARCHAR(100) NOT NULL, -- 'immediate', 'scheduled', 'behavioral', 'score_change'
  trigger_conditions JSONB, -- Specific conditions that start this campaign
  
  -- Campaign Settings
  frequency_cap JSONB, -- {"max_emails_per_day": 2, "max_emails_per_week": 5}
  time_window JSONB, -- {"start_hour": 9, "end_hour": 17, "timezone": "America/Chicago"}
  respect_unsubscribe BOOLEAN DEFAULT true,
  respect_preferences BOOLEAN DEFAULT true,
  
  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT false,
  ab_test_config JSONB, -- {"variants": ["A", "B"], "split": [50, 50], "metric": "open_rate"}
  
  -- Performance Tracking
  leads_enrolled INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'paused', 'archived'))
);

CREATE INDEX idx_campaigns_org ON nurture_campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON nurture_campaigns(organization_id, status);
CREATE INDEX idx_campaigns_type ON nurture_campaigns(campaign_type);

ALTER TABLE nurture_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_org_isolation ON nurture_campaigns
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- CAMPAIGN_SEQUENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Sequence Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL, -- Order within campaign (1, 2, 3...)
  
  -- Timing
  delay_value INTEGER NOT NULL, -- How long to wait after previous message
  delay_unit VARCHAR(20) NOT NULL, -- 'minutes', 'hours', 'days', 'weeks'
  send_time_preference VARCHAR(50), -- 'optimal', 'morning', 'afternoon', 'evening', 'specific'
  specific_send_time TIME, -- If send_time_preference = 'specific'
  
  -- Branching Logic
  branch_type VARCHAR(50) DEFAULT 'linear', -- 'linear', 'conditional', 'ab_test'
  branch_conditions JSONB, -- Conditions for conditional branching
  
  -- Performance
  messages_scheduled INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_delay_unit CHECK (delay_unit IN ('minutes', 'hours', 'days', 'weeks'))
);

CREATE INDEX idx_sequences_campaign ON campaign_sequences(campaign_id, sequence_order);
CREATE INDEX idx_sequences_org ON campaign_sequences(organization_id);

ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY sequences_org_isolation ON campaign_sequences
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- CAMPAIGN_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES campaign_sequences(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Message Identity
  name VARCHAR(255) NOT NULL,
  variant VARCHAR(10) DEFAULT 'A', -- 'A', 'B', 'C' for A/B/C testing
  
  -- Message Content
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  
  -- Personalization Tokens
  -- Supports: {{name}}, {{property_type}}, {{location}}, {{budget}}, {{agent_name}}, etc.
  personalization_schema JSONB, -- Defines available merge fields
  
  -- Attachments & Links
  attachments JSONB, -- Array of file URLs
  tracked_links JSONB, -- Links to track clicks
  
  -- Call to Action
  primary_cta_text VARCHAR(255),
  primary_cta_url TEXT,
  secondary_cta_text VARCHAR(255),
  secondary_cta_url TEXT,
  
  -- Performance Tracking
  times_sent INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  
  -- Calculated Metrics
  open_rate DECIMAL(5,2), -- Percentage
  click_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'archived'
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_variant CHECK (variant IN ('A', 'B', 'C', 'D'))
);

CREATE INDEX idx_messages_sequence ON campaign_messages(sequence_id);
CREATE INDEX idx_messages_org ON campaign_messages(organization_id);
CREATE INDEX idx_messages_variant ON campaign_messages(sequence_id, variant);

ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_org_isolation ON campaign_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- LEAD_CAMPAIGN_ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lead_campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  
  -- Enrollment Details
  enrolled_at TIMESTAMP DEFAULT NOW(),
  enrollment_source VARCHAR(100), -- 'manual', 'trigger', 'score_change', 'behavior'
  variant_assigned VARCHAR(10), -- 'A', 'B' for A/B testing
  
  -- Current State
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'unsubscribed'
  current_sequence_id UUID REFERENCES campaign_sequences(id),
  current_sequence_order INTEGER,
  next_send_at TIMESTAMP,
  
  -- Completion Tracking
  completed_at TIMESTAMP,
  completion_reason VARCHAR(100), -- 'finished_sequence', 'unsubscribed', 'converted', 'manually_stopped'
  
  -- Performance Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_engagement_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_lead_campaign UNIQUE (lead_id, campaign_id)
);

CREATE INDEX idx_enrollments_lead ON lead_campaign_enrollments(lead_id);
CREATE INDEX idx_enrollments_campaign ON lead_campaign_enrollments(campaign_id);
CREATE INDEX idx_enrollments_status ON lead_campaign_enrollments(organization_id, status);
CREATE INDEX idx_enrollments_next_send ON lead_campaign_enrollments(next_send_at) WHERE status = 'active';

ALTER TABLE lead_campaign_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollments_org_isolation ON lead_campaign_enrollments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- EMAIL_SENDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  enrollment_id UUID REFERENCES lead_campaign_enrollments(id),
  message_id UUID NOT NULL REFERENCES campaign_messages(id),
  
  -- Send Details
  send_status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'sending', 'sent', 'failed', 'bounced'
  scheduled_send_time TIMESTAMP NOT NULL,
  actual_send_time TIMESTAMP,
  
  -- Email Provider Details
  provider VARCHAR(50), -- 'sendgrid', 'mailgun'
  provider_message_id VARCHAR(255), -- External ID from email service
  
  -- Recipient Info
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  
  -- Message Content (snapshot at send time)
  subject_line TEXT,
  body_html TEXT,
  personalization_data JSONB, -- Merge fields used
  
  -- Tracking
  tracking_pixel_id VARCHAR(100) UNIQUE, -- For open tracking
  tracking_domain VARCHAR(255), -- For click tracking
  
  -- Engagement Events
  opened_at TIMESTAMP,
  first_click_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Failure Details
  failure_reason TEXT,
  bounce_type VARCHAR(50), -- 'soft', 'hard', 'complaint'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sends_lead ON email_sends(lead_id);
CREATE INDEX idx_sends_enrollment ON email_sends(enrollment_id);
CREATE INDEX idx_sends_status ON email_sends(organization_id, send_status);
CREATE INDEX idx_sends_scheduled ON email_sends(scheduled_send_time) WHERE send_status = 'queued';
CREATE INDEX idx_sends_tracking ON email_sends(tracking_pixel_id);
CREATE INDEX idx_sends_provider_id ON email_sends(provider_message_id);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY sends_org_isolation ON email_sends
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- EMAIL_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email_send_id UUID NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id),
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL, -- 'open', 'click', 'bounce', 'spam_report', 'unsubscribe'
  event_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Event Context
  ip_address INET,
  user_agent TEXT,
  location JSONB, -- {"country": "US", "city": "Austin", "region": "TX"}
  
  -- Click-Specific Data
  clicked_url TEXT,
  link_position INTEGER,
  
  -- Bounce-Specific Data
  bounce_reason TEXT,
  bounce_code VARCHAR(10),
  
  -- Provider Data
  provider_event_id VARCHAR(255),
  provider_raw_data JSONB,
  
  -- Deduplication
  event_hash VARCHAR(64), -- Hash to prevent duplicate event processing
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('open', 'click', 'bounce', 'spam_report', 'unsubscribe', 'delivered'))
);

CREATE INDEX idx_events_send ON email_events(email_send_id, event_type);
CREATE INDEX idx_events_lead ON email_events(lead_id, event_timestamp DESC);
CREATE INDEX idx_events_type ON email_events(organization_id, event_type);
CREATE INDEX idx_events_timestamp ON email_events(event_timestamp DESC);
CREATE INDEX idx_events_hash ON email_events(event_hash);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_org_isolation ON email_events
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- LEAD_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lead_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Communication Preferences
  email_subscribed BOOLEAN DEFAULT true,
  sms_subscribed BOOLEAN DEFAULT false,
  
  -- Frequency Preferences
  max_emails_per_week INTEGER DEFAULT 3,
  preferred_contact_times VARCHAR(100)[], -- ['morning', 'afternoon']
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  
  -- Content Preferences
  interested_in_listings BOOLEAN DEFAULT true,
  interested_in_market_updates BOOLEAN DEFAULT true,
  interested_in_tips_advice BOOLEAN DEFAULT true,
  interested_in_events BOOLEAN DEFAULT false,
  
  -- Unsubscribe History
  unsubscribed_at TIMESTAMP,
  unsubscribe_reason TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_lead_preferences UNIQUE (lead_id)
);

CREATE INDEX idx_preferences_lead ON lead_preferences(lead_id);
CREATE INDEX idx_preferences_subscribed ON lead_preferences(organization_id, email_subscribed);

ALTER TABLE lead_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_org_isolation ON lead_preferences
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- CAMPAIGN_ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  
  -- Time Period
  analytics_date DATE NOT NULL,
  
  -- Volume Metrics
  leads_enrolled_today INTEGER DEFAULT 0,
  emails_sent_today INTEGER DEFAULT 0,
  emails_scheduled_today INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  unique_opens_today INTEGER DEFAULT 0,
  unique_clicks_today INTEGER DEFAULT 0,
  unsubscribes_today INTEGER DEFAULT 0,
  bounces_today INTEGER DEFAULT 0,
  
  -- Calculated Rates
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  click_to_open_rate DECIMAL(5,2),
  unsubscribe_rate DECIMAL(5,2),
  
  -- Conversion Tracking
  appointments_booked INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  
  -- A/B Test Results (if applicable)
  variant_a_opens INTEGER DEFAULT 0,
  variant_a_clicks INTEGER DEFAULT 0,
  variant_b_opens INTEGER DEFAULT 0,
  variant_b_clicks INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_campaign_date UNIQUE (campaign_id, analytics_date)
);

CREATE INDEX idx_analytics_campaign ON campaign_analytics(campaign_id, analytics_date DESC);
CREATE INDEX idx_analytics_org ON campaign_analytics(organization_id, analytics_date DESC);

ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_org_isolation ON campaign_analytics
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- Helper Functions
-- ============================================

-- Calculate time until next send based on delay
CREATE OR REPLACE FUNCTION calculate_next_send_time(
  p_delay_value INTEGER,
  p_delay_unit VARCHAR,
  p_last_send_time TIMESTAMP DEFAULT NOW()
)
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN CASE p_delay_unit
    WHEN 'minutes' THEN p_last_send_time + (p_delay_value || ' minutes')::INTERVAL
    WHEN 'hours' THEN p_last_send_time + (p_delay_value || ' hours')::INTERVAL
    WHEN 'days' THEN p_last_send_time + (p_delay_value || ' days')::INTERVAL
    WHEN 'weeks' THEN p_last_send_time + (p_delay_value || ' weeks')::INTERVAL
    ELSE p_last_send_time + (p_delay_value || ' days')::INTERVAL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update campaign analytics (called by trigger or scheduled job)
CREATE OR REPLACE FUNCTION update_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics when email events occur
  IF NEW.event_type = 'open' THEN
    UPDATE campaign_analytics
    SET unique_opens_today = unique_opens_today + 1
    WHERE campaign_id = (
      SELECT e.campaign_id 
      FROM email_sends es
      JOIN lead_campaign_enrollments e ON e.id = es.enrollment_id
      WHERE es.id = NEW.email_send_id
    )
    AND analytics_date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_on_event
AFTER INSERT ON email_events
FOR EACH ROW
EXECUTE FUNCTION update_campaign_analytics();
Required API Access:

SendGrid API

Endpoints: /v3/mail/send, /v3/webhooks/event/webhook
Authentication: API Key (Bearer token)
Rate Limits: Varies by plan (typically 100 req/sec)
Webhooks: Delivery events, opens, clicks, bounces


Mailgun API (Alternative)

Endpoints: /v3/{domain}/messages, /v3/webhooks
Authentication: API Key (Basic Auth)
Rate Limits: Varies by plan


OpenAI API (For content personalization)

Endpoints: /v1/chat/completions
Usage: Generate personalized property descriptions, email content
Rate Limits: 3500 requests/min



Required N8n Credentials:

sendgrid_api: SendGrid API key
mailgun_api: Mailgun API key (if using Mailgun)
supabase_main: Supabase project URL + service key
openai_api: OpenAI API key for content generation

Required Environment Variables:
bashN8N_EMAIL_PROVIDER=sendgrid # or 'mailgun'
N8N_SENDGRID_API_KEY=your_key
N8N_TRACKING_DOMAIN=track.strivetech.io # For click tracking
N8N_EMAIL_FROM_ADDRESS=noreply@strivetech.io
N8N_EMAIL_FROM_NAME=Strive Real Estate
N8N_MAX_EMAILS_PER_HOUR=1000 # Rate limiting
N8N_OPTIMAL_SEND_HOUR=10 # Default 10 AM local time

Technical Architecture
Multi-Workflow System Overview
┌────────────────────────────────────────────────────────────────┐
│                   LEAD NURTURING SYSTEM                        │
│                    (6 Workflows)                                │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 1: ENROLLMENT TRIGGER                                  │
│                                                                 │
│ Triggers: New lead, Score change, Behavior event               │
│   ↓                                                             │
│ Check Campaign Eligibility → Check Current Enrollments         │
│   ↓                                                             │
│ Enroll in Campaign → Calculate Next Send Time                  │
│   ↓                                                             │
│ Create Enrollment Record → Update Lead Status                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 2: MESSAGE SCHEDULER (Runs every 5 minutes)           │
│                                                                 │
│ Find Due Enrollments (next_send_at <= NOW)                     │
│   ↓                                                             │
│ For Each Enrollment:                                            │
│   → Load Lead Data → Load Message Template                     │
│   → Personalize Content → Calculate Optimal Send Time          │
│   → Create Email Send Record (status: 'queued')                │
│   → Update Enrollment (next_sequence, next_send_at)            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 3: EMAIL SENDER (Runs every 1 minute)                 │
│                                                                 │
│ Find Queued Emails (scheduled_send_time <= NOW)                │
│   ↓                                                             │
│ Batch Emails (100 per batch) → Check Rate Limits               │
│   ↓                                                             │
│ For Each Email:                                                 │
│   → Generate Tracking Pixel → Add Click Tracking Links         │
│   → Call SendGrid/Mailgun API → Update Send Status             │
│   ↓                                                             │
│ Log Results → Handle Failures → Retry if Needed                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 4: EVENT TRACKER (Webhook-driven)                     │
│                                                                 │
│ Webhook Receives Event (from SendGrid/Mailgun)                 │
│   ↓                                                             │
│ Validate Event → Deduplicate (check event_hash)                │
│   ↓                                                             │
│ Parse Event Data → Find Email Send Record                      │
│   ↓                                                             │
│ Store Event → Update Send Record → Update Lead Engagement      │
│   ↓                                                             │
│ Trigger Actions:                                                │
│   - If opened/clicked: Update lead score                       │
│   - If unsubscribed: Remove from all campaigns                 │
│   - If bounced: Mark email invalid                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 5: ANALYTICS UPDATER (Runs daily at midnight)         │
│                                                                 │
│ For Each Active Campaign:                                       │
│   → Calculate Daily Metrics (opens, clicks, sends)             │
│   → Calculate Rates (open rate, CTR, etc)                      │
│   → Store in campaign_analytics                                │
│   → Compare A/B Test Variants (if applicable)                  │
│   → Generate Performance Report                                │
│   → Alert on Anomalies (unusually low performance)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW 6: CONTENT PERSONALIZER (Called by other workflows)   │
│                                                                 │
│ Receives: Lead data, Message template, Context                 │
│   ↓                                                             │
│ Extract Personalization Tokens ({{name}}, {{property}})        │
│   ↓                                                             │
│ Fetch Dynamic Content:                                          │
│   - Property recommendations (match lead preferences)           │
│   - Market updates (for their location)                        │
│   - Educational content (based on lead stage)                  │
│   ↓                                                             │
│ Replace Tokens → Generate Final HTML → Return Personalized     │
└─────────────────────────────────────────────────────────────────┘

WORKFLOW 1: Campaign Enrollment Trigger
Purpose
Enrolls leads into nurture campaigns based on triggers (new lead, score change, behavior).
Complete Node Structure
Node 1: Webhook Trigger
json{
  "id": "webhook_enroll_trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "/api/nurture/enroll",
    "responseMode": "responseNode"
  }
}
Input Schema:
json{
  "organization_id": "uuid - Required",
  "lead_id": "uuid - Required",
  "trigger_type": "string - Required - new_lead|score_change|behavior",
  "trigger_data": {
    "campaign_type": "string - Optional - specific campaign to enroll in",
    "old_score": "integer - Optional - for score_change triggers",
    "new_score": "integer - Optional",
    "behavior_event": "string - Optional - event that triggered enrollment"
  }
}
Node 2: Validate & Load Lead
json{
  "id": "validate_and_load_lead",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
Complete Function Code:
javascript// ============================================
// VALIDATE ENROLLMENT REQUEST & LOAD LEAD
// ============================================

const input = $input.first().json;
const { organization_id, lead_id, trigger_type, trigger_data = {} } = input;

// Validation
const errors = [];
if (!organization_id) errors.push('organization_id required');
if (!lead_id) errors.push('lead_id required');
if (!trigger_type) errors.push('trigger_type required');

const validTriggers = ['new_lead', 'score_change', 'behavior'];
if (!validTriggers.includes(trigger_type)) {
  errors.push(`Invalid trigger_type. Must be one of: ${validTriggers.join(', ')}`);
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

return {
  json: {
    ...input,
    validated: true,
    timestamp: new Date().toISOString()
  }
};
Node 3: Supabase - Load Lead Data
json{
  "id": "load_lead_data",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [650, 300],
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
Node 4: Find Eligible Campaigns
json{
  "id": "find_eligible_campaigns",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [850, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
Complete Function Code:
javascript// ============================================
// DETERMINE ELIGIBLE CAMPAIGNS FOR LEAD
// ============================================

const input = $input.first().json;
const leadData = input; // Lead data from Supabase
const originalRequest = $('validate_and_load_lead').first().json;

// Extract lead attributes
const {
  lead_type,
  score,
  status,
  timeline,
  budget_min,
  location_preferences
} = leadData;

// Build campaign eligibility query
// We'll find campaigns that match:
// 1. Active status
// 2. Target audience matches lead attributes
// 3. Not already enrolled in this campaign

const eligibilityFilters = {
  organization_id: originalRequest.organization_id,
  status: 'active'
};

// Map trigger type to campaign type
const triggerToCampaignType = {
  'new_lead': 'new_lead',
  'score_change': 'lead_score_increase',
  'behavior': 'event_trigger'
};

const campaignType = triggerToCampaignType[originalRequest.trigger_type];

return {
  json: {
    ...leadData,
    _original_request: originalRequest,
    _campaign_search: {
      organization_id: originalRequest.organization_id,
      status: 'active',
      campaign_type: campaignType
    }
  }
};
Node 5: Supabase - Query Active Campaigns
json{
  "id": "query_active_campaigns",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1050, 300],
  "parameters": {
    "operation": "select",
    "table": "nurture_campaigns",
    "select": "id, name, campaign_type, target_audience, trigger_conditions, frequency_cap, ab_test_enabled",
    "filterByFields": {
      "fields": [
        {"fieldName": "organization_id", "fieldValue": "={{ $json._campaign_search.organization_id }}"},
        {"fieldName": "status", "fieldValue": "active"},
        {"fieldName": "campaign_type", "fieldValue": "={{ $json._campaign_search.campaign_type }}"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
Node 6: Filter & Match Campaigns
json{
  "id": "filter_matching_campaigns",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1250, 300],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
Complete Function Code:
javascript// ============================================
// FILTER CAMPAIGNS BASED ON TARGET AUDIENCE
// ============================================

const leadData = $('find_eligible_campaigns').first().json;
const campaigns = $input.all().map(item => item.json);

if (!campaigns || campaigns.length === 0) {
  return {
    json: {
      ...leadData,
      eligible_campaigns: [],
      enrollment_needed: false,
      reason: 'No active campaigns found for trigger type'
    }
  };
}

// Filter campaigns based on target_audience criteria
const eligibleCampaigns = campaigns.filter(campaign => {
  const targetAudience = campaign.target_audience || {};
  
  // Check lead_type match
  if (targetAudience.lead_types && 
      !targetAudience.lead_types.includes(leadData.lead_type)) {
    return false;
  }
  
  // Check score range
  if (targetAudience.score_min && leadData.score < targetAudience.score_min) {
    return false;
  }
  if (targetAudience.score_max && leadData.score > targetAudience.score_max) {
    return false;
  }
  
  // Check timeline match
  if (targetAudience.timelines && 
      !targetAudience.timelines.includes(leadData.timeline)) {
    return false;
  }
  
  // Check budget range
  if (targetAudience.budget_min && 
      leadData.budget_max && 
      leadData.budget_max < targetAudience.budget_min) {
    return false;
  }
  
  // All checks passed
  return true;
});

// Assign A/B test variant if campaign has A/B testing enabled
const campaignsWithVariants = eligibleCampaigns.map(campaign => {
  if (campaign.ab_test_enabled) {
    const abConfig = campaign.ab_test_config || { split: [50, 50] };
    const randomValue = Math.random() * 100;
    const variant = randomValue < abConfig.split[0] ? 'A' : 'B';
    return { ...campaign, assigned_variant: variant };
  }
  return { ...campaign, assigned_variant: 'A' };
});

return {
  json: {
    ...leadData,
    eligible_campaigns: campaignsWithVariants,
    enrollment_needed: campaignsWithVariants.length > 0
  }
};
Node 7: Switch - Enroll or Skip
json{
  "id": "should_enroll_switch",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [1450, 300],
  "parameters": {
    "rules": {
      "rules": [{
        "operation": "equal",
        "value1": "={{ $json.enrollment_needed }}",
        "value2": true,
        "output": 0
      }]
    },
    "fallbackOutput": 1
  }
}
Node 8: Check Existing Enrollments
json{
  "id": "check_existing_enrollments",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [1650, 250],
  "parameters": {
    "operation": "select",
    "table": "lead_campaign_enrollments",
    "select": "campaign_id, status",
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
Node 9: Process Enrollments
json{
  "id": "process_enrollments",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [1850, 250],
  "parameters": {
    "functionCode": "// COMPLETE CODE BELOW"
  }
}
Complete Function Code:
javascript// ============================================
// CREATE ENROLLMENT RECORDS
// ============================================

const leadData = $('filter_matching_campaigns').first().json;
const existingEnrollments = $input.all().map(item => item.json);
const eligibleCampaigns = leadData.eligible_campaigns;

// Filter out campaigns lead is already enrolled in
const existingCampaignIds = existingEnrollments
  .filter(e => e.status === 'active')
  .map(e => e.campaign_id);

const newCampaigns = eligibleCampaigns.filter(
  campaign => !existingCampaignIds.includes(campaign.id)
);

if (newCampaigns.length === 0) {
  return {
    json: {
      ...leadData,
      enrollments_created: 0,
      reason: 'Lead already enrolled in all eligible campaigns'
    }
  };
}

// Create enrollment records for each new campaign
const enrollments = newCampaigns.map(campaign => ({
  organization_id: leadData.organization_id,
  lead_id: leadData.id,
  campaign_id: campaign.id,
  enrollment_source: leadData._original_request.trigger_type,
  variant_assigned: campaign.assigned_variant,
  status: 'active',
  next_send_at: new Date().toISOString(), // Send first message immediately
  current_sequence_order: 0
}));

return {
  json: {
    ...leadData,
    enrollments_to_create: enrollments,
    enrollment_count: enrollments.length
  }
};
Node 10: Supabase - Insert Enrollments
json{
  "id": "insert_enrollments",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 1,
  "position": [2050, 250],
  "parameters": {
    "batchSize": 10
  }
}
json{
  "id": "insert_single_enrollment",
  "type": "@n8n/n8n-nodes-langchain.supabaseVectorStore",
  "typeVersion": 1,
  "position": [2250, 250],
  "parameters": {
    "operation": "insert",
    "table": "lead_campaign_enrollments",
    "data": {
      "fields": [
        {"fieldName": "organization_id", "fieldValue": "={{ $json.organization_id }}"},
        {"fieldName": "lead_id", "fieldValue": "={{ $json.lead_id }}"},
        {"fieldName": "campaign_id", "fieldValue": "={{ $json.campaign_id }}"},
        {"fieldName": "enrollment_source", "fieldValue": "={{ $json.enrollment_source }}"},
        {"fieldName": "variant_assigned", "fieldValue": "={{ $json.variant_assigned }}"},
        {"fieldName": "status", "fieldValue": "active"},
        {"fieldName": "next_send_at", "fieldValue": "={{ $json.next_send_at }}"},
        {"fieldName": "current_sequence_order", "fieldValue": "0"}
      ]
    }
  },
  "credentials": {
    "supabaseApi": {"id": "supabase_main"}
  }
}
Node 11: Update Campaign Stats
json{
  "id": "update_campaign_stats",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [2450, 250],
  "parameters": {
    "functionCode": "// SQL to increment leads_enrolled count"
  }
}
Node 12: Response
json{
  "id": "enrollment_response",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1,
  "position": [2650, 250],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({success: true, enrollments_created: $json.enrollment_count, campaigns: $json.enrollments_to_create.map(e => e.campaign_id)}) }}"
  }
}

WORKFLOW 2: Message Scheduler
Purpose
Runs every 5 minutes to find enrollments that are due for their next message and creates email send records.
Trigger: Cron Schedule
json{
  "id": "schedule_trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "rule": {
      "interval": [{"field": "minutes", "minutesInterval": 5}]
    }
  }
}
Key Nodes (Summary - Full implementation similar to above)

Find Due Enrollments - Query lead_campaign_enrollments WHERE next_send_at <= NOW() AND status = 'active'
Load Sequence & Message - For each enrollment, get current sequence and message
Load Lead Data - Get lead details for personalization
Check Send Eligibility - Verify lead is subscribed, within frequency cap, in allowed time window
Calculate Optimal Send Time - Apply send time optimization logic
Create Email Send Record - Insert into email_sends with status 'queued'
Update Enrollment - Set next_sequence_order and next_send_at
Log Execution - Track how many emails were scheduled


WORKFLOW 3: Email Sender
Purpose
Runs every minute to send queued emails via SendGrid/Mailgun.
Trigger: Cron Schedule (Every Minute)
Key Processing Logic
javascript// Find queued emails due to be sent
SELECT * FROM email_sends
WHERE send_status = 'queued'
  AND scheduled_send_time <= NOW()
  AND retry_count < max_retries
ORDER BY scheduled_send_time ASC
LIMIT 100; // Batch size

// For each email:
// 1. Add tracking pixel
// 2. Replace links with tracking URLs
// 3. Call SendGrid/Mailgun API
// 4. Update send_status to 'sent' or 'failed'
// 5. If failed, increment retry_count

WORKFLOW 4: Event Tracker (Webhook)
Purpose
Receives webhooks from SendGrid/Mailgun for delivery events (opens, clicks, bounces).
Webhook Configuration
SendGrid Event Webhook:

URL: https://n8n.yoursite.com/webhook/email-events
Events: delivered, open, click, bounce, spam_report, unsubscribe

Event Processing:

Validate webhook signature
Parse event JSON
Find email_send_id by provider_message_id
Check for duplicate events (using event_hash)
Insert into email_events table
Update email_sends record (opened_at, click_count, etc.)
Update lead engagement metrics
Trigger actions (if unsubscribe → remove from all campaigns)


WORKFLOW 5: Analytics Updater (Daily)
Purpose
Runs daily to calculate campaign performance metrics.
Cron: Daily at 12:01 AM
Processing:
sql-- For each active campaign, calculate yesterday's metrics
INSERT INTO campaign_analytics (
  organization_id,
  campaign_id,
  analytics_date,
  emails_sent_today,
  unique_opens_today,
  unique_clicks_today,
  open_rate,
  click_rate
)
SELECT 
  organization_id,
  campaign_id,
  CURRENT_DATE - 1 as analytics_date,
  COUNT(*) as emails_sent,
  COUNT(DISTINCT CASE WHEN opened_at IS NOT NULL THEN id END) as unique_opens,
  COUNT(DISTINCT CASE WHEN first_click_at IS NOT NULL THEN id END) as unique_clicks,
  ROUND(COUNT(DISTINCT CASE WHEN opened_at IS NOT NULL THEN id END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2) as open_rate,
  ROUND(COUNT(DISTINCT CASE WHEN first_click_at IS NOT NULL THEN id END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2) as click_rate
FROM email_sends es
JOIN lead_campaign_enrollments lce ON lce.id = es.enrollment_id
WHERE DATE(es.actual_send_time) = CURRENT_DATE - 1
GROUP BY organization_id, campaign_id;

WORKFLOW 6: Content Personalizer
Purpose
Generates personalized email content by replacing tokens and fetching dynamic data.
Called By: Message Scheduler, Email Sender
Input:
json{
  "organization_id": "uuid",
  "lead_id": "uuid",
  "message_template": {
    "subject_line": "New listings in {{location}}",
    "body_html": "<p>Hi {{name}},...</p>"
  },
  "lead_data": { /* lead attributes */ }
}
Processing:

Extract all tokens from template ({{name}}, {{property}}, etc.)
Build replacement map from lead_data
For dynamic content tokens:

{{property_recommendations}}: Query properties matching lead preferences
{{market_update}}: Fetch recent market stats for lead's location
{{agent_name}}: Get assigned agent name


Replace all tokens in subject and body
Return personalized content


Testing & Validation
Test Case 1: End-to-End Campaign Flow
bash# Step 1: Create a test campaign
POST /api/campaigns
{
  "organization_id": "test-org-001",
  "name": "New Buyer Welcome Series",
  "campaign_type": "new_lead",
  "status": "active",
  "target_audience": {
    "lead_types": ["buyer"],
    "score_min": 50
  }
}

# Step 2: Create sequence with 3 messages
POST /api/campaigns/{campaign_id}/sequences
[
  {
    "name": "Welcome Email",
    "sequence_order": 1,
    "delay_value": 0,
    "delay_unit": "minutes"
  },
  {
    "name": "Day 2 Follow-up",
    "sequence_order": 2,
    "delay_value": 2,
    "delay_unit": "days"
  },
  {
    "name": "Day 5 Property Recommendations",
    "sequence_order": 3,
    "delay_value": 3,
    "delay_unit": "days"
  }
]

# Step 3: Create message templates for each sequence
POST /api/sequences/{sequence_id}/messages
{
  "subject_line": "Welcome to {{agent_name}}'s Real Estate Services",
  "body_html": "<html>...</html>",
  "body_text": "..."
}

# Step 4: Enroll a test lead
POST /webhook/api/nurture/enroll
{
  "organization_id": "test-org-001",
  "lead_id": "test-lead-001",
  "trigger_type": "new_lead"
}

# Expected: Enrollment created, first email scheduled immediately

# Step 5: Verify scheduler picks up the enrollment
# Wait for next scheduler run (max 5 minutes)
# Check email_sends table

SELECT * FROM email_sends 
WHERE lead_id = 'test-lead-001'
ORDER BY created_at DESC;

# Expected: One email in 'queued' status

# Step 6: Verify sender sends the email
# Wait for next sender run (max 1 minute)
# Check email_sends table

SELECT * FROM email_sends 
WHERE lead_id = 'test-lead-001'
ORDER BY created_at DESC;

# Expected: Email status changed to 'sent', provider_message_id populated

# Step 7: Simulate email open event
POST /webhook/email-events
{
  "event": "open",
  "email": "test@example.com",
  "sg_message_id": "...",
  "timestamp": 1234567890
}

# Expected: email_events record created, email_sends.opened_at updated

# Step 8: Verify next email is scheduled
SELECT * FROM lead_campaign_enrollments
WHERE lead_id = 'test-lead-001';

# Expected: current_sequence_order = 2, next_send_at = NOW() + 2 days
Test Case 2: A/B Testing
bash# Create campaign with A/B test enabled
{
  "name": "Subject Line Test",
  "ab_test_enabled": true,
  "ab_test_config": {
    "variants": ["A", "B"],
    "split": [50, 50],
    "metric": "open_rate"
  }
}

# Create two message variants
Message A: subject_line = "New Listings in Your Area"
Message B: subject_line = "5 Homes Perfect for You"

# Enroll 100 test leads
# Verify 50 get variant A, 50 get variant B

# After 24 hours, check analytics
SELECT variant_assigned, 
       COUNT(*) as sends,
       SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
       ROUND(SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2) as open_rate
FROM email_sends es
JOIN lead_campaign_enrollments lce ON lce.id = es.enrollment_id
WHERE lce.campaign_id = 'test-campaign'
GROUP BY variant_assigned;

# Expected: Statistical comparison of variant performance
Test Case 3: Unsubscribe Handling
bash# Simulate unsubscribe event
POST /webhook/email-events
{
  "event": "unsubscribe",
  "email": "test@example.com",
  "sg_message_id": "..."
}

# Expected behavior:
# 1. Email event recorded
# 2. lead_preferences.email_subscribed set to false
# 3. lead_preferences.unsubscribed_at set to NOW()
# 4. All active enrollments for this lead set to status 'unsubscribed'
# 5. No future emails scheduled for this lead

# Verify
SELECT * FROM lead_preferences WHERE lead_id = 'test-lead-001';
SELECT * FROM lead_campaign_enrollments WHERE lead_id = 'test-lead-001';

# Expected: email_subscribed = false, all enrollments.status = 'unsubscribed'

Performance Optimization
Batch Processing

Scheduler processes up to 1000 enrollments per run
Sender sends up to 100 emails per minute (adjust based on provider limits)
Use batch inserts for email_sends records

Caching

Cache active campaigns (TTL: 5 minutes)
Cache message templates (TTL: 10 minutes)
Cache lead preferences (TTL: 1 minute)

Database Optimization
sql-- Critical indexes
CREATE INDEX idx_enrollments_next_send ON lead_campaign_enrollments(next_send_at) 
  WHERE status = 'active';

CREATE INDEX idx_sends_queued ON email_sends(scheduled_send_time) 
  WHERE send_status = 'queued';

CREATE INDEX idx_events_send_id ON email_events(email_send_id, event_type);
Rate Limiting
javascript// Respect SendGrid rate limits
const MAX_SENDS_PER_MINUTE = 100;
const currentMinute = Math.floor(Date.now() / 60000);
const sendsThisMinute = await getRedisCount(`sends:${currentMinute}`);

if (sendsThisMinute >= MAX_SENDS_PER_MINUTE) {
  // Wait until next minute
  await sleep(60000 - (Date.now() % 60000));
}

Documentation
Campaign Configuration Guide
Creating a New Campaign:

Define target audience criteria
Create sequence of messages with timing
Write message templates with personalization tokens
Configure send time preferences
Set frequency caps
Enable A/B testing if desired
Activate campaign

Available Personalization Tokens:

{{name}} - Lead's name
{{email}} - Lead's email
{{agent_name}} - Assigned agent's name
{{agent_phone}} - Agent's phone
{{property_recommendations}} - Dynamic property list
{{market_update}} - Local market statistics
{{budget}} - Lead's budget range
{{location}} - Lead's preferred locations

Troubleshooting
Problem: Emails Not Sending

Check email_sends table for status 'failed' and failure_reason
Verify SendGrid API key is valid
Check if organization has exceeded send limits
Verify lead is subscribed (lead_preferences.email_subscribed = true)

Problem: Low Open Rates

Review subject lines for spam triggers
Check send times - are emails going out at optimal times?
Verify tracking pixel is being added
Check if emails are landing in spam (monitor spam_report events)

Problem: High Unsubscribe Rate

Review email frequency - may be too high
Check content relevance - are recommendations matching lead preferences?
Review unsubscribe_reason field for patterns
Consider segmenting audience more granularly


Success Criteria
Functionality:

✅ Leads automatically enrolled in appropriate campaigns based on triggers
✅ Emails sent according to sequence timing
✅ Personalization tokens correctly replaced
✅ Email events (opens, clicks) accurately tracked
✅ Unsubscribes immediately stop all future sends
✅ A/B testing distributes variants correctly

Performance:

✅ Scheduler processes 1000+ enrollments per run in <10 seconds
✅ Sender delivers 100 emails per minute consistently
✅ Email delivery rate > 95%
✅ Open rate > 35% (well above industry average)
✅ Click rate > 8%

Security:

✅ Organization isolation enforced across all tables
✅ Webhook signatures validated
✅ No PII logged in error messages

Operations:

✅ Daily analytics calculated and available in dashboard
✅ Alerts configured for delivery failures
✅ Campaign performance monitoring in place

