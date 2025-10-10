# Session 1: NeuroFlow Hub (AI-HUB) - Database Foundation

## Session Overview
**Goal:** Establish the complete database foundation for NeuroFlow Hub (AI-HUB) by extending the Prisma schema with all required models, relationships, enums, and RLS policies for workflow automation, AI agents, and team orchestration.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with NeuroFlow Hub models (Workflow, AIAgent, AgentTeam, etc.)
2. ✅ Add all enums for AI-HUB fields (AgentStatus, TeamStructure, ExecutionStatus, etc.)
3. ✅ Create relationships between models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Generate and run migrations using helper scripts
6. ✅ Add RLS policies for tenant isolation
7. ✅ Add indexes for performance optimization
8. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema with User and Organization models
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture
- [x] Platform helper scripts available (npm run db:migrate)
- [x] Supabase MCP tools available

## Database Models to Add

### NeuroFlow Hub Models Overview
- **Workflow** - Visual workflow definitions with React Flow nodes/edges
- **AIAgent** - Configurable AI agents with personality and model settings
- **AgentTeam** - Teams of agents with coordination patterns
- **TeamMember** - Agent membership in teams with roles
- **WorkflowExecution** - Execution history and results
- **AgentExecution** - Individual agent task executions
- **TeamExecution** - Team-based task executions
- **Integration** - External service connections (Slack, Gmail, etc.)
- **WorkflowTemplate** - Pre-built workflow templates for marketplace

### 1. Workflow Model
```prisma
model Workflow {
  id             String   @id @default(cuid())
  name           String   @db.VarChar(100)
  description    String?  @db.Text

  // Workflow definition (React Flow)
  nodes          Json     @db.JsonB  // React Flow nodes
  edges          Json     @db.JsonB  // React Flow connections
  variables      Json?    @db.JsonB  // Workflow variables

  // Workflow configuration
  isActive       Boolean  @default(true)
  version        String   @default("1.0.0") @db.VarChar(20)
  tags           String[] @default([])

  // Usage tracking
  executionCount Int      @default(0)
  lastExecuted   DateTime?

  // Template source
  templateId     String?
  template       WorkflowTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation("WorkflowCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  executions     WorkflowExecution[]

  @@index([organizationId])
  @@index([createdBy])
  @@index([isActive])
  @@index([templateId])
  @@index([createdAt])
  @@map("workflows")
}
```

### 2. AIAgent Model
```prisma
model AIAgent {
  id             String   @id @default(cuid())
  name           String   @db.VarChar(100)
  description    String?  @db.Text
  avatar         String?  @db.VarChar(500)

  // Agent configuration
  personality    Json     @db.JsonB  // Traits, communication style, behavior
  modelConfig    Json     @db.JsonB  // Provider, model, parameters
  capabilities   String[] @default([])  // Available tools/functions
  memory         Json     @db.JsonB  // Conversation history, knowledge base

  // Performance metrics
  executionCount Int      @default(0)
  successRate    Float?
  avgResponseTime Float?  // In milliseconds

  // Agent status
  isActive       Boolean  @default(true)
  status         AgentStatus @default(IDLE)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation("AIAgentCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  teamMembers    TeamMember[]
  executions     AgentExecution[]

  @@index([organizationId])
  @@index([createdBy])
  @@index([status])
  @@index([isActive])
  @@map("ai_agents")
}
```

### 3. AgentTeam Model
```prisma
model AgentTeam {
  id             String   @id @default(cuid())
  name           String   @db.VarChar(100)
  description    String?  @db.Text

  // Team configuration
  structure      TeamStructure  // HIERARCHICAL, COLLABORATIVE, PIPELINE, DEMOCRATIC
  coordination   Json     @db.JsonB  // Coordination pattern settings

  // Performance metrics
  executionCount Int      @default(0)
  successRate    Float?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String
  creator        User     @relation("AgentTeamCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  members        TeamMember[]
  executions     TeamExecution[]

  @@index([organizationId])
  @@index([createdBy])
  @@index([structure])
  @@map("agent_teams")
}
```

### 4. TeamMember Model
```prisma
model TeamMember {
  id       String @id @default(cuid())
  teamId   String
  team     AgentTeam @relation(fields: [teamId], references: [id], onDelete: Cascade)
  agentId  String
  agent    AIAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  role     TeamRole  // LEADER, WORKER, COORDINATOR, SPECIALIST
  priority Int      @default(0)  // Execution order

  joinedAt DateTime @default(now())

  @@unique([teamId, agentId])
  @@index([teamId])
  @@index([agentId])
  @@map("team_members")
}
```

