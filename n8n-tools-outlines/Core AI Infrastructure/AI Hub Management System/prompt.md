Role: N8n Conversation Management Engineer

Task: Create the AI Hub management system workflow that handles conversation persistence, usage analytics, and user interaction tracking.

Requirements:
- Build conversation session management (create, update, retrieve, archive)
- Implement usage analytics tracking (tokens used, conversation length, satisfaction scores)
- Create conversation history search and retrieval system
- Add conversation export functionality for users
- Implement conversation sharing between team members (with permission checks)
- Track AI tool usage across all agents and calculate costs per organization
- Generate usage reports and billing data for subscription management
- Add conversation sentiment analysis and feedback collection

Technical Specifications:
- Database: Supabase with AI_conversations, usage_tracking, feedback tables
- Conversation retention: 90 days for free tier, unlimited for paid
- Analytics aggregation: Real-time for current usage, daily batch for historical
- Export formats: JSON, PDF, CSV
- Permission levels: Private, team, organization based on user role

Create the complete N8n workflow for conversation management and analytics.
