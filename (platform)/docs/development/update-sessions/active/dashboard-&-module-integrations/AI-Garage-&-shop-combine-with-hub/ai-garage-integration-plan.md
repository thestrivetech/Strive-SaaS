# AI Garage & Workbench Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the AI Garage & Workbench module into the Strive SaaS Platform, preserving the exact holographic, futuristic UI design while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- AI Garage & Workbench code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Documentation & Code)
**Design System:**
- **Dark-mode-first**: Holographic glass morphism with aurora gradients
- **Color Palette**: Cyan (primary), Violet (secondary), Emerald (success), slate backgrounds
- **Animations**: Magnetic hover effects and fluid transitions
- **Typography**: Futuristic, clean fonts with gradient text effects
- **Glass Morphism**: Backdrop blur effects with gradient borders
- **Aurora Gradients**: Multi-stop color transitions throughout interface

**Key Visual Elements:**
- Holographic cards with aurora borders and backdrop blur
- Floating UI elements with magnetic hover animations
- Gradient text overlays and neon accent colors
- Interactive agent avatar builders with status rings
- Tool forge canvas with drag-and-drop components
- Order timeline visualizers with milestone tracking

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add AI Garage & Workbench Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// AI Garage & Workbench Module Tables
model CustomAgentOrder {
  id             String   @id @default(cuid())
  title          String
  description    String
  requirements   Json     // Detailed specification
  useCase        String   // Primary application
  complexity     ComplexityLevel
  estimatedHours Int?
  estimatedCost  Decimal?
  
  // Status tracking
  status         OrderStatus @default(DRAFT)
  priority       OrderPriority @default(NORMAL)
  submittedAt    DateTime?
  startedAt      DateTime?
  completedAt    DateTime?
  deliveredAt    DateTime?
  
  // Progress tracking
  progress       Int      @default(0) // 0-100
  currentStage   String?  // design, development, testing, deployment
  
  // Configuration
  agentConfig    Json     // Agent personality, capabilities, model settings
  toolsConfig    Json     // Required tools and integrations
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  assignedTo     String?  // Internal builder
  assignee       User?    @relation("AssignedBuilds", fields: [assignedTo], references: [id])
  milestones     OrderMilestone[]
  buildLogs      BuildLog[]
  
  @@map("custom_agent_orders")
}

model AgentTemplate {
  id             String   @id @default(cuid())
  name           String
  description    String
  category       AgentCategory // sales, support, analysis, content
  avatar         String?
  
  // Configuration preset
  personalityConfig Json
  modelConfig    Json     // AI provider, model, parameters
  toolsConfig    Json     // Integrated tools and APIs
  memoryConfig   Json     // Knowledge base, conversation history
  
  // Template metadata
  tags           String[]
  features       String[]
  useCases       String[]
  
  // Usage and ratings
  usageCount     Int      @default(0)
  rating         Float?
  isPopular      Boolean  @default(false)
  
  // Visibility
  isPublic       Boolean  @default(false)
  isSystem       Boolean  @default(false) // System vs user-created
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation (nullable for system templates)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String?
  creator        User?    @relation(fields: [createdBy], references: [id])
  reviews        TemplateReview[]
  orders         CustomAgentOrder[] // Orders based on this template
  
  @@map("agent_templates")
}

model ToolBlueprint {
  id             String   @id @default(cuid())
  name           String
  description    String
  category       ToolCategory // automation, analytics, integration, ui
  
  // Visual programming components
  components     Json     // Component definitions and properties
  connections    Json     // Component relationships and data flow
  configuration  Json     // Tool settings and parameters
  
  // Blueprint metadata
  version        String   @default("1.0.0")
  tags           String[]
  complexity     ComplexityLevel
  
  // Usage tracking
  usageCount     Int      @default(0)
  isPublic       Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("tool_blueprints")
}

model OrderMilestone {
  id             String   @id @default(cuid())
  orderId        String
  order          CustomAgentOrder @relation(fields: [orderId], references: [id])
  
  name           String
  description    String?
  stage          String   // design, development, testing, deployment
  dueDate        DateTime?
  completedAt    DateTime?
  isCompleted    Boolean  @default(false)
  
  sortOrder      Int      @default(0)
  
  createdAt      DateTime @default(now())
  
  @@map("order_milestones")
}

