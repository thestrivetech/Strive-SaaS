# Session 6: UI Components Migration & Adaptation - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3.5-4 hours
**Dependencies:** Session 1-5 completed
**Parallel Safe:** No (requires backend complete)

---

## 🎯 Session Objectives

Migrate and adapt UI components from external dashboard to Next.js with shadcn/ui, converting Wouter routing to App Router and React Query to Server Actions.

**What We're Building:**
- ✅ Transaction dashboard page
- ✅ Loop detail page with tabs
- ✅ Document viewer component
- ✅ Signature request UI
- ✅ Party management interface
- ✅ Task checklist component

---

## 📋 Task Breakdown

### Phase 1: Route Structure & Layouts (30 minutes)

**Create Route Structure:**
```bash
app/(protected)/transactions/
├── page.tsx                 # Dashboard
├── layout.tsx              # Transaction layout
├── [loopId]/
│   ├── page.tsx           # Loop detail
│   ├── documents/
│   │   └── page.tsx       # Documents tab
│   ├── parties/
│   │   └── page.tsx       # Parties tab
│   ├── tasks/
│   │   └── page.tsx       # Tasks tab
│   └── signatures/
│       └── page.tsx       # Signatures tab
└── sign/
    └── [signatureId]/
        └── page.tsx       # Public signing page
```

**Create `app/(protected)/transactions/layout.tsx`:**
```typescript
import { TransactionNav } from '@/components/transactions/transaction-nav';

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <TransactionNav />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
```

---

### Phase 2: Dashboard Page (45 minutes)

**Create `app/(protected)/transactions/page.tsx`:**
```typescript
import { Suspense } from 'react';
import { LoopGrid } from '@/components/transactions/loop-grid';
import { StatsCards } from '@/components/transactions/stats-cards';
import { CreateLoopDialog } from '@/components/transactions/create-loop-dialog';
import { getLoops, getLoopStats } from '@/lib/modules/transactions';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;

  const [loopsData, stats] = await Promise.all([
    getLoops({
      status: searchParams.status as any,
      page,
      limit: 20,
    }),
    getLoopStats(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">
            Manage real estate transactions and documents
          </p>
        </div>
        <CreateLoopDialog />
      </div>

      <StatsCards stats={stats} />

      <Suspense fallback={<LoopGridSkeleton />}>
        <LoopGrid loops={loopsData.loops} />
      </Suspense>
    </div>
  );
}
```

---

### Phase 3: Migrate Components (60 minutes)

**Adapt LoopCard Component:**
```typescript
// components/transactions/loop-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TransactionLoop } from '@prisma/client';
import { useRouter } from 'next/navigation';

export function LoopCard({ loop }: { loop: TransactionLoop }) {
  const router = useRouter();

  const statusColors = {
    DRAFT: 'bg-gray-500',
    ACTIVE: 'bg-blue-500',
    UNDER_CONTRACT: 'bg-yellow-500',
    CLOSING: 'bg-orange-500',
    CLOSED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/transactions/${loop.id}`)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{loop.propertyAddress}</CardTitle>
          <Badge className={statusColors[loop.status]}>
            {loop.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{loop.transactionType}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">
            ${loop.listingPrice.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{loop.progress}%</span>
          </div>
          <Progress value={loop.progress} />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Create Document Upload Component:**
```typescript
// components/transactions/document-upload.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadDocument } from '@/lib/modules/documents';
import { toast } from '@/hooks/use-toast';

export function DocumentUpload({ loopId }: { loopId: string }) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('loopId', loopId);

    try {
      await uploadDocument(formData);
      toast({ title: 'Document uploaded successfully' });
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div>
        <Label htmlFor="file">Select Document</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          className="w-full rounded-md border p-2"
        >
          <option value="contract">Contract</option>
          <option value="disclosure">Disclosure</option>
          <option value="inspection">Inspection</option>
          <option value="other">Other</option>
        </select>
      </div>
      <Button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}
```

---

### Phase 4: Loop Detail Page (45 minutes)

**Create `app/(protected)/transactions/[loopId]/page.tsx`:**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLoopById } from '@/lib/modules/transactions';
import { DocumentList } from '@/components/transactions/document-list';
import { PartyList } from '@/components/transactions/party-list';
import { TaskChecklist } from '@/components/transactions/task-checklist';
import { SignatureRequests } from '@/components/transactions/signature-requests';

export default async function LoopDetailPage({
  params,
}: {
  params: { loopId: string };
}) {
  const loop = await getLoopById(params.loopId);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{loop.propertyAddress}</h1>
        <p className="text-muted-foreground">
          {loop.transactionType} - ${loop.listingPrice.toLocaleString()}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({loop.documents.length})
          </TabsTrigger>
          <TabsTrigger value="parties">
            Parties ({loop.parties.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({loop.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Loop overview */}
        </TabsContent>

        <TabsContent value="documents">
          <DocumentList documents={loop.documents} loopId={loop.id} />
        </TabsContent>

        <TabsContent value="parties">
          <PartyList parties={loop.parties} loopId={loop.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskChecklist tasks={loop.tasks} loopId={loop.id} />
        </TabsContent>

        <TabsContent value="signatures">
          <SignatureRequests requests={loop.signatures} loopId={loop.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📊 Files to Create

```
app/(protected)/transactions/
├── page.tsx                          # ✅ Dashboard
├── layout.tsx                        # ✅ Layout
├── [loopId]/page.tsx                # ✅ Loop detail
└── sign/[signatureId]/page.tsx      # ✅ Signing page

components/transactions/
├── loop-card.tsx                     # ✅ Adapted from external
├── loop-grid.tsx                     # ✅ Grid layout
├── stats-cards.tsx                   # ✅ Stats display
├── create-loop-dialog.tsx            # ✅ Create dialog
├── document-list.tsx                 # ✅ Document table
├── document-upload.tsx               # ✅ Upload form
├── party-list.tsx                    # ✅ Party table
├── task-checklist.tsx               # ✅ Task list
└── signature-requests.tsx            # ✅ Signature table
```

**Total:** ~15 files

---

## 🎯 Success Criteria

- [ ] All routes accessible
- [ ] Components use shadcn/ui
- [ ] Server Actions replace React Query
- [ ] Responsive design
- [ ] Loading states implemented
- [ ] Error boundaries in place

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 HIGH
