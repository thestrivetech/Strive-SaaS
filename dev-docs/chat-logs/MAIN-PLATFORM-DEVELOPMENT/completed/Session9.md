# Session 9 Tasks - AI Integration & Real-Time Features

**Goal:** Implement AI chat, real-time updates, bulk operations, and export features
**Starting Point:** Phase 3 - 90% Complete 🚧
**Estimated Duration:** 4-5 hours

---

## 📍 Current Status (From Session 8)

### ✅ Already Completed (Session 1-8)
**Foundation (Phase 1 & 2):** 100% ✅
- Next.js 15 + React 19 + Prisma setup
- Supabase authentication & database
- 56 UI components from shadcn/ui
- Dashboard layouts & navigation
- Organization & team management

**SaaS Features (Phase 3):** 90% ✅
- **CRM System:** 90% complete
  - Full CRUD operations
  - Advanced filtering (multi-select + date ranges)
  - Pagination (25/50/100 per page)
  - Search functionality
- **Project Management:** 95% complete
  - Project CRUD with full details
  - Advanced filters (6 filter types)
  - Pagination & search
  - Progress tracking
- **Task Management:** 92% complete
  - Task CRUD operations
  - Advanced filters (5 filter types)
  - Assignee management
  - Priority & status tracking

**UI/UX Enhancements:** 90% ✅
- Loading states & skeletons
- Pagination system
- Advanced filtering components (DateRangePicker, MultiSelect)
- URL-based state management

### 🔧 Carry-Over Tasks from Session 8
- **Optimistic UI Updates:** Deferred - not critical for MVP
- **Task Kanban Board:** Deferred - stretch goal for Session 9
- **Saved Filter Presets:** Deferred to Phase 4

---

## 🎯 Session 9 Primary Objectives

### Priority 1: AI Chat Integration (Est: 90 min)

#### 1. Setup AI Provider Configurations
**File:** `lib/ai/config.ts` (~50 lines)

**Implementation Requirements:**
- OpenRouter API configuration
- Groq API configuration
- Model selection based on subscription tier
- Rate limit configurations per tier

**Configuration Structure:**
```typescript
// Tier-based model access
export const TIER_MODELS = {
  FREE: {
    providers: ['groq'],
    models: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    rateLimit: { requests: 10, window: 3600 }, // 10/hour
  },
  BASIC: {
    providers: ['groq', 'openrouter'],
    models: ['llama-3.1-70b', 'gpt-3.5-turbo', 'claude-3-haiku'],
    rateLimit: { requests: 100, window: 3600 }, // 100/hour
  },
  PRO: {
    providers: ['groq', 'openrouter'],
    models: ['gpt-4-turbo', 'claude-3.5-sonnet', 'llama-3.3-70b'],
    rateLimit: { requests: 500, window: 3600 }, // 500/hour
  },
  ENTERPRISE: {
    providers: ['groq', 'openrouter'],
    models: ['all'], // All models available
    rateLimit: { requests: -1, window: 3600 }, // Unlimited
  },
};
```

**Estimated Lines:** ~50 lines

#### 2. Create AI Service Layer
**File:** `lib/ai/service.ts` (~150 lines)

**Implementation Requirements:**
- OpenRouter API client
- Groq API client
- Unified interface for both providers
- Streaming support
- Error handling & retry logic
- Usage tracking

**Service Pattern:**
```typescript
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export class AIService {
  async chat(
    messages: AIMessage[],
    options: {
      model: string;
      provider: 'openrouter' | 'groq';
      stream?: boolean;
      temperature?: number;
    }
  ): Promise<AIResponse | ReadableStream> {
    // Route to correct provider
    if (options.provider === 'groq') {
      return this.groqChat(messages, options);
    } else {
      return this.openrouterChat(messages, options);
    }
  }

  private async groqChat(messages: AIMessage[], options: any) {
    // Groq API implementation
  }

  private async openrouterChat(messages: AIMessage[], options: any) {
    // OpenRouter API implementation
  }
}
```

**Why separate service:**
- Abstraction over multiple providers
- Easy to add new providers
- Centralized error handling
- Usage tracking in one place

**Estimated Lines:** ~150 lines

#### 3. Create AI Chat Server Actions
**File:** `lib/modules/ai/actions.ts` (~100 lines)

**Implementation Requirements:**
- `sendMessage` action with validation
- Rate limit checking
- Tier-based model access enforcement
- Conversation history management
- Activity logging

