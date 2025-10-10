# NeuroFlow Hub (AI-HUB) Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the NeuroFlow Hub AI automation platform into the Strive SaaS Platform, preserving the exact futuristic UI design and comprehensive workflow capabilities while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- NeuroFlow Hub code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Documentation)
**Design Theme:**
- **Futuristic UI**: Glassmorphism effects with neon accents
- **Color Palette**: 
  - Electric Blue: #00D2FF (primary)
  - Cyber Green: #39FF14 (success)
  - Violet accents: #8B5CF6 (secondary)
- **Dark Theme**: Gradient backgrounds with glass morphism
- **Interactive Elements**: React Flow drag-and-drop workflow canvas
- **Real-time Updates**: WebSocket-powered live execution monitoring

**Key Visual Elements:**
- Floating node palette with smooth animations
- Mini-map for large workflow navigation
- Glass morphism cards with neon borders
- Real-time execution visualizer with animated progress
- Team collaboration board with cyber-grid background
- Agent avatars with status rings and neon glows

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add NeuroFlow Hub Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// NeuroFlow Hub (AI-HUB) Module Tables
model Workflow {
  id             String   @id @default(cuid())
  name           String
  description    String?
  
  // Workflow definition
  nodes          Json     // React Flow nodes
  edges          Json     // React Flow connections
  variables      Json?    // Workflow variables
  
  // Workflow configuration
  isActive       Boolean  @default(true)
  version        String   @default("1.0.0")
  tags           String[]
  
  // Usage tracking
  executionCount Int      @default(0)
  lastExecuted   DateTime?
  
  // Template source
  templateId     String?
  template       WorkflowTemplate? @relation(fields: [templateId], references: [id])
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  executions     WorkflowExecution[]
  
  @@map("workflows")
}

model AIAgent {
  id             String   @id @default(cuid())
  name           String
  description    String?
  avatar         String?  // Avatar image URL
  
  // Agent configuration
  personality    Json     // Traits, communication style, behavior
  modelConfig    Json     // Provider, model, parameters
  capabilities   String[] // Available tools/functions
  memory         Json     // Conversation history, knowledge base
  
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
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  teamMembers    TeamMember[]
  executions     AgentExecution[]
  
  @@map("ai_agents")
}

model AgentTeam {
  id             String   @id @default(cuid())
  name           String
  description    String?
  
  // Team configuration
  structure      TeamStructure // HIERARCHICAL, COLLABORATIVE, PIPELINE, DEMOCRATIC
  coordination   Json     // Coordination pattern settings
  
  // Performance metrics
  executionCount Int      @default(0)
  successRate    Float?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  members        TeamMember[]
  executions     TeamExecution[]
  
  @@map("agent_teams")
}

model TeamMember {
  id       String @id @default(cuid())
  teamId   String
  team     AgentTeam @relation(fields: [teamId], references: [id])
  agentId  String
  agent    AIAgent @relation(fields: [agentId], references: [id])
  
  role     TeamRole // LEADER, WORKER, COORDINATOR, SPECIALIST
  priority Int      @default(0) // Execution order
  
  joinedAt DateTime @default(now())
  
  @@unique([teamId, agentId])
  @@map("team_members")
}

model WorkflowExecution {
  id         String   @id @default(cuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id])
  
  // Execution details
  status     ExecutionStatus @default(PENDING)
  startedAt  DateTime @default(now())
  completedAt DateTime?
  duration   Int?     // Duration in milliseconds
  
  // Execution data
  input      Json?    // Input parameters
  output     Json?    // Execution results
  error      String?  // Error message if failed
  logs       Json[]   // Step-by-step execution logs
  
  // Performance metrics
  nodesExecuted Int    @default(0)
  tokensUsed   Int     @default(0)
  cost         Decimal @default(0) // Execution cost in cents
  
  @@map("workflow_executions")
}

