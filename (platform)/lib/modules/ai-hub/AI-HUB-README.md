# AI Hub Module

**Enterprise AI automation and orchestration for real estate professionals**

## 📋 Overview

The AI Hub is a comprehensive module that provides AI-powered automation, intelligent agents, multi-agent teams, and workflow orchestration for the Strive Tech platform. It enables users to create custom AI agents, build automated workflows, and coordinate teams of agents to handle complex tasks.

**Location:**
- Frontend: `app/real-estate/ai-hub/`
- Backend: `lib/modules/ai-hub/`
- Components: `components/real-estate/ai-hub/`

**Access Requirements:**
- **Minimum Tier:** GROWTH ($699/month per seat)
- **Permissions:** RBAC checks via `canAccessAIHub()` and `canManageAIHub()`

---

## 🏗️ Architecture

### Module Structure

```
lib/modules/ai-hub/
├── workflows/          # Automation workflow builder
│   ├── actions.ts     # Create, update, execute, delete
│   ├── queries.ts     # Fetch workflows and stats
│   ├── schemas.ts     # Zod validation schemas
│   ├── execution.ts   # Workflow execution engine
│   └── utils.ts       # Validation utilities
├── agents/            # AI agent management
│   ├── actions.ts     # CRUD operations
│   ├── queries.ts     # Fetch agents and executions
│   ├── schemas.ts     # Agent configuration schemas
│   ├── execution.ts   # Agent execution engine
│   ├── providers.ts   # API key validation
│   └── utils.ts       # Config validation
├── teams/             # Multi-agent coordination
│   ├── actions.ts     # Team management
│   ├── queries.ts     # Team data fetching
│   ├── schemas.ts     # Team configuration
│   ├── execution.ts   # Team execution engine
│   ├── patterns.ts    # Coordination patterns
│   └── utils.ts       # Team utilities
├── integrations/      # Third-party integrations
│   ├── actions.ts     # Integration management
│   ├── queries.ts     # Integration data
│   ├── schemas.ts     # Integration config
│   ├── providers/     # Integration providers
│   │   ├── slack.ts   # Slack integration
│   │   ├── gmail.ts   # Gmail integration (stub)
│   │   ├── webhook.ts # Webhook integration (stub)
│   │   └── http.ts    # HTTP integration (stub)
│   └── utils.ts
├── templates/         # Workflow templates
│   ├── actions.ts     # Template management
│   ├── queries.ts     # Template library
│   ├── schemas.ts     # Template validation
│   └── utils.ts
├── analytics/         # Execution analytics
│   └── queries.ts     # Stats and metrics
├── dashboard/         # Dashboard data
│   └── queries.ts     # Overview stats
└── index.ts          # Module exports
```

---

## 🤖 Features

### 1. AI Agents

Create custom AI agents with specific personalities, capabilities, and model configurations.

**Supported Providers:**
- **OpenAI:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic:** Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Groq:** Llama 3 70B, Mixtral 8x7B

**Agent Configuration:**
```typescript
{
  name: "Real Estate Assistant",
  description: "Helps with property analysis and market research",
  personality: {
    traits: ["professional", "analytical", "detail-oriented"],
    tone: "professional",
    expertise: ["real estate", "market analysis"]
  },
  model_config: {
    provider: "openai",
    model: "gpt-4-turbo",
    temperature: 0.7,
    max_tokens: 4000
  },
  capabilities: ["property_analysis", "market_research", "documentation"],
  memory: {
    conversation_history: [],
    context_window: 10
  }
}
```

### 2. Automation Workflows

Build visual workflows using React Flow with drag-and-drop nodes.

**Workflow Components:**
- **Nodes:** Trigger, Action, Condition, Transform, AI Task
- **Edges:** Data flow connections
- **Variables:** Dynamic workflow inputs
- **Execution:** Logs, status tracking, error handling

