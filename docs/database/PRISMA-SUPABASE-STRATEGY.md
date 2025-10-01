# Prisma + Supabase Hybrid Database Strategy

**Version:** 1.0.0
**Last Updated:** October 1, 2025
**Status:** 🎯 Production Strategy

> **CRITICAL:** This document defines when to use Prisma vs Supabase Client in the Strive Tech SaaS Platform. Both tools are REQUIRED and work together, not as alternatives.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Strive Tech SaaS Platform                      │
│                                                             │
│  ┌──────────────────┐            ┌──────────────────┐      │
│  │  Prisma Client   │            │ Supabase Client  │      │
│  │  (ORM Layer)     │            │ (Services Layer) │      │
│  │                  │            │                  │      │
│  │ • Complex Queries│            │ • Auth           │      │
│  │ • Transactions   │            │ • Realtime       │      │
│  │ • Aggregations   │            │ • Storage        │      │
│  │ • Joins          │            │ • RLS Queries    │      │
│  │ • Migrations     │            │ • Presence       │      │
│  └────────┬─────────┘            └────────┬─────────┘      │
│           │                               │                │
│           └───────────────┬───────────────┘                │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │        Supabase Platform              │
        │                                       │
        │  ┌─────────────────────────────────┐  │
        │  │   PostgreSQL Database           │  │
        │  │   (Single Source of Truth)      │  │
        │  └─────────────────────────────────┘  │
        │                                       │
        │  ┌──────────┐  ┌──────────────────┐  │
        │  │   Auth   │  │  Row Level       │  │
        │  │ Service  │  │  Security (RLS)  │  │
        │  └──────────┘  └──────────────────┘  │
        │                                       │
        │  ┌──────────┐  ┌──────────────────┐  │
        │  │ Storage  │  │  Realtime        │  │
        │  │ Buckets  │  │  Channels        │  │
        │  └──────────┘  └──────────────────┘  │
        └───────────────────────────────────────┘
```

---

## 🎯 The Golden Rules

### Rule 1: They Work TOGETHER, Not Instead Of

**Prisma** = ORM tool to query Supabase PostgreSQL
**Supabase** = Database provider + Auth + Storage + Realtime

```typescript
// ✅ CORRECT - Both used for their strengths
// Complex query with Prisma
const report = await prisma.customer.findMany({
  where: { organizationId },
  include: {
    projects: { include: { tasks: true } },
    invoices: { where: { status: 'PAID' } }
  }
});

// Realtime with Supabase
supabase
  .from('notifications')
  .on('INSERT', handleNewNotification)
  .subscribe();

