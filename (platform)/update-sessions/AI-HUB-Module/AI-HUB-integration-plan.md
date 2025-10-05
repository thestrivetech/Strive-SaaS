# NeuroFlow Hub Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the NeuroFlow Hub AI Automation Platform into the Strive SaaS Platform, preserving the original UI design and functionality while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Admin access to platform repository
- Understanding of multi-tenant RLS and RBAC patterns

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add NeuroFlow Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// NeuroFlow Hub Tables
model Workflow {
  id             String   @id @default(cuid())
  name           String
  description    String?
  nodes          Json     // React Flow nodes
  edges          Json     // React Flow edges  
  status         WorkflowStatus @default(DRAFT)
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
  avatar         String?
  personality    Json     // Traits and communication style
  capabilities   String[] // Skills and enabled tools
  modelConfig    Json     // Provider, model, parameters
  memory         Json     // Vector embeddings and context
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
  structure      TeamStructure // HIERARCHICAL, COLLABORATIVE, PIPELINE, DEMOCRATIC
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  members        TeamMember[]
  
  @@map("agent_teams")
}

model TeamMember {
  id       String @id @default(cuid())
  teamId   String
  team     AgentTeam @relation(fields: [teamId], references: [id])
  agentId  String
  agent    AIAgent @relation(fields: [agentId], references: [id])
  role     String // leader, worker, coordinator
  
  @@unique([teamId, agentId])
  @@map("team_members")
}

model WorkflowExecution {
  id          String    @id @default(cuid())
  workflowId  String
  workflow    Workflow  @relation(fields: [workflowId], references: [id])
  status      ExecutionStatus
  startedAt   DateTime
  completedAt DateTime?
  error       String?
  result      Json?
  tokenUsage  Json?     // AI token tracking
  
  @@map("workflow_executions")
}

model AgentExecution {
  id        String    @id @default(cuid())
  agentId   String
  agent     AIAgent   @relation(fields: [agentId], references: [id])
  input     String
  output    String?
  status    ExecutionStatus
  startedAt DateTime
  completedAt DateTime?
  tokenUsage Json?
  
  @@map("agent_executions")
}

model WorkflowTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  nodes       Json
  edges       Json
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  // Nullable for public templates
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  
  @@map("workflow_templates")
}

enum WorkflowStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum TeamStructure {
  HIERARCHICAL
  COLLABORATIVE  
  PIPELINE
  DEMOCRATIC
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // NeuroFlow relations
  workflows         Workflow[]
  agents            AIAgent[]
  teams             AgentTeam[]
  templates         WorkflowTemplate[]
}

model Organization {
  // ... existing fields
  
  // NeuroFlow relations
  workflows         Workflow[]
  agents            AIAgent[]
  teams             AgentTeam[]
  templates         WorkflowTemplate[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-neuroflow-hub
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create NeuroFlow Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/automation/{workflows,agents,teams,marketplace,analytics}
mkdir -p app/\(platform\)/automation/workflows/{builder,templates}
mkdir -p app/\(platform\)/automation/agents/{create,manage}
mkdir -p app/\(platform\)/automation/teams/workshop
```

#### 2.2 Copy and Adapt Components
Create `components/features/automation/` directory and migrate components:

```bash
mkdir -p components/features/automation/{workflow,agents,teams,shared}
```

**Key components to recreate with platform styling:**
- `WorkflowBuilder` - React Flow canvas with platform theme
- `NodePalette` - Floating component palette
- `AgentCreator` - AI agent configuration form  
- `TeamWorkshop` - Multi-agent team builder
- `AnalyticsDashboard` - Execution metrics and performance

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/automation/{workflows,agents,teams,templates,executions}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Automation Modules
Following platform module patterns:

```typescript
// lib/modules/automation/workflows/index.ts
export const WorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nodes: z.any(), // React Flow nodes
  edges: z.any(), // React Flow edges
  organizationId: z.string().uuid(),
});

export async function createWorkflow(input: WorkflowInput) {
  const session = await requireAuth();
  
  if (!canAccessAutomation(session.user)) {
    throw new Error('Unauthorized: Automation access required');
  }
  
  if (!canAccessFeature(session.user, 'automation')) {
    throw new Error('Upgrade required: Automation feature not available');
  }

  const validated = WorkflowSchema.parse(input);

  return await prisma.workflow.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}