**Action Pattern:**
```typescript
'use server';

import { z } from 'zod';
import { AIService } from '@/lib/ai/service';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { checkRateLimit } from '@/lib/rate-limit';

const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  model: z.string(),
  provider: z.enum(['openrouter', 'groq']),
});

export async function sendMessage(data: z.infer<typeof SendMessageSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Validate input
  const validated = SendMessageSchema.parse(data);

  // Check rate limit
  const allowed = await checkRateLimit(user.id, user.subscriptionTier);
  if (!allowed) throw new Error('Rate limit exceeded');

  // Check tier access to model
  const hasAccess = checkModelAccess(user.subscriptionTier, validated.model);
  if (!hasAccess) throw new Error('Model not available in your tier');

  // Send to AI service
  const aiService = new AIService();
  const response = await aiService.chat(
    [
      { role: 'system', content: 'You are Sai, an AI assistant for Strive Tech.' },
      { role: 'user', content: validated.message },
    ],
    {
      model: validated.model,
      provider: validated.provider,
    }
  );

  // Save conversation to database
  await prisma.aIConversation.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      messages: [
        { role: 'user', content: validated.message, timestamp: new Date() },
        { role: 'assistant', content: response.content, timestamp: new Date() },
      ],
      model: validated.model,
      provider: validated.provider,
    },
  });

  return response;
}
```

**Security Considerations:**
- Rate limiting per user per tier
- Model access enforcement
- Input validation (max 4000 chars)
- API key never exposed to client

**Estimated Lines:** ~100 lines

#### 4. Create AI Chat UI Component
**File:** `components/features/ai/ai-chat.tsx` (~250 lines)

**Implementation Requirements:**
- Message list with user/assistant bubbles
- Message input with submit
- Model selector dropdown (tier-based options)
- Provider badge (OpenRouter/Groq)
- Loading state with typing indicator
- Error handling UI
- Streaming message display

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Select } from '@/components/ui/select';
import { sendMessage } from '@/lib/modules/ai/actions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat({ availableModels, userTier }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: input,
        model: selectedModel,
        provider: getProviderForModel(selectedModel),
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Model selector */}
      <div className="p-4 border-b">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sai anything..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Why "use client":**
- useState for message state
- Form submission handler
- Input field interaction
- Real-time UI updates

**Estimated Lines:** ~250 lines

#### 5. Create AI Chat Page
**File:** `app/(platform)/ai/page.tsx` (~100 lines)

**Implementation Requirements:**
- Fetch user's subscription tier
- Get available models for tier
- Render AIChat component
- Show tier upgrade prompt if needed

**Server Component Pattern:**
```typescript
export default async function AIPage() {
  const user = await getCurrentUser();
  const userOrgs = await getUserOrganizations(user.id);
  const currentOrg = userOrgs[0];

  // Get subscription tier from organization
  const subscription = await getSubscription(currentOrg.organizationId);
  const availableModels = TIER_MODELS[subscription.tier].models;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sai Assistant</h1>
          <p className="text-muted-foreground">
            AI-powered assistant for your business needs
          </p>
        </div>
        <Badge variant="secondary">{subscription.tier} Plan</Badge>
      </div>

      <Card className="h-[calc(100vh-200px)]">
        <CardContent className="p-0 h-full">
          <AIChat
            availableModels={availableModels}
            userTier={subscription.tier}
          />
        </CardContent>
      </Card>

      {subscription.tier === 'FREE' && (
        <Alert>
          <AlertTitle>Upgrade for more AI power</AlertTitle>
          <AlertDescription>
            Get access to advanced models like GPT-4 and Claude 3.5
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

**Estimated Lines:** ~100 lines

---

### Priority 2: Real-Time Updates (Est: 60 min)

#### 1. Setup Supabase Realtime Client
**File:** `lib/realtime/client.ts` (~80 lines)

**Implementation Requirements:**
- Supabase Realtime channel setup
- Presence tracking (who's online)
- Broadcast for instant updates
- Connection status handling

**Realtime Pattern:**
```typescript
import { createClient } from '@supabase/supabase-js';