**Workflow Definition:**
```typescript
{
  name: "Lead Qualification Workflow",
  description: "Automatically qualify and route leads",
  nodes: [
    { id: "1", type: "trigger", data: { event: "lead_created" } },
    { id: "2", type: "ai_task", data: { agentId: "agent-123" } },
    { id: "3", type: "condition", data: { field: "score", operator: ">" } }
  ],
  edges: [
    { source: "1", target: "2" },
    { source: "2", target: "3" }
  ]
}
```

### 3. Agent Teams

Coordinate multiple agents using different patterns.

**Team Structures:**
- **Hierarchical:** Leader delegates tasks to workers
- **Collaborative:** All agents contribute, results merged
- **Pipeline:** Sequential processing through agents
- **Democratic:** Agents vote on decisions

**Team Configuration:**
```typescript
{
  name: "Property Analysis Team",
  structure: "HIERARCHICAL",
  coordination: {
    leaderDelegationStrategy: "capability_match",
    workerReportingFormat: "structured",
    maxRetries: 2,
    timeout: 60000
  },
  members: [
    { agentId: "agent-1", role: "LEADER", priority: 10 },
    { agentId: "agent-2", role: "WORKER", priority: 5 },
    { agentId: "agent-3", role: "SPECIALIST", priority: 5 }
  ]
}
```

### 4. Integrations

Connect to external services for data flow and automation.

**Available Integrations:**
- **Slack:** ✅ Full (webhooks, bot API, file uploads)
- **Gmail:** 🚧 Stub (needs implementation)
- **Webhook:** 🚧 Stub (needs implementation)
- **HTTP:** 🚧 Stub (needs implementation)

---

## 🔐 Security & Multi-Tenancy

### Multi-Tenancy

**All queries are automatically filtered by organization:**

```typescript
import { setTenantContext } from '@/lib/database/prisma-middleware';

// ALWAYS set context before queries
await setTenantContext({
  organizationId: user.organizationId,
  userId: user.id
});

// Now queries auto-filter by organization
const agents = await prisma.ai_agents.findMany();
```

### RBAC (Role-Based Access Control)

**Two-level permission check:**

```typescript
import { canAccessAIHub, canManageAIHub } from '@/lib/auth/rbac';

// Check if user can view AI Hub (GROWTH tier minimum)
if (!canAccessAIHub(user)) {
  throw new Error('Unauthorized: GROWTH tier required');
}

// Check if user can create/edit/delete (ADMIN or SUPER_ADMIN)
if (!canManageAIHub(user)) {
  throw new Error('Unauthorized: Admin permissions required');
}
```

### Tier Gating

**AI Hub requires GROWTH tier minimum:**
- FREE: ❌ No access
- CUSTOM: ❌ No access
- STARTER: ❌ No access
- GROWTH: ✅ Full access
- ELITE: ✅ Full access
- ENTERPRISE: ✅ Full access

**SUPER_ADMIN users bypass all tier restrictions.**

---

## ⚙️ Configuration

### Environment Variables

**Required API Keys:**

```bash
# OpenAI (required for GPT models)
OPENAI_API_KEY="sk-proj-..."

# Anthropic (required for Claude models)
ANTHROPIC_API_KEY="sk-ant-..."

# Groq (required for Llama/Mixtral models)
GROQ_API_KEY="gsk_..."
```

**Optional Integrations:**

```bash
# Slack Bot Token
SLACK_BOT_TOKEN="xoxb-..."

# Gmail OAuth Credentials
GMAIL_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="GOCSPX-..."
GMAIL_REFRESH_TOKEN="1//..."
```

### Provider Setup

1. **OpenAI:**
   - Get API key: https://platform.openai.com/api-keys
   - Set `OPENAI_API_KEY` in `.env.local`
   - Supported models: gpt-4, gpt-4-turbo, gpt-3.5-turbo

2. **Anthropic:**
   - Get API key: https://console.anthropic.com/settings/keys
   - Set `ANTHROPIC_API_KEY` in `.env.local`
   - Supported models: claude-3-opus, claude-3-sonnet, claude-3-haiku

