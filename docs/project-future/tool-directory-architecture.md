# Centralized Tools Architecture

## Directory Structure

```
lib/
├── tools/                          # 🆕 New centralized tools directory
│   ├── index.ts                    # Tool registry and exports
│   ├── types.ts                    # Shared tool types
│   ├── registry.ts                 # Tool metadata and configuration
│   ├── manager.ts                  # Tool lifecycle management
│   │
│   ├── property-alerts/            # Individual tool modules
│   │   ├── index.ts                # Tool definition & exports
│   │   ├── actions.ts              # Server Actions
│   │   ├── queries.ts              # Data fetching
│   │   ├── schemas.ts              # Zod validation
│   │   ├── types.ts                # TypeScript types
│   │   ├── constants.ts            # Tool-specific constants
│   │   ├── config.ts               # Tool configuration
│   │   ├── services/               # Business logic
│   │   │   ├── matching-service.ts
│   │   │   └── notification-service.ts
│   │   └── components/             # Tool-specific UI components
│   │       ├── alert-form.tsx
│   │       └── alert-list.tsx
│   │
│   ├── appointment-reminders/
│   │   └── [same structure]
│   │
│   ├── investment-analyzer/
│   │   └── [same structure]
│   │
│   ├── document-processing/
│   │   └── [same structure]
│   │
│   └── [... 60+ tools following same pattern]
│
├── modules/                        # Keep existing core platform modules
│   ├── crm/                        # Core CRM functionality
│   ├── organization/               # Multi-tenancy
│   ├── chatbot/                    # AI chatbot
│   └── real-estate/                # Shared real estate utilities
│       ├── services/
│       │   ├── mls-service.ts      # MLS API integration
│       │   ├── n8n-service.ts      # n8n workflow management
│       │   └── valuation-service.ts
│       └── types.ts
│
└── components/                     # Shared UI components
    ├── tools/                      # 🆕 Tool-related shared components
    │   ├── tool-card.tsx
    │   ├── tool-grid.tsx
    │   └── tool-settings.tsx
    └── ui/                         # shadcn/ui components
```

---

## Core Tool System

### 1. Tool Definition Interface

```typescript
// lib/tools/types.ts

export type ToolCategory = 
  | 'lead-management'
  | 'communication'
  | 'automation'
  | 'analytics'
  | 'financial'
  | 'marketing'
  | 'document-management';

export type ToolTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type ToolImplementation = 'nextjs' | 'n8n' | 'hybrid' | 'external';

export interface ToolMetadata {
  // Identification
  id: string;                           // 'property-alerts'
  name: string;                         // 'Property Alert System'
  description: string;
  icon: string;                         // Lucide icon name
  
  // Classification
  category: ToolCategory;
  tier: ToolTier;
  implementation: ToolImplementation;
  
  // Pricing & Access
  basePrice: number;                    // Monthly price in cents
  isAddon?: boolean;                    // Available as add-on?
  requiredTier?: string;                // Minimum subscription tier
  
  // Technical
  version: string;                      // '1.0.0'
  dependencies?: string[];              // Other tool IDs
  apiEndpoints?: string[];              // API routes this tool exposes
  n8nWorkflows?: string[];              // n8n workflow IDs
  
  // Configuration
  configurableSettings?: ToolSetting[];
  requiresSetup?: boolean;              // Needs onboarding?
  
  // Status
  status: 'active' | 'beta' | 'deprecated';
  releasedAt: Date;
}

export interface ToolSetting {
  key: string;                          // 'notification_frequency'
  label: string;                        // 'Notification Frequency'
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  defaultValue: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  description?: string;
}

export interface OrganizationToolConfig {
  id: string;
  organizationId: string;
  toolId: string;
  enabled: boolean;
  settings: Record<string, any>;
  enabledAt?: Date;
  disabledAt?: Date;
}

export interface Tool {
  metadata: ToolMetadata;
  
  // Tool actions
  actions?: Record<string, (...args: any[]) => Promise<any>>;
  queries?: Record<string, (...args: any[]) => Promise<any>>;
  
  // Lifecycle hooks
  onEnable?: (organizationId: string) => Promise<void>;
  onDisable?: (organizationId: string) => Promise<void>;
  onConfigure?: (organizationId: string, settings: Record<string, any>) => Promise<void>;
  
  // Health check
  healthCheck?: () => Promise<{ healthy: boolean; message?: string }>;
}
```