model BuildLog {
  id             String   @id @default(cuid())
  orderId        String
  order          CustomAgentOrder @relation(fields: [orderId], references: [id])
  
  stage          String   // design, development, testing, deployment
  message        String
  details        Json?    // Additional context, code snippets, etc.
  logLevel       LogLevel @default(INFO)
  
  createdAt      DateTime @default(now())
  
  @@map("build_logs")
}

model TemplateReview {
  id         String @id @default(cuid())
  templateId String
  template   AgentTemplate @relation(fields: [templateId], references: [id])
  
  rating     Int    // 1-5 stars
  review     String?
  
  createdAt  DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  reviewerId String
  reviewer   User   @relation(fields: [reviewerId], references: [id])
  
  @@unique([templateId, reviewerId])
  @@map("template_reviews")
}

model ProjectShowcase {
  id             String   @id @default(cuid())
  title          String
  description    String
  category       ShowcaseCategory
  
  // Project details
  imageUrl       String?  // Screenshot or demo image
  demoUrl        String?  // Link to live demo
  features       String[]
  technologies   String[]
  
  // Metrics
  views          Int      @default(0)
  likes          Int      @default(0)
  isPublic       Boolean  @default(false)
  isFeatured     Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("project_showcases")
}

enum ComplexityLevel {
  SIMPLE       // 1-8 hours
  MODERATE     // 8-24 hours  
  COMPLEX      // 24-72 hours
  ENTERPRISE   // 72+ hours
}

enum OrderStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  IN_PROGRESS
  TESTING
  COMPLETED
  DELIVERED
  CANCELLED
  REJECTED
}

enum OrderPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum AgentCategory {
  SALES
  SUPPORT
  ANALYSIS
  CONTENT
  AUTOMATION
  RESEARCH
}