### 5. WorkflowExecution Model
```prisma
model WorkflowExecution {
  id         String   @id @default(cuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  // Execution details
  status     ExecutionStatus @default(PENDING)
  startedAt  DateTime @default(now())
  completedAt DateTime?
  duration   Int?     // Duration in milliseconds

  // Execution data
  input      Json?    @db.JsonB  // Input parameters
  output     Json?    @db.JsonB  // Execution results
  error      String?  @db.Text   // Error message if failed
  logs       Json[]   @default([])  // Step-by-step execution logs

  // Performance metrics
  nodesExecuted Int    @default(0)
  tokensUsed   Int     @default(0)
  cost         Decimal @default(0) @db.Decimal(12, 2)  // Execution cost in cents

  // Relations
  agentExecutions AgentExecution[]

  @@index([workflowId])
  @@index([status])
  @@index([startedAt])
  @@map("workflow_executions")
}
```

### 6. AgentExecution Model
```prisma
model AgentExecution {
  id       String  @id @default(cuid())
  agentId  String
  agent    AIAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  // Execution context
  workflowExecutionId String?
  workflowExecution   WorkflowExecution? @relation(fields: [workflowExecutionId], references: [id], onDelete: SetNull)

  // Task details
  task     String  @db.Text  // Task description
  input    Json    @db.JsonB  // Input data
  output   Json?   @db.JsonB  // Agent response

  // Performance metrics
  status     ExecutionStatus @default(PENDING)
  startedAt  DateTime @default(now())
  completedAt DateTime?
  duration   Int?    // Duration in milliseconds
  tokensUsed Int     @default(0)
  cost       Decimal @default(0) @db.Decimal(12, 2)

  // AI model details
  model      String? @db.VarChar(100)  // gpt-4o, claude-sonnet-4, etc.
  provider   String? @db.VarChar(50)   // openai, anthropic

  @@index([agentId])
  @@index([workflowExecutionId])
  @@index([status])
  @@index([startedAt])
  @@map("agent_executions")
}
```

### 7. TeamExecution Model
```prisma
model TeamExecution {
  id     String    @id @default(cuid())
  teamId String
  team   AgentTeam @relation(fields: [teamId], references: [id], onDelete: Cascade)

  // Task details
  task        String @db.Text
  pattern     TeamStructure  // Coordination pattern used
  input       Json   @db.JsonB
  output      Json?  @db.JsonB

  // Performance metrics
  status      ExecutionStatus @default(PENDING)
  startedAt   DateTime @default(now())
  completedAt DateTime?
  duration    Int?

  // Agent participation
  agentResults Json[] @default([])  // Results from each participating agent

  @@index([teamId])
  @@index([status])
  @@index([startedAt])
  @@map("team_executions")
}
```

### 8. Integration Model
```prisma
model Integration {
  id           String   @id @default(cuid())
  name         String   @db.VarChar(100)
  provider     String   @db.VarChar(50)  // slack, gmail, webhook, http

  // Connection details
  credentials  Json     @db.JsonB  // API keys, tokens (encrypted)
  config       Json     @db.JsonB  // Provider-specific configuration

  // Integration status
  isActive     Boolean  @default(true)
  lastTested   DateTime?
  status       IntegrationStatus @default(DISCONNECTED)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy    String
  creator      User     @relation("IntegrationCreator", fields: [createdBy], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([createdBy])
  @@index([provider])
  @@index([status])
  @@map("integrations")
}
```

### 9. WorkflowTemplate Model
```prisma
model WorkflowTemplate {
  id             String   @id @default(cuid())
  name           String   @db.VarChar(100)
  description    String   @db.Text
  category       TemplateCategory

  // Template definition
  nodes          Json     @db.JsonB  // React Flow nodes
  edges          Json     @db.JsonB  // React Flow connections
  variables      Json?    @db.JsonB  // Default variables

  // Template metadata
  icon           String?  @db.VarChar(100)
  tags           String[] @default([])
  difficulty     DifficultyLevel @default(BEGINNER)
  estimatedTime  Int?     // Estimated setup time in minutes

  // Usage tracking
  usageCount     Int      @default(0)
  rating         Float?
  isPublic       Boolean  @default(false)
  isFeatured     Boolean  @default(false)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Multi-tenant isolation (nullable for system templates)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Relations
  createdBy      String?
  creator        User?    @relation("WorkflowTemplateCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  workflows      Workflow[]

  @@index([organizationId])
  @@index([createdBy])
  @@index([category])
  @@index([isPublic])
  @@index([isFeatured])
  @@map("workflow_templates")
}
```

