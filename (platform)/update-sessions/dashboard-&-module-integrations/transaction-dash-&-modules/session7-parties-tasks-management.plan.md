# Session 7: Parties, Tasks & Assignment Management - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-2.5 hours
**Dependencies:** Session 1, 3 completed
**Parallel Safe:** Yes (can run with Session 4, 5)

---

## 🎯 Session Objectives

Build party management and task assignment system for transaction loops with role-based permissions and notification system.

**What We're Building:**
- ✅ Party invitation and management
- ✅ Role-based party permissions
- ✅ Task creation and assignment
- ✅ Task completion workflow
- ✅ Email notifications

---

## 📋 Task Breakdown

### Phase 1: Party Management Module (40 minutes)

**Create `lib/modules/parties/schemas.ts`:**
```typescript
import { z } from 'zod';
import { PartyRole } from '@prisma/client';

export const CreatePartySchema = z.object({
  loopId: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.nativeEnum(PartyRole),
  permissions: z.array(z.enum(['view', 'edit', 'sign', 'upload'])).default(['view']),
});

export const UpdatePartySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(PartyRole).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REMOVED']).optional(),
});
```

**Create `lib/modules/parties/actions.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { sendPartyInvitationEmail } from '@/lib/email/notifications';
import { CreatePartySchema } from './schemas';

export async function inviteParty(input: any) {
  const session = await requireAuth();
  const validated = CreatePartySchema.parse(input);

  // Verify loop ownership
  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: validated.loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) throw new Error('Loop not found');

  // Create party
  const party = await prisma.loopParty.create({
    data: {
      ...validated,
      permissions: validated.permissions as any,
      loopId: validated.loopId,
      status: 'ACTIVE',
      invitedAt: new Date(),
    },
  });

  // Send invitation email
  await sendPartyInvitationEmail({
    to: party.email,
    partyName: party.name,
    role: party.role,
    loopAddress: loop.propertyAddress,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${loop.id}`,
  });

  return { success: true, party };
}

export async function updateParty(partyId: string, input: any) {
  const session = await requireAuth();
  const validated = UpdatePartySchema.parse(input);

  const party = await prisma.loopParty.findFirst({
    where: {
      id: partyId,
      loop: { organizationId: session.user.organizationId! },
    },
  });

  if (!party) throw new Error('Party not found');

  const updated = await prisma.loopParty.update({
    where: { id: partyId },
    data: validated,
  });

  return { success: true, party: updated };
}

export async function removeParty(partyId: string) {
  const session = await requireAuth();

  const party = await prisma.loopParty.findFirst({
    where: {
      id: partyId,
      loop: { organizationId: session.user.organizationId! },
    },
  });

  if (!party) throw new Error('Party not found');

  await prisma.loopParty.update({
    where: { id: partyId },
    data: { status: 'REMOVED' },
  });

  return { success: true };
}
```

---

### Phase 2: Task Management Module (40 minutes)

**Create `lib/modules/tasks/schemas.ts`:**
```typescript
import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const CreateTaskSchema = z.object({
  loopId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(TaskPriority).default('MEDIUM'),
  dueDate: z.date().optional(),
  assignedTo: z.string().uuid().optional(), // Party ID
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.date().optional(),
  assignedTo: z.string().uuid().optional(),
});
```

**Create `lib/modules/tasks/actions.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { sendTaskAssignmentEmail } from '@/lib/email/notifications';
import { CreateTaskSchema } from './schemas';

export async function createTask(input: any) {
  const session = await requireAuth();
  const validated = CreateTaskSchema.parse(input);

  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: validated.loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) throw new Error('Loop not found');

  const task = await prisma.task.create({
    data: {
      ...validated,
      createdBy: session.user.id,
      status: 'PENDING',
    },
    include: {
      assignee: true,
    },
  });

  // Send notification if assigned
  if (task.assignee) {
    await sendTaskAssignmentEmail({
      to: task.assignee.email,
      assigneeName: task.assignee.name,
      taskTitle: task.title,
      dueDate: task.dueDate,
      loopAddress: loop.propertyAddress,
      taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${loop.id}?tab=tasks`,
    });
  }

  return { success: true, task };
}

export async function completeTask(taskId: string) {
  const session = await requireAuth();

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      loop: { organizationId: session.user.organizationId! },
    },
  });

  if (!task) throw new Error('Task not found');

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  return { success: true, task: updated };
}
```

---

### Phase 3: Email Notifications (30 minutes)

**Update `lib/email/notifications.ts`:**
```typescript
export async function sendPartyInvitationEmail(params: {
  to: string;
  partyName: string;
  role: string;
  loopAddress: string;
  inviteUrl: string;
}) {
  await resend.emails.send({
    from: 'Strive Transactions <transactions@strivetech.ai>',
    to: params.to,
    subject: `You've been added to ${params.loopAddress}`,
    html: `
      <h2>Hello ${params.partyName},</h2>
      <p>You have been added as a <strong>${params.role}</strong> to the following transaction:</p>
      <p><strong>${params.loopAddress}</strong></p>
      <p>
        <a href="${params.inviteUrl}">View Transaction</a>
      </p>
    `,
  });
}

export async function sendTaskAssignmentEmail(params: {
  to: string;
  assigneeName: string;
  taskTitle: string;
  dueDate?: Date;
  loopAddress: string;
  taskUrl: string;
}) {
  await resend.emails.send({
    from: 'Strive Transactions <transactions@strivetech.ai>',
    to: params.to,
    subject: `Task Assigned: ${params.taskTitle}`,
    html: `
      <h2>Hello ${params.assigneeName},</h2>
      <p>You have been assigned a new task:</p>
      <p><strong>${params.taskTitle}</strong></p>
      <p>Transaction: ${params.loopAddress}</p>
      ${params.dueDate ? `<p>Due: ${params.dueDate.toLocaleDateString()}</p>` : ''}
      <p>
        <a href="${params.taskUrl}">View Task</a>
      </p>
    `,
  });
}
```

---

## 📊 Files to Create

```
lib/modules/parties/
├── schemas.ts          # ✅ Party validation
├── actions.ts          # ✅ Invite/manage parties
├── queries.ts          # ✅ Get parties
└── index.ts            # ✅ Public API

lib/modules/tasks/
├── schemas.ts          # ✅ Task validation
├── actions.ts          # ✅ Create/manage tasks
├── queries.ts          # ✅ Get tasks
└── index.ts            # ✅ Public API

components/transactions/
├── party-list.tsx      # ✅ Party table
├── party-invite-dialog.tsx  # ✅ Invite form
├── task-checklist.tsx  # ✅ Task list
└── task-create-dialog.tsx   # ✅ Create task form
```

**Total:** 12 files

---

## 🎯 Success Criteria

- [ ] Party invitations send emails
- [ ] Role-based permissions enforced
- [ ] Task assignment with notifications
- [ ] Task completion workflow
- [ ] Party removal (soft delete)
- [ ] Tests 80%+ coverage

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🟡 MEDIUM
