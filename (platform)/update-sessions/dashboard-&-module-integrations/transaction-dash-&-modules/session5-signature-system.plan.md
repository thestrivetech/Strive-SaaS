# Session 5: E-Signature Request & Verification System - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3 hours
**Dependencies:** Session 1, 3, 4 completed
**Parallel Safe:** No (integrates with documents)

---

## 🎯 Session Objectives

Build complete e-signature system with request orchestration, signing workflow, email notifications, and audit trail.

**What We're Building:**
- ✅ Signature request creation (sequential/parallel)
- ✅ Signing workflow with authentication
- ✅ Email notifications to signers
- ✅ Signature verification and audit trail
- ✅ Signature status tracking

---

## 📋 Task Breakdown

### Phase 1: Signature Request Module (45 minutes)

**Create `lib/modules/signatures/schemas.ts`:**
```typescript
import { z } from 'zod';

export const CreateSignatureRequestSchema = z.object({
  loopId: z.string().uuid(),
  title: z.string().min(3).max(200),
  message: z.string().max(2000).optional(),
  documentIds: z.array(z.string().uuid()).min(1),
  signerIds: z.array(z.string().uuid()).min(1),
  signingOrder: z.enum(['SEQUENTIAL', 'PARALLEL']).default('PARALLEL'),
  expiresAt: z.date().optional(),
});

export const SignDocumentSchema = z.object({
  signatureId: z.string().uuid(),
  signatureData: z.string(), // Base64 signature image
  authMethod: z.enum(['EMAIL', 'SMS', 'ID_VERIFICATION']).default('EMAIL'),
});
```

**Create `lib/modules/signatures/actions.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { sendSignatureRequestEmail } from '@/lib/email/notifications';
import { CreateSignatureRequestSchema, SignDocumentSchema } from './schemas';

export async function createSignatureRequest(input: any) {
  const session = await requireAuth();
  const validated = CreateSignatureRequestSchema.parse(input);

  // Verify loop ownership
  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: validated.loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) throw new Error('Loop not found');

  // Create signature request
  const request = await prisma.signatureRequest.create({
    data: {
      title: validated.title,
      message: validated.message,
      loopId: validated.loopId,
      requestedBy: session.user.id,
      signingOrder: validated.signingOrder,
      expiresAt: validated.expiresAt,
      status: 'PENDING',
    },
  });

  // Create individual signature records
  const signatures = [];
  for (const documentId of validated.documentIds) {
    for (const signerId of validated.signerIds) {
      const signature = await prisma.documentSignature.create({
        data: {
          documentId,
          signerId,
          requestId: request.id,
          status: 'PENDING',
        },
        include: {
          signer: true,
          document: true,
        },
      });

      signatures.push(signature);

      // Send email notification
      await sendSignatureRequestEmail({
        to: signature.signer.email,
        signerName: signature.signer.name,
        documentName: signature.document.originalName,
        requestTitle: validated.title,
        message: validated.message,
        signUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/sign/${signature.id}`,
      });
    }
  }

  return { success: true, request, signatures };
}

export async function signDocument(input: any) {
  const validated = SignDocumentSchema.parse(input);

  const signature = await prisma.documentSignature.findUnique({
    where: { id: validated.signatureId },
    include: {
      request: true,
      signer: true,
    },
  });

  if (!signature) throw new Error('Signature not found');
  if (signature.status === 'SIGNED') throw new Error('Already signed');
  if (signature.request.status === 'EXPIRED') throw new Error('Request expired');

  // Update signature
  const updated = await prisma.documentSignature.update({
    where: { id: validated.signatureId },
    data: {
      status: 'SIGNED',
      signedAt: new Date(),
      signatureData: validated.signatureData,
      authMethod: validated.authMethod,
    },
  });

  // Check if all signatures complete
  const allSignatures = await prisma.documentSignature.findMany({
    where: { requestId: signature.requestId },
  });

  const allSigned = allSignatures.every(s => s.status === 'SIGNED');

  if (allSigned) {
    await prisma.signatureRequest.update({
      where: { id: signature.requestId },
      data: {
        status: 'SIGNED',
        completedAt: new Date(),
      },
    });
  }

  return { success: true, signature: updated };
}

export async function declineSignature(signatureId: string, reason: string) {
  const signature = await prisma.documentSignature.update({
    where: { id: signatureId },
    data: {
      status: 'DECLINED',
      declineReason: reason,
    },
  });

  // Update request status
  await prisma.signatureRequest.update({
    where: { id: signature.requestId },
    data: { status: 'DECLINED' },
  });

  return { success: true };
}
```

**Create Email Service `lib/email/notifications.ts`:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSignatureRequestEmail(params: {
  to: string;
  signerName: string;
  documentName: string;
  requestTitle: string;
  message?: string;
  signUrl: string;
}) {
  await resend.emails.send({
    from: 'Strive Transactions <transactions@strivetech.ai>',
    to: params.to,
    subject: `Signature Requested: ${params.requestTitle}`,
    html: `
      <h2>Hello ${params.signerName},</h2>
      <p>You have been requested to sign the following document:</p>
      <p><strong>${params.documentName}</strong></p>
      ${params.message ? `<p>${params.message}</p>` : ''}
      <p>
        <a href="${params.signUrl}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Sign Document
        </a>
      </p>
      <p>This link will expire in 7 days.</p>
    `,
  });
}
```

**Success Criteria:**
- [ ] Signature requests created
- [ ] Emails sent to signers
- [ ] Signing workflow works
- [ ] Status tracking accurate

---

## 📊 Files to Create

```
lib/modules/signatures/
├── schemas.ts          # ✅ Validation
├── actions.ts          # ✅ Request/sign actions
├── queries.ts          # ✅ Status queries
└── index.ts            # ✅ Public API

lib/email/
└── notifications.ts    # ✅ Email service
```

**Total:** 5 files

---

## 🎯 Success Criteria

- [ ] Signature requests send emails
- [ ] Sequential signing enforced
- [ ] Parallel signing works
- [ ] Decline workflow functional
- [ ] Audit trail complete
- [ ] Tests 80%+ coverage

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 HIGH
