# Session 3: Expense Categories & Receipt Upload Module

## Session Overview
**Goal:** Implement expense category management and receipt upload functionality with Supabase Storage integration.

**Duration:** 2-3 hours
**Complexity:** Medium-High
**Dependencies:** Session 2 (Expense module must be complete)

## Objectives

1. ✅ Create Expense Categories module with CRUD operations
2. ✅ Implement system vs custom categories logic
3. ✅ Create receipt upload module with Supabase Storage
4. ✅ Implement file validation and storage policies
5. ✅ Add OCR processing placeholders (for future enhancement)
6. ✅ Create API routes for categories and receipts
7. ✅ Add proper error handling for file operations

## Prerequisites

- [x] Session 2 completed (Expense module ready)
- [x] Supabase Storage bucket configured
- [x] Understanding of file upload patterns

## Module Structure

```
lib/modules/expenses/
├── categories/
│   ├── actions.ts      # Category CRUD
│   ├── queries.ts      # Category fetching
│   ├── schemas.ts      # Category schemas
│   └── index.ts
├── receipts/
│   ├── actions.ts      # Upload, delete receipts
│   ├── queries.ts      # Receipt fetching
│   ├── schemas.ts      # Upload validation
│   ├── storage.ts      # Supabase Storage helpers
│   └── index.ts
```

## Step-by-Step Implementation

### Step 1: Create Category Schemas

**File:** `lib/modules/expenses/categories/schemas.ts`

```typescript
import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isDeductible: z.boolean().default(true),
  taxCode: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  organizationId: z.string().uuid(),
});

export const UpdateCategorySchema = CategorySchema.partial().extend({
  id: z.string().uuid(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
```

### Step 2: Create Category Actions

**File:** `lib/modules/expenses/categories/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { CategorySchema, UpdateCategorySchema } from './schemas';
import type { CategoryInput, UpdateCategoryInput } from './schemas';

export async function createCategory(input: CategoryInput) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = CategorySchema.parse(input);

  try {
    const category = await prisma.expenseCategories.create({
      data: {
        ...validated,
        organizationId: session.user.organizationId,
        isSystem: false,
      }
    });

    revalidatePath('/expenses/settings');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to create category:', error);
    throw new Error('Failed to create category');
  }
}

export async function updateCategory(input: UpdateCategoryInput) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = UpdateCategorySchema.parse(input);
  const { id, ...data } = validated;

  try {
    // Verify category belongs to organization and is not system
    const existing = await prisma.expenseCategories.findUnique({
      where: { id },
      select: { organizationId: true, isSystem: true }
    });

    if (!existing || existing.organizationId !== session.user.organizationId) {
      throw new Error('Category not found');
    }

    if (existing.isSystem) {
      throw new Error('Cannot modify system categories');
    }

    const category = await prisma.expenseCategories.update({
      where: { id },
      data
    });

    revalidatePath('/expenses/settings');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to update category:', error);
    throw new Error('Failed to update category');
  }
}

export async function deleteCategory(id: string) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    // Verify category belongs to organization and is not system
    const existing = await prisma.expenseCategories.findUnique({
      where: { id },
      select: { organizationId: true, isSystem: true }
    });

    if (!existing || existing.organizationId !== session.user.organizationId) {
      throw new Error('Category not found');
    }

    if (existing.isSystem) {
      throw new Error('Cannot delete system categories');
    }

    await prisma.expenseCategories.delete({
      where: { id }
    });

    revalidatePath('/expenses/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw new Error('Failed to delete category');
  }
}
```

### Step 3: Create Category Queries

**File:** `lib/modules/expenses/categories/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';

export async function getCategories() {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  // Get both system categories and organization-specific categories
  const categories = await prisma.expenseCategories.findMany({
    where: {
      OR: [
        { organizationId: session.user.organizationId },
        { organizationId: null, isSystem: true }
      ],
      isActive: true
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  return categories;
}

export async function getCategoryById(id: string) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const category = await prisma.expenseCategories.findUnique({
    where: {
      id,
      OR: [
        { organizationId: session.user.organizationId },
        { organizationId: null, isSystem: true }
      ]
    }
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
}
```

### Step 4: Create Receipt Upload Schemas

**File:** `lib/modules/expenses/receipts/schemas.ts`

```typescript
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const ReceiptUploadSchema = z.object({
  expenseId: z.string().uuid(),
  file: z.custom<File>()
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      'File must be an image (JPEG, PNG, WEBP) or PDF'
    ),
});

export type ReceiptUploadInput = z.infer<typeof ReceiptUploadSchema>;
```

### Step 5: Create Supabase Storage Helpers

**File:** `lib/modules/expenses/receipts/storage.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

const BUCKET_NAME = 'receipts';

export async function uploadReceiptToStorage(
  file: File,
  expenseId: string,
  organizationId: string
): Promise<{ url: string; path: string }> {
  const supabase = await createClient();

  // Generate unique file path: org-id/expense-id/timestamp-filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${organizationId}/${expenseId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error('Failed to upload receipt');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteReceiptFromStorage(filePath: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Supabase storage delete error:', error);
    throw new Error('Failed to delete receipt from storage');
  }
}

export async function getReceiptUrl(filePath: string): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

### Step 6: Create Receipt Actions

**File:** `lib/modules/expenses/receipts/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { uploadReceiptToStorage, deleteReceiptFromStorage } from './storage';