export class RealtimeClient {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  subscribeToTaskUpdates(projectId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Task',
          filter: `projectId=eq.${projectId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  broadcastTaskUpdate(projectId: string, task: any) {
    const channel = this.supabase.channel(`project:${projectId}`);
    channel.send({
      type: 'broadcast',
      event: 'task_updated',
      payload: task,
    });
  }
}
```

**Estimated Lines:** ~80 lines

#### 2. Create useRealtime Hook
**File:** `lib/realtime/use-realtime.ts` (~100 lines)

**Implementation Requirements:**
- React hook for subscribing to updates
- Auto-cleanup on unmount
- Optimistic updates integration
- Connection status

**Hook Pattern:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { RealtimeClient } from './client';

export function useRealtimeTaskUpdates(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new RealtimeClient();

    const unsubscribe = client.subscribeToTaskUpdates(projectId, (payload) => {
      // Handle update
      if (payload.eventType === 'INSERT') {
        setTasks((prev) => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setTasks((prev) =>
          prev.map((task) => (task.id === payload.new.id ? payload.new : task))
        );
      } else if (payload.eventType === 'DELETE') {
        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
      }
    });

    setIsConnected(true);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [projectId]);

  return { tasks, isConnected };
}
```

**Estimated Lines:** ~100 lines

#### 3. Integrate Realtime in Task List
**File:** `app/(platform)/projects/[projectId]/page.tsx` (MODIFY ~30 lines)

**Implementation Requirements:**
- Use useRealtimeTaskUpdates hook
- Merge realtime updates with initial data
- Show connection status indicator
- Handle reconnection

**Integration Pattern:**
```typescript
'use client';

import { useRealtimeTaskUpdates } from '@/lib/realtime/use-realtime';

export function TaskList({ initialTasks, projectId }: Props) {
  const { tasks: realtimeTasks, isConnected } = useRealtimeTaskUpdates(projectId);

  // Merge initial tasks with realtime updates
  const tasks = realtimeTasks.length > 0 ? realtimeTasks : initialTasks;

  return (
    <div>
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Live updates' : 'Connecting...'}
        </span>
      </div>

      {/* Task list */}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

**Estimated Lines:** ~30 lines modified

---

### Priority 3: Bulk Operations (Est: 45 min)

#### 1. Create Bulk Selection Component
**File:** `components/ui/bulk-selector.tsx` (~150 lines)

**Implementation Requirements:**
- Checkbox in header (select all visible)
- Checkbox per row
- Selected count badge
- Bulk action dropdown

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkSelectorProps {
  items: Array<{ id: string }>;
  onBulkAction: (action: string, ids: string[]) => void;
}

export function BulkSelector({ items, onBulkAction }: BulkSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <div className="flex items-center gap-4">
      <Checkbox
        checked={selected.size === items.length}
        onCheckedChange={handleSelectAll}
      />

      {selected.size > 0 && (
        <>
          <Badge>{selected.size} selected</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBulkAction('delete', Array.from(selected))}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('changeStatus', Array.from(selected))}>
                Change Status
              </DropdownMenuItem>
              {/* More actions */}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
```

**Estimated Lines:** ~150 lines

#### 2. Create Bulk Actions Server Actions
**File:** `lib/modules/tasks/bulk-actions.ts` (~100 lines)

**Implementation Requirements:**
- Bulk status change
- Bulk assignment
- Bulk delete with confirmation
- Validation & authorization

**Action Pattern:**
```typescript
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

const BulkUpdateSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100), // Max 100 at once
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']),
});

export async function bulkUpdateTaskStatus(data: z.infer<typeof BulkUpdateSchema>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const validated = BulkUpdateSchema.parse(data);

  // Verify user has access to all tasks (multi-tenancy check)
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: validated.taskIds },
      project: { organizationId: user.organizationId },
    },
  });

  if (tasks.length !== validated.taskIds.length) {
    throw new Error('Some tasks not found or unauthorized');
  }

  // Bulk update
  await prisma.task.updateMany({
    where: { id: { in: validated.taskIds } },
    data: { status: validated.status },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      action: 'BULK_UPDATE',
      entityType: 'Task',
      entityId: validated.taskIds.join(','),
      details: { status: validated.status, count: validated.taskIds.length },
    },
  });

  return { success: true, count: validated.taskIds.length };
}
```

**Security:**
- Max 100 items per bulk operation
- Multi-tenancy verification
- Activity logging for audit trail

**Estimated Lines:** ~100 lines

---

### Priority 4: Export Features (Est: 45 min)

#### 1. Create CSV Export Utility
**File:** `lib/export/csv.ts` (~80 lines)

**Implementation Requirements:**
- Generic CSV generator
- Handles different data types
- Column mapping
- File download trigger

**Utility Pattern:**
```typescript
export function generateCSV<T>(
  data: T[],
  columns: Array<{ key: keyof T; label: string }>
): string {
  // Header row
  const headers = columns.map((col) => col.label).join(',');

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        // Escape commas and quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Estimated Lines:** ~80 lines

#### 2. Create Export Button Component
**File:** `components/features/export/export-button.tsx` (~100 lines)

**Implementation Requirements:**
- Export dropdown (CSV, PDF)
- Loading state during generation
- Success/error feedback
- Format-specific options

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCSV, downloadCSV } from '@/lib/export/csv';

