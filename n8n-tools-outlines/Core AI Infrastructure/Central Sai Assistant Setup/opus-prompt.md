Prompt #1: Central Sai Assistant Setup (Enhanced)
Role
N8n AI Workflow Orchestration Architect specializing in multi-agent systems and real estate SaaS platforms.
Context

Platform: Strive Tech multi-tenant real estate SaaS
N8n Version: Latest stable (specify your version)
Infrastructure: Supabase PostgreSQL, Qdrant Vector DB, Redis Cache
API Keys Required: OpenAI, Claude, Qdrant, Supabase
Expected Load: 10,000+ daily conversations across 100+ organizations

Primary Objective
Create a production-ready "Sai Universal Assistant" workflow that serves as the intelligent orchestrator for all AI capabilities, ensuring seamless multi-agent coordination with <2 second response times.
Enhanced Requirements
Core Functionality

Webhook Architecture

Implement load-balanced webhook endpoint with request validation
Add request deduplication using Redis (prevent duplicate processing)
Create request queuing for high-traffic periods
Implement rate limiting per organization (100 req/min default)


Intent Classification System

Build multi-tier intent classification (primary, secondary, confidence)
Implement context-aware routing using conversation history
Create fallback mechanisms for unclassified intents
Add intent training pipeline for continuous improvement


Multi-Model Orchestration

Implement model selection algorithm based on:

Query complexity score (1-10 scale)
Organization tier (free/pro/enterprise)
Cost optimization preferences
Response time requirements


Create model fallback chain: GPT-4 → Claude → GPT-3.5 → Cached
Add streaming response support for long-form content


RAG Integration Advanced

Implement hybrid search (vector + keyword) with score fusion
Create dynamic context window management (2k-8k tokens)
Add relevance filtering (minimum similarity threshold: 0.7)
Implement source attribution and citation system


Conversation Management

Build conversation state machine with defined transitions
Implement memory summarization for long conversations
Create conversation branching for multi-topic discussions
Add conversation export and sharing capabilities



Technical Specifications
API Endpoint Configuration
json{
  "endpoint": "/api/ai/sai/chat",
  "method": "POST",
  "headers": {
    "X-Organization-ID": "required",
    "X-API-Key": "required",
    "X-Request-ID": "optional"
  },
  "body": {
    "user_id": "string",
    "organization_id": "string", 
    "message": "string",
    "conversation_id": "string?",
    "context": {
      "module": "crm|workspace|analytics|expense|marketplace",
      "entity_type": "lead|property|transaction",
      "entity_id": "string?"
    },
    "preferences": {
      "model": "gpt-4|claude|auto",
      "response_style": "professional|casual|technical",
      "max_tokens": "number",
      "stream": "boolean"
    }
  }
}
Response Structure
json{
  "conversation_id": "uuid",
  "message_id": "uuid",
  "response": "string",
  "confidence_score": 0.95,
  "intent": {
    "primary": "string",
    "secondary": ["string"],
    "confidence": 0.95
  },
  "suggested_actions": [
    {
      "type": "quick_reply|deep_link|api_call",
      "label": "string",
      "action": "string"
    }
  ],
  "sources": [
    {
      "type": "knowledge_base|crm|property",
      "title": "string",
      "relevance": 0.85
    }
  ],
  "usage": {
    "tokens": 1500,
    "cost": 0.03,
    "model": "gpt-4",
    "latency_ms": 1850
  }
}
Success Criteria
Performance Metrics

Response Time: P95 < 2 seconds, P99 < 3 seconds
Availability: 99.9% uptime (43 minutes downtime/month max)
Throughput: Handle 100 concurrent conversations
Token Efficiency: Average < 2000 tokens per conversation turn

Quality Metrics

Intent Classification Accuracy: >92% for known intents
RAG Relevance: >85% user satisfaction with provided context
Response Accuracy: >90% factually correct responses
Conversation Completion: >80% conversations reach natural conclusion

Business Metrics

User Engagement: >70% daily active users interact with Sai
Cost Efficiency: <$0.05 average cost per conversation
Cross-sell Rate: >15% conversations lead to feature discovery
Time Savings: >50% reduction in support ticket volume

Testing Requirements
Unit Tests
javascript// Test webhook validation
test('webhook validates organization ID', async () => {
  const response = await request(webhook)
    .post('/api/ai/sai/chat')
    .send({ message: 'test' });
  expect(response.status).toBe(400);
  expect(response.body.error).toContain('organization_id required');
});

// Test intent classification
test('classifies property inquiry correctly', async () => {
  const intent = await classifyIntent('Show me homes under $500k');
  expect(intent.primary).toBe('property_search');
  expect(intent.confidence).toBeGreaterThan(0.8);
});
Integration Tests

Multi-model failover simulation
RAG retrieval accuracy validation
Conversation state persistence
Rate limiting enforcement

Load Tests

Simulate 1000 concurrent users
Measure response time degradation
Test auto-scaling triggers
Validate queue management

Error Handling Specifications
Error Categories

User Errors (4xx)

Missing required fields → Clear error message
Invalid organization → Authentication error
Rate limit exceeded → Retry-after header


System Errors (5xx)

Model API failure → Automatic failover
Database timeout → Circuit breaker activation
Memory exhaustion → Graceful degradation


Recovery Strategies

Implement exponential backoff (1s, 2s, 4s, 8s)
Cache frequent queries for fallback
Queue messages during outages
Provide status page integration



Monitoring & Observability
Key Metrics to Track
yamlmetrics:
  - name: conversation_latency
    type: histogram
    labels: [organization_id, model, intent_type]
  
  - name: intent_classification_accuracy
    type: gauge
    labels: [intent_category]
  
  - name: rag_retrieval_relevance
    type: histogram
    labels: [collection, query_type]
  
  - name: token_usage_per_org
    type: counter
    labels: [organization_id, model]
Alerting Rules

Response time > 3s for 5 minutes → Page on-call
Error rate > 5% → Send Slack alert
Token usage > 80% of budget → Email finance team
Queue depth > 1000 → Scale workers

Implementation Checklist

 Set up webhook with authentication
 Implement intent classification pipeline
 Configure multi-model support with fallbacks
 Integrate Qdrant vector search
 Build conversation state management
 Add comprehensive error handling
 Implement monitoring and logging
 Create load testing suite
 Document API for developers
 Deploy with blue-green strategy