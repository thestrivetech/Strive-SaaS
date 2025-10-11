-- ============================================================================
-- SOCIAL MEDIA TRACKER - DATABASE SCHEMA EXTENSION
-- ============================================================================
-- Version: 1.0
-- Purpose: Track social media posts and analytics across all platforms
-- Integration: Extends Campaign ROI Tracker system
-- ============================================================================

-- ============================================================================
-- SOCIAL MEDIA ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Account identity
    platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'
    platform_account_id TEXT NOT NULL, -- External platform's account ID
    account_name TEXT NOT NULL,
    account_handle TEXT, -- @username
    profile_url TEXT,
    
    -- Account stats (updated periodically)
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2), -- Average engagement rate
    
    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'disconnected', 'archived'
    is_verified BOOLEAN DEFAULT FALSE,
    is_business_account BOOLEAN DEFAULT FALSE,
    
    -- Access credentials (encrypted in production)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint per platform per org
    UNIQUE(organization_id, platform, platform_account_id)
);

CREATE INDEX idx_social_accounts_org_id ON social_media_accounts(organization_id);
CREATE INDEX idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_social_accounts_status ON social_media_accounts(status);

-- ============================================================================
-- SOCIAL MEDIA POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    
    -- Post identity
    platform TEXT NOT NULL,
    platform_post_id TEXT NOT NULL, -- External platform's post ID
    post_url TEXT,
    
    -- Content
    content_text TEXT,
    content_type TEXT, -- 'text', 'image', 'video', 'carousel', 'story', 'reel', 'short'
    media_urls JSONB, -- Array of media URLs
    media_count INTEGER DEFAULT 0,
    
    -- Publishing details
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Content classification
    hashtags JSONB, -- Array of hashtags
    mentions JSONB, -- Array of mentioned accounts
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL, -- Link to campaign
    content_category TEXT, -- 'listing', 'education', 'testimonial', 'brand', 'community'
    target_audience TEXT, -- 'buyers', 'sellers', 'investors', 'general'
    
    -- Engagement metrics (updated periodically)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Calculated metrics
    engagement_rate DECIMAL(5,2) DEFAULT 0, -- (likes + comments + shares) / followers * 100
    engagement_score INTEGER DEFAULT 0, -- 0-100 weighted score
    reach INTEGER DEFAULT 0, -- Unique users who saw the post
    impressions INTEGER DEFAULT 0, -- Total times post was displayed
    
    -- Video-specific metrics
    video_duration_seconds INTEGER,
    video_watch_time_seconds INTEGER,
    video_completion_rate DECIMAL(5,2),
    average_watch_percentage DECIMAL(5,2),
    
    -- Performance classification
    performance_tier TEXT, -- 'viral', 'excellent', 'good', 'average', 'poor'
    
    -- Posting optimization data
    posted_day_of_week INTEGER, -- 0=Sunday, 6=Saturday
    posted_hour INTEGER, -- 0-23
    posted_time_slot TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_metrics_update TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(platform, platform_post_id)
);

CREATE INDEX idx_social_posts_org_id ON social_media_posts(organization_id);
CREATE INDEX idx_social_posts_account_id ON social_media_posts(account_id);
CREATE INDEX idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_posts_published ON social_media_posts(published_at DESC);
CREATE INDEX idx_social_posts_campaign ON social_media_posts(campaign_id);
CREATE INDEX idx_social_posts_performance ON social_media_posts(performance_tier);
CREATE INDEX idx_social_posts_engagement ON social_media_posts(engagement_rate DESC);

-- Full text search on content
CREATE INDEX idx_social_posts_content_search ON social_media_posts 
USING gin(to_tsvector('english', content_text));

-- ============================================================================
-- SOCIAL MEDIA POST METRICS HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_post_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
    
    -- Time dimension
    snapshot_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    hours_since_published INTEGER, -- For growth rate analysis
    
    -- Engagement metrics snapshot
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    
    -- Growth rates (since last snapshot)
    likes_growth INTEGER DEFAULT 0,
    comments_growth INTEGER DEFAULT 0,
    shares_growth INTEGER DEFAULT 0,
    views_growth INTEGER DEFAULT 0,
    
    -- Calculated at snapshot time
    engagement_rate DECIMAL(5,2),
    viral_coefficient DECIMAL(5,4), -- shares / reach
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_metrics_post_id ON social_media_post_metrics(post_id);
CREATE INDEX idx_post_metrics_timestamp ON social_media_post_metrics(snapshot_timestamp DESC);