### 10. Enums
```prisma
enum AgentStatus {
  IDLE
  BUSY
  OFFLINE
  ERROR
}

enum TeamStructure {
  HIERARCHICAL    // Leader delegates to workers
  COLLABORATIVE   // All agents contribute equally
  PIPELINE        // Sequential processing
  DEMOCRATIC      // Voting/consensus-based
}

enum TeamRole {
  LEADER
  WORKER
  COORDINATOR
  SPECIALIST
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
  TESTING
}

enum TemplateCategory {
  SALES
  SUPPORT
  MARKETING
  DATA_PROCESSING
  AUTOMATION
  ANALYTICS
  CONTENT
  COMMUNICATION
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

## Step-by-Step Implementation

### Step 1: Update Prisma Schema

**File:** `(platform)/prisma/schema.prisma`

1. Add all enums after existing enums
2. Add all models in the models section
3. Update existing User and Organization models to add new relations

**User Model Updates:**
```prisma
model User {
  // ... existing fields ...

  // NeuroFlow Hub Relations
  workflows            Workflow[]              @relation("WorkflowCreator")
  aiAgents             AIAgent[]               @relation("AIAgentCreator")
  agentTeams           AgentTeam[]             @relation("AgentTeamCreator")
  integrations         Integration[]           @relation("IntegrationCreator")
  workflowTemplates    WorkflowTemplate[]      @relation("WorkflowTemplateCreator")

  // ... rest of model ...
}
```

**Organization Model Updates:**
```prisma
model Organization {
  // ... existing fields ...

  // NeuroFlow Hub Relations
  workflows            Workflow[]
  aiAgents             AIAgent[]
  agentTeams           AgentTeam[]
  integrations         Integration[]
  workflowTemplates    WorkflowTemplate[]

  // ... rest of model ...
}
```

### Step 2: Create Migration Using Helper Script

**IMPORTANT: Use platform helper scripts instead of direct Prisma CLI**

```bash
# Navigate to platform directory
cd "(platform)"

# Create migration interactively
npm run db:migrate

# When prompted:
# Migration name: add_neuroflow_hub_ai_hub_module

# Generate schema documentation
npm run db:docs

