# AI-HUB Module Architecture

**Last Updated:** 2025-10-10
**Status:** Database Foundation Complete (Session 1)

## Module Purpose

AI-HUB is the **UNIFIED CONTROL CENTER** for ALL AI and automation capabilities across the Strive Tech platform.

It is NOT a separate system. It aggregates and provides management for:
- AI conversations (all types)
- Chatbot interactions (Sai)
- Transaction automation workflows
- AI-powered automation workflows
- AI agents and teams
- External integrations
- AI tools and capabilities

Think of it as the "Task Manager" or "System Preferences" for AI.

## Database Architecture

### EXISTING Tables (Used by AI-HUB):
- `ai_conversations` - General AI interactions
- `conversations` - Chatbot (Sai) conversations
- `workflows` - Transaction automation
- `ai_tools` - Available AI tools

### NEW Tables (AI-HUB Specific):
- `ai_agents` - Configurable AI agents
- `agent_teams` - Multi-agent orchestration
- `team_members` - Team membership
- `automation_workflows` - AI automation (distinct from transaction workflows)
- `workflow_executions` - Unified execution tracking
- `agent_executions` - Agent task history
- `team_executions` - Team task history
- `integrations` - External service connections
- `workflow_templates` - Marketplace templates

### Key Design Decisions:

**1. Naming Convention:**
- Prefix with domain to avoid conflicts (ai_agents, automation_workflows)
- Use existing table naming patterns (snake_case)

**2. Workflow Separation:**
- `workflows` table = Transaction workflows (real estate deals)
- `automation_workflows` table = AI-powered automation workflows
- `workflow_executions` table = Tracks BOTH types (polymorphic)

**3. Multi-Tenancy:**
- ALL tables have organization_id
- RLS policies enforce tenant isolation
- Every query filters by organization_id

## Database Schema Summary

### Enums Added (8 total):
```prisma
enum AgentStatus {
  IDLE, BUSY, OFFLINE, ERROR
}

enum TeamStructure {
  HIERARCHICAL, COLLABORATIVE, PIPELINE, DEMOCRATIC
}

enum TeamRole {
  LEADER, WORKER, COORDINATOR, SPECIALIST
}

enum ExecutionStatus {
  PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
}

enum IntegrationStatus {
  CONNECTED, DISCONNECTED, ERROR, TESTING
}

enum TemplateCategory {
  SALES, SUPPORT, MARKETING, DATA_PROCESSING, AUTOMATION, ANALYTICS, CONTENT, COMMUNICATION
}

enum DifficultyLevel {
  BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
}
```

### Models Added (9 total):

**1. ai_agents** - AI Agent Configurations
- Fields: name, description, avatar, personality, model_config, capabilities, memory
- Performance: execution_count, success_rate, avg_response_time
- Status: is_active, status (AgentStatus)
- Relations: organization, creator, team_members, executions

**2. agent_teams** - Multi-Agent Orchestration
- Fields: name, description, structure (TeamStructure), coordination
- Performance: execution_count, success_rate
- Relations: organization, creator, members, executions

**3. team_members** - Team Membership
- Fields: team_id, agent_id, role (TeamRole), priority
- Unique: [team_id, agent_id]

**4. automation_workflows** - AI Automation Workflows
- Fields: name, description, nodes (React Flow), edges, variables
- Config: is_active, version, tags
- Usage: execution_count, last_executed
- Relations: organization, creator, template, executions

**5. workflow_executions** - Unified Execution Tracking
- Fields: workflow_id, workflow_type (polymorphic), status
- Timing: started_at, completed_at, duration
- Data: input, output, error, logs
- Performance: nodes_executed, tokens_used, cost
- Relations: automation_workflow, agent_executions

**6. agent_executions** - Agent Task Executions
- Fields: agent_id, workflow_execution_id, task, input, output
- Status: status (ExecutionStatus), started_at, completed_at, duration
- Performance: tokens_used, cost
- AI Details: model, provider

**7. team_executions** - Team Task Executions
- Fields: team_id, task, pattern (TeamStructure), input, output
- Status: status, started_at, completed_at, duration
- Results: agent_results (JSON array)

**8. integrations** - External Service Connections
- Fields: name, provider, credentials (encrypted), config
- Status: is_active, last_tested, status (IntegrationStatus)
- Relations: organization, creator

**9. workflow_templates** - Marketplace Templates
- Fields: name, description, category, nodes, edges, variables
- Metadata: icon, tags, difficulty, estimated_time
- Usage: usage_count, rating, is_public, is_featured
- Relations: organization (nullable), creator (nullable), automation_workflows

### Relations Added to Existing Models:

**users table:**
```prisma
ai_agents              ai_agents[]              @relation("AIAgentCreator")
agent_teams            agent_teams[]            @relation("AgentTeamCreator")
automation_workflows   automation_workflows[]   @relation("AutomationWorkflowCreator")
integrations           integrations[]           @relation("IntegrationCreator")
workflow_templates     workflow_templates[]     @relation("WorkflowTemplateCreator")
```