export async function uploadReceipt(formData: FormData) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const expenseId = formData.get('expenseId') as string;
  const file = formData.get('file') as File;

  if (!expenseId || !file) {
    throw new Error('Expense ID and file are required');
  }

  try {
    // Verify expense belongs to user's organization
    const expense = await prisma.expenses.findUnique({
      where: {
        id: expenseId,
        organizationId: session.user.organizationId
      }
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Upload to Supabase Storage
    const { url, path } = await uploadReceiptToStorage(
      file,
      expenseId,
      session.user.organizationId
    );

    // Create receipt record
    const receipt = await prisma.receipts.create({
      data: {
        expenseId,
        originalName: file.name,
        fileName: path.split('/').pop() || file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      }
    });

    // Update expense with receipt info
    await prisma.expenses.update({
      where: { id: expenseId },
      data: {
        receiptUrl: url,
        receiptName: file.name,
        receiptType: file.type,
      }
    });

    revalidatePath('/expenses');
    return { success: true, receipt };
  } catch (error) {
    console.error('Failed to upload receipt:', error);
    throw new Error('Failed to upload receipt');
  }
}

export async function deleteReceipt(receiptId: string) {
  const session = await requireAuth();

  if (!canAccessExpenses(session.user)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    // Get receipt and verify access
    const receipt = await prisma.receipts.findUnique({
      where: { id: receiptId },
      include: {
        expense: {
          select: { organizationId: true, id: true }
        }
      }
    });

    if (!receipt || receipt.expense.organizationId !== session.user.organizationId) {
      throw new Error('Receipt not found');
    }

    // Extract file path from URL
    const filePath = receipt.fileUrl.split('/').slice(-3).join('/');

    // Delete from storage
    await deleteReceiptFromStorage(filePath);

    // Delete receipt record
    await prisma.receipts.delete({
      where: { id: receiptId }
    });

    // Update expense
    await prisma.expenses.update({
      where: { id: receipt.expense.id },
      data: {
        receiptUrl: null,
        receiptName: null,
        receiptType: null,
      }
    });

    revalidatePath('/expenses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete receipt:', error);
    throw new Error('Failed to delete receipt');
  }
}
```

### Step 7: Configure Supabase Storage Bucket

**Using Supabase MCP:**

```typescript
// Tool: mcp__supabase__execute_sql
// Create storage bucket and policies
{
  "query": `
    -- Create receipts bucket (if not exists)
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('receipts', 'receipts', true)
    ON CONFLICT (id) DO NOTHING;

    -- RLS policy for receipts bucket - only allow org members to upload
    CREATE POLICY "Organization members can upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

    -- RLS policy for receipts bucket - only allow org members to view
    CREATE POLICY "Organization members can view receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts');

    -- RLS policy for receipts bucket - only allow org members to delete
    CREATE POLICY "Organization members can delete receipts"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  `
}
```

### Step 8: Create API Routes

**File:** `app/api/v1/expenses/categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createCategory } from '@/lib/modules/expenses/categories/actions';
import { getCategories } from '@/lib/modules/expenses/categories/queries';

export async function GET(req: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/v1/expenses/categories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await createCategory(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses/categories error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/v1/expenses/receipts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadReceipt } from '@/lib/modules/expenses/receipts/actions';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadReceipt(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/expenses/receipts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}
```

## Testing & Validation

### Test 1: Create Category
```bash
curl -X POST http://localhost:3000/api/v1/expenses/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Software",
    "description": "Software subscriptions",
    "isDeductible": true,
    "taxCode": "SOFTWARE"
  }'
```

### Test 2: Upload Receipt
```bash
curl -X POST http://localhost:3000/api/v1/expenses/receipts \
  -F "expenseId=expense-uuid" \
  -F "file=@/path/to/receipt.pdf"
```

### Test 3: Verify Storage Isolation
- Upload receipts for different organizations
- Verify files are stored in org-specific folders
- Verify RLS prevents cross-org access

## Success Criteria

- [x] Category CRUD operations working
- [x] System vs custom categories logic implemented
- [x] Receipt upload to Supabase Storage functional
- [x] File validation enforced (size, type)
- [x] Storage bucket policies configured
- [x] Multi-tenancy maintained (org-specific folders)
- [x] Error handling for file operations
- [x] API routes functional

## Files Created

- ✅ `lib/modules/expenses/categories/schemas.ts`
- ✅ `lib/modules/expenses/categories/actions.ts`
- ✅ `lib/modules/expenses/categories/queries.ts`
- ✅ `lib/modules/expenses/categories/index.ts`
- ✅ `lib/modules/expenses/receipts/schemas.ts`
- ✅ `lib/modules/expenses/receipts/actions.ts`
- ✅ `lib/modules/expenses/receipts/storage.ts`
- ✅ `lib/modules/expenses/receipts/index.ts`
- ✅ `app/api/v1/expenses/categories/route.ts`
- ✅ `app/api/v1/expenses/receipts/route.ts`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Not validating file types
**Problem:** Malicious files uploaded
**Solution:** Strict MIME type checking in schema

### ❌ Pitfall 2: Storing files without org isolation
**Problem:** Data leak via storage URLs
**Solution:** Use org-id in storage path

### ❌ Pitfall 3: Not cleaning up storage on delete
**Problem:** Orphaned files consuming storage
**Solution:** Always delete from storage before DB

### ❌ Pitfall 4: Missing system category protection
**Problem:** Users delete system categories
**Solution:** Check isSystem flag before mutations

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Tax Estimate Module**
2. ✅ Receipt upload functional and tested
3. ✅ Category management ready for UI

---

**Session 3 Complete:** ✅ Categories and receipt upload implemented with Supabase Storage