3. **Groq:**
   - Get API key: https://console.groq.com/keys
   - Set `GROQ_API_KEY` in `.env.local`
   - Supported models: llama3-70b-8192, mixtral-8x7b-32768

---

## 📊 Database Schema

### Models (8)

**Core Tables:**
- `ai_agents` - Agent definitions
- `agent_teams` - Team configurations
- `team_members` - Agent-to-team relationships
- `automation_workflows` - Workflow definitions
- `workflow_executions` - Execution history
- `agent_executions` - Agent runs
- `team_executions` - Team coordination runs
- `workflow_templates` - Reusable templates

### Enums (6)

```typescript
AgentStatus: IDLE | BUSY | OFFLINE | ERROR

TeamStructure: HIERARCHICAL | COLLABORATIVE | PIPELINE | DEMOCRATIC

TeamRole: LEADER | WORKER | COORDINATOR | SPECIALIST

ExecutionStatus: PENDING | RUNNING | COMPLETED | FAILED | CANCELLED

TemplateCategory: SALES | SUPPORT | MARKETING | DATA_PROCESSING |
                  AUTOMATION | ANALYTICS | CONTENT | COMMUNICATION

DifficultyLevel: BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
```

### Relationships

```
organizations (1) ──> (M) ai_agents
organizations (1) ──> (M) agent_teams
organizations (1) ──> (M) automation_workflows
organizations (1) ──> (M) workflow_templates

ai_agents (1) ──> (M) team_members
ai_agents (1) ──> (M) agent_executions

agent_teams (1) ──> (M) team_members
agent_teams (1) ──> (M) team_executions

automation_workflows (1) ──> (M) workflow_executions

workflow_executions (1) ──> (M) agent_executions

workflow_templates (1) ──> (M) automation_workflows
```

---

## 🚀 Usage Examples

### Creating an AI Agent

```typescript
import { createAgent } from '@/lib/modules/ai-hub/agents';

const agent = await createAgent({
  name: "Market Research Agent",
  description: "Analyzes market trends and generates reports",
  personality: {
    traits: ["analytical", "data-driven"],
    tone: "professional",
    expertise: ["market analysis", "real estate trends"]
  },
  model_config: {
    provider: "openai",
    model: "gpt-4-turbo",
    temperature: 0.5,
    max_tokens: 8000
  },
  capabilities: ["research", "analysis", "reporting"],
  organizationId: user.organizationId
});
```

### Executing an Agent

```typescript
import { executeAgent } from '@/lib/modules/ai-hub/agents';

const execution = await executeAgent({
  agentId: agent.id,
  task: "Analyze the current real estate market in Austin, TX",
  context: {
    location: "Austin, TX",
    timeframe: "Q4 2024",
    focus: ["prices", "inventory", "trends"]
  }
});

console.log(execution.output); // AI-generated analysis
console.log(execution.tokens_used); // Token usage
console.log(execution.cost); // Execution cost
```

### Creating a Workflow

```typescript
import { createWorkflow } from '@/lib/modules/ai-hub/workflows';

const workflow = await createWorkflow({
  name: "Lead Nurture Campaign",
  description: "Automated lead follow-up sequence",
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      data: { event: "lead_created", delay: 0 }
    },
    {
      id: "qualify",
      type: "ai_task",
      data: {
        agentId: "agent-qualify-123",
        task: "Qualify lead based on criteria"
      }
    },
    {
      id: "email",
      type: "action",
      data: {
        integration: "email",
        template: "welcome_email"
      }
    }
  ],
  edges: [
    { source: "trigger", target: "qualify" },
    { source: "qualify", target: "email" }
  ],
  isActive: true,
  organizationId: user.organizationId
});
```

### Creating an Agent Team

```typescript
import { createTeam, addTeamMember } from '@/lib/modules/ai-hub/teams';

// Create team
const team = await createTeam({
  name: "Content Generation Team",
  description: "Collaborative content creation",
  structure: "COLLABORATIVE",
  coordination: {
    contributionWeights: {
      "agent-writer": 0.5,
      "agent-editor": 0.3,
      "agent-seo": 0.2
    },
    consensusThreshold: 0.7
  },
  organizationId: user.organizationId
});

// Add members
await addTeamMember({
  teamId: team.id,
  agentId: "agent-writer",
  role: "WORKER",
  priority: 10
});
```