---

### 2. Tool Registry

```typescript
// lib/tools/registry.ts

import { Tool, ToolMetadata } from './types';

// Import all tools
import * as PropertyAlerts from './property-alerts';
import * as AppointmentReminders from './appointment-reminders';
import * as InvestmentAnalyzer from './investment-analyzer';
// ... import all 60+ tools

export const TOOL_REGISTRY: Record<string, Tool> = {
  'property-alerts': PropertyAlerts.tool,
  'appointment-reminders': AppointmentReminders.tool,
  'investment-analyzer': InvestmentAnalyzer.tool,
  // ... register all tools
};

export const TOOL_METADATA: Record<string, ToolMetadata> = Object.entries(
  TOOL_REGISTRY
).reduce((acc, [id, tool]) => {
  acc[id] = tool.metadata;
  return acc;
}, {} as Record<string, ToolMetadata>);

// Helper functions
export function getToolById(toolId: string): Tool | undefined {
  return TOOL_REGISTRY[toolId];
}

export function getToolsByCategory(category: string): Tool[] {
  return Object.values(TOOL_REGISTRY).filter(
    (tool) => tool.metadata.category === category
  );
}

export function getToolsByTier(tier: string): Tool[] {
  return Object.values(TOOL_REGISTRY).filter(
    (tool) => tool.metadata.tier === tier
  );
}

export function getAllTools(): Tool[] {
  return Object.values(TOOL_REGISTRY);
}
```

---

### 3. Tool Manager

```typescript
// lib/tools/manager.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getToolById } from './registry';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

export class ToolManager {
  /**
   * Check if a tool is enabled for an organization
   */
  static async isToolEnabled(
    organizationId: string,
    toolId: string
  ): Promise<boolean> {
    const config = await prisma.organizationToolConfig.findUnique({
      where: {
        organizationId_toolId: {
          organizationId,
          toolId,
        },
      },
    });

    return config?.enabled ?? false;
  }

  /**
   * Enable a tool for an organization
   */
  static async enableTool(
    organizationId: string,
    toolId: string,
    settings?: Record<string, any>
  ): Promise<void> {
    const tool = getToolById(toolId);
    
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Create or update configuration
    await prisma.organizationToolConfig.upsert({
      where: {
        organizationId_toolId: {
          organizationId,
          toolId,
        },
      },
      create: {
        organizationId,
        toolId,
        enabled: true,
        settings: settings || {},
        enabledAt: new Date(),
      },
      update: {
        enabled: true,
        enabledAt: new Date(),
        disabledAt: null,
        settings: settings || {},
      },
    });

    // Run tool's onEnable hook
    if (tool.onEnable) {
      await tool.onEnable(organizationId);
    }

    // Log activity
    const user = await getCurrentUser();
    if (user) {
      await prisma.activityLog.create({
        data: {
          organizationId,
          userId: user.id,
          action: 'enabled_tool',
          resourceType: 'tool',
          resourceId: toolId,
          newData: { toolId, settings },
        },
      });
    }
  }

  /**
   * Disable a tool for an organization
   */
  static async disableTool(
    organizationId: string,
    toolId: string
  ): Promise<void> {
    const tool = getToolById(toolId);
    
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Update configuration
    await prisma.organizationToolConfig.update({
      where: {
        organizationId_toolId: {
          organizationId,
          toolId,
        },
      },
      data: {
        enabled: false,
        disabledAt: new Date(),
      },
    });

    // Run tool's onDisable hook
    if (tool.onDisable) {
      await tool.onDisable(organizationId);
    }

    // Log activity
    const user = await getCurrentUser();
    if (user) {
      await prisma.activityLog.create({
        data: {
          organizationId,
          userId: user.id,
          action: 'disabled_tool',
          resourceType: 'tool',
          resourceId: toolId,
        },
      });
    }
  }

  /**
   * Get all enabled tools for an organization
   */
  static async getEnabledTools(organizationId: string) {
    const configs = await prisma.organizationToolConfig.findMany({
      where: {
        organizationId,
        enabled: true,
      },
    });

    return configs.map((config) => ({
      ...getToolById(config.toolId),
      config,
    }));
  }

  /**
   * Update tool settings
   */
  static async updateToolSettings(
    organizationId: string,
    toolId: string,
    settings: Record<string, any>
  ): Promise<void> {
    const tool = getToolById(toolId);
    
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Update settings
    await prisma.organizationToolConfig.update({
      where: {
        organizationId_toolId: {
          organizationId,
          toolId,
        },
      },
      data: {
        settings,
      },
    });

    // Run tool's onConfigure hook
    if (tool.onConfigure) {
      await tool.onConfigure(organizationId, settings);
    }
  }

  /**
   * Get tool settings
   */
  static async getToolSettings(
    organizationId: string,
    toolId: string
  ): Promise<Record<string, any>> {
    const config = await prisma.organizationToolConfig.findUnique({
      where: {
        organizationId_toolId: {
          organizationId,
          toolId,
        },
      },
    });

    return config?.settings || {};
  }

  /**
   * Health check all enabled tools
   */
  static async healthCheckAll(organizationId: string) {
    const enabledTools = await this.getEnabledTools(organizationId);
    
    const results = await Promise.all(
      enabledTools.map(async (tool) => {
        if (!tool.healthCheck) {
          return { toolId: tool.metadata.id, healthy: true };
        }

        try {
          const result = await tool.healthCheck();
          return { toolId: tool.metadata.id, ...result };
        } catch (error) {
          return {
            toolId: tool.metadata.id,
            healthy: false,
            message: error.message,
          };
        }
      })
    );

    return results;
  }
}
```