// ❌ WRONG - Trying to replace one with the other
// Don't try to use only Prisma (you'll lose Realtime, Auth, Storage)
// Don't try to use only Supabase (you'll lose powerful ORM features)
```

### Rule 2: Single PostgreSQL Database

Both tools connect to the **same** Supabase PostgreSQL database:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Points to Supabase PostgreSQL
}

// Supabase client config
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // Same database
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### Rule 3: Choose Based on Use Case, Not Preference

Follow the decision tree in this document. Don't default to one tool - each has specific strengths.

---

## 📊 When to Use Prisma

### Prisma Strengths:
✅ Complex queries with multiple joins
✅ Database transactions
✅ Type-safe query builder
✅ Aggregations and analytics
✅ Schema migrations
✅ Better IntelliSense/autocomplete
✅ Relationships and includes
✅ Raw SQL when needed

### Use Prisma For:

#### 1. Complex Business Logic Queries

```typescript
// ✅ USE PRISMA: Complex joins and filtering
async function getCustomerAnalytics(orgId: string) {
  return await prisma.customer.findMany({
    where: {
      organizationId: orgId,
      projects: {
        some: {
          status: 'ACTIVE',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    },
    include: {
      projects: {
        include: {
          tasks: {
            where: { status: 'COMPLETED' }
          }
        }
      },
      invoices: true,
      _count: {
        select: { projects: true, invoices: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

#### 2. Database Transactions

```typescript
// ✅ USE PRISMA: Multi-step transactions
async function createProjectWithTasks(data: ProjectData) {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Create project
    const project = await tx.project.create({
      data: {
        name: data.name,
        organizationId: data.organizationId
      }
    });

    // Step 2: Create initial tasks
    await tx.task.createMany({
      data: data.tasks.map(task => ({
        ...task,
        projectId: project.id
      }))
    });

    // Step 3: Update user's project count
    await tx.user.update({
      where: { id: data.userId },
      data: { projectCount: { increment: 1 } }
    });

    // Step 4: Log activity
    await tx.activityLog.create({
      data: {
        userId: data.userId,
        action: 'PROJECT_CREATED',
        projectId: project.id
      }
    });

    return project;
  });
}
```

#### 3. Aggregations and Analytics

```typescript
// ✅ USE PRISMA: Complex aggregations
async function getDashboardMetrics(orgId: string) {
  const [projectStats, taskStats, revenueStats] = await Promise.all([
    // Project statistics
    prisma.project.aggregate({
      where: { organizationId: orgId },
      _count: { id: true },
      _avg: { completionPercentage: true }
    }),

    // Task statistics
    prisma.task.groupBy({
      by: ['status'],
      where: {
        project: { organizationId: orgId }
      },
      _count: { id: true }
    }),

    // Revenue statistics
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: 'PAID'
      },
      _sum: { amount: true },
      _avg: { amount: true }
    })
  ]);

  return { projectStats, taskStats, revenueStats };
}
```

#### 4. Schema Migrations

```bash
# ✅ USE PRISMA: All schema changes
npx prisma migrate dev --name add_customer_preferences

# Prisma handles:
# - Schema versioning
# - Migration rollback
# - Database synchronization
# - Type regeneration
```

#### 5. Server Actions (Mutations)

```typescript
// ✅ USE PRISMA: All Server Actions
'use server';

export async function updateCustomer(data: CustomerUpdateInput) {
  const validated = CustomerSchema.parse(data);

  return await prisma.customer.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      email: validated.email,
      preferences: validated.preferences,
      updatedAt: new Date()
    },
    include: {
      organization: true,
      projects: { take: 5 }
    }
  });
}
```

#### 6. AI Context Retrieval (RAG - Retrieval Augmented Generation)

```typescript
// ✅ USE PRISMA: Vector search for AI context
async function findSimilarDocuments(queryEmbedding: number[], userId: string) {
  // Use Prisma for vector similarity search
  const similar = await prisma.$queryRaw<Document[]>`
    SELECT
      id,
      content,
      metadata,
      1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM documents
    WHERE user_id = ${userId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 5
  `;

  return similar;
}

// Store AI conversation history
async function saveAIConversation(data: ConversationData) {
  return await prisma.aIConversation.create({
    data: {
      userId: data.userId,
      messages: data.messages,
      model: data.model,
      tokensUsed: data.tokensUsed,
      cost: data.cost
    }
  });
}
```

#### 7. Batch Operations

```typescript
// ✅ USE PRISMA: Bulk inserts and updates
async function bulkImportCustomers(customers: CustomerInput[]) {
  return await prisma.$transaction([
    // Create all customers
    prisma.customer.createMany({
      data: customers,
      skipDuplicates: true
    }),

    // Update import log
    prisma.importLog.create({
      data: {
        type: 'CUSTOMER_IMPORT',
        count: customers.length,
        status: 'SUCCESS'
      }
    })
  ]);
}
```

---

## 🌐 When to Use Supabase Client

### Supabase Strengths:
✅ Real-time database subscriptions
✅ Authentication (login, signup, sessions)
✅ Row Level Security (automatic tenant isolation)
✅ File storage (avatars, documents)
✅ Presence (who's online)
✅ Realtime channels (WebSocket)
✅ Edge functions

### Use Supabase Client For:

#### 1. Authentication (ALL Auth Operations)

```typescript
// ✅ USE SUPABASE: All authentication
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});

// OAuth (Google, GitHub, etc.)
await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();
```

#### 2. Real-time Notifications

```typescript
// ✅ USE SUPABASE: Real-time notifications
'use client';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new notifications for current user
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // New notification arrives instantly!
          setNotifications(prev => [payload.new as Notification, ...prev]);
          showToast('New notification!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <button className="relative">
      <Bell />
      {notifications.length > 0 && (
        <span className="badge">{notifications.length}</span>
      )}
    </button>
  );
}
```

#### 3. Live Presence (Who's Online)

```typescript
// ✅ USE SUPABASE: Presence tracking
'use client';

export function TeamPresence({ teamId }: { teamId: string }) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`team:${teamId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as User[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user as online
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  return (
    <div className="presence-indicators">
      {onlineUsers.map(user => (
        <Avatar key={user.id} src={user.avatar} online />
      ))}
      <span>{onlineUsers.length} online</span>
    </div>
  );
}
```

#### 4. Live Chat/Messaging

```typescript
// ✅ USE SUPABASE: Real-time messaging
'use client';

export function TeamChat({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="chat-container">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

#### 5. File Storage (Avatars, Documents, Images)

```typescript
// ✅ USE SUPABASE: All file uploads and downloads
const supabase = createClient();

// Upload file
async function uploadAvatar(file: File, userId: string) {
  const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Download file
async function downloadDocument(path: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(path);

  if (error) throw error;
  return data;
}

// List files
async function getUserDocuments(userId: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .list(`${userId}/`, {
      limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  });

  return data;
}

// Delete file
async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('documents')
    .remove([path]);

  if (error) throw error;
}
```

#### 6. RLS-Protected Queries (Simple CRUD)

```typescript
// ✅ USE SUPABASE: When RLS handles security automatically
const supabase = createClient();

// RLS policy automatically filters to user's organization
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'ACTIVE');

// RLS policy in Supabase:
// CREATE POLICY "Users see own org projects"
// ON projects FOR SELECT
// USING (organization_id = (
//   SELECT organization_id FROM users WHERE id = auth.uid()
// ));

// No need to manually filter by organizationId - RLS does it!
```

#### 7. Live Dashboard Updates

```typescript
// ✅ USE SUPABASE: Live metrics that update automatically
'use client';

export function LiveDashboard({ orgId }: { orgId: string }) {
  const [metrics, setMetrics] = useState<Metrics>({
    activeProjects: 0,
    completedTasks: 0,
    revenue: 0
  });

  const supabase = createClient();

  useEffect(() => {
    // Subscribe to project changes
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => refreshMetrics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => refreshMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  // Dashboard updates automatically without polling!
  return <MetricsDisplay metrics={metrics} />;
}
```

#### 8. Typing Indicators

```typescript
// ✅ USE SUPABASE: "User is typing..." indicators
'use client';

export function ChatInput({ conversationId }: { conversationId: string }) {
  const supabase = createClient();
  const channel = supabase.channel(`conversation:${conversationId}`);

  const handleTyping = debounce(() => {
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId }
    });
  }, 300);

  useEffect(() => {
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        showTypingIndicator(payload.userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <input
      onChange={handleTyping}
      placeholder="Type a message..."
    />
  );
}
```

---

## 🔀 Hybrid Use Cases (Use Both)

### 1. AI Chatbot with Live Updates

```typescript
// AI chatbot: Use BOTH Prisma + Supabase
export async function POST(req: Request) {
  const { message, conversationId } = await req.json();

  // 1. Save user message with Prisma (complex insert)
  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      role: 'user',
      content: message,
      metadata: {
        ip: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent')
      }
    },
    include: {
      conversation: {
        include: { user: true }
      }
    }
  });

  // 2. Call AI API (OpenRouter/Groq)
  const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: message }],
      stream: true
    })
  });

  // 3. Stream response + save with Prisma + notify via Supabase Realtime
  let fullResponse = '';
  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiResponse.body!.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        controller.enqueue(encoder.encode(chunk));
      }

      // 4. Save AI response with Prisma
      await prisma.message.create({
        data: {
          conversationId,
          role: 'assistant',
          content: fullResponse
        }
      });

      // 5. Notify other team members via Supabase Realtime
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side
      );

      await supabase
        .from('notifications')
        .insert({
          user_id: userMessage.conversation.user.id,
          type: 'AI_RESPONSE',
          message: 'New AI response available'
        });

      controller.close();
    }
  });

  return new Response(stream);
}
```

### 2. Collaborative Document Editing

```typescript
// Collaborative editing: Use BOTH
export function CollaborativeEditor({ documentId }: { documentId: string }) {
  const [content, setContent] = useState('');
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const supabase = createClient();

  useEffect(() => {
    // Load document with Prisma (Server Component or API)
    fetch(`/api/documents/${documentId}`)
      .then(res => res.json())
      .then(doc => setContent(doc.content));

    // Track presence with Supabase
    const channel = supabase.channel(`document:${documentId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCursors(state);
      })
      .on('broadcast', { event: 'content-change' }, ({ payload }) => {
        setContent(payload.content);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            cursor: { line: 1, column: 1 }
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const handleChange = debounce((newContent: string) => {
    // Broadcast change to other users (Supabase)
    channel.send({
      type: 'broadcast',
      event: 'content-change',
      payload: { content: newContent }
    });

    // Save to database (Prisma via API)
    fetch(`/api/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: newContent })
    });
  }, 500);

  return (
    <Editor
      content={content}
      onChange={handleChange}
      cursors={cursors}
    />
  );
}
```

### 3. Activity Feed with Real-time Updates

```typescript
// Activity feed: Use BOTH
export function ActivityFeed({ orgId }: { orgId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Load initial activities with Prisma (via Server Action)
    loadActivities(orgId).then(setActivities);

    // Subscribe to new activities with Supabase
    const channel = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `organization_id=eq.${orgId}`
        },
        (payload) => {
          setActivities(prev => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  return (
    <div className="activity-feed">
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

// Server Action using Prisma
async function loadActivities(orgId: string) {
  return await prisma.activityLog.findMany({
    where: { organizationId: orgId },
    include: {
      user: true,
      project: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}
```

---

## 🚀 Platform-Specific Use Cases

### Your AI-Powered B2B SaaS Platform

#### 1. AI Assistant (Sai) - **Use Prisma**

```typescript
// AI conversation storage and retrieval
// ✅ USE PRISMA: Complex queries, embeddings, RAG

// Store conversation
await prisma.aIConversation.create({
  data: {
    userId,
    messages: messages,
    model: 'claude-3.5-sonnet',
    tokensUsed: 1500,
    cost: 0.045
  }
});

// Retrieve conversation history
const history = await prisma.aIConversation.findMany({
  where: { userId },
  include: {
    messages: {
      orderBy: { createdAt: 'asc' }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// Vector search for RAG (Retrieval Augmented Generation)
const relevantDocs = await prisma.$queryRaw`
  SELECT * FROM knowledge_base
  WHERE organization_id = ${orgId}
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`;
```

#### 2. Live Notifications - **Use Supabase**

```typescript
// Real-time notifications
// ✅ USE SUPABASE: Live updates without polling

supabase
  .from('notifications')
  .on('INSERT', (payload) => {
    showToast(payload.new.message);
    updateBadgeCount();
  })
  .subscribe();
```

#### 3. Team Collaboration - **Use Both**

```typescript
// Team collaboration features
// ✅ USE BOTH: Complex queries + real-time updates

// Prisma: Load team and permissions (complex query)
const team = await prisma.organizationMember.findMany({
  where: { organizationId },
  include: {
    user: {
      include: {
        permissions: true,
        roles: true
      }
    }
  }
});

// Supabase: Track who's online (presence)
const channel = supabase.channel('team-presence');
channel.on('presence', { event: 'sync' }, () => {
  const onlineMembers = channel.presenceState();
  updateOnlineIndicators(onlineMembers);
});
```

#### 4. CRM System - **Use Prisma**

```typescript
// CRM queries
// ✅ USE PRISMA: Complex business logic

const customers = await prisma.customer.findMany({
  where: {
    organizationId,
    status: 'ACTIVE',
    lastContactDate: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  include: {
    projects: {
      include: {
        tasks: { where: { status: 'IN_PROGRESS' } }
      }
    },
    invoices: {
      where: { status: { in: ['PENDING', 'OVERDUE'] } }
    },
    contactHistory: {
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  },
  orderBy: { lastContactDate: 'asc' }
});
```

#### 5. Live Dashboard Metrics - **Use Both**

```typescript
// Dashboard with live updates
// ✅ USE BOTH: Complex aggregations + real-time

// Prisma: Calculate metrics (Server Component)
async function getDashboardMetrics(orgId: string) {
  const [projects, tasks, revenue] = await Promise.all([
    prisma.project.count({
      where: { organizationId: orgId, status: 'ACTIVE' }
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { project: { organizationId: orgId } },
      _count: true
    }),
    prisma.invoice.aggregate({
      where: { organizationId: orgId, status: 'PAID' },
      _sum: { amount: true }
    })
  ]);

  return { projects, tasks, revenue };
}

// Supabase: Subscribe to changes (Client Component)
'use client';
export function LiveMetrics({ initialMetrics }: { initialMetrics: Metrics }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('metrics-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
          () => refreshMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
          () => refreshMetrics())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return <MetricsDisplay metrics={metrics} />;
}
```

#### 6. File Attachments - **Use Supabase**

```typescript
// File storage for project attachments
// ✅ USE SUPABASE: All file operations

async function uploadProjectFile(file: File, projectId: string) {
  const filePath = `projects/${projectId}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('project-files')
    .upload(filePath, file);

  if (error) throw error;

  // Save metadata to database with Prisma
  await prisma.projectAttachment.create({
    data: {
      projectId,
      fileName: file.name,
      fileSize: file.size,
      filePath: filePath,
      mimeType: file.type
    }
  });

  return filePath;
}
```

#### 7. User Authentication - **Use Supabase**

```typescript
// All auth operations
// ✅ USE SUPABASE: Authentication & session management

const supabase = createClient();

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@company.com',
  password: 'secure-password',
  options: {
    data: {
      organization_name: 'Company Inc.',
      tier: 'TIER_1'
    }
  }
});

// After signup, create user record with Prisma
await prisma.user.create({
  data: {
    id: data.user!.id, // Use Supabase Auth UUID
    email: data.user!.email!,
    organizationMembers: {
      create: {
        organizationId: orgId,
        role: 'OWNER'
      }
    }
  }
});
```

#### 8. Project Management - **Use Prisma**

```typescript
// Project queries and mutations
// ✅ USE PRISMA: Complex relationships and transactions

async function createProject(data: ProjectInput) {
  return await prisma.$transaction(async (tx) => {
    // Create project
    const project = await tx.project.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        ownerId: data.ownerId
      }
    });

    // Create default tasks
    await tx.task.createMany({
      data: data.initialTasks.map(task => ({
        ...task,
        projectId: project.id
      }))
    });

    // Assign team members
    await tx.projectMember.createMany({
      data: data.members.map(memberId => ({
        projectId: project.id,
        userId: memberId,
        role: 'MEMBER'
      }))
    });

    // Create activity log
    await tx.activityLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.ownerId,
        action: 'PROJECT_CREATED',
        projectId: project.id
      }
    });

    return project;
  });
}
```

---

## ⚠️ Common Pitfalls

### ❌ Pitfall 1: Using Prisma with Service Role Key (RLS Bypass)

```typescript
// ❌ WRONG: Prisma bypasses RLS
const users = await prisma.user.findMany(); // Returns ALL users across ALL orgs!

// ✅ CORRECT: Always filter by organization
const users = await prisma.user.findMany({
  where: { organizationId: currentUserOrgId }
});

// ✅ BETTER: Implement in middleware
export async function middleware(req: NextRequest) {
  const session = await getSession(req);
  req.headers.set('x-organization-id', session.user.organizationId);
}
```

### ❌ Pitfall 2: Trying to Do Realtime with Prisma

```typescript
// ❌ WRONG: Polling with Prisma (inefficient)
setInterval(async () => {
  const messages = await prisma.message.findMany({
    where: { conversationId }
  });
  setMessages(messages);
}, 2000); // Polling every 2 seconds - BAD!

// ✅ CORRECT: Use Supabase Realtime
supabase
  .from('messages')
  .on('INSERT', (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

### ❌ Pitfall 3: Complex Queries with Supabase Client

```typescript
// ❌ WRONG: Complex join with Supabase (limited)
const { data } = await supabase
  .from('customers')
  .select(`
    *,
    projects (
      *,
      tasks (*)
    ),
    invoices (*)
  `)
  .eq('status', 'ACTIVE');
// This works but is limited compared to Prisma

// ✅ BETTER: Use Prisma for complex queries
const customers = await prisma.customer.findMany({
  where: { status: 'ACTIVE' },
  include: {
    projects: {
      include: { tasks: true },
      where: { status: 'IN_PROGRESS' }
    },
    invoices: {
      where: { dueDate: { lt: new Date() } }
    }
  }
});
```

### ❌ Pitfall 4: File Storage with Prisma

```typescript
// ❌ WRONG: Trying to store files in PostgreSQL
await prisma.document.create({
  data: {
    name: file.name,
    content: await file.arrayBuffer() // Don't store large files in DB!
  }
});

// ✅ CORRECT: Use Supabase Storage
const { data } = await supabase.storage
  .from('documents')
  .upload(filePath, file);

// Then store metadata with Prisma
await prisma.document.create({
  data: {
    name: file.name,
    storagePath: filePath,
    size: file.size
  }
});
```

---

## 📋 Decision Tree

```
┌─────────────────────────────────────┐
│    Need to query/mutate data?      │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ What kind?    │
       └───┬───────────┘
           │
           ├─── Auth/Session? ──────────────────────► Use Supabase Auth
           │
           ├─── File upload/download? ──────────────► Use Supabase Storage
           │
           ├─── Real-time updates? ─────────────────► Use Supabase Realtime
           │
           ├─── Live presence/typing? ──────────────► Use Supabase Presence
           │
           ├─── Complex query with joins? ──────────► Use Prisma
           │
           ├─── Database transaction? ──────────────► Use Prisma
           │
           ├─── Aggregation/analytics? ─────────────► Use Prisma
           │
           ├─── Schema migration? ──────────────────► Use Prisma Migrate
           │
           ├─── Simple CRUD with RLS? ──────────────► Use Supabase Client
           │                                            (optional, but easier)
           │
           └─── AI conversation storage? ───────────► Use Prisma
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local

# Supabase (required for both Prisma and Supabase client)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Server-side only!

# Database (Prisma connects to Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

### Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

// Enable vector extension for AI embeddings
// Supabase has this built-in!
```

### Supabase Client Initialization

```typescript
// lib/supabase/client.ts (Client-side)
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// lib/supabase/server.ts (Server-side)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

---

## 📊 Summary Table

| Feature | Prisma | Supabase | Reason |
|---------|--------|----------|--------|
| **Complex Queries** | ✅ Use This | ❌ Limited | Better joins, filtering, ORM features |
| **Transactions** | ✅ Use This | ❌ No Support | Multi-step operations need Prisma |
| **Aggregations** | ✅ Use This | ⚠️ Basic | Complex analytics need Prisma |
| **Schema Migrations** | ✅ Use This | ❌ Manual | Prisma Migrate handles versioning |
| **Type Safety** | ✅ Excellent | ⚠️ Generated | Prisma has superior TypeScript types |
| **Authentication** | ❌ No | ✅ Use This | Supabase Auth is purpose-built |
| **Real-time Updates** | ❌ No | ✅ Use This | Database subscriptions via WebSocket |
| **File Storage** | ❌ No | ✅ Use This | Supabase Storage for files |
| **Presence Tracking** | ❌ No | ✅ Use This | Who's online, typing indicators |
| **Row Level Security** | ⚠️ Manual | ✅ Automatic | Supabase RLS is easier |
| **AI Embeddings** | ✅ Use This | ⚠️ Possible | Raw SQL via Prisma for vectors |
| **Server Actions** | ✅ Use This | ⚠️ Possible | Prisma for mutations |
| **Simple CRUD** | ✅ Works | ✅ Simpler | Either works, Supabase easier |

---

## 🎓 Best Practices

### 1. Default to Prisma for Queries

Unless you need Realtime or RLS auto-enforcement, use Prisma:

```typescript
// ✅ Default choice for most queries
const data = await prisma.customer.findMany({
  where: { organizationId }
});
```

### 2. Always Use Supabase for Auth

Never implement your own auth when Supabase Auth exists:

```typescript
// ✅ Always use Supabase Auth
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

### 3. Use Supabase Storage for All Files

Never store files in PostgreSQL:

```typescript
// ✅ Files go to Supabase Storage
await supabase.storage.from('bucket').upload(path, file);
```

### 4. Implement Tenant Isolation in Middleware

Since Prisma bypasses RLS, enforce it in code:

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return redirect('/login');

  // All requests get organization context
  req.headers.set('x-organization-id', session.user.organizationId);
}
```

### 5. Use Transactions for Multi-Step Operations

```typescript
// ✅ Wrap related operations in transaction
await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.inventory.update({ where: { id }, data: { quantity: { decrement: 1 } } }),
  prisma.notification.create({ data: notificationData })
]);
```

### 6. Optimize Realtime Subscriptions

Don't subscribe to everything:

```typescript
// ❌ BAD: Subscribes to entire table
supabase.from('messages').on('*', handler).subscribe();

// ✅ GOOD: Filter to specific conversation
supabase
  .from('messages')
  .on('INSERT', handler)
  .filter('conversation_id', 'eq', conversationId)
  .subscribe();
```

### 7. Clean Up Subscriptions

Always unsubscribe when component unmounts:

```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel');
  channel.subscribe();

  return () => {
    supabase.removeChannel(channel); // ✅ Clean up!
  };
}, []);
```

---

## 🚀 Next Steps

1. **Review your current code**: Identify places using wrong tool
2. **Add Supabase Realtime**: For notifications, presence, live updates
3. **Keep Prisma for queries**: Complex business logic stays with Prisma
4. **Implement RLS policies**: Even with Prisma, add RLS as safety net
5. **Test hybrid approach**: Verify both tools work together seamlessly

---

**Remember:** Prisma and Supabase are **teammates, not competitors**. Use each for what it does best, and your platform will be both powerful and real-time responsive.
