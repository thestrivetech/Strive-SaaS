-- =====================================================
-- STRIVE TECH CRM ACTIVITY FEED - DATABASE SCHEMA
-- Multi-tenant real estate SaaS platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For multi-column indexes

-- =====================================================
-- 1. ACTIVITIES TABLE - Central activity stream
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    agent_id UUID,
    
    -- Activity metadata
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(50) NOT NULL, -- email, phone, sms, meeting, web, social, property_view
    channel VARCHAR(50) NOT NULL, -- email, phone, sms, meeting, web, social
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    
    -- Content and analysis
    content TEXT,
    summary TEXT, -- AI-generated summary
    metadata JSONB DEFAULT '{}', -- Flexible metadata storage
    
    -- AI-enriched fields
    sentiment DECIMAL(3,2), -- -1.00 to 1.00
    sentiment_label VARCHAR(20), -- negative, neutral, positive
    intent VARCHAR(100), -- classified intent
    topics TEXT[], -- extracted topics
    entities JSONB, -- extracted entities (names, places, etc.)
    urgency INTEGER CHECK (urgency >= 1 AND urgency <= 5), -- 1=low, 5=critical
    weight DECIMAL(3,2) DEFAULT 1.0, -- Importance weight
    
    -- References
    property_ids UUID[], -- Related properties
    related_activity_id UUID, -- Parent activity if this is a follow-up
    
    -- System fields
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_related_activity FOREIGN KEY (related_activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_activities_org_client ON activities(organization_id, client_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_activities_type_channel ON activities(type, channel);
CREATE INDEX idx_activities_agent ON activities(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_activities_metadata ON activities USING gin(metadata);
CREATE INDEX idx_activities_search ON activities USING gin(content gin_trgm_ops);
CREATE INDEX idx_activities_unprocessed ON activities(organization_id) WHERE NOT processed;

-- =====================================================
-- 2. CLIENT_INSIGHTS TABLE - Aggregated intelligence
-- =====================================================
CREATE TABLE IF NOT EXISTS client_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL UNIQUE,
    
    -- Engagement metrics
    engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
    relationship_strength DECIMAL(3,2) CHECK (relationship_strength >= 0 AND relationship_strength <= 10),
    total_interactions INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,
    
    -- Lifecycle stage
    stage VARCHAR(50) DEFAULT 'new', -- new, exploring, active, committed, closed, dormant
    stage_changed_at TIMESTAMPTZ DEFAULT NOW(),
    previous_stage VARCHAR(50),
    
    -- Risk and opportunity
    churn_risk VARCHAR(20) DEFAULT 'low', -- low, medium, high
    churn_probability DECIMAL(5,4), -- 0.0000 to 1.0000
    opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    estimated_close_value DECIMAL(12,2),
    
    -- Behavioral insights
    preferred_channel VARCHAR(50),
    best_contact_time TIME,
    best_contact_day INTEGER CHECK (best_contact_day >= 0 AND best_contact_day <= 6), -- 0=Sunday
    average_response_time_hours DECIMAL(6,2),
    
    -- Interests and preferences
    interests JSONB DEFAULT '[]', -- Array of property interests
    price_range_min DECIMAL(12,2),
    price_range_max DECIMAL(12,2),
    preferred_locations TEXT[],
    
    -- Behavioral profile
    behavioral_profile JSONB DEFAULT '{}',
    communication_style VARCHAR(50), -- formal, casual, technical
    decision_speed VARCHAR(20), -- fast, moderate, slow
    
    -- Predictive fields
    next_best_action VARCHAR(200),
    next_best_action_confidence DECIMAL(3,2),
    expected_response_time_hours DECIMAL(6,2),
    purchase_probability DECIMAL(5,4),
    estimated_days_to_decision INTEGER,
    
    -- System fields
    last_analyzed_at TIMESTAMPTZ,
    analysis_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_client_insights_org ON client_insights(organization_id);
CREATE INDEX idx_client_insights_stage ON client_insights(organization_id, stage);
CREATE INDEX idx_client_insights_churn ON client_insights(organization_id, churn_risk);
CREATE INDEX idx_client_insights_score ON client_insights(organization_id, engagement_score DESC);

-- =====================================================
-- 3. OPPORTUNITIES TABLE - Identified opportunities
-- =====================================================
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    
    -- Opportunity details
    type VARCHAR(50) NOT NULL, -- relocation, upgrade, investment, referral, seasonal_urgency, equity_opportunity
    confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    trigger TEXT NOT NULL, -- What triggered this opportunity
    action TEXT NOT NULL, -- Recommended action
    expected_outcome TEXT,
    
    -- Value and scoring
    estimated_value DECIMAL(12,2),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Timing
    suggested_contact_time TIMESTAMPTZ,
    suggested_channel VARCHAR(50),
    expires_at TIMESTAMPTZ,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'identified', -- identified, reviewed, actioned, converted, expired, dismissed
    actioned_by UUID,
    actioned_at TIMESTAMPTZ,
    conversion_value DECIMAL(12,2),
    converted_at TIMESTAMPTZ,
    dismissal_reason TEXT,
    
    -- Related data
    related_activity_id UUID,
    suggested_content TEXT,
    rationale TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_related_activity FOREIGN KEY (related_activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_opportunities_org_client ON opportunities(organization_id, client_id);
CREATE INDEX idx_opportunities_status ON opportunities(organization_id, status);
CREATE INDEX idx_opportunities_priority ON opportunities(organization_id, priority, score DESC);
CREATE INDEX idx_opportunities_created ON opportunities(created_at DESC);

-- =====================================================
-- 4. BEHAVIORAL_PATTERNS TABLE - Detected patterns
-- =====================================================
CREATE TABLE IF NOT EXISTS behavioral_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    
    -- Pattern details
    pattern_type VARCHAR(100) NOT NULL, -- contact_time, response_time, channel_preference, decision_cycle, etc.
    pattern_data JSONB NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    
    -- Temporal data
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    
    -- Analysis metadata
    sample_size INTEGER, -- Number of data points used
    analysis_algorithm VARCHAR(100),
    
    -- System fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_behavioral_patterns_client ON behavioral_patterns(organization_id, client_id);
CREATE INDEX idx_behavioral_patterns_type ON behavioral_patterns(pattern_type);
CREATE INDEX idx_behavioral_patterns_confidence ON behavioral_patterns(confidence DESC);

-- =====================================================
-- 5. WORKFLOW_EXECUTIONS TABLE - Performance tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(200) NOT NULL,
    execution_id VARCHAR(200), -- N8n execution ID
    organization_id UUID,
    
    -- Execution details
    status VARCHAR(20) NOT NULL, -- started, completed, failed, timeout
    duration_ms INTEGER,
    
    -- Error tracking
    error_message TEXT,
    error_stack TEXT,
    error_type VARCHAR(100),
    
    -- Performance metrics
    items_processed INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    ai_tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4),
    
    -- Input/output (sanitized)
    input_data JSONB,
    output_data JSONB,
    
    -- System fields
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_name, started_at DESC);
CREATE INDEX idx_workflow_executions_org ON workflow_executions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_errors ON workflow_executions(workflow_name) WHERE status = 'failed';

-- =====================================================
-- 6. ACTIVITY_METRICS TABLE - Aggregated analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    
    -- Volume metrics
    total_activities INTEGER DEFAULT 0,
    activities_by_type JSONB DEFAULT '{}',
    activities_by_channel JSONB DEFAULT '{}',
    
    -- Engagement metrics
    avg_engagement_score DECIMAL(5,2),
    avg_response_time_hours DECIMAL(6,2),
    total_clients_active INTEGER DEFAULT 0,
    
    -- Conversion metrics
    opportunities_identified INTEGER DEFAULT 0,
    opportunities_converted INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    total_value_generated DECIMAL(12,2),
    
    -- AI metrics
    sentiment_distribution JSONB DEFAULT '{}',
    top_intents JSONB DEFAULT '[]',
    ai_accuracy_score DECIMAL(3,2),
    
    -- System fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT unique_org_date UNIQUE (organization_id, metric_date)
);

-- Indexes
CREATE INDEX idx_activity_metrics_org_date ON activity_metrics(organization_id, metric_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (example for activities - repeat for all tables)
CREATE POLICY "Users can only access their organization's activities"
    ON activities
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Service role can bypass RLS for workflow operations
-- Note: Workflows should use service_role key with proper organization_id filtering

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_insights_updated_at BEFORE UPDATE ON client_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_behavioral_patterns_updated_at BEFORE UPDATE ON behavioral_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_metrics_updated_at BEFORE UPDATE ON activity_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Recent activities by client
CREATE OR REPLACE VIEW v_recent_client_activities AS
SELECT 
    a.*,
    ci.engagement_score,
    ci.stage as client_stage
FROM activities a
LEFT JOIN client_insights ci ON a.client_id = ci.client_id AND a.organization_id = ci.organization_id
WHERE a.timestamp > NOW() - INTERVAL '90 days'
ORDER BY a.timestamp DESC;

-- Active opportunities dashboard
CREATE OR REPLACE VIEW v_active_opportunities AS
SELECT 
    o.*,
    ci.engagement_score,
    ci.stage as client_stage,
    ci.preferred_channel
FROM opportunities o
LEFT JOIN client_insights ci ON o.client_id = ci.client_id AND o.organization_id = ci.organization_id
WHERE o.status IN ('identified', 'reviewed', 'actioned')
ORDER BY o.score DESC, o.created_at DESC;

-- =====================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- =====================================================

-- Insert sample activity types for reference
COMMENT ON COLUMN activities.type IS 'Valid types: email, phone, sms, meeting, web_visit, property_view, social_message, form_submission, chat_message';

COMMENT ON COLUMN activities.channel IS 'Valid channels: email, phone, sms, meeting, web, social, chat, in_person';

COMMENT ON COLUMN client_insights.stage IS 'Valid stages: new, exploring, active, committed, closed, dormant, lost';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ CRM Activity Feed Database Schema Created Successfully!';
    RAISE NOTICE '📊 Tables created: activities, client_insights, opportunities, behavioral_patterns, workflow_executions, activity_metrics';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '⚡ Indexes and triggers configured for performance';
    RAISE NOTICE '📋 Next step: Import N8n workflows';
END $$;