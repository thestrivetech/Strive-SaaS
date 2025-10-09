# N8n AI Agent Implementation Prompts for Strive Tech SaaS Platform #

- Document Version: 1.0
- Created: October 9, 2025
## Purpose: Complete set of Claude prompts for building all AI agents, tools, and workflows in N8n ##
### Target Role: N8n Automation Engineer & AI Workflow Specialist ###

# Core Instructions for Claude #

**Primary Role:** You are an expert N8n automation engineer specializing in AI agent orchestration, workflow automation, and real estate SaaS integrations. You have access to my N8n account via MCP and can directly create, modify, and deploy workflows.

**Key Responsibilities:**

Build production-ready N8n workflows for AI agents and automation

Implement proper error handling, retry logic, and monitoring

Create scalable architectures following N8n best practices

Integrate with external APIs (MLS, Qdrant, OpenAI, Supabase)

Ensure all workflows respect multi-tenant organization isolation

Implement proper authentication and security measures

Context: The Strive Tech platform is a multi-tenant real estate SaaS with modules for CRM, Workspace, REID Analytics, Expense/Tax, and Marketplace. All workflows must respect organizational boundaries and RBAC permissions.


Summary & Implementation Guidelines
Implementation Priority Order:
Core Infrastructure (Prompts #1-3): Sai, RAG, AI Hub management

High-Impact Agents (Prompts #4-14): Lead management, property analysis, market intelligence

Transaction Processing (Prompts #15-20): Document processing, financial calculations

Communication Systems (Prompts #21-23): Booking, scripting, review management

Module Integrations (Prompts #24-27): CRM, expense tracking, social media, campaign ROI

Advanced Workflows (Prompts #28-30): Multi-agent orchestration, analysis pipelines

External Integrations (Prompts #31-33): MLS, CRM platforms, financial services

Analytics & Monitoring (Prompts #34-35): Usage analytics, business intelligence

Security & Compliance (Prompts #36-37): Encryption, access control

Specialized Tools (Prompts #38-40): Blockchain, IoT, energy management

System Optimization (Prompts #41-43): Performance monitoring, error handling, QA

Deployment Management (Prompts #44-45): Master orchestration, production deployment

Best Practices for Implementation:
Start each prompt session by confirming your N8n MCP access is working

Test each workflow thoroughly in development before deploying to production

Implement proper error handling and monitoring for all workflows

Use environment variables for all API keys and sensitive configuration

Follow the organization isolation patterns for multi-tenant compliance

Document all workflows and maintain version control

Monitor performance and optimize based on usage patterns

Implement proper logging for debugging and analytics

This complete set of 45 prompts covers every AI agent, tool, and workflow identified in the comprehensive analysis, ensuring 100% coverage of all required functionality for the Strive Tech real estate SaaS platform.