---

### 4. Individual Tool Template

```typescript
// lib/tools/property-alerts/index.ts

import { Tool } from '../types';
import * as actions from './actions';
import * as queries from './queries';

export const tool: Tool = {
  metadata: {
    id: 'property-alerts',
    name: 'Property Alert System',
    description: 'Automated notifications when properties match customer criteria',
    icon: 'Bell',
    
    category: 'lead-management',
    tier: 'TIER_1',
    implementation: 'hybrid',
    
    basePrice: 10000, // $100/month
    requiredTier: 'FREE',
    
    version: '1.0.0',
    dependencies: [],
    apiEndpoints: ['/api/alerts', '/api/webhooks/send-alert-notification'],
    n8nWorkflows: ['property-alerts-monitor'],
    
    configurableSettings: [
      {
        key: 'default_frequency',
        label: 'Default Notification Frequency',
        type: 'select',
        defaultValue: 'DAILY',
        options: [
          { label: 'Immediate', value: 'IMMEDIATE' },
          { label: 'Hourly', value: 'HOURLY' },
          { label: 'Daily', value: 'DAILY' },
          { label: 'Weekly', value: 'WEEKLY' },
        ],
        required: true,
      },
      {
        key: 'max_alerts_per_customer',
        label: 'Maximum Alerts Per Customer',
        type: 'number',
        defaultValue: 5,
        required: true,
      },
    ],
    
    requiresSetup: false,
    status: 'active',
    releasedAt: new Date('2025-01-01'),
  },

  // Expose actions and queries
  actions: {
    createPropertyAlert: actions.createPropertyAlert,
    updatePropertyAlert: actions.updatePropertyAlert,
    deletePropertyAlert: actions.deletePropertyAlert,
    toggleAlertActive: actions.toggleAlertActive,
  },

  queries: {
    getPropertyAlerts: queries.getPropertyAlerts,
    getPropertyAlert: queries.getPropertyAlert,
    getAlertMatchesForCustomer: queries.getAlertMatchesForCustomer,
  },

  // Lifecycle hooks
  async onEnable(organizationId: string) {
    console.log(`Enabling property alerts for ${organizationId}`);
    
    // Initialize any required data
    // Trigger n8n workflow registration
    // Send welcome email to organization
  },

  async onDisable(organizationId: string) {
    console.log(`Disabling property alerts for ${organizationId}`);
    
    // Pause all active alerts
    // Notify customers
  },

  async onConfigure(organizationId: string, settings: Record<string, any>) {
    console.log(`Configuring property alerts for ${organizationId}`, settings);
    
    // Apply new settings to existing alerts
  },

  // Health check
  async healthCheck() {
    // Check if n8n workflow is running
    // Check if MLS API is accessible
    // Check if notifications are working
    
    return { healthy: true };
  },
};

// Re-export everything for convenience
export * from './actions';
export * from './queries';
export * from './schemas';
export * from './types';
```