-- ============================================================================
-- HASHTAG PERFORMANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hashtag_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Hashtag
    hashtag TEXT NOT NULL, -- Without #
    platform TEXT NOT NULL,
    
    -- Usage stats
    times_used INTEGER DEFAULT 0,
    first_used_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics (aggregated from posts using this hashtag)
    avg_engagement_rate DECIMAL(5,2),
    avg_reach INTEGER,
    total_impressions BIGINT DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    
    -- Best performing post with this hashtag
    best_post_id UUID REFERENCES social_media_posts(id),
    best_post_engagement_rate DECIMAL(5,2),
    
    -- Trending data
    trending_score DECIMAL(5,2), -- 0-100 based on recent performance
    is_trending BOOLEAN DEFAULT FALSE,
    
    -- Category
    hashtag_category TEXT, -- 'location', 'industry', 'branded', 'trending', 'evergreen'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, hashtag, platform)
);

CREATE INDEX idx_hashtag_org_platform ON hashtag_performance(organization_id, platform);
CREATE INDEX idx_hashtag_performance ON hashtag_performance(avg_engagement_rate DESC);
CREATE INDEX idx_hashtag_trending ON hashtag_performance(is_trending, trending_score DESC);

-- ============================================================================
-- CONTENT PERFORMANCE INSIGHTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_performance_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Analysis period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    platform TEXT,
    
    -- Best performing content types
    best_content_type TEXT, -- 'video', 'image', 'carousel', etc.
    best_content_category TEXT, -- 'listing', 'education', etc.
    
    -- Optimal posting times
    best_day_of_week INTEGER,
    best_hour INTEGER,
    best_time_slot TEXT,
    
    -- Engagement patterns
    avg_engagement_rate DECIMAL(5,2),
    top_performing_hashtags JSONB, -- Array of top hashtags
    
    -- Recommendations
    recommended_posting_frequency TEXT, -- 'daily', '3x_week', etc.
    recommended_content_mix JSONB, -- Percentages by content type
    
    -- Audience insights
    peak_audience_activity_hours JSONB, -- Array of hours
    audience_engagement_pattern TEXT, -- 'morning_focused', 'evening_focused', 'distributed'
    
    -- Performance benchmarks
    posts_analyzed INTEGER,
    total_engagement INTEGER,
    total_reach BIGINT,
    
    -- Metadata
    analysis_version TEXT DEFAULT '1.0',
    confidence_score DECIMAL(5,2),
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, platform, period_start, period_end)
);

CREATE INDEX idx_insights_org_platform ON content_performance_insights(organization_id, platform);
CREATE INDEX idx_insights_period ON content_performance_insights(period_end DESC);

-- ============================================================================
-- SOCIAL MEDIA COMPETITORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Competitor identity
    competitor_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    platform_account_id TEXT NOT NULL,
    account_handle TEXT,
    profile_url TEXT,
    
    -- Monitoring status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Latest metrics
    followers_count INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2),
    posting_frequency DECIMAL(5,2), -- Posts per week
    last_post_date TIMESTAMP WITH TIME ZONE,
    
    -- Comparative analysis
    follower_growth_rate DECIMAL(5,2), -- % per month
    engagement_trend TEXT, -- 'increasing', 'stable', 'decreasing'
    
    -- Content strategy
    top_content_types JSONB,
    top_hashtags JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(organization_id, platform, platform_account_id)
);

CREATE INDEX idx_competitors_org_platform ON social_media_competitors(organization_id, platform);

-- ============================================================================
-- SOCIAL MEDIA CAMPAIGNS
-- ============================================================================

-- Link social posts to marketing campaigns
CREATE TABLE IF NOT EXISTS social_media_campaign_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
    
    -- Campaign-specific tracking
    campaign_phase TEXT, -- 'awareness', 'consideration', 'conversion'
    content_pillar TEXT, -- Main theme/category for this campaign
    
    -- Performance attribution
    attributed_leads INTEGER DEFAULT 0,
    attributed_conversions INTEGER DEFAULT 0,
    attributed_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, post_id)
);