export async function getWorkflows() {
  const session = await requireAuth();

  return await prisma.workflow.findMany({
    where: {
      organizationId: session.user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      executions: {
        orderBy: { startedAt: 'desc' },
        take: 5
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}
```

#### 3.2 Create Agent Module
```typescript
// lib/modules/automation/agents/index.ts
export const AIAgentSchema = z.object({
  name: z.string().min(1).max(100),
  personality: z.any(), // JSON personality config
  capabilities: z.array(z.string()),
  modelConfig: z.object({
    provider: z.enum(['openai', 'anthropic', 'groq']),
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().optional()
  }),
  organizationId: z.string().uuid(),
});

export async function createAgent(input: AgentInput) {
  const session = await requireAuth();
  
  if (!canAccessAutomation(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = AIAgentSchema.parse(input);

  return await prisma.aIAgent.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Automation Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessAutomation(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canManageWorkflows(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canExecuteWorkflows(user: User): boolean {
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return canAccessAutomation(user) && hasOrgAccess;
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'automation-basic'], // Basic workflows
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'automation-full'], // Full automation
};

export function getAutomationLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { workflows: 0, agents: 0, executions: 0 },
    STARTER: { workflows: 0, agents: 0, executions: 0 },
    GROWTH: { workflows: 10, agents: 3, executions: 1000 }, // Per month
    ELITE: { workflows: -1, agents: -1, executions: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Migration

#### 5.1 Create Main Layout
Create `app/(platform)/automation/layout.tsx`:
```tsx
import { AutomationSidebar } from '@/components/features/automation/sidebar'
import { AutomationHeader } from '@/components/features/automation/header'
import { FeatureGuard } from '@/components/shared/feature-guard'

export default function AutomationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="automation-basic">
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <AutomationSidebar />
        <div className="flex-1 flex flex-col">
          <AutomationHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </FeatureGuard>
  )
}
```

#### 5.2 Recreate Workflow Builder
Create `components/features/automation/workflow/WorkflowBuilder.tsx` maintaining exact visual design:
```tsx
'use client'

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { NodePalette } from './NodePalette'
import { CustomNode } from './CustomNode'
import { Button } from '@/components/ui/button'

const nodeTypes = {
  custom: CustomNode,
}

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="h-full w-full relative bg-slate-950">
      {/* Glassmorphic Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="backdrop-blur-lg bg-slate-900/80 border border-cyan-500/30 rounded-lg px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Workflow Builder</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                Save
              </Button>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                Execute
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        className="bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900"
        fitView
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#1e293b" 
        />
        
        <MiniMap
          nodeColor="#0891b2"
          className="!bg-slate-900/90 !border-cyan-500/30"
        />
      </ReactFlow>

      {/* Node Palette */}
      <NodePalette />
    </div>
  )
}
```

#### 5.3 Create Node Palette Component
```tsx
// components/features/automation/workflow/NodePalette.tsx
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Database, 
  Mail, 
  Globe, 
  Bot,
  GitBranch,
  Clock,
  FileText 
} from 'lucide-react'

const nodeCategories = [
  {
    title: 'Triggers',
    nodes: [
      { type: 'webhook', icon: Globe, label: 'Webhook', color: 'from-green-500 to-emerald-500' },
      { type: 'schedule', icon: Clock, label: 'Schedule', color: 'from-blue-500 to-cyan-500' },
      { type: 'email', icon: Mail, label: 'Email', color: 'from-purple-500 to-violet-500' },
    ]
  },
  {
    title: 'Actions', 
    nodes: [
      { type: 'ai-agent', icon: Bot, label: 'AI Agent', color: 'from-cyan-500 to-blue-500' },
      { type: 'database', icon: Database, label: 'Database', color: 'from-orange-500 to-red-500' },
      { type: 'condition', icon: GitBranch, label: 'Condition', color: 'from-yellow-500 to-orange-500' },
    ]
  }
]

export function NodePalette() {
  return (
    <div className="absolute left-4 top-24 z-20">
      <Card className="backdrop-blur-lg bg-slate-900/80 border-cyan-500/30 p-4 w-64">
        <h3 className="text-sm font-semibold text-white mb-4">Node Library</h3>
        
        {nodeCategories.map((category) => (
          <div key={category.title} className="mb-4">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              {category.title}
            </h4>
            
            <div className="space-y-2">
              {category.nodes.map((node) => (
                <Button
                  key={node.type}
                  variant="ghost"
                  className="w-full justify-start h-10 text-left hover:bg-slate-800/50"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', node.type)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                >
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${node.color} flex items-center justify-center mr-3`}>
                    <node.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-white">{node.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Workflow API
Create `app/api/v1/automation/workflows/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createWorkflow, getWorkflows } from '@/lib/modules/automation/workflows'
import { canAccessAutomation, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAutomation(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const workflows = await getWorkflows()
    return NextResponse.json({ workflows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAutomation(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'automation-basic')) {
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

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'Automation',
    href: '/automation/workflows',
    icon: Zap,
    children: [
      { name: 'Workflows', href: '/automation/workflows' },
      { name: 'AI Agents', href: '/automation/agents' },
      { name: 'Team Workshop', href: '/automation/teams' },
      { name: 'Marketplace', href: '/automation/marketplace' },
      { name: 'Analytics', href: '/automation/analytics' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create Automation Tests
Create `__tests__/modules/automation/workflows.test.ts`:
```typescript
import { createWorkflow } from '@/lib/modules/automation/workflows'
import { canAccessAutomation } from '@/lib/auth/rbac'

describe('Automation Workflows Module', () => {
  it('should create workflow for current org only', async () => {
    const workflow = await createWorkflow({
      name: 'Test Workflow',
      nodes: [],
      edges: [],
      organizationId: 'org-123'
    })

    expect(workflow.organizationId).toBe('org-123')
  })

  it('should reject unauthorized users', async () => {
    const user = { globalRole: 'CLIENT', organizationRole: 'VIEWER' }
    expect(canAccessAutomation(user)).toBe(false)
  })
})
```

### Phase 9: Deployment Configuration

#### 9.1 Environment Variables
Add to platform environment variables:
```bash
# AI Providers (for automation workflows)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GROQ_API_KEY=your-groq-key

# Workflow execution
WORKFLOW_EXECUTION_TIMEOUT=300000 # 5 minutes
MAX_CONCURRENT_EXECUTIONS=10
```

#### 9.2 Update Middleware
Update `middleware.ts` to protect automation routes:
```typescript
if (request.nextUrl.pathname.startsWith('/automation')) {
  const hasAccess = canAccessAutomation(session.user)
  const hasFeature = canAccessFeature(session.user, 'automation-basic')
  
  if (!hasAccess || !hasFeature) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### Phase 10: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all automation tables
- [ ] RBAC permissions working for automation access
- [ ] Subscription tier limits enforced
- [ ] Workflow builder UI matches original design exactly
- [ ] Agent creation flow functional
- [ ] Team orchestration working
- [ ] AI provider integrations configured
- [ ] Real-time execution updates working
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage
- [ ] Performance optimized (lazy loading, code splitting)

## UI Design Preservation Notes

**Critical Design Elements to Maintain:**
- **Glassmorphic Cards**: `backdrop-blur-lg bg-slate-900/80 border border-cyan-500/30`
- **Neon Accent Colors**: Electric Blue (#00D2FF), Cyber Green (#39FF14), Violet (#8B5CF6)
- **Dark Gradient Background**: `bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900`
- **Floating Components**: Absolute positioned with high z-index
- **Smooth Animations**: Framer Motion transitions on hover/focus states
- **Node Visual Design**: Gradient backgrounds with rounded corners and icon styling

**Component Styling Patterns:**
```css
/* Glassmorphic container */
.glass-container {
  @apply backdrop-blur-lg bg-slate-900/80 border border-cyan-500/30 rounded-lg;
}

/* Neon glow effect */
.neon-glow {
  @apply shadow-lg shadow-cyan-500/25;
}

/* Gradient button */
.gradient-button {
  @apply bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600;
}
```

This integration preserves the exact visual design and user experience of NeuroFlow Hub while adapting it to the Strive platform's multi-tenant architecture and security requirements.