---

### 5. Database Schema Updates

```prisma
// Add to prisma/schema.prisma

model OrganizationToolConfig {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  toolId         String   @map("tool_id")
  
  enabled        Boolean  @default(false)
  settings       Json     @default("{}")
  
  enabledAt      DateTime? @map("enabled_at")
  disabledAt     DateTime? @map("disabled_at")
  
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, toolId])
  @@index([organizationId])
  @@index([toolId])
  @@index([enabled])
  @@map("organization_tool_configs")
}

model ToolUsageLog {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  toolId         String   @map("tool_id")
  userId         String?  @map("user_id")
  
  action         String   // 'create', 'update', 'delete', 'execute'
  resourceType   String?  @map("resource_type")
  resourceId     String?  @map("resource_id")
  
  executionTime  Int?     @map("execution_time") // milliseconds
  success        Boolean  @default(true)
  errorMessage   String?  @map("error_message")
  
  metadata       Json?
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])
  
  createdAt      DateTime @default(now()) @map("created_at")
  
  @@index([organizationId, toolId])
  @@index([createdAt])
  @@map("tool_usage_logs")
}
```

---

## Using Tools in Your Application

### 1. Tools Dashboard Page

```typescript
// app/(platform)/tools/page.tsx

import { requireAuth } from '@/lib/auth/auth-helpers';
import { ToolManager } from '@/lib/tools/manager';
import { getAllTools } from '@/lib/tools/registry';
import { ToolGrid } from '@/components/tools/tool-grid';

export default async function ToolsPage() {
  const user = await requireAuth();
  const organizationId = user.organizationMembers[0].organizationId;

  // Get all available tools
  const allTools = getAllTools();
  
  // Get enabled tools for this organization
  const enabledTools = await ToolManager.getEnabledTools(organizationId);
  const enabledToolIds = new Set(enabledTools.map(t => t.metadata.id));

  // Group tools by category
  const toolsByCategory = allTools.reduce((acc, tool) => {
    const category = tool.metadata.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({
      ...tool,
      enabled: enabledToolIds.has(tool.metadata.id),
    });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground">
          Enable and configure tools to enhance your workflow
        </p>
      </div>

      {Object.entries(toolsByCategory).map(([category, tools]) => (
        <div key={category}>
          <h2 className="text-2xl font-semibold mb-4 capitalize">
            {category.replace('-', ' ')}
          </h2>
          <ToolGrid tools={tools} />
        </div>
      ))}
    </div>
  );
}
```

### 2. Tool Card Component

```typescript
// components/tools/tool-card.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, CheckCircle } from 'lucide-react';
import { ToolManager } from '@/lib/tools/manager';
import { useRouter } from 'next/navigation';

interface ToolCardProps {
  tool: any;
  organizationId: string;
}

export function ToolCard({ tool, organizationId }: ToolCardProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(tool.enabled);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    
    try {
      if (enabled) {
        await ToolManager.disableTool(organizationId, tool.metadata.id);
      } else {
        await ToolManager.enableTool(organizationId, tool.metadata.id);
      }
      
      setEnabled(!enabled);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle tool:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={enabled ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{tool.metadata.name}</CardTitle>
              {enabled && <CheckCircle className="h-4 w-4 text-primary" />}
            </div>
            <CardDescription>{tool.metadata.description}</CardDescription>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline">{tool.metadata.tier}</Badge>
            <Badge variant="outline">{tool.metadata.implementation}</Badge>
          </div>
          
          {enabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/tools/${tool.metadata.id}/settings`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Using Tools in Other Pages

```typescript
// app/(platform)/dashboard/page.tsx

import { ToolManager } from '@/lib/tools/manager';
import { getToolById } from '@/lib/tools/registry';

export default async function DashboardPage() {
  const organizationId = 'org-id';
  
  // Check if property alerts tool is enabled
  const alertsEnabled = await ToolManager.isToolEnabled(
    organizationId,
    'property-alerts'
  );

  if (alertsEnabled) {
    // Get the tool
    const alertsTool = getToolById('property-alerts');
    
    // Call tool actions
    const alerts = await alertsTool.queries.getPropertyAlerts();
    
    // Render alerts widget
    return (
      <div>
        <h2>Active Alerts</h2>
        {alerts.map(alert => (
          <div key={alert.id}>{alert.name}</div>
        ))}
      </div>
    );
  }

  return <div>Enable Property Alerts to see this widget</div>;
}
```

