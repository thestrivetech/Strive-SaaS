-- ============================================
-- STRIVE TECH - LEAD NURTURING DATABASE SCHEMA
-- ============================================
-- Version: 1.0
-- Date: 2025-10-10
-- Description: Complete schema for email nurture campaigns
-- ============================================

-- ============================================
-- TABLE: nurture_campaigns
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
  target_audience JSONB, -- {"lead_types": ["buyer"], "score_min": 50, "score_max": 100, "timelines": ["0-3 months"]}
  
  -- Trigger Configuration
  trigger_type VARCHAR(100) NOT NULL, -- 'immediate', 'scheduled', 'behavioral', 'score_change'
  trigger_conditions JSONB,
  
  -- Campaign Settings
  frequency_cap JSONB DEFAULT '{"max_emails_per_day": 2, "max_emails_per_week": 5}'::jsonb,
  time_window JSONB DEFAULT '{"start_hour": 9, "end_hour": 17, "timezone": "America/Chicago"}'::jsonb,
  respect_unsubscribe BOOLEAN DEFAULT true,
  respect_preferences BOOLEAN DEFAULT true,
  
  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT false,
  ab_test_config JSONB DEFAULT '{"variants": ["A", "B"], "split": [50, 50], "metric": "open_rate"}'::jsonb,
  
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
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  CONSTRAINT valid_campaign_type CHECK (campaign_type IN ('new_lead', 'lead_score_increase', 'property_match', 'market_update', 'event_trigger'))
);

CREATE INDEX idx_campaigns_org ON nurture_campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON nurture_campaigns(organization_id, status);
CREATE INDEX idx_campaigns_type ON nurture_campaigns(campaign_type);
CREATE INDEX idx_campaigns_active ON nurture_campaigns(organization_id, status) WHERE status = 'active';

ALTER TABLE nurture_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_org_isolation ON nurture_campaigns
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: campaign_sequences
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Sequence Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  
  -- Timing
  delay_value INTEGER NOT NULL DEFAULT 0,
  delay_unit VARCHAR(20) NOT NULL DEFAULT 'days', -- 'minutes', 'hours', 'days', 'weeks'
  send_time_preference VARCHAR(50) DEFAULT 'optimal', -- 'optimal', 'morning', 'afternoon', 'evening', 'specific'
  specific_send_time TIME,
  
  -- Branching Logic
  branch_type VARCHAR(50) DEFAULT 'linear', -- 'linear', 'conditional', 'ab_test'
  branch_conditions JSONB,
  
  -- Performance
  messages_scheduled INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_delay_unit CHECK (delay_unit IN ('minutes', 'hours', 'days', 'weeks')),
  CONSTRAINT valid_send_preference CHECK (send_time_preference IN ('optimal', 'morning', 'afternoon', 'evening', 'specific')),
  CONSTRAINT unique_campaign_sequence UNIQUE (campaign_id, sequence_order)
);

CREATE INDEX idx_sequences_campaign ON campaign_sequences(campaign_id, sequence_order);
CREATE INDEX idx_sequences_org ON campaign_sequences(organization_id);

ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY sequences_org_isolation ON campaign_sequences
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: campaign_messages
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
  personalization_schema JSONB DEFAULT '["name", "email", "agent_name", "property_recommendations"]'::jsonb,
  
  -- Attachments & Links
  attachments JSONB,
  tracked_links JSONB,
  
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
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_variant CHECK (variant IN ('A', 'B', 'C', 'D')),
  CONSTRAINT valid_message_status CHECK (status IN ('active', 'paused', 'archived'))
);

CREATE INDEX idx_messages_sequence ON campaign_messages(sequence_id);
CREATE INDEX idx_messages_org ON campaign_messages(organization_id);
CREATE INDEX idx_messages_variant ON campaign_messages(sequence_id, variant);
CREATE INDEX idx_messages_active ON campaign_messages(sequence_id, status) WHERE status = 'active';

ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_org_isolation ON campaign_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: lead_campaign_enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS lead_campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES nurture_campaigns(id) ON DELETE CASCADE,
  
  -- Enrollment Details
  enrolled_at TIMESTAMP DEFAULT NOW(),
  enrollment_source VARCHAR(100), -- 'manual', 'trigger', 'score_change', 'behavior'
  variant_assigned VARCHAR(10) DEFAULT 'A',
  
  -- Current State
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'unsubscribed'
  current_sequence_id UUID REFERENCES campaign_sequences(id),
  current_sequence_order INTEGER DEFAULT 1,
  next_send_at TIMESTAMP,
  
  -- Completion Tracking
  completed_at TIMESTAMP,
  completion_reason VARCHAR(100),
  
  -- Performance Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_engagement_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_lead_campaign UNIQUE (lead_id, campaign_id),
  CONSTRAINT valid_enrollment_status CHECK (status IN ('active', 'completed', 'paused', 'unsubscribed'))
);