enum ToolCategory {
  AUTOMATION
  ANALYTICS
  INTEGRATION
  UI
  API
  WORKFLOW
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

enum ShowcaseCategory {
  AI_AGENT
  AUTOMATION_TOOL
  INTEGRATION
  WORKFLOW
  CUSTOM_SOLUTION
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // AI Garage relations
  agentOrders       CustomAgentOrder[]
  assignedBuilds    CustomAgentOrder[] @relation("AssignedBuilds")
  agentTemplates    AgentTemplate[]
  toolBlueprints    ToolBlueprint[]
  templateReviews   TemplateReview[]
  projectShowcases  ProjectShowcase[]
}

model Organization {
  // ... existing fields
  
  // AI Garage relations
  agentOrders       CustomAgentOrder[]
  agentTemplates    AgentTemplate[]
  toolBlueprints    ToolBlueprint[]
  templateReviews   TemplateReview[]
  projectShowcases  ProjectShowcase[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-ai-garage-workbench
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create AI Garage Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/ai-garage/{dashboard,agent-builder,tool-forge,order-studio,gallery,templates,analytics}
```

#### 2.2 Copy and Adapt Components
Create `components/features/ai-garage/` directory:

```bash
mkdir -p components/features/ai-garage/{
  dashboard,
  agent-builder,
  tool-forge,
  order-studio,
  gallery,
  templates,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/ai-garage/{orders,templates,blueprints,showcase}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create AI Garage Module
Following platform module patterns:

```typescript
// lib/modules/ai-garage/orders/index.ts
export const CustomAgentOrderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  useCase: z.string().min(1),
  complexity: z.nativeEnum(ComplexityLevel),
  requirements: z.any(), // JSON object
  agentConfig: z.any(),   // JSON object
  toolsConfig: z.any(),   // JSON object
  organizationId: z.string().uuid(),
});

export async function createAgentOrder(input: CustomAgentOrderInput) {
  const session = await requireAuth();
  
  if (!canAccessAIGarage(session.user)) {
    throw new Error('Unauthorized: AI Garage access required');
  }
  
  if (!canAccessFeature(session.user, 'ai-garage')) {
    throw new Error('Upgrade required: AI Garage features not available');
  }

  const validated = CustomAgentOrderSchema.parse(input);

  // Calculate estimated cost based on complexity
  const estimatedHours = calculateEstimatedHours(validated.complexity, validated.requirements);
  const estimatedCost = calculateEstimatedCost(estimatedHours);

  return await prisma.customAgentOrder.create({
    data: {
      ...validated,
      estimatedHours,
      estimatedCost,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });
}

export async function getAgentOrders(filters?: OrderFilters) {
  const session = await requireAuth();

  return await prisma.customAgentOrder.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.complexity && { complexity: filters.complexity }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      assignee: {
        select: { id: true, name: true, email: true }
      },
      milestones: {
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

function calculateEstimatedHours(complexity: ComplexityLevel, requirements: any): number {
  const baseHours = {
    SIMPLE: 6,
    MODERATE: 16,
    COMPLEX: 48,
    ENTERPRISE: 120
  };

  let hours = baseHours[complexity];
  
  // Adjust based on requirements complexity
  if (requirements.integrations?.length > 3) hours *= 1.5;
  if (requirements.customUI) hours *= 1.3;
  if (requirements.multiModel) hours *= 1.2;
  
  return Math.round(hours);
}

function calculateEstimatedCost(hours: number): number {
  const hourlyRate = 150; // $150 per hour
  return hours * hourlyRate * 100; // Store in cents
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add AI Garage Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessAIGarage(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canCreateAgentOrders(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canAssignBuilders(user: User): boolean {
  return user.globalRole === 'ADMIN' || user.organizationRole === 'OWNER';
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai-garage-basic'], // Simple agents
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'ai-garage-full'], // Complex agents + tools
};

export function getAIGarageLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { orders: 0, templates: 0, blueprints: 0 },
    STARTER: { orders: 0, templates: 0, blueprints: 0 },
    GROWTH: { orders: 3, templates: 10, blueprints: 5 }, // Per month
    ELITE: { orders: -1, templates: -1, blueprints: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation (Holographic Design)

#### 5.1 Add Custom CSS Variables
Update `app/globals.css` to include holographic theme variables:

```css
:root {
  /* AI Garage Holographic Theme */
  --aurora-from: #06b6d4;
  --aurora-via: #8b5cf6;
  --aurora-to: #10b981;
  
  /* Glass morphism */
  --glass-bg: rgba(15, 23, 42, 0.7);
  --glass-border: rgba(148, 163, 184, 0.2);
  
  /* Neon effects */
  --neon-cyan: #22d3ee;
  --neon-violet: #a855f7;
  --neon-emerald: #34d399;
  
  /* Dark theme slate colors */
  --slate-950: #020617;
  --slate-900: #0f172a;
  --slate-800: #1e293b;
}

/* Aurora gradient animation */
@keyframes aurora {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.aurora-gradient {
  background: linear-gradient(-45deg, var(--aurora-from), var(--aurora-via), var(--aurora-to));
  background-size: 400% 400%;
  animation: aurora 15s ease infinite;
}

/* Glass morphism card */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

/* Magnetic hover effect */
.magnetic-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.magnetic-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(34, 211, 238, 0.25);
}

/* Holographic border */
.holo-border {
  background: linear-gradient(45deg, transparent, rgba(34, 211, 238, 0.4), transparent);
  background-size: 200% 200%;
  animation: holoBorder 3s ease-in-out infinite;
}

@keyframes holoBorder {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

#### 5.2 Create Main Dashboard Page
Create `app/(platform)/ai-garage/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { AIGarageHeader } from '@/components/features/ai-garage/dashboard/header'
import { ProjectGrid } from '@/components/features/ai-garage/dashboard/project-grid'
import { QuickActions } from '@/components/features/ai-garage/dashboard/quick-actions'
import { BuildProgress } from '@/components/features/ai-garage/dashboard/build-progress'
import { CapabilityMeter } from '@/components/features/ai-garage/dashboard/capability-meter'
import { ParticleBackground } from '@/components/features/ai-garage/shared/particle-background'
import { Skeleton } from '@/components/ui/skeleton'

export default function AIGarageDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Header */}
      <AIGarageHeader />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Panel - Capability & Quick Actions */}
          <div className="xl:col-span-1 space-y-6">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <CapabilityMeter />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-48" />}>
              <QuickActions />
            </Suspense>
          </div>
          
          {/* Main Content - Project Grid */}
          <div className="xl:col-span-2">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ProjectGrid />
            </Suspense>
          </div>
          
          {/* Right Panel - Build Progress */}
          <div className="xl:col-span-1">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <BuildProgress />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.3 Create Holographic Project Cards
Create `components/features/ai-garage/dashboard/ProjectGrid.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Wrench, Clock, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface Project {
  id: string
  title: string
  status: string
  complexity: string
  progress: number
  type: 'agent' | 'tool'
  estimatedHours: number
  createdAt: string
}

export function ProjectGrid() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['ai-garage-projects'],
    queryFn: async () => {
      const response = await fetch('/api/v1/ai-garage/orders')
      return response.json()
    }
  })

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      SUBMITTED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  const getComplexityColor = (complexity: string) => {
    const colors = {
      SIMPLE: 'bg-emerald-500/20 text-emerald-300',
      MODERATE: 'bg-yellow-500/20 text-yellow-300',
      COMPLEX: 'bg-orange-500/20 text-orange-300',
      ENTERPRISE: 'bg-red-500/20 text-red-300',
    }
    return colors[complexity as keyof typeof colors] || colors.SIMPLE
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
          Active Projects
        </h2>
        
        <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white border-0">
          New Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects?.orders?.map((project: Project, index: number) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card magnetic-hover holo-border rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Project Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center">
                        {project.type === 'agent' ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <Wrench className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{project.title}</h3>
                        <p className="text-sm text-slate-400">
                          {project.type === 'agent' ? 'AI Agent' : 'Custom Tool'}
                        </p>
                      </div>
                    </div>
                    
                    <Badge className={`${getStatusColor(project.status)} border px-3 py-1`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-cyan-400 font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className={`${getComplexityColor(project.complexity)} px-2 py-1 text-xs`}>
                        {project.complexity}
                      </Badge>
                      
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{project.estimatedHours}h</span>
                      </div>
                    </div>
                    
                    {project.status === 'COMPLETED' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    View Details
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

#### 5.4 Create Agent Builder Interface
Create `components/features/ai-garage/agent-builder/AgentBuilder.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Bot, Zap, Brain, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

interface PersonalityTrait {
  id: string
  name: string
  description: string
  value: number
}

export function AgentBuilder() {
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [personality, setPersonality] = useState<PersonalityTrait[]>([
    { id: 'creativity', name: 'Creativity', description: 'How creative and innovative the agent should be', value: 75 },
    { id: 'accuracy', name: 'Accuracy', description: 'Preference for factual correctness over creativity', value: 85 },
    { id: 'friendliness', name: 'Friendliness', description: 'How warm and approachable the agent should be', value: 70 },
    { id: 'formality', name: 'Formality', description: 'Level of professional language and structure', value: 60 },
  ])

  const models = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', provider: 'OpenAI', cost: 'Premium' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', cost: 'Premium' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', cost: 'Standard' },
    { id: 'llama-3', name: 'Llama 3', provider: 'Meta', cost: 'Economy' },
  ]

  const updatePersonality = (traitId: string, value: number) => {
    setPersonality(prev => 
      prev.map(trait => 
        trait.id === traitId ? { ...trait, value } : trait
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Agent Preview */}
          <div className="xl:col-span-1">
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  Agent Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Avatar */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-1">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                        <Bot className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                    
                    {/* Status Ring */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse">
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                    </div>
                  </motion.div>
                </div>

                {/* Agent Stats */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Sales Assistant</h3>
                    <p className="text-slate-400">Intelligent sales automation agent</p>
                  </div>

                  <div className="space-y-3">
                    {personality.map((trait) => (
                      <div key={trait.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{trait.name}</span>
                          <span className="text-sm text-cyan-400 font-medium">{trait.value}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${trait.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel - Configuration */}
          <div className="xl:col-span-2 space-y-8">
            {/* Model Selection */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  AI Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map((model) => (
                    <motion.div
                      key={model.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedModel === model.id 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedModel(model.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white">{model.name}</h4>
                          <Badge className={`${
                            model.cost === 'Premium' ? 'bg-purple-500/20 text-purple-300' :
                            model.cost === 'Standard' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {model.cost}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{model.provider}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personality Configuration */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Personality Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {personality.map((trait) => (
                  <div key={trait.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{trait.name}</h4>
                        <p className="text-sm text-slate-400">{trait.description}</p>
                      </div>
                      <span className="text-lg font-bold text-cyan-400">{trait.value}%</span>
                    </div>
                    
                    <Slider
                      value={[trait.value]}
                      onValueChange={(values) => updatePersonality(trait.id, values[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Test Agent
              </Button>
              
              <Button className="bg-gradient-to-r from-violet-500 to-emerald-500 hover:from-violet-600 hover:to-emerald-600 text-white flex-1">
                Deploy Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Agent Orders API
Create `app/api/v1/ai-garage/orders/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createAgentOrder, getAgentOrders } from '@/lib/modules/ai-garage/orders'
import { canAccessAIGarage, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAIGarage(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      status: searchParams.get('status'),
      complexity: searchParams.get('complexity'),
    }

    const orders = await getAgentOrders(filters)
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessAIGarage(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'ai-garage')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const order = await createAgentOrder({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
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
    name: 'AI Garage & Workbench',
    href: '/ai-garage/dashboard',
    icon: Bot,
    children: [
      { name: 'Dashboard', href: '/ai-garage/dashboard' },
      { name: 'Agent Builder', href: '/ai-garage/agent-builder' },
      { name: 'Tool Forge', href: '/ai-garage/tool-forge' },
      { name: 'Order Studio', href: '/ai-garage/order-studio' },
      { name: 'Gallery', href: '/ai-garage/gallery' },
      { name: 'Templates', href: '/ai-garage/templates' },
      { name: 'Analytics', href: '/ai-garage/analytics' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create AI Garage Tests
Create `__tests__/modules/ai-garage/orders.test.ts`:
```typescript
import { createAgentOrder } from '@/lib/modules/ai-garage/orders'
import { canAccessAIGarage } from '@/lib/auth/rbac'

describe('AI Garage Module', () => {
  it('should create agent order for current org only', async () => {
    const order = await createAgentOrder({
      title: 'Sales Assistant',
      description: 'AI agent for sales automation',
      useCase: 'lead-qualification',
      complexity: 'MODERATE',
      requirements: {},
      agentConfig: {},
      toolsConfig: {},
      organizationId: 'org-123'
    })

    expect(order.organizationId).toBe('org-123')
  })

  it('should calculate estimated cost correctly', async () => {
    const order = await createAgentOrder({
      title: 'Complex Agent',
      description: 'Enterprise-level AI agent',
      useCase: 'automation',
      complexity: 'ENTERPRISE',
      requirements: { integrations: ['salesforce', 'hubspot'] },
      agentConfig: {},
      toolsConfig: {},
      organizationId: 'org-123'
    })

    expect(order.estimatedCost).toBeGreaterThan(0)
    expect(order.estimatedHours).toBeGreaterThan(72) // Enterprise minimum
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all AI Garage tables
- [ ] RBAC permissions working for AI Garage access
- [ ] Subscription tier limits enforced
- [ ] Holographic theme CSS variables loaded correctly
- [ ] Project cards display with glass morphism and aurora effects
- [ ] Agent builder interface functional with personality sliders
- [ ] Tool forge canvas operational with drag-and-drop
- [ ] Order studio wizard working with estimation calculator
- [ ] Template gallery displaying with ratings and usage counts
- [ ] Build progress tracking with milestone visualization
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Particle background animations rendering smoothly
- [ ] Mobile responsiveness maintained with adaptive layouts
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements from Documentation:**
- **Holographic Theme**: Dark-mode-first with glass morphism and aurora gradients
- **Color System**: 
  - Primary: Cyan (#06b6d4, #22d3ee)
  - Secondary: Violet (#8b5cf6, #a855f7)  
  - Success: Emerald (#10b981, #34d399)
  - Background: Slate gradients (#020617, #0f172a, #1e293b)
- **Glass Morphism**: `backdrop-filter: blur(20px)` with rgba backgrounds
- **Magnetic Hover**: Scale and translate effects with neon glow shadows
- **Aurora Animations**: Multi-stop gradient backgrounds with keyframe animations
- **Typography**: Gradient text effects using `bg-clip-text text-transparent`

**Component Styling Patterns:**
```css
/* Glass card base */
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Holographic border animation */
.holo-border {
  background: linear-gradient(45deg, transparent, rgba(34, 211, 238, 0.4), transparent);
  background-size: 200% 200%;
  animation: holoBorder 3s ease-in-out infinite;
}

/* Aurora gradient text */
.aurora-text {
  background: linear-gradient(-45deg, #06b6d4, #8b5cf6, #10b981);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: aurora 15s ease infinite;
}

/* Magnetic hover effect */
.magnetic-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(34, 211, 238, 0.25);
}
```

This integration preserves the exact holographic, futuristic design aesthetic of the AI Garage & Workbench while seamlessly integrating it into the Strive platform's multi-tenant, RBAC architecture.