### 4. AI Agent Using Tools

```typescript
// lib/modules/chatbot/services/tool-calling-service.ts

import { ToolManager } from '@/lib/tools/manager';
import { getToolById } from '@/lib/tools/registry';

export class ToolCallingService {
  static async handleToolCall(
    organizationId: string,
    toolId: string,
    action: string,
    params: any
  ) {
    // Check if tool is enabled
    const enabled = await ToolManager.isToolEnabled(organizationId, toolId);
    
    if (!enabled) {
      throw new Error(`Tool ${toolId} is not enabled for this organization`);
    }

    // Get tool
    const tool = getToolById(toolId);
    
    if (!tool || !tool.actions?.[action]) {
      throw new Error(`Action ${action} not found on tool ${toolId}`);
    }

    // Execute tool action
    return await tool.actions[action](params);
  }
}

// Example: Chatbot creates a property alert
const result = await ToolCallingService.handleToolCall(
  'org-123',
  'property-alerts',
  'createPropertyAlert',
  {
    organizationId: 'org-123',
    customerId: 'customer-456',
    name: 'Downtown Condos',
    criteria: { minPrice: 200000, maxPrice: 500000 },
    frequency: 'DAILY',
    channels: ['email'],
  }
);
```

---

## Migration Guide

### Step 1: Create Tools Directory

```bash
cd app/lib
mkdir -p tools
cd tools

# Create base files
touch index.ts types.ts registry.ts manager.ts

# Create first tool
mkdir -p property-alerts/services
cd property-alerts
touch index.ts actions.ts queries.ts schemas.ts types.ts config.ts
```

### Step 2: Move Existing Code

```bash
# If you already created property-alerts in modules, move it:
mv lib/modules/property-alerts/* lib/tools/property-alerts/

# Keep core platform features in modules
# Move only "tools" to the tools directory
```

### Step 3: Update Imports

```typescript
// Before
import { createPropertyAlert } from '@/lib/modules/property-alerts/actions';

// After
import { createPropertyAlert } from '@/lib/tools/property-alerts';
// or
import { tool } from '@/lib/tools/property-alerts';
await tool.actions.createPropertyAlert(...);
```

### Step 4: Add Database Models

```bash
cd app
npx prisma format
npx prisma generate
npx prisma db push
```

---

## Benefits of This Architecture

1. **Discoverability** - All tools in one place
2. **Consistency** - Every tool follows same structure
3. **Configurability** - Enable/disable per organization
4. **Composability** - Tools can call other tools
5. **Monetization** - Track usage, enable billing
6. **Testing** - Easy to test tools in isolation
7. **Documentation** - Metadata serves as documentation
8. **Versioning** - Track tool versions
9. **Health Monitoring** - Built-in health checks
10. **Analytics** - Usage tracking per tool

---

## Tool Development Workflow

```typescript
// 1. Create new tool directory
mkdir lib/tools/my-new-tool

// 2. Define tool metadata
// lib/tools/my-new-tool/index.ts
export const tool: Tool = {
  metadata: {
    id: 'my-new-tool',
    name: 'My New Tool',
    // ... metadata
  },
  actions: { /* ... */ },
  queries: { /* ... */ },
};

// 3. Implement actions, queries, services
// lib/tools/my-new-tool/actions.ts
// lib/tools/my-new-tool/queries.ts
// lib/tools/my-new-tool/services/

// 4. Register in registry
// lib/tools/registry.ts
import * as MyNewTool from './my-new-tool';

export const TOOL_REGISTRY = {
  'my-new-tool': MyNewTool.tool,
  // ... other tools
};

// 5. Create UI pages
// app/(platform)/my-new-tool/page.tsx

// 6. Test
// __tests__/tools/my-new-tool.test.ts

// 7. Deploy
```

---

## Next Steps

1. Create `lib/tools/` directory structure
2. Implement base types and registry
3. Migrate property-alerts to new structure
4. Create tools dashboard UI
5. Add tool management to settings
6. Implement usage tracking
7. Build remaining 59 tools following the pattern

This architecture scales to 100+ tools while maintaining organization and consistency.