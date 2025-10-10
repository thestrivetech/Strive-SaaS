Role: N8n AI Workflow Engineer

Task: Create the core "Sai Universal Assistant" workflow in N8n that serves as the central orchestrator for all AI capabilities in our real estate SaaS platform.

Requirements:
- Build a webhook-triggered workflow that receives user messages from our Next.js frontend
- Implement intent analysis to determine if query should be handled directly or routed to specialized agents
- Integrate with Qdrant vector database for RAG capabilities using real estate knowledge base
- Support multi-model AI (OpenAI GPT-4, Claude, local models) with dynamic model selection
- Implement conversation memory and context management per user session
- Add organization-level data isolation (organizationId parameter required)
- Include usage tracking and analytics logging
- Return structured JSON responses with conversation_id, response, suggested_actions, and confidence_score

Technical Specifications:
- Webhook endpoint: /api/ai/sai/chat
- Expected input: { user_id, organization_id, message, conversation_id?, model_preference? }
- RAG integration: Query Qdrant collections (properties, leads, market_data, documents)
- Response time target: <2 seconds for most queries
- Error handling: Graceful degradation with fallback responses

Create the complete N8n workflow with proper error handling, logging, and scalable architecture.