model AgentExecution {
  id       String  @id @default(cuid())
  agentId  String
  agent    AIAgent @relation(fields: [agentId], references: [id])
  
  // Execution context
  workflowExecutionId String?
  workflowExecution   WorkflowExecution? @relation(fields: [workflowExecutionId], references: [id])
  
  // Task details
  task     String  // Task description
  input    Json    // Input data
  output   Json?   // Agent response
  
  // Performance metrics
  status     ExecutionStatus @default(PENDING)
  startedAt  DateTime @default(now())
  completedAt DateTime?
  duration   Int?    // Duration in milliseconds
  tokensUsed Int     @default(0)
  cost       Decimal @default(0)
  
  // AI model details
  model      String? // gpt-4o, claude-sonnet-4, etc.
  provider   String? // openai, anthropic
  
  @@map("agent_executions")
}

model TeamExecution {
  id     String    @id @default(cuid())
  teamId String
  team   AgentTeam @relation(fields: [teamId], references: [id])
  
  // Task details
  task        String
  pattern     TeamStructure // Coordination pattern used
  input       Json
  output      Json?
  
  // Performance metrics
  status      ExecutionStatus @default(PENDING)
  startedAt   DateTime @default(now())
  completedAt DateTime?
  duration    Int?
  
  // Agent participation
  agentResults Json[] // Results from each participating agent
  
  @@map("team_executions")
}

model Integration {
  id           String   @id @default(cuid())
  name         String
  provider     String   // slack, gmail, webhook, http
  
  // Connection details
  credentials  Json     // API keys, tokens (encrypted)
  config       Json     // Provider-specific configuration
  
  // Integration status
  isActive     Boolean  @default(true)
  lastTested   DateTime?
  status       IntegrationStatus @default(DISCONNECTED)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy    String
  creator      User     @relation(fields: [createdBy], references: [id])
  
  @@map("integrations")
}

model WorkflowTemplate {
  id             String   @id @default(cuid())
  name           String
  description    String
  category       TemplateCategory
  
  // Template definition
  nodes          Json     // React Flow nodes
  edges          Json     // React Flow connections
  variables      Json?    // Default variables
  
  // Template metadata
  icon           String?
  tags           String[]
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
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String?
  creator        User?    @relation(fields: [createdBy], references: [id])
  workflows      Workflow[]
  
  @@map("workflow_templates")
}

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

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // NeuroFlow Hub relations
  workflows         Workflow[]
  aiAgents          AIAgent[]
  agentTeams        AgentTeam[]
  integrations      Integration[]
  workflowTemplates WorkflowTemplate[]
}