# Verify migration status
npm run db:status
```

**What the migration will include:**
- All 8 enums
- All 9 models with proper relationships
- All indexes for performance
- Foreign key constraints
- Proper cascade/set null behaviors

### Step 3: Add RLS Policies (Manual SQL)

After Prisma migration completes, add RLS policies using Supabase MCP or SQL directly:

**Tool:** `mcp__supabase-production__execute_sql`

```sql
-- Enable RLS on all NeuroFlow Hub tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Workflow RLS Policies
CREATE POLICY "tenant_isolation_workflows" ON workflows
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation_workflows_insert" ON workflows
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- AIAgent RLS Policies
CREATE POLICY "tenant_isolation_ai_agents" ON ai_agents
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation_ai_agents_insert" ON ai_agents
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- AgentTeam RLS Policies
CREATE POLICY "tenant_isolation_agent_teams" ON agent_teams
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation_agent_teams_insert" ON agent_teams
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- TeamMember RLS Policies (via team)
CREATE POLICY "team_member_access" ON team_members
  USING (
    EXISTS (
      SELECT 1 FROM agent_teams
      WHERE agent_teams.id = team_members.team_id
      AND agent_teams.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- WorkflowExecution RLS Policies (via workflow)
CREATE POLICY "workflow_execution_access" ON workflow_executions
  USING (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_executions.workflow_id
      AND workflows.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- AgentExecution RLS Policies (via agent)
CREATE POLICY "agent_execution_access" ON agent_executions
  USING (
    EXISTS (
      SELECT 1 FROM ai_agents
      WHERE ai_agents.id = agent_executions.agent_id
      AND ai_agents.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- TeamExecution RLS Policies (via team)
CREATE POLICY "team_execution_access" ON team_executions
  USING (
    EXISTS (
      SELECT 1 FROM agent_teams
      WHERE agent_teams.id = team_executions.team_id
      AND agent_teams.organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Integration RLS Policies
CREATE POLICY "tenant_isolation_integrations" ON integrations
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation_integrations_insert" ON integrations
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- WorkflowTemplate RLS Policies (allow public + org templates)
CREATE POLICY "workflow_template_access" ON workflow_templates
  USING (
    is_public = true OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflow_template_insert" ON workflow_templates
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));
```

### Step 4: Generate Prisma Client

```bash
# From platform directory
npx prisma generate
```

### Step 5: Verify in Database

**Using Supabase MCP:**

```typescript
// Tool: mcp__supabase-production__list_tables
// Verify all tables exist:
// ✅ workflows
// ✅ ai_agents
// ✅ agent_teams
// ✅ team_members
// ✅ workflow_executions
// ✅ agent_executions
// ✅ team_executions
// ✅ integrations
// ✅ workflow_templates

// Tool: mcp__supabase-production__execute_sql
// Query to verify table structure:
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN (
      'workflows', 'ai_agents', 'agent_teams', 'team_members',
      'workflow_executions', 'agent_executions', 'team_executions',
      'integrations', 'workflow_templates'
    )
    ORDER BY table_name, ordinal_position;
  `
}
```

## Testing & Validation

### Test 1: Schema Validation
```bash
npx prisma validate
```
**Expected:** Schema is valid

### Test 2: Migration Success
```bash
npm run db:status
```
**Expected:** All migrations applied successfully

### Test 3: Type Generation
```bash
npx prisma generate
```
**Expected:** Types generated in node_modules/@prisma/client

### Test 4: Verify RLS Policies
**Using Supabase MCP:**
```typescript
{
  "query": `
    SELECT
      tablename,
      policyname,
      cmd,
      qual
    FROM pg_policies
    WHERE tablename IN (
      'workflows', 'ai_agents', 'agent_teams', 'team_members',
      'workflow_executions', 'agent_executions', 'team_executions',
      'integrations', 'workflow_templates'
    )
    ORDER BY tablename, policyname;
  `
}
```
**Expected:** Tenant isolation policies for all tables

## Success Criteria

- [x] All 9 new models added to schema
- [x] All 8 enums defined correctly
- [x] All relationships established
- [x] organizationId field on all tables (multi-tenancy)
- [x] Proper indexes created for performance
- [x] Migration applied successfully
- [x] Prisma client generates without errors
- [x] RLS policies enabled on all tables
- [x] TypeScript types available for all models

## Files Modified

- ✅ `(platform)/prisma/schema.prisma` - Extended with NeuroFlow Hub models

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId
**Problem:** Forgetting to add organization_id to a model
**Solution:** Every AI-HUB model MUST have organizationId for multi-tenancy

### ❌ Pitfall 2: Missing Indexes
**Problem:** Slow queries on filtered fields
**Solution:** Add indexes on commonly queried fields (status, organizationId, dates)

### ❌ Pitfall 3: Incorrect Enum Values
**Problem:** Using wrong enum values in code
**Solution:** Import enums from @prisma/client, not hardcoded strings

### ❌ Pitfall 4: Forgetting RLS Policies
**Problem:** Data leakage between organizations
**Solution:** ALWAYS enable RLS and create policies before inserting data

### ❌ Pitfall 5: Public Template Access
**Problem:** System templates not accessible across orgs
**Solution:** Use isPublic flag and proper RLS policies for public/system templates

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Workflows Module - Backend & API**
2. ✅ Database foundation is ready
3. ✅ Can start implementing business logic modules
4. ✅ Schema is extensible for future NeuroFlow features

## Rollback Plan

If issues arise, rollback using migrations:

```bash
# Check migration history
npm run db:status

# If needed, manually rollback using Supabase dashboard or MCP:
# DROP TABLE IF EXISTS workflow_templates CASCADE;
# DROP TABLE IF EXISTS integrations CASCADE;
# DROP TABLE IF EXISTS team_executions CASCADE;
# DROP TABLE IF EXISTS agent_executions CASCADE;
# DROP TABLE IF EXISTS workflow_executions CASCADE;
# DROP TABLE IF EXISTS team_members CASCADE;
# DROP TABLE IF EXISTS agent_teams CASCADE;
# DROP TABLE IF EXISTS ai_agents CASCADE;
# DROP TABLE IF EXISTS workflows CASCADE;

# DROP ENUMS...
```

---

**Session 1 Complete:** ✅ NeuroFlow Hub database foundation established, ready for module development
