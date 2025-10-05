# Session 8: Workflows, Milestones & Automation - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2.5-3 hours
**Dependencies:** Session 1, 3, 7 completed
**Parallel Safe:** Yes (can run with Session 5)

---

## 🎯 Session Objectives

Build workflow template system with automated task generation, milestone tracking, and progress automation.

**What We're Building:**
- ✅ Workflow template creation
- ✅ Workflow application to loops
- ✅ Automated task generation from templates
- ✅ Milestone tracking
- ✅ Progress calculation

---

## 📋 Task Breakdown

### Phase 1: Workflow Templates (45 minutes)

**Create `lib/modules/workflows/schemas.ts`:**
```typescript
import { z } from 'zod';

const WorkflowStepSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  order: z.number().int().min(0),
  estimatedDays: z.number().int().optional(),
  dependencies: z.array(z.string()).default([]), // Step IDs
  autoAssignRole: z.enum(['BUYER_AGENT', 'LISTING_AGENT', 'LENDER', 'TITLE_COMPANY']).optional(),
  requiresDocument: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
});

export const CreateWorkflowTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  transactionType: z.enum(['PURCHASE_AGREEMENT', 'LISTING_AGREEMENT', 'LEASE_AGREEMENT', 'ALL']),
  steps: z.array(WorkflowStepSchema).min(1),
});

export const ApplyWorkflowSchema = z.object({
  loopId: z.string().uuid(),
  templateId: z.string().uuid(),
  customizations: z.record(z.any()).optional(),
});
```

**Create `lib/modules/workflows/actions.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { CreateWorkflowTemplateSchema, ApplyWorkflowSchema } from './schemas';

export async function createWorkflowTemplate(input: any) {
  const session = await requireAuth();
  const validated = CreateWorkflowTemplateSchema.parse(input);

  const template = await prisma.workflow.create({
    data: {
      name: validated.name,
      description: validated.description,
      isTemplate: true,
      steps: validated.steps as any,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
      status: 'ACTIVE',
    },
  });

  return { success: true, template };
}

export async function applyWorkflowToLoop(input: any) {
  const session = await requireAuth();
  const validated = ApplyWorkflowSchema.parse(input);

  // Get template
  const template = await prisma.workflow.findFirst({
    where: {
      id: validated.templateId,
      isTemplate: true,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) throw new Error('Template not found');

  // Get loop
  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: validated.loopId,
      organizationId: session.user.organizationId!,
    },
    include: {
      parties: true,
    },
  });

  if (!loop) throw new Error('Loop not found');

  // Create workflow instance
  const workflow = await prisma.workflow.create({
    data: {
      name: template.name,
      description: template.description,
      isTemplate: false,
      steps: template.steps,
      loopId: loop.id,
      createdBy: session.user.id,
      status: 'ACTIVE',
    },
  });

  // Generate tasks from workflow steps
  const steps = template.steps as any[];
  const createdTasks = [];

  for (const step of steps) {
    // Auto-assign to party if role specified
    let assignedTo = undefined;
    if (step.autoAssignRole) {
      const party = loop.parties.find(p => p.role === step.autoAssignRole);
      assignedTo = party?.id;
    }

    // Calculate due date based on estimated days
    let dueDate = undefined;
    if (step.estimatedDays) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + step.estimatedDays);
    }

    const task = await prisma.task.create({
      data: {
        title: step.title,
        description: step.description,
        loopId: loop.id,
        createdBy: session.user.id,
        assignedTo,
        dueDate,
        priority: 'MEDIUM',
        status: 'PENDING',
      },
    });

    createdTasks.push(task);
  }

  return { success: true, workflow, tasks: createdTasks };
}
```

---

### Phase 2: Milestone System (35 minutes)

**Create `lib/modules/milestones/schemas.ts`:**
```typescript
import { z } from 'zod';

export const MilestoneSchema = z.object({
  name: z.string(),
  completedPercentage: z.number().min(0).max(100),
  requiredTasks: z.array(z.string()).default([]),
  requiredDocuments: z.array(z.string()).default([]),
});

export const TRANSACTION_MILESTONES = {
  PURCHASE_AGREEMENT: [
    { name: 'Offer Accepted', completedPercentage: 15 },
    { name: 'Inspection Complete', completedPercentage: 35 },
    { name: 'Appraisal Complete', completedPercentage: 50 },
    { name: 'Financing Approved', completedPercentage: 70 },
    { name: 'Final Walkthrough', completedPercentage: 90 },
    { name: 'Closing Complete', completedPercentage: 100 },
  ],
  LISTING_AGREEMENT: [
    { name: 'Listing Active', completedPercentage: 25 },
    { name: 'Offer Received', completedPercentage: 50 },
    { name: 'Offer Accepted', completedPercentage: 75 },
    { name: 'Closing Complete', completedPercentage: 100 },
  ],
};
```

**Create Progress Calculator:**
```typescript
export async function calculateLoopProgress(loopId: string) {
  const session = await requireAuth();

  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
    include: {
      tasks: true,
      documents: true,
      signatures: true,
    },
  });

  if (!loop) throw new Error('Loop not found');

  // Calculate task completion
  const totalTasks = loop.tasks.length;
  const completedTasks = loop.tasks.filter(t => t.status === 'COMPLETED').length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate document progress
  const requiredDocs = 5; // Minimum docs needed
  const docProgress = Math.min((loop.documents.length / requiredDocs) * 100, 100);

  // Calculate signature progress
  const totalSignatures = loop.signatures.length;
  const completedSignatures = loop.signatures.filter(s => s.status === 'SIGNED').length;
  const signatureProgress = totalSignatures > 0 ? (completedSignatures / totalSignatures) * 100 : 0;

  // Weighted average
  const overallProgress = Math.round(
    (taskProgress * 0.5) + (docProgress * 0.3) + (signatureProgress * 0.2)
  );

  // Update loop
  await prisma.transactionLoop.update({
    where: { id: loopId },
    data: { progress: overallProgress },
  });

  return { progress: overallProgress };
}
```

---

## 📊 Files to Create

```
lib/modules/workflows/
├── schemas.ts          # ✅ Workflow schemas
├── actions.ts          # ✅ Create/apply workflows
├── queries.ts          # ✅ Get workflows
└── index.ts            # ✅ Public API

lib/modules/milestones/
├── schemas.ts          # ✅ Milestone definitions
├── calculator.ts       # ✅ Progress calculation
└── index.ts            # ✅ Public API

components/transactions/
├── workflow-templates.tsx  # ✅ Template list
├── apply-workflow-dialog.tsx  # ✅ Apply dialog
└── milestone-timeline.tsx     # ✅ Progress timeline
```

**Total:** 10 files

---

## 🎯 Success Criteria

- [ ] Workflow templates created
- [ ] Templates apply to loops
- [ ] Tasks auto-generated from templates
- [ ] Progress auto-calculated
- [ ] Milestones tracked
- [ ] Tests 80%+ coverage

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🟡 MEDIUM