model Organization {
  // ... existing fields
  
  // NeuroFlow Hub relations
  workflows         Workflow[]
  aiAgents          AIAgent[]
  agentTeams        AgentTeam[]
  integrations      Integration[]
  workflowTemplates WorkflowTemplate[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-neuroflow-hub
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create NeuroFlow Hub Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/ai-hub/{dashboard,workflows,agents,teams,marketplace,analytics,integrations}
```

#### 2.2 Copy and Adapt Components
Create `components/features/ai-hub/` directory:

```bash
mkdir -p components/features/ai-hub/{
  workflows,
  agents,
  teams,
  analytics,
  integrations,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/ai-hub/{workflows,agents,teams,executions,integrations,templates,analytics}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create NeuroFlow Hub Module
Following platform module patterns:

```typescript
// lib/modules/ai-hub/workflows/index.ts
export const WorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nodes: z.any(), // React Flow nodes
  edges: z.any(), // React Flow edges
  variables: z.any().optional(),
  tags: z.array(z.string()),
  organizationId: z.string().uuid(),
});

export async function createWorkflow(input: WorkflowInput) {
  const session = await requireAuth();
  
  if (!canAccessAIHub(session.user)) {
    throw new Error('Unauthorized: AI Hub access required');
  }
  
  if (!canAccessFeature(session.user, 'ai-hub')) {
    throw new Error('Upgrade required: AI Hub features not available');
  }

  const validated = WorkflowSchema.parse(input);

  return await prisma.workflow.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      template: true
    }
  });
}

export async function executeWorkflow(workflowId: string, input?: any) {
  const session = await requireAuth();
  
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      organizationId: session.user.organizationId
    }
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  // Create execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      status: 'PENDING',
      input: input || {}
    }
  });

  // Execute workflow (simplified version)
  try {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: { status: 'RUNNING' }
    });

    // Process workflow nodes in topological order
    const result = await processWorkflowNodes(workflow.nodes, workflow.edges, input);

    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        output: result,
        duration: Date.now() - execution.startedAt.getTime()
      }
    });

    return { execution, result };
  } catch (error) {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message
      }
    });

    throw error;
  }
}

async function processWorkflowNodes(nodes: any[], edges: any[], input: any) {
  // Implement topological sort and node execution
  // This is a simplified version - full implementation would handle:
  // - AI agent nodes with model integration
  // - Conditional branching
  // - Integration connector nodes
  // - Parallel execution paths
  
  let result = input;
  
  for (const node of nodes) {
    if (node.type === 'trigger') {
      // Start node - pass through input
      continue;
    }
    
    if (node.type === 'aiAgent') {
      // Execute AI agent with current data
      result = await executeAIAgentNode(node, result);
    }
    
    if (node.type === 'integration') {
      // Execute integration action
      result = await executeIntegrationNode(node, result);
    }
    
    if (node.type === 'condition') {
      // Handle conditional logic
      result = await executeConditionNode(node, result);
    }
  }
  
  return result;
}
```

#### 3.2 Create AI Agent Module
```typescript
// lib/modules/ai-hub/agents/index.ts
export const AIAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  personality: z.any(),
  modelConfig: z.object({
    provider: z.enum(['openai', 'anthropic', 'groq']),
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().optional(),
  }),
  capabilities: z.array(z.string()),
  organizationId: z.string().uuid(),
});

export async function createAIAgent(input: AIAgentInput) {
  const session = await requireAuth();
  
  if (!canAccessAIHub(session.user)) {
    throw new Error('Unauthorized: AI Hub access required');
  }

  const validated = AIAgentSchema.parse(input);

  return await prisma.aIAgent.create({
    data: {
      ...validated,
      memory: {}, // Initialize empty memory
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}

export async function executeAIAgent(agentId: string, task: string, context?: any) {
  const session = await requireAuth();
  
  const agent = await prisma.aIAgent.findFirst({
    where: {
      id: agentId,
      organizationId: session.user.organizationId
    }
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  const execution = await prisma.agentExecution.create({
    data: {
      agentId,
      task,
      input: context || {},
      status: 'RUNNING'
    }
  });

  try {
    // Execute AI agent based on model provider
    let result;
    
    if (agent.modelConfig.provider === 'openai') {
      result = await executeOpenAIAgent(agent, task, context);
    } else if (agent.modelConfig.provider === 'anthropic') {
      result = await executeAnthropicAgent(agent, task, context);
    }

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        output: result,
        duration: Date.now() - execution.startedAt.getTime()
      }
    });

    return result;
  } catch (error) {
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        completedAt: new Date()
      }
    });

    throw error;
  }
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add AI Hub Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessAIHub(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canCreateWorkflows(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canExecuteWorkflows(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(user.organizationRole);
}

export function canManageAgents(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai-hub-basic'], // Basic workflows
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'ai-hub-full'], // Advanced AI features
};

export function getAIHubLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { workflows: 0, agents: 0, executions: 0 },
    STARTER: { workflows: 0, agents: 0, executions: 0 },
    GROWTH: { workflows: 10, agents: 5, executions: 1000 }, // Per month
    ELITE: { workflows: -1, agents: -1, executions: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation (Futuristic Design)

#### 5.1 Add NeuroFlow Theme CSS
Update `app/globals.css`:

```css
/* NeuroFlow Hub Theme */
:root {
  /* Electric colors */
  --electric-blue: #00D2FF;
  --cyber-green: #39FF14;
  --neon-violet: #8B5CF6;
  
  /* Glass morphism */
  --glass-dark: rgba(15, 23, 42, 0.8);
  --glass-border: rgba(0, 210, 255, 0.3);
  
  /* Neon glow effects */
  --neon-glow-blue: 0 0 20px rgba(0, 210, 255, 0.5);
  --neon-glow-green: 0 0 20px rgba(57, 255, 20, 0.5);
}

/* Electric gradient animation */
@keyframes electric-pulse {
  0%, 100% { 
    box-shadow: var(--neon-glow-blue);
    border-color: var(--electric-blue);
  }
  50% { 
    box-shadow: var(--neon-glow-green);
    border-color: var(--cyber-green);
  }
}

.electric-border {
  border: 1px solid var(--electric-blue);
  animation: electric-pulse 2s ease-in-out infinite;
}

/* Cyber grid background */
.cyber-grid {
  background-image: 
    linear-gradient(rgba(0, 210, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 210, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Floating node palette */
.floating-palette {
  background: var(--glass-dark);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--neon-glow-blue);
}

/* Workflow node styling */
.workflow-node {
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid var(--electric-blue);
  backdrop-filter: blur(10px);
}

.workflow-node:hover {
  box-shadow: var(--neon-glow-blue);
  transform: scale(1.05);
}

/* Agent avatar with status ring */
.agent-avatar {
  position: relative;
  border: 2px solid var(--electric-blue);
  box-shadow: var(--neon-glow-blue);
}

.agent-avatar.active {
  border-color: var(--cyber-green);
  box-shadow: var(--neon-glow-green);
}

/* Execution progress bar */
.execution-progress {
  background: linear-gradient(90deg, var(--electric-blue), var(--cyber-green));
  height: 4px;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.execution-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progress-shine 1.5s infinite;
}

@keyframes progress-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

#### 5.2 Create Main AI Hub Dashboard
Create `app/(platform)/ai-hub/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { AIHubHeader } from '@/components/features/ai-hub/dashboard/header'
import { WorkflowOverview } from '@/components/features/ai-hub/dashboard/workflow-overview'
import { AgentStatus } from '@/components/features/ai-hub/dashboard/agent-status'
import { ExecutionMetrics } from '@/components/features/ai-hub/dashboard/execution-metrics'
import { QuickActions } from '@/components/features/ai-hub/dashboard/quick-actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function AIHubDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 cyber-grid">
      {/* Header */}
      <AIHubHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <WorkflowOverview />
            </Suspense>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <AgentStatus />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ExecutionMetrics />
              </Suspense>
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="xl:col-span-1">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <QuickActions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.3 Create Workflow Builder Interface
Create `components/features/ai-hub/workflows/WorkflowBuilder.tsx`:
```tsx
'use client'

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Play, Save, Settings } from 'lucide-react'
import { NodePalette } from './NodePalette'
import { CustomNode } from './CustomNode'

const nodeTypes = {
  customNode: CustomNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 250, y: 25 },
    data: { 
      label: 'Trigger',
      nodeType: 'trigger',
      icon: 'Zap',
      status: 'idle'
    },
  },
]

const initialEdges: Edge[] = []

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isExecuting, setIsExecuting] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const executeWorkflow = async () => {
    setIsExecuting(true)
    
    try {
      // Simulate workflow execution
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        
        // Update node status to executing
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, status: 'executing' } }
              : n
          )
        )
        
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update node status to completed
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, status: 'completed' } }
              : n
          )
        )
      }
    } catch (error) {
      console.error('Workflow execution failed:', error)
    } finally {
      setIsExecuting(false)
      
      // Reset node statuses after 2 seconds
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle' } }))
        )
      }, 2000)
    }
  }

  const saveWorkflow = async () => {
    try {
      const workflow = {
        nodes,
        edges,
        name: 'Untitled Workflow',
        description: 'Workflow created in builder'
      }
      
      const response = await fetch('/api/v1/ai-hub/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      })
      
      if (response.ok) {
        // Show success notification
      }
    } catch (error) {
      console.error('Failed to save workflow:', error)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 to-blue-950 cyber-grid">
      <div className="h-full flex">
        {/* Node Palette */}
        <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-r border-blue-500/30">
          <NodePalette />
        </div>
        
        {/* Workflow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="workflow-canvas"
          >
            <Controls className="bg-slate-900/80 border-blue-500/30" />
            <MiniMap 
              className="bg-slate-900/80 border-blue-500/30"
              nodeColor="#00D2FF"
              maskColor="rgba(15, 23, 42, 0.8)"
            />
            <Background 
              variant="dots" 
              gap={20} 
              size={1}
              color="rgba(0, 210, 255, 0.3)"
            />
            
            {/* Control Panel */}
            <Panel position="top-right" className="space-x-2">
              <Button
                onClick={saveWorkflow}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button
                onClick={executeWorkflow}
                disabled={isExecuting}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white electric-border"
              >
                <Play className="w-4 h-4 mr-2" />
                {isExecuting ? 'Executing...' : 'Execute'}
              </Button>
              
              <Button
                className="bg-slate-800 hover:bg-slate-700 text-violet-400 border border-violet-500/50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
```

#### 5.4 Create Agent Management Interface
Create `components/features/ai-hub/agents/AgentLab.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Zap, Brain, Activity } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface AIAgent {
  id: string
  name: string
  description: string
  status: 'IDLE' | 'BUSY' | 'OFFLINE' | 'ERROR'
  modelConfig: {
    provider: string
    model: string
  }
  successRate: number
  executionCount: number
}

export function AgentLab() {
  const queryClient = useQueryClient()
  
  const { data: agents, isLoading } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const response = await fetch('/api/v1/ai-hub/agents')
      return response.json()
    }
  })

  const executeAgentMutation = useMutation({
    mutationFn: async ({ agentId, task }: { agentId: string; task: string }) => {
      const response = await fetch(`/api/v1/ai-hub/agents/${agentId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] })
    }
  })

  const getStatusColor = (status: string) => {
    const colors = {
      IDLE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      BUSY: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      OFFLINE: 'bg-red-500/20 text-red-300 border-red-500/30',
      ERROR: 'bg-red-600/20 text-red-400 border-red-600/30'
    }
    return colors[status as keyof typeof colors] || colors.IDLE
  }

  const getProviderIcon = (provider: string) => {
    const icons = {
      openai: '🤖',
      anthropic: '🧠',
      groq: '⚡'
    }
    return icons[provider as keyof typeof icons] || '🤖'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="floating-palette rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-slate-600 rounded mb-4"></div>
            <div className="h-3 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-700 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-slate-600 rounded w-16"></div>
              <div className="h-8 bg-slate-600 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text">
            AI Agent Laboratory
          </h1>
          <p className="text-slate-400 mt-2">Create, configure, and manage your AI workforce</p>
        </div>
        
        <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white electric-border">
          <Bot className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.agents?.map((agent: AIAgent, index: number) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="floating-palette rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`agent-avatar rounded-full p-2 ${
                      agent.status === 'BUSY' ? 'active' : ''
                    }`}>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white">
                          <Bot className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Status Ring */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        agent.status === 'IDLE' ? 'bg-green-500' :
                        agent.status === 'BUSY' ? 'bg-yellow-500 animate-pulse' :
                        agent.status === 'OFFLINE' ? 'bg-gray-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div>
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <p className="text-slate-400 text-sm">{agent.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(agent.status)} border px-3 py-1`}>
                    <Activity className="w-3 h-3 mr-1" />
                    {agent.status}
                  </Badge>
                  
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span>{getProviderIcon(agent.modelConfig.provider)}</span>
                    <span>{agent.modelConfig.model}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {agent.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-violet-400">
                      {agent.executionCount}
                    </div>
                    <div className="text-xs text-slate-500">Executions</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/50"
                    disabled={agent.status === 'BUSY'}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-violet-400 border border-violet-500/50"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Workflows API
Create `app/api/v1/ai-hub/workflows/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createWorkflow, getWorkflows } from '@/lib/modules/ai-hub/workflows'
import { canAccessAIHub, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAIHub(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      isActive: searchParams.get('active') === 'true',
      tags: searchParams.get('tags')?.split(','),
    }

    const workflows = await getWorkflows(filters)
    return NextResponse.json({ workflows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAIHub(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'ai-hub')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const workflow = await createWorkflow({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}
```

#### 6.2 Create Workflow Execution API
Create `app/api/v1/ai-hub/workflows/[id]/execute/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { executeWorkflow } from '@/lib/modules/ai-hub/workflows'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAIHub(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { input } = await req.json()
    const result = await executeWorkflow(params.id, input)
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Execution failed',
      details: error.message 
    }, { status: 500 })
  }
}
```

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'AI Hub (NeuroFlow)',
    href: '/ai-hub/dashboard',
    icon: Zap,
    children: [
      { name: 'Dashboard', href: '/ai-hub/dashboard' },
      { name: 'Workflows', href: '/ai-hub/workflows' },
      { name: 'AI Agents', href: '/ai-hub/agents' },
      { name: 'Teams', href: '/ai-hub/teams' },
      { name: 'Marketplace', href: '/ai-hub/marketplace' },
      { name: 'Analytics', href: '/ai-hub/analytics' },
      { name: 'Integrations', href: '/ai-hub/integrations' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create NeuroFlow Hub Tests
Create `__tests__/modules/ai-hub/workflows.test.ts`:
```typescript
import { createWorkflow, executeWorkflow } from '@/lib/modules/ai-hub/workflows'
import { canAccessAIHub } from '@/lib/auth/rbac'

describe('NeuroFlow Hub Module', () => {
  it('should create workflow for current org only', async () => {
    const workflow = await createWorkflow({
      name: 'Test Workflow',
      nodes: [{ id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: {} }],
      edges: [],
      tags: ['test'],
      organizationId: 'org-123'
    })

    expect(workflow.organizationId).toBe('org-123')
  })

  it('should execute workflow and track performance', async () => {
    const workflowId = 'workflow-123'
    const result = await executeWorkflow(workflowId, { test: 'data' })

    expect(result.execution).toBeDefined()
    expect(result.execution.status).toBe('COMPLETED')
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all NeuroFlow tables
- [ ] RBAC permissions working for AI Hub access
- [ ] Subscription tier limits enforced
- [ ] Electric blue/cyber green theme CSS loaded correctly
- [ ] Workflow builder with React Flow canvas operational
- [ ] Node palette with drag-and-drop functionality working
- [ ] AI agent lab displaying agents with status indicators
- [ ] Team orchestration patterns implemented
- [ ] Real-time execution monitoring with WebSocket
- [ ] Integration connectors (Slack, Email, Webhook) functional
- [ ] Analytics dashboard showing execution metrics
- [ ] Template marketplace operational
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Glass morphism effects rendering correctly
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements from Documentation:**
- **Electric Theme**: 
  - Primary: Electric Blue (#00D2FF) 
  - Success: Cyber Green (#39FF14)
  - Secondary: Violet (#8B5CF6)
- **Glass Morphism**: `backdrop-filter: blur(20px)` with dark glass backgrounds
- **Neon Effects**: Box shadows with electric blue/green glows
- **Cyber Grid**: Background pattern with electric blue grid lines
- **Floating Elements**: Node palette and panels with glass morphism
- **Status Indicators**: Agent avatars with animated status rings
- **Progress Animation**: Execution bars with shine effects

**Component Styling Patterns:**
```css
/* Electric border animation */
.electric-border {
  border: 1px solid #00D2FF;
  animation: electric-pulse 2s ease-in-out infinite;
}

/* Floating glass panels */
.floating-palette {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 210, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.5);
}

/* Workflow node styling */
.workflow-node {
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid #00D2FF;
  backdrop-filter: blur(10px);
}

/* Agent status ring */
.agent-avatar.active {
  border-color: #39FF14;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
}
```

This integration preserves the exact futuristic, glassmorphic design of NeuroFlow Hub while seamlessly integrating it into the Strive platform's multi-tenant, RBAC architecture with comprehensive workflow automation, AI agent management, and real-time execution capabilities.