export function ExportButton({ data, filename, type }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = generateCSV(data, columns);
      downloadCSV(`${filename}.csv`, csv);
      toast.success('Exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Estimated Lines:** ~100 lines

#### 3. Integrate Export in List Pages
**Files Modified:**
- `app/(platform)/crm/page.tsx` (~10 lines)
- `app/(platform)/projects/page.tsx` (~10 lines)

**Integration Pattern:**
```typescript
<div className="flex items-center gap-2">
  <ExportButton
    data={customers}
    filename={`customers-${new Date().toISOString()}`}
    type="customers"
  />
  <CustomerFilters />
  <CreateCustomerDialog />
</div>
```

**Estimated Lines:** ~20 lines total

---

## 📋 Technical Tasks Summary

### Modules to Create (3 new modules)
1. AI module (`lib/ai/` + `lib/modules/ai/`)
2. Realtime module (`lib/realtime/`)
3. Export module (`lib/export/`)

### Components to Create (6 new components)
1. AIChat component (~250 lines)
2. BulkSelector component (~150 lines)
3. ExportButton component (~100 lines)
4. MessageBubble component (~50 lines)
5. TypingIndicator component (~30 lines)
6. ConnectionStatus component (~30 lines)

### Files to Modify (3 files)
1. `app/(platform)/projects/[projectId]/page.tsx` - Realtime integration
2. `app/(platform)/crm/page.tsx` - Export button
3. `app/(platform)/projects/page.tsx` - Export button

### Total New Code Estimate
- **New Files:** ~1,400 lines
- **Modified Files:** ~70 lines
- **Total:** ~1,470 lines

---

## ✅ Testing Checklist

### AI Chat Testing
- [ ] OpenRouter API connection works
- [ ] Groq API connection works
- [ ] Model selection shows correct options per tier
- [ ] Rate limiting works correctly
- [ ] Messages save to database
- [ ] Error handling displays correctly
- [ ] Streaming messages display properly

### Real-Time Testing
- [ ] Task updates appear instantly for all users viewing same project
- [ ] Connection status indicator works
- [ ] Reconnection after disconnect
- [ ] Presence tracking (who's online)
- [ ] No duplicate messages on reconnect

### Bulk Operations Testing
- [ ] Select all/deselect all works
- [ ] Individual selection works
- [ ] Bulk status change works
- [ ] Bulk assignment works
- [ ] Bulk delete with confirmation
- [ ] Multi-tenancy enforced (can't bulk-update other org's items)
- [ ] Activity logging works

### Export Testing
- [ ] CSV export generates correct format
- [ ] CSV handles special characters (commas, quotes)
- [ ] PDF export generates readable document
- [ ] Export respects current filters
- [ ] Large exports don't freeze UI
- [ ] Download triggers correctly

---

## 🎯 Success Criteria

### Must Complete ✅
- [ ] AI chat interface functional with OpenRouter OR Groq
- [ ] Users can send messages and receive responses
- [ ] Model selection based on subscription tier
- [ ] Real-time task updates work for multi-user projects
- [ ] Bulk operations work for tasks (status change, delete)
- [ ] CSV export works for customers and projects
- [ ] All TypeScript errors fixed
- [ ] No regression in existing features

### Stretch Goals 🎯
- [ ] Streaming message display (typewriter effect)
- [ ] Task Kanban board with @dnd-kit
- [ ] PDF export with formatting
- [ ] Saved filter presets
- [ ] Keyboard shortcuts for quick actions

### Performance Targets
- **AI Response Time:** < 3 seconds for first token
- **Real-Time Latency:** < 500ms for updates
- **Bulk Operation:** < 2 seconds for 50 items
- **CSV Export:** < 1 second for 1000 rows

---

## 🚀 Implementation Order (Recommended)

### Phase 1: AI Integration (90 min)
1. Setup AI configs (15 min)
2. Create AI service layer (30 min)
3. Create server actions (20 min)
4. Build AI chat UI (40 min)
5. Create AI page (15 min)
6. Test with both providers (20 min)

**Checkpoint:** Users can chat with AI and get responses

### Phase 2: Real-Time Updates (60 min)
1. Setup Supabase Realtime client (20 min)
2. Create useRealtime hook (20 min)
3. Integrate in task list (15 min)
4. Test with multiple browser windows (15 min)

**Checkpoint:** Task updates appear instantly across sessions

### Phase 3: Bulk Operations (45 min)
1. Create BulkSelector component (20 min)
2. Create bulk actions (15 min)
3. Integrate in task list (10 min)
4. Test bulk update/delete (10 min)

**Checkpoint:** Users can select and perform bulk actions

### Phase 4: Export Features (45 min)
1. Create CSV utility (15 min)
2. Create ExportButton component (15 min)
3. Integrate in CRM and Projects (10 min)
4. Test exports with various data (10 min)

**Checkpoint:** Users can export data to CSV

### Phase 5: Testing & Polish (30 min)
1. Full feature testing (15 min)
2. TypeScript type check (5 min)
3. Performance testing (10 min)
4. Bug fixes (as needed)

**Total Estimated:** 4-5 hours

---

## 📦 Dependencies

### External Libraries (to install)
```bash
npm install @supabase/realtime-js  # Real-time updates
npm install openai                  # OpenRouter API (compatible)
npm install jspdf                   # PDF generation (optional)
npm install date-fns               # Already installed
```

### API Keys Needed
- `OPENROUTER_API_KEY` - Already in .env
- `GROQ_API_KEY` - Already in .env
- Supabase keys already configured

### Supabase Setup Required
- Enable Realtime on `Task` table
- Configure RLS policies for Realtime
- Test Realtime connection in Supabase dashboard

---

## 🔗 References & Resources

### API Documentation
- **OpenRouter:** https://openrouter.ai/docs
- **Groq:** https://console.groq.com/docs
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime

### Code Examples
- Streaming AI responses: `/docs/ai-streaming-pattern.md`
- Supabase Realtime hooks: `/docs/realtime-hooks.md`
- Bulk operations: `/docs/bulk-operations-pattern.md`

### Design Patterns
- AI chat UI: Linear, Notion AI
- Real-time indicators: Figma, Google Docs
- Bulk operations: Gmail, GitHub

---

## 📝 Notes & Considerations

### AI Rate Limiting Strategy
- Free tier: 10 requests/hour (strict)
- Basic tier: 100 requests/hour
- Pro tier: 500 requests/hour
- Enterprise: Unlimited

**Implementation:**
```typescript
// Store in Redis or database
interface RateLimitTracker {
  userId: string;
  tier: string;
  requests: number;
  windowStart: Date;
}

async function checkRateLimit(userId: string, tier: string): Promise<boolean> {
  const limit = TIER_MODELS[tier].rateLimit.requests;
  const window = TIER_MODELS[tier].rateLimit.window;

  // Check current usage
  // Return true if under limit, false if exceeded
}
```

### Real-Time Performance
- Use Supabase channels, not polling
- Debounce rapid updates (100ms)
- Limit to active project/page only
- Unsubscribe on unmount (prevent memory leaks)

### Bulk Operations UX
- Show confirmation dialog for bulk delete
- Display progress for large batches
- Allow undo for 5 seconds (toast with undo button)
- Clear selection after operation completes

### Export Considerations
- CSV: Max 10,000 rows (performance limit)
- PDF: Max 1,000 rows (file size limit)
- Apply current filters to export
- Show loading state during generation
- Consider server-side generation for very large exports

---

## 🎯 Expected Outcomes

**After Session 9 completion:**

1. **Phase 3 Progress:** 90% → 98% (+8%)
   - AI Integration: 0% → 100%
   - Real-Time Updates: 0% → 100%
   - Bulk Operations: 0% → 100%
   - Export Features: 0% → 100%

2. **Feature Completeness:**
   - Users can interact with AI assistant (Sai)
   - Multi-user collaboration with real-time updates
   - Efficient bulk operations for task management
   - Data export for reporting and analysis

3. **Technical Achievements:**
   - Multi-provider AI integration (OpenRouter + Groq)
   - WebSocket-based real-time updates
   - Scalable bulk operation system
   - Generic export utilities (reusable)

4. **User Experience:**
   - Instant AI assistance within the app
   - Live collaboration indicators
   - Efficient workflows with bulk actions
   - Easy data export for external tools

---

## 🔮 Session 10 Preview

**Focus:** Phase 3 Completion & Polish

With AI, real-time, bulk operations, and export features complete in Session 9, Session 10 will focus on:

1. **Notifications System** - In-app and email notifications
2. **Advanced Analytics** - Dashboard widgets and reports
3. **File Attachments** - Upload/download for tasks and projects
4. **Task Kanban Board** - Drag & drop interface (if not done in Session 9)
5. **Polish & Bug Fixes** - Refine existing features
6. **Performance Optimization** - Code splitting, lazy loading
7. **Phase 3 Review** - Final testing and documentation

**Expected:** Phase 3: 98% → 100% (COMPLETE)

---

**Session 9 Ready to Begin!**

Clear objectives, detailed implementation plans, and all dependencies ready. Let's build advanced features!