**organizations table:**
```prisma
ai_agents              ai_agents[]
agent_teams            agent_teams[]
automation_workflows   automation_workflows[]
integrations           integrations[]
workflow_templates     workflow_templates[]
```

## Security & Multi-Tenancy

### RLS Policies Required:
All 9 new tables need RLS policies to enforce tenant isolation:

```sql
-- Enable RLS on all AI-HUB tables
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Example tenant isolation policy (repeat for all tables)
CREATE POLICY "tenant_isolation_ai_agents" ON ai_agents
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));
```

### Application-Level Security:
```typescript
// ALWAYS filter by organization_id
const agents = await prisma.ai_agents.findMany({
  where: { organization_id: session.user.organizationId }
});

// Set tenant context for automatic filtering
await setTenantContext({
  organizationId: session.user.organizationId,
  userId: session.user.id
});
```

## Integration Points

### Future Sessions Will Build:

**Session 2: Workflows Module**
- React Flow workflow builder
- Node palette (trigger, AI agent, integration, condition)
- Execution engine
- Real-time monitoring

**Session 3: AI Agents Module**
- Agent configuration UI
- Model selection (OpenAI, Anthropic, Groq)
- Personality customization
- Capability management
- Testing playground

**Session 4: Agent Teams Module**
- Team creation & management
- Role assignment (LEADER, WORKER, COORDINATOR, SPECIALIST)
- Coordination patterns (HIERARCHICAL, COLLABORATIVE, PIPELINE, DEMOCRATIC)
- Team execution monitoring

**Session 5: Integrations Module**
- Integration connectors (Slack, Gmail, Webhook, HTTP)
- Credential management (encrypted)
- Connection testing
- Action triggers

**Session 6: Templates Marketplace**
- Template browsing & search
- Category filtering
- Difficulty levels
- Usage tracking & ratings
- One-click deployment

**Session 7: Analytics & Monitoring**
- Execution metrics dashboard
- Performance charts (success rate, response time, cost)
- Token usage tracking
- Cost analysis
- Error logs

**Session 8: Testing & Deployment**
- Unit tests (80%+ coverage)
- Integration tests
- E2E tests (Playwright)
- Production deployment
- Documentation

## Technical Specifications

### Performance Targets:
- Workflow execution: < 5 seconds for simple workflows
- Agent response: < 3 seconds for single-agent tasks
- Team coordination: < 10 seconds for multi-agent tasks
- Dashboard load: < 2 seconds
- Real-time updates: < 500ms latency

### Scaling Considerations:
- Workflow executions: Indexed by status, started_at for efficient queries
- Agent executions: Partitioned by organization_id for tenant isolation
- Execution logs: JSON array with size limits (max 1000 entries)
- Cost tracking: Decimal(12,2) supports up to $10M in costs
- Token usage: Integer supports up to 2.1B tokens

### Data Retention:
- Active workflows: Indefinite
- Completed executions: 90 days (configurable per tier)
- Failed executions: 30 days
- Execution logs: 7 days (archived to cold storage after)
- Templates: Indefinite for public, 180 days for private unused

## Session 1 Completion Status

### Completed:
- ✅ 8 new enums added to schema
- ✅ 9 new models added to schema
- ✅ Relations added to users and organizations
- ✅ Schema pushed to Supabase database
- ✅ Prisma client generated with new models
- ✅ Schema documentation regenerated (SCHEMA-*.md)
- ✅ Database tables verified in production
- ✅ TypeScript validation passed (0 schema errors)

### Remaining Work:
- ⏳ Add RLS policies for all 9 tables (Session 2 prerequisite)
- ⏳ Create module backend structure (lib/modules/ai-hub/)
- ⏳ Create frontend routes (app/real-estate/ai-hub/)
- ⏳ Build UI components
- ⏳ Implement RBAC permissions for AI-HUB
- ⏳ Add subscription tier limits
- ⏳ Create API routes
- ⏳ Write tests

## Next Steps (Session 2)

**Priority 1: Add RLS Policies**
- Enable RLS on all 9 tables
- Create tenant isolation policies
- Test multi-tenant queries
- Document policy patterns

**Priority 2: Module Structure**
- Create `lib/modules/ai-hub/` directory
- Implement workflows module (schemas, queries, actions)
- Implement agents module
- Implement integrations module

**Priority 3: RBAC Integration**
- Add AI-HUB permissions to `lib/auth/rbac.ts`
- Define tier-based access limits
- Implement permission checks in Server Actions

**Priority 4: Basic UI**
- Create AI-HUB dashboard page
- Create workflows list page
- Create agents list page
- Add navigation menu integration

---

**Database Foundation Status:** ✅ COMPLETE
**Production Ready:** ⏳ Pending RLS policies + Module implementation
**Next Session:** Session 2 - Workflows Module Implementation
