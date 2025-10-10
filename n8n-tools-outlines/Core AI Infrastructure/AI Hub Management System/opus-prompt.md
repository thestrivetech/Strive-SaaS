Prompt #3: AI Hub Management System (Enhanced)
Role
N8n Conversation Analytics Engineer specializing in usage tracking, cost optimization, and user experience analytics.
Context

Database: Supabase PostgreSQL with proper indexing
Data Volume: 100k+ conversations/month
Retention: 90 days free tier, unlimited paid
Analytics: Real-time and batch processing
Compliance: GDPR, CCPA, SOC 2

Primary Objective
Create a comprehensive conversation management system that tracks all AI interactions, provides usage analytics, manages costs, and enables conversation sharing while maintaining security and compliance.
Enhanced Requirements
Conversation Lifecycle Management

Session Architecture

typescript   interface ConversationSession {
     id: string;
     organization_id: string;
     user_id: string;
     status: 'active' | 'paused' | 'completed' | 'archived';
     created_at: Date;
     updated_at: Date;
     metadata: {
       source: 'web' | 'mobile' | 'api';
       module: string;
       intent_chain: string[];
       satisfaction_score?: number;
     };
     messages: Message[];
     summary?: string;
     total_tokens: number;
     total_cost: number;
   }

Usage Tracking System

Token counting per model and request
Cost calculation with markup rules
Rate limit tracking per organization
Feature usage analytics
User engagement patterns


Analytics Pipeline

yaml   analytics_layers:
     real_time:
       - active_sessions_count
       - tokens_per_minute
       - error_rate
       - response_time_p95
     
     hourly_batch:
       - conversation_summaries
       - user_engagement_scores
       - cost_aggregations
       - satisfaction_trends
     
     daily_batch:
       - usage_reports
       - billing_calculations
       - retention_analysis
       - feature_adoption
Technical Specifications
Database Schema
sql-- Conversations table with partitioning
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    metadata JSONB,
    summary TEXT,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    satisfaction_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE ai_conversations_2025_01 PARTITION OF ai_conversations
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for performance
CREATE INDEX idx_conversations_org_user ON ai_conversations(organization_id, user_id);
CREATE INDEX idx_conversations_status ON ai_conversations(status) WHERE status = 'active';
CREATE INDEX idx_conversations_created ON ai_conversations(created_at DESC);
Export Functionality
javascriptconst exportFormats = {
  json: {
    includeMetadata: true,
    prettyPrint: true,
    maxSizeMB: 50
  },
  pdf: {
    template: 'conversation_report',
    includeCharts: true,
    branding: true
  },
  csv: {
    delimiter: ',',
    headers: true,
    dateFormat: 'ISO8601'
  }
};
Success Criteria
Performance Metrics

Session Creation: <100ms latency
Analytics Query: <500ms for date ranges up to 30 days
Export Generation: <10s for conversations up to 1000 messages
Real-time Updates: <1s propagation to dashboards

Business Metrics

Usage Visibility: 100% of AI interactions tracked
Cost Accuracy: Within 1% of actual provider costs
Report Generation: Daily reports by 6 AM local time
Data Retention: 100% compliance with retention policies

Quality Metrics

Sentiment Analysis Accuracy: >85% agreement with manual review
Summary Quality: >80% user satisfaction
Search Relevance: >90% success rate finding conversations
Export Completeness: 100% data integrity in exports

Testing Requirements
Conversation Management Tests
javascriptdescribe('Conversation Management', () => {
  test('creates conversation with proper isolation', async () => {
    const conversation = await createConversation({
      organization_id: 'org_123',
      user_id: 'user_456'
    });
    
    expect(conversation.organization_id).toBe('org_123');
    expect(conversation.status).toBe('active');
    
    // Verify other orgs cannot access
    const unauthorizedAccess = await getConversation(
      conversation.id, 
      'org_other'
    );
    expect(unauthorizedAccess).toBeNull();
  });
  
  test('tracks usage accurately', async () => {
    const message = await addMessage(conversationId, {
      content: 'test message',
      model: 'gpt-4',
      tokens: 150
    });
    
    const conversation = await getConversation(conversationId);
    expect(conversation.total_tokens).toBe(150);
    expect(conversation.total_cost).toBeCloseTo(0.0045, 4);
  });
});
Monitoring Requirements
Dashboard Metrics
yamldashboards:
  executive:
    - total_conversations_today
    - average_satisfaction_score
    - cost_per_conversation
    - top_modules_by_usage
  
  operational:
    - active_sessions_count
    - token_usage_by_hour
    - error_rate_by_endpoint
    - p95_response_times
  
  financial:
    - total_cost_mtd
    - cost_by_organization
    - projected_monthly_cost
    - cost_per_user
Implementation Checklist

 Design conversation state machine
 Implement session tracking system
 Build usage analytics pipeline
 Create cost calculation engine
 Develop export functionality
 Implement permission system
 Add sentiment analysis
 Build retention policies
 Create billing integration
 Generate analytics dashboards