CREATE INDEX idx_enrollments_lead ON lead_campaign_enrollments(lead_id);
CREATE INDEX idx_enrollments_campaign ON lead_campaign_enrollments(campaign_id);
CREATE INDEX idx_enrollments_status ON lead_campaign_enrollments(organization_id, status);
CREATE INDEX idx_enrollments_next_send ON lead_campaign_enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX idx_enrollments_due ON lead_campaign_enrollments(organization_id, status, next_send_at) 
  WHERE status = 'active' AND next_send_at IS NOT NULL;

ALTER TABLE lead_campaign_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollments_org_isolation ON lead_campaign_enrollments
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: email_sends
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
  provider VARCHAR(50) DEFAULT 'sendgrid',
  provider_message_id VARCHAR(255),
  
  -- Recipient Info
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  
  -- Message Content (snapshot at send time)
  subject_line TEXT,
  body_html TEXT,
  personalization_data JSONB,
  
  -- Tracking
  tracking_pixel_id VARCHAR(100) UNIQUE,
  tracking_domain VARCHAR(255) DEFAULT 'track.strivetech.io',
  
  -- Engagement Events
  opened_at TIMESTAMP,
  first_click_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Failure Details
  failure_reason TEXT,
  bounce_type VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_send_status CHECK (send_status IN ('queued', 'sending', 'sent', 'failed', 'bounced')),
  CONSTRAINT valid_provider CHECK (provider IN ('sendgrid', 'mailgun'))
);

CREATE INDEX idx_sends_lead ON email_sends(lead_id);
CREATE INDEX idx_sends_enrollment ON email_sends(enrollment_id);
CREATE INDEX idx_sends_status ON email_sends(organization_id, send_status);
CREATE INDEX idx_sends_scheduled ON email_sends(scheduled_send_time) WHERE send_status = 'queued';
CREATE INDEX idx_sends_queued ON email_sends(send_status, scheduled_send_time) 
  WHERE send_status = 'queued' AND scheduled_send_time <= NOW();
CREATE INDEX idx_sends_tracking ON email_sends(tracking_pixel_id);
CREATE INDEX idx_sends_provider_id ON email_sends(provider_message_id);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY sends_org_isolation ON email_sends
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: email_events
-- ============================================
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email_send_id UUID NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id),
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL, -- 'open', 'click', 'bounce', 'spam_report', 'unsubscribe', 'delivered'
  event_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Event Context
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  
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
  event_hash VARCHAR(64),
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('open', 'click', 'bounce', 'spam_report', 'unsubscribe', 'delivered'))
);

CREATE INDEX idx_events_send ON email_events(email_send_id, event_type);
CREATE INDEX idx_events_lead ON email_events(lead_id, event_timestamp DESC);
CREATE INDEX idx_events_type ON email_events(organization_id, event_type);
CREATE INDEX idx_events_timestamp ON email_events(event_timestamp DESC);
CREATE INDEX idx_events_hash ON email_events(event_hash);
CREATE UNIQUE INDEX idx_events_unique ON email_events(event_hash) WHERE event_hash IS NOT NULL;

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_org_isolation ON email_events
  FOR ALL USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- TABLE: lead_preferences
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
  preferred_contact_times VARCHAR(100)[] DEFAULT ARRAY['morning', 'afternoon'],
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
-- TABLE: campaign_analytics
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
  
  -- A/B Test Results
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
-- HELPER FUNCTIONS
-- ============================================

-- Calculate next send time based on delay
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

-- Adjust send time to optimal hour (10 AM local time)
CREATE OR REPLACE FUNCTION adjust_to_optimal_time(
  p_send_time TIMESTAMP,
  p_timezone VARCHAR DEFAULT 'America/Chicago',
  p_optimal_hour INTEGER DEFAULT 10
)
RETURNS TIMESTAMP AS $$
DECLARE
  v_local_time TIMESTAMP;
  v_hour INTEGER;
BEGIN
  -- Convert to local timezone
  v_local_time := p_send_time AT TIME ZONE p_timezone;
  v_hour := EXTRACT(HOUR FROM v_local_time);
  
  -- If before optimal hour, move to optimal hour same day
  IF v_hour < p_optimal_hour THEN
    RETURN date_trunc('day', v_local_time) + (p_optimal_hour || ' hours')::INTERVAL;
  -- If after 5 PM, move to next day at optimal hour
  ELSIF v_hour >= 17 THEN
    RETURN date_trunc('day', v_local_time) + '1 day'::INTERVAL + (p_optimal_hour || ' hours')::INTERVAL;
  -- Otherwise use the calculated time
  ELSE
    RETURN p_send_time;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON nurture_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON campaign_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON campaign_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON lead_campaign_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON lead_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Create default lead preferences for new leads
CREATE OR REPLACE FUNCTION create_default_lead_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lead_preferences (organization_id, lead_id)
  VALUES (NEW.organization_id, NEW.id)
  ON CONFLICT (lead_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_lead_preferences_on_insert
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION create_default_lead_preferences();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify installation:

-- 1. Check all tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE '%campaign%' OR table_name LIKE '%email%';

-- 2. Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE '%campaign%';

-- 3. Check indexes
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('nurture_campaigns', 'email_sends', 'lead_campaign_enrollments');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================