---

## 📈 Cost Tracking

### Token Usage

All executions track token usage:

```typescript
{
  tokens_used: 1500,
  cost: 0.045,
  model: "gpt-4-turbo",
  provider: "openai"
}
```

### Cost Calculation

**Provider Pricing (approximate):**

| Provider | Model | Input (per 1K) | Output (per 1K) |
|----------|-------|----------------|-----------------|
| OpenAI | GPT-4 Turbo | $0.01 | $0.03 |
| OpenAI | GPT-3.5 Turbo | $0.0005 | $0.0015 |
| Anthropic | Claude 3 Opus | $0.015 | $0.075 |
| Anthropic | Claude 3 Sonnet | $0.003 | $0.015 |
| Anthropic | Claude 3 Haiku | $0.00025 | $0.00125 |
| Groq | Llama 3 70B | FREE | FREE |
| Groq | Mixtral 8x7B | FREE | FREE |

**Note:** Groq provides free inference with rate limits.

---

## 🧪 Testing

### Unit Tests

```bash
cd (platform)
npm test lib/modules/ai-hub
```

### Integration Tests

```bash
# Test agent execution
npm test lib/modules/ai-hub/agents/execution.test.ts

# Test workflow execution
npm test lib/modules/ai-hub/workflows/execution.test.ts

# Test team coordination
npm test lib/modules/ai-hub/teams/execution.test.ts
```

### Manual Testing

1. Navigate to `/real-estate/ai-hub`
2. Verify GROWTH tier gate works
3. Create a test agent
4. Execute the agent with a simple task
5. Verify execution logs and cost tracking

---

## 🐛 Troubleshooting

### Common Issues

**"API key not configured for provider"**
- Solution: Add required API keys to `.env.local`
- Check `lib/modules/ai-hub/agents/providers.ts` for validation

**"Unauthorized: AI Hub access required"**
- Solution: User needs GROWTH tier or higher
- SUPER_ADMIN users bypass this check

**"Agent execution failed"**
- Check execution logs in `agent_executions` table
- Verify API key is valid
- Check token limits haven't been exceeded

**"Workflow validation failed"**
- Ensure all nodes have required data fields
- Verify edges connect valid nodes
- Check for circular dependencies

---

## 📚 Additional Resources

**Documentation:**
- Database schema: `prisma/SCHEMA-MODELS.md`
- Enum values: `prisma/SCHEMA-ENUMS.md`
- Quick reference: `prisma/SCHEMA-QUICK-REF.md`

**Provider Documentation:**
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com
- Groq: https://console.groq.com/docs

**Integration Guides:**
- Slack: https://api.slack.com/docs
- Gmail: https://developers.google.com/gmail/api

---

## 🔮 Roadmap

### v1.0 (Current)
- ✅ AI Agents (OpenAI, Anthropic, Groq)
- ✅ Automation Workflows
- ✅ Multi-agent Teams
- ✅ Slack Integration
- ✅ Cost Tracking

### v1.1 (Planned)
- 🚧 Complete Gmail integration
- 🚧 Complete Webhook integration
- 🚧 Complete HTTP integration
- 🚧 Advanced analytics dashboard
- 🚧 Template marketplace

### v2.0 (Future)
- 📝 Fine-tuning support
- 📝 Custom model hosting
- 📝 Agent marketplace
- 📝 Advanced team patterns
- 📝 Real-time collaboration

---

## 🤝 Contributing

When contributing to AI Hub:

1. **Read the module structure** above
2. **Follow security patterns** (RBAC, multi-tenancy)
3. **Use Zod schemas** for all input validation
4. **Write tests** for new features
5. **Update documentation** when changing APIs

---

**Last Updated:** 2025-10-11
**Version:** 1.0
**Maintainer:** Strive Tech Platform Team