CREATE INDEX idx_campaign_posts_campaign ON social_media_campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_post ON social_media_campaign_posts(post_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_campaign_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY social_accounts_isolation ON social_media_accounts
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY social_accounts_service_role ON social_media_accounts
    FOR ALL TO service_role USING (true);

CREATE POLICY social_posts_isolation ON social_media_posts
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY social_posts_service_role ON social_media_posts
    FOR ALL TO service_role USING (true);

CREATE POLICY post_metrics_isolation ON social_media_post_metrics
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY post_metrics_service_role ON social_media_post_metrics
    FOR ALL TO service_role USING (true);

CREATE POLICY hashtag_isolation ON hashtag_performance
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY hashtag_service_role ON hashtag_performance
    FOR ALL TO service_role USING (true);

CREATE POLICY insights_isolation ON content_performance_insights
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY insights_service_role ON content_performance_insights
    FOR ALL TO service_role USING (true);

CREATE POLICY competitors_isolation ON social_media_competitors
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY competitors_service_role ON social_media_competitors
    FOR ALL TO service_role USING (true);

CREATE POLICY campaign_posts_isolation ON social_media_campaign_posts
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY campaign_posts_service_role ON social_media_campaign_posts
    FOR ALL TO service_role USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
    p_likes INTEGER,
    p_comments INTEGER,
    p_shares INTEGER,
    p_saves INTEGER,
    p_followers INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
    IF p_followers = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ((p_likes + p_comments + p_shares + COALESCE(p_saves, 0))::DECIMAL / p_followers * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate engagement score (0-100)
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    p_likes INTEGER,
    p_comments INTEGER,
    p_shares INTEGER,
    p_saves INTEGER,
    p_views INTEGER,
    p_clicks INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
BEGIN
    -- Base points for different engagement types
    v_score := v_score + (p_likes * 1);
    v_score := v_score + (p_comments * 3);
    v_score := v_score + (p_shares * 5);
    v_score := v_score + (COALESCE(p_saves, 0) * 4);
    v_score := v_score + (p_clicks * 2);
    
    -- Normalize to 0-100 scale (adjust divisor based on your typical engagement)
    v_score := LEAST(100, v_score / 10);
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to classify post performance
CREATE OR REPLACE FUNCTION classify_post_performance(
    p_engagement_rate DECIMAL,
    p_platform TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_viral_threshold DECIMAL;
    v_excellent_threshold DECIMAL;
    v_good_threshold DECIMAL;
    v_average_threshold DECIMAL;
BEGIN
    -- Platform-specific thresholds (industry benchmarks)
    CASE p_platform
        WHEN 'instagram' THEN
            v_viral_threshold := 10.0;
            v_excellent_threshold := 5.0;
            v_good_threshold := 3.0;
            v_average_threshold := 1.0;
        WHEN 'facebook' THEN
            v_viral_threshold := 8.0;
            v_excellent_threshold := 4.0;
            v_good_threshold := 2.0;
            v_average_threshold := 0.5;
        WHEN 'twitter' THEN
            v_viral_threshold := 15.0;
            v_excellent_threshold := 7.0;
            v_good_threshold := 3.0;
            v_average_threshold := 1.0;
        WHEN 'linkedin' THEN
            v_viral_threshold := 10.0;
            v_excellent_threshold := 5.0;
            v_good_threshold := 3.0;
            v_average_threshold := 1.5;
        WHEN 'tiktok' THEN
            v_viral_threshold := 20.0;
            v_excellent_threshold := 10.0;
            v_good_threshold := 5.0;
            v_average_threshold := 2.0;
        ELSE
            v_viral_threshold := 10.0;
            v_excellent_threshold := 5.0;
            v_good_threshold := 2.5;
            v_average_threshold := 1.0;
    END CASE;
    
    -- Classify
    IF p_engagement_rate >= v_viral_threshold THEN
        RETURN 'viral';
    ELSIF p_engagement_rate >= v_excellent_threshold THEN
        RETURN 'excellent';
    ELSIF p_engagement_rate >= v_good_threshold THEN
        RETURN 'good';
    ELSIF p_engagement_rate >= v_average_threshold THEN
        RETURN 'average';
    ELSE
        RETURN 'poor';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update post metrics and classifications
CREATE OR REPLACE FUNCTION update_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate engagement rate
    NEW.engagement_rate := calculate_engagement_rate(
        NEW.likes_count,
        NEW.comments_count,
        NEW.shares_count,
        NEW.saves_count,
        (SELECT followers_count FROM social_media_accounts WHERE id = NEW.account_id)
    );
    
    -- Calculate engagement score
    NEW.engagement_score := calculate_engagement_score(
        NEW.likes_count,
        NEW.comments_count,
        NEW.shares_count,
        NEW.saves_count,
        NEW.views_count,
        NEW.clicks_count
    );
    
    -- Classify performance
    NEW.performance_tier := classify_post_performance(
        NEW.engagement_rate,
        NEW.platform
    );
    
    -- Extract posting time data
    NEW.posted_day_of_week := EXTRACT(DOW FROM NEW.published_at);
    NEW.posted_hour := EXTRACT(HOUR FROM NEW.published_at);
    
    -- Classify time slot
    NEW.posted_time_slot := CASE
        WHEN NEW.posted_hour BETWEEN 6 AND 11 THEN 'morning'
        WHEN NEW.posted_hour BETWEEN 12 AND 17 THEN 'afternoon'
        WHEN NEW.posted_hour BETWEEN 18 AND 22 THEN 'evening'
        ELSE 'night'
    END;
    
    NEW.updated_at := NOW();
    NEW.last_metrics_update := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic metric updates
CREATE TRIGGER update_post_metrics_trigger
    BEFORE INSERT OR UPDATE ON social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_metrics();

-- Function to update account stats
CREATE OR REPLACE FUNCTION update_account_stats(p_account_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE social_media_accounts
    SET 
        total_posts = (
            SELECT COUNT(*) 
            FROM social_media_posts 
            WHERE account_id = p_account_id
        ),
        engagement_rate = (
            SELECT AVG(engagement_rate)
            FROM social_media_posts
            WHERE account_id = p_account_id
            AND published_at > NOW() - INTERVAL '30 days'
        ),
        last_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Daily social media performance
CREATE OR REPLACE VIEW v_daily_social_performance AS
SELECT 
    p.organization_id,
    p.platform,
    DATE(p.published_at) as date,
    COUNT(p.id) as posts_count,
    SUM(p.likes_count) as total_likes,
    SUM(p.comments_count) as total_comments,
    SUM(p.shares_count) as total_shares,
    SUM(p.views_count) as total_views,
    SUM(p.reach) as total_reach,
    AVG(p.engagement_rate) as avg_engagement_rate,
    COUNT(CASE WHEN p.performance_tier IN ('viral', 'excellent') THEN 1 END) as high_performing_posts
FROM social_media_posts p
WHERE p.published_at > CURRENT_DATE - 90
GROUP BY p.organization_id, p.platform, DATE(p.published_at);

-- View: Content type performance comparison
CREATE OR REPLACE VIEW v_content_type_performance AS
SELECT 
    p.organization_id,
    p.platform,
    p.content_type,
    COUNT(p.id) as posts_count,
    AVG(p.engagement_rate) as avg_engagement_rate,
    AVG(p.reach) as avg_reach,
    SUM(p.likes_count + p.comments_count + p.shares_count) as total_engagement
FROM social_media_posts p
WHERE p.published_at > CURRENT_DATE - 30
GROUP BY p.organization_id, p.platform, p.content_type;

-- View: Best posting times
CREATE OR REPLACE VIEW v_best_posting_times AS
SELECT 
    p.organization_id,
    p.platform,
    p.posted_day_of_week,
    p.posted_hour,
    p.posted_time_slot,
    COUNT(p.id) as posts_count,
    AVG(p.engagement_rate) as avg_engagement_rate,
    COUNT(CASE WHEN p.performance_tier IN ('viral', 'excellent') THEN 1 END) as high_performing_count
FROM social_media_posts p
WHERE p.published_at > CURRENT_DATE - 60
GROUP BY p.organization_id, p.platform, p.posted_day_of_week, p.posted_hour, p.posted_time_slot
HAVING COUNT(p.id) >= 3; -- At least 3 posts for statistical significance

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

INSERT INTO schema_versions (version, description) VALUES 
('2.0.0', 'Social Media Tracker extension with multi-platform support');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================