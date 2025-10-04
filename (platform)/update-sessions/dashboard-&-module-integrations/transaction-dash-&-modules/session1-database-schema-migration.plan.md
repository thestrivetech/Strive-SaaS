# Session 1: Database Schema & Prisma Migration - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2.5-3 hours
**Dependencies:** Shared Prisma schema exists, Platform database configured
**Parallel Safe:** No (must run before Session 3, 4, 5)

---

## 🎯 Session Objectives

Migrate and adapt the transaction management database schema from the external dashboard (Drizzle ORM) to the platform's Prisma schema with full multi-tenancy support, RBAC integration, and Row Level Security (RLS) policies.

**What We're Building:**
- ✅ Complete Prisma models for transaction management (9 new models)
- ✅ Multi-tenancy fields (organizationId) on all tables
- ✅ Database migrations with RLS policies
- ✅ TypeScript types generation
- ✅ Connection testing and validation

**What's Different from External Dashboard:**
- ❌ External uses Drizzle ORM → ✅ Platform uses Prisma
- ❌ External has no multi-tenancy → ✅ Platform requires organizationId isolation
- ❌ External uses Neon PostgreSQL → ✅ Platform uses Supabase PostgreSQL
- ❌ External has basic auth → ✅ Platform needs RBAC integration

---

## 📋 Task Breakdown

### Phase 1: Schema Analysis & Planning (30 minutes)

#### Step 1.1: Review External Dashboard Schema
- [ ] Read integration plan models (lines 40-281)
- [ ] List all required models: TransactionLoop, Document, SignatureRequest, DocumentSignature, LoopParty, Task, Workflow, AuditLog, DocumentVersion
- [ ] Identify field types and relationships
- [ ] Map Drizzle types to Prisma equivalents

**Key Models from Integration Plan:**
```
1. TransactionLoop - Core loop entity
2. Document - File management
3. SignatureRequest - E-signature orchestration
4. DocumentSignature - Individual signatures
5. LoopParty - Transaction participants
6. Task - Task management
7. Workflow - Process templates
8. AuditLog - Compliance tracking
9. DocumentVersion - Version control
```

**Success Criteria:**
- [ ] All 9 models identified
- [ ] Relationships mapped
- [ ] Data types documented

---

#### Step 1.2: Identify Multi-Tenancy Requirements
- [ ] Review platform CLAUDE.md (lines 139-162) for RLS patterns
- [ ] Identify which models need organizationId
- [ ] Plan RLS policy structure
- [ ] Document access control patterns

**Multi-Tenant Models (Need organizationId):**
```typescript
// ALL transaction models must filter by organization
TransactionLoop      → organizationId (REQUIRED)
Document            → via loop.organizationId
SignatureRequest    → via loop.organizationId
LoopParty          → via loop.organizationId
Task               → via loop.organizationId
Workflow           → organizationId (for templates) OR loopId
```

**Success Criteria:**
- [ ] organizationId strategy defined
- [ ] RLS cascade pattern documented
- [ ] Access control matrix created

---

### Phase 2: Prisma Schema Creation (45 minutes)

#### Step 2.1: Create Base Transaction Models
- [ ] Navigate to shared schema: `../shared/prisma/schema.prisma`
- [ ] Add TransactionLoop model with all fields
- [ ] Add organizationId and relation to Organization
- [ ] Add createdBy relation to User
- [ ] Include all enums: TransactionType, LoopStatus

**Create TransactionLoop Model:**
```prisma
model TransactionLoop {
  id              String          @id @default(cuid())
  propertyAddress String
  transactionType TransactionType
  listingPrice    Decimal         @db.Decimal(12, 2)
  status          LoopStatus      @default(DRAFT)
  expectedClosing DateTime?
  actualClosing   DateTime?
  progress        Int             @default(0) // 0-100 percentage
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Multi-tenancy
  organizationId  String
  organization    Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Creator
  createdBy       String
  creator         User            @relation(fields: [createdBy], references: [id])

  // Relations
  documents       Document[]
  parties         LoopParty[]
  tasks           Task[]
  signatures      SignatureRequest[]
  workflows       Workflow[]

  @@index([organizationId])
  @@index([status])
  @@index([createdBy])
  @@map("transaction_loops")
}

enum TransactionType {
  PURCHASE_AGREEMENT
  LISTING_AGREEMENT
  LEASE_AGREEMENT
  COMMERCIAL_PURCHASE
  COMMERCIAL_LEASE
}

enum LoopStatus {
  DRAFT
  ACTIVE
  UNDER_CONTRACT
  CLOSING
  CLOSED
  CANCELLED
  ARCHIVED
}
```

**Success Criteria:**
- [ ] Model created with all fields
- [ ] organizationId added with relation
- [ ] Indexes on key fields
- [ ] Cascade delete configured

---

#### Step 2.2: Add Document Management Models
- [ ] Create Document model
- [ ] Create DocumentVersion model (for version control)
- [ ] Add DocumentSignature model
- [ ] Include DocumentStatus enum

**Create Document Models:**
```prisma
model Document {
  id             String         @id @default(cuid())
  filename       String
  originalName   String
  mimeType       String
  fileSize       Int            // bytes
  storageKey     String         @unique // Supabase Storage path
  version        Int            @default(1)
  status         DocumentStatus @default(DRAFT)
  category       String?        // "contract", "disclosure", "inspection", etc.
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id], onDelete: Cascade)
  uploadedBy     String
  uploader       User           @relation(fields: [uploadedBy], references: [id])
  signatures     DocumentSignature[]
  versions       DocumentVersion[]

  @@index([loopId])
  @@index([status])
  @@index([category])
  @@map("documents")
}

model DocumentVersion {
  id           String   @id @default(cuid())
  versionNumber Int
  storageKey   String   // Historical version storage path
  fileSize     Int
  createdAt    DateTime @default(now())
  createdBy    String
  creator      User     @relation(fields: [createdBy], references: [id])

  documentId   String
  document     Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([documentId, versionNumber])
  @@index([documentId])
  @@map("document_versions")
}

enum DocumentStatus {
  DRAFT
  PENDING
  REVIEWED
  SIGNED
  ARCHIVED
}
```

**Success Criteria:**
- [ ] Document model with version control
- [ ] Storage key for Supabase integration
- [ ] Version history tracking
- [ ] Proper cascading deletes

---

#### Step 2.3: Add Signature System Models
- [ ] Create SignatureRequest model
- [ ] Create DocumentSignature model
- [ ] Add SignatureStatus, SigningOrder enums
- [ ] Include audit fields (IP, user agent, etc.)

**Create Signature Models:**
```prisma
model SignatureRequest {
  id             String          @id @default(cuid())
  title          String
  message        String?         @db.Text
  status         SignatureStatus @default(PENDING)
  signingOrder   SigningOrder    @default(PARALLEL)
  expiresAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id], onDelete: Cascade)
  requestedBy    String
  requester      User            @relation(fields: [requestedBy], references: [id])
  signatures     DocumentSignature[]

  @@index([loopId])
  @@index([status])
  @@map("signature_requests")
}

model DocumentSignature {
  id             String          @id @default(cuid())
  status         SignatureStatus @default(PENDING)
  signedAt       DateTime?
  signatureData  String?         @db.Text // Base64 signature image
  ipAddress      String?
  userAgent      String?
  authMethod     String?         // "SMS", "Email", "ID_Verification"
  declineReason  String?         @db.Text

  // Relations
  documentId     String
  document       Document        @relation(fields: [documentId], references: [id], onDelete: Cascade)
  signerId       String
  signer         LoopParty       @relation(fields: [signerId], references: [id])
  requestId      String
  request        SignatureRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([signerId])
  @@index([requestId])
  @@index([status])
  @@map("document_signatures")
}

enum SignatureStatus {
  PENDING
  SENT
  VIEWED
  SIGNED
  DECLINED
  EXPIRED
}

enum SigningOrder {
  SEQUENTIAL    // Sign in order
  PARALLEL      // All can sign at once
}
```

**Success Criteria:**
- [ ] Request orchestration model
- [ ] Individual signature tracking
- [ ] Audit trail fields (IP, UA, timestamp)
- [ ] Expiration logic support

---

#### Step 2.4: Add Party and Task Models
- [ ] Create LoopParty model
- [ ] Create Task model
- [ ] Add PartyRole, PartyStatus, TaskStatus, TaskPriority enums

**Create Party & Task Models:**
```prisma
model LoopParty {
  id             String      @id @default(cuid())
  name           String
  email          String
  phone          String?
  role           PartyRole
  permissions    Json        // Array of permission strings
  status         PartyStatus @default(ACTIVE)
  invitedAt      DateTime    @default(now())
  joinedAt       DateTime?

  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id], onDelete: Cascade)
  signatures     DocumentSignature[]
  assignedTasks  Task[]

  @@index([loopId])
  @@index([email])
  @@index([role])
  @@map("loop_parties")
}

model Task {
  id             String       @id @default(cuid())
  title          String
  description    String?      @db.Text
  status         TaskStatus   @default(PENDING)
  priority       TaskPriority @default(MEDIUM)
  dueDate        DateTime?
  completedAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id], onDelete: Cascade)
  assignedTo     String?
  assignee       LoopParty?   @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
  createdBy      String
  creator        User         @relation(fields: [createdBy], references: [id])

  @@index([loopId])
  @@index([status])
  @@index([assignedTo])
  @@index([dueDate])
  @@map("tasks")
}

enum PartyRole {
  BUYER
  SELLER
  BUYER_AGENT
  LISTING_AGENT
  LENDER
  TITLE_COMPANY
  INSPECTOR
  APPRAISER
  ATTORNEY
  ESCROW_OFFICER
  OTHER
}

enum PartyStatus {
  ACTIVE
  INACTIVE
  REMOVED
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Success Criteria:**
- [ ] Party management with roles
- [ ] Task assignment and tracking
- [ ] Proper enum values
- [ ] Relationship integrity

---

#### Step 2.5: Add Workflow and Audit Models
- [ ] Create Workflow model
- [ ] Create AuditLog model
- [ ] Add WorkflowStatus enum

**Create Workflow & Audit Models:**
```prisma
model Workflow {
  id             String         @id @default(cuid())
  name           String
  description    String?        @db.Text
  isTemplate     Boolean        @default(false)
  steps          Json           // Array of workflow steps
  status         WorkflowStatus @default(ACTIVE)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  // Relations - Can be template (no loop) OR instance (has loop)
  loopId         String?
  loop           TransactionLoop? @relation(fields: [loopId], references: [id], onDelete: Cascade)
  createdBy      String
  creator        User           @relation(fields: [createdBy], references: [id])

  // For templates, add organization ownership
  organizationId String?
  organization   Organization?  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([loopId])
  @@index([isTemplate])
  @@index([organizationId])
  @@map("workflows")
}

model TransactionAuditLog {
  id             String   @id @default(cuid())
  action         String   // "created", "updated", "deleted", "signed", etc.
  entityType     String   // "loop", "document", "signature", etc.
  entityId       String
  oldValues      Json?
  newValues      Json?
  ipAddress      String?
  userAgent      String?
  timestamp      DateTime @default(now())

  // Relations
  userId         String
  user           User     @relation(fields: [userId], references: [id])

  // Multi-tenancy (via user's org, but also store directly)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([entityType, entityId])
  @@index([userId])
  @@index([organizationId])
  @@index([timestamp])
  @@map("transaction_audit_logs")
}

enum WorkflowStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

**Success Criteria:**
- [ ] Workflow templates and instances
- [ ] Complete audit trail
- [ ] Organization-level templates
- [ ] Comprehensive indexing

---

### Phase 3: Update Existing Models (20 minutes)

#### Step 3.1: Add Relations to User Model
- [ ] Find existing User model in schema
- [ ] Add transaction-related relations

**Update User Model:**
```prisma
model User {
  // ... existing fields ...

  // Transaction Management Relations
  createdLoops           TransactionLoop[]
  uploadedDocuments      Document[]
  createdDocumentVersions DocumentVersion[]
  requestedSignatures    SignatureRequest[]
  createdTasks           Task[]
  createdWorkflows       Workflow[]
  transactionAuditLogs   TransactionAuditLog[]

  // ... rest of model ...
}
```

**Success Criteria:**
- [ ] All relations added to User
- [ ] No naming conflicts
- [ ] TypeScript types update

---

#### Step 3.2: Add Relations to Organization Model
- [ ] Find existing Organization model
- [ ] Add transaction relations

**Update Organization Model:**
```prisma
model Organization {
  // ... existing fields ...

  // Transaction Management Relations
  transactionLoops       TransactionLoop[]
  workflowTemplates      Workflow[]
  transactionAuditLogs   TransactionAuditLog[]

  // ... rest of model ...
}
```

**Success Criteria:**
- [ ] Organization owns loops
- [ ] Workflow templates scoped to org
- [ ] Audit logs linked

---

### Phase 4: Database Migration (30 minutes)

#### Step 4.1: Create Migration Using Supabase MCP
- [ ] Use `mcp__supabase__list_tables` to view current database schema
- [ ] Create migration SQL based on Prisma models
- [ ] Use `mcp__supabase__apply_migration` to apply the migration
- [ ] Review migration results

**IMPORTANT:** Use Supabase MCP tools instead of direct Prisma migrate commands!

**Create Migration with MCP:**
```typescript
// Step 1: Check current tables
await mcp__supabase__list_tables({ schemas: ['public'] });

// Step 2: Apply migration using MCP
await mcp__supabase__apply_migration({
  name: "add_transaction_management",
  query: `
    -- Create Enums
    CREATE TYPE "TransactionType" AS ENUM ('PURCHASE_AGREEMENT', 'LISTING_AGREEMENT', 'LEASE_AGREEMENT', 'COMMERCIAL_PURCHASE', 'COMMERCIAL_LEASE');
    CREATE TYPE "LoopStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_CONTRACT', 'CLOSING', 'CLOSED', 'CANCELLED', 'ARCHIVED');
    CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'REVIEWED', 'SIGNED', 'ARCHIVED');
    CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED', 'EXPIRED');
    CREATE TYPE "SigningOrder" AS ENUM ('SEQUENTIAL', 'PARALLEL');
    CREATE TYPE "PartyRole" AS ENUM ('BUYER', 'SELLER', 'BUYER_AGENT', 'LISTING_AGENT', 'LENDER', 'TITLE_COMPANY', 'INSPECTOR', 'APPRAISER', 'ATTORNEY', 'ESCROW_OFFICER', 'OTHER');
    CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');
    CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    CREATE TYPE "WorkflowStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

    -- Create Tables
    CREATE TABLE "transaction_loops" (
      "id" TEXT PRIMARY KEY,
      "propertyAddress" TEXT NOT NULL,
      "transactionType" "TransactionType" NOT NULL,
      "listingPrice" DECIMAL(12,2) NOT NULL,
      "status" "LoopStatus" DEFAULT 'DRAFT' NOT NULL,
      "expectedClosing" TIMESTAMP,
      "actualClosing" TIMESTAMP,
      "progress" INTEGER DEFAULT 0 NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL,
      "organizationId" TEXT NOT NULL,
      "createdBy" TEXT NOT NULL
    );

    -- [Add other table CREATE statements here]

    -- Create Indexes
    CREATE INDEX "transaction_loops_organizationId_idx" ON "transaction_loops"("organizationId");
    CREATE INDEX "transaction_loops_status_idx" ON "transaction_loops"("status");
    CREATE INDEX "transaction_loops_createdBy_idx" ON "transaction_loops"("createdBy");

    -- Add Foreign Keys
    ALTER TABLE "transaction_loops" ADD CONSTRAINT "transaction_loops_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;
    ALTER TABLE "transaction_loops" ADD CONSTRAINT "transaction_loops_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id");
  `
});

// Step 3: Verify migration
await mcp__supabase__list_migrations();
```

**Success Criteria:**
- [ ] Migration applied via MCP tool
- [ ] All tables created
- [ ] Indexes on organizationId
- [ ] Foreign keys with cascade

---

#### Step 4.2: Verify Migration
- [ ] Use `mcp__supabase__list_tables` to verify all tables created
- [ ] Use `mcp__supabase__execute_sql` to check table structure
- [ ] Verify indexes exist
- [ ] Check constraints

**Verification Queries:**
```typescript
// Check tables
await mcp__supabase__list_tables({ schemas: ['public'] });

// Verify structure
await mcp__supabase__execute_sql({
  query: `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'transaction_loops';
  `
});

// Check indexes
await mcp__supabase__execute_sql({
  query: `
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'transaction_loops';
  `
});
```

**Database Verification Checklist:**
- [ ] 9 new tables created
- [ ] organizationId on TransactionLoop
- [ ] Cascade deletes configured
- [ ] All enums created
- [ ] Indexes present

**Success Criteria:**
- [ ] Migration applied successfully
- [ ] All tables visible in list_tables
- [ ] All relations verified

---

#### Step 4.3: Generate Prisma Client
- [ ] Generate client: `npx prisma generate --schema=../shared/prisma/schema.prisma`
- [ ] Verify types: Check `node_modules/.prisma/client`
- [ ] Test import: `import { TransactionLoop } from '@prisma/client'`

**Note:** Prisma generate is still needed for TypeScript types, but migration is done via Supabase MCP!

**Success Criteria:**
- [ ] Client generated
- [ ] TypeScript types available
- [ ] No import errors

---

### Phase 5: RLS Policies (Supabase) (30 minutes)

#### Step 5.1: Enable RLS on Tables Using Supabase MCP
- [ ] Use `mcp__supabase__execute_sql` to enable RLS on all transaction tables

**Enable RLS via MCP:**
```typescript
// Enable RLS on all transaction tables using MCP
await mcp__supabase__execute_sql({
  query: `
    ALTER TABLE transaction_loops ENABLE ROW LEVEL SECURITY;
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loop_parties ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transaction_audit_logs ENABLE ROW LEVEL SECURITY;
  `
});

// Verify RLS is enabled
await mcp__supabase__execute_sql({
  query: `
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE tablename LIKE '%transaction%' OR tablename IN ('documents', 'tasks', 'workflows');
  `
});
```

**Success Criteria:**
- [ ] RLS enabled on all tables via MCP
- [ ] Verified with SQL query

---

#### Step 5.2: Create RLS Policies Using Supabase MCP
- [ ] Create SELECT policy (organization isolation)
- [ ] Create INSERT policy (organization validation)
- [ ] Create UPDATE policy (organization + ownership)
- [ ] Create DELETE policy (admin only)

**RLS Policy Creation via MCP:**
```typescript
// Create RLS Policies using Supabase MCP
await mcp__supabase__execute_sql({
  query: `
    -- TransactionLoop RLS Policies
    CREATE POLICY "Users can view loops from their organization"
      ON transaction_loops FOR SELECT
      USING (
        organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      );

    CREATE POLICY "Users can create loops in their organization"
      ON transaction_loops FOR INSERT
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      );

    CREATE POLICY "Users can update loops they created or own"
      ON transaction_loops FOR UPDATE
      USING (
        organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND (
          created_by = auth.uid() OR
          EXISTS (
            SELECT 1 FROM organization_members
            WHERE user_id = auth.uid()
            AND organization_id = transaction_loops.organization_id
            AND role IN ('OWNER', 'ADMIN')
          )
        )
      );

    -- Cascade policies for related tables via loopId
    CREATE POLICY "Users can view documents from their org loops"
      ON documents FOR SELECT
      USING (
        loop_id IN (
          SELECT id FROM transaction_loops
          WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
          )
        )
      );

    -- [Add similar policies for other tables: tasks, parties, signatures, etc.]
  `
});

// Verify policies were created
await mcp__supabase__execute_sql({
  query: `
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename LIKE '%transaction%' OR tablename IN ('documents', 'tasks');
  `
});
```

**Success Criteria:**
- [ ] All tables have SELECT policy created via MCP
- [ ] Organization isolation enforced
- [ ] Cascade policies via loopId
- [ ] Admin overrides configured
- [ ] Verified policies exist with query

---

### Phase 6: Testing & Validation (30 minutes)

#### Step 6.1: Create Test Seed Data
- [ ] Create seed file: `prisma/seed.ts`
- [ ] Add sample transaction loop
- [ ] Add sample documents and parties
- [ ] Test relationships

**Create Seed File:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Assume test org and user exist
  const testOrg = await prisma.organization.findFirst();
  const testUser = await prisma.user.findFirst();

  if (!testOrg || !testUser) {
    console.log('No test org/user found, skipping transaction seed');
    return;
  }

  // Create test transaction loop
  const loop = await prisma.transactionLoop.create({
    data: {
      propertyAddress: '123 Test Street, Test City, TC 12345',
      transactionType: 'PURCHASE_AGREEMENT',
      listingPrice: 450000,
      status: 'ACTIVE',
      expectedClosing: new Date('2025-12-31'),
      progress: 25,
      organizationId: testOrg.id,
      createdBy: testUser.id,
      parties: {
        create: [
          {
            name: 'John Buyer',
            email: 'buyer@example.com',
            role: 'BUYER',
            permissions: JSON.stringify(['view', 'sign']),
          },
          {
            name: 'Jane Seller',
            email: 'seller@example.com',
            role: 'SELLER',
            permissions: JSON.stringify(['view', 'sign']),
          },
        ],
      },
      tasks: {
        create: [
          {
            title: 'Upload Purchase Agreement',
            description: 'Upload signed purchase agreement',
            status: 'PENDING',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdBy: testUser.id,
          },
        ],
      },
    },
    include: {
      parties: true,
      tasks: true,
    },
  });

  console.log('Created test transaction loop:', loop);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run Seed:**
```bash
npx tsx prisma/seed.ts
```

**Success Criteria:**
- [ ] Seed data created
- [ ] Relations work correctly
- [ ] No constraint violations

---

#### Step 6.2: Test Database Queries
- [ ] Test basic CRUD operations
- [ ] Verify RLS filtering
- [ ] Check cascade deletes
- [ ] Validate indexes

**Test Queries:**
```typescript
// test-transaction-queries.ts
import { prisma } from '@/lib/prisma';

async function testQueries() {
  // Test 1: Fetch loops for organization
  const loops = await prisma.transactionLoop.findMany({
    where: { organizationId: 'test-org-id' },
    include: {
      parties: true,
      documents: true,
      tasks: true,
    },
  });
  console.log('Loops:', loops.length);

  // Test 2: Fetch with status filter
  const activeLoops = await prisma.transactionLoop.findMany({
    where: {
      organizationId: 'test-org-id',
      status: 'ACTIVE',
    },
  });
  console.log('Active loops:', activeLoops.length);

  // Test 3: Create with relations
  const newLoop = await prisma.transactionLoop.create({
    data: {
      propertyAddress: '456 New Ave',
      transactionType: 'LISTING_AGREEMENT',
      listingPrice: 350000,
      status: 'DRAFT',
      progress: 0,
      organizationId: 'test-org-id',
      createdBy: 'test-user-id',
    },
  });
  console.log('Created:', newLoop.id);

  // Test 4: Update
  await prisma.transactionLoop.update({
    where: { id: newLoop.id },
    data: { progress: 10 },
  });
  console.log('Updated progress');

  // Test 5: Delete (cascade test)
  await prisma.transactionLoop.delete({
    where: { id: newLoop.id },
  });
  console.log('Deleted (cascade should remove related records)');
}

testQueries();
```

**Success Criteria:**
- [ ] All CRUD operations work
- [ ] Filtering by organizationId works
- [ ] Includes fetch relations
- [ ] Cascade deletes verified

---

## 📊 Files to Create/Update

### Files to Create (2 files)
```
prisma/seed.ts                           # ✅ Create (test data)
scripts/test-transaction-queries.ts      # ✅ Create (validation)
```

### Files to Update (2 files)
```
../shared/prisma/schema.prisma           # 🔄 Add 9 models + enums
package.json                             # 🔄 Add seed script
```

### Database Changes
```
- 9 new tables
- 8 new enums
- ~30 indexes
- RLS policies on all tables
- Cascade delete constraints
```

**Total:** 4 file operations, 9 database tables, 8 enums, RLS policies

---

## 🎯 Success Criteria

**MANDATORY - All must pass:**
- [ ] All 9 Prisma models added to shared schema
- [ ] organizationId on TransactionLoop with index
- [ ] All enums defined (8 total)
- [ ] User model updated with relations
- [ ] Organization model updated with relations
- [ ] Migration created and applied successfully
- [ ] Prisma Client generated with new types
- [ ] RLS enabled on all transaction tables
- [ ] RLS policies created for organization isolation
- [ ] Seed data creates successfully
- [ ] Test queries work correctly
- [ ] Cascade deletes verified
- [ ] No TypeScript errors

**Quality Checks:**
- [ ] All foreign keys have onDelete cascade/setNull
- [ ] Indexes on organizationId, status, dates
- [ ] Decimal type for money (listingPrice)
- [ ] Text type for long strings (description, message)
- [ ] Proper @@map names (snake_case)
- [ ] Json type for flexible data (permissions, workflow steps)

---

## 🔗 Integration Points

### With Shared Prisma Schema
```typescript
// All models added to: ../shared/prisma/schema.prisma
// Available to all projects: (platform), (chatbot), (website)
```

### With Platform Auth System
```typescript
// User relation on all created_by fields
import { prisma } from '@/lib/prisma';

const loop = await prisma.transactionLoop.create({
  data: {
    // ... other fields
    createdBy: session.user.id,        // From auth
    organizationId: session.user.orgId, // From auth
  },
});
```

### With RLS/Multi-Tenancy
```sql
-- All queries automatically filtered by organization
-- Set session context:
SET app.current_user_id = 'user-id';
SET app.current_org_id = 'org-id';

-- Then queries auto-filter:
SELECT * FROM transaction_loops; -- Only returns current org's loops
```

---

## 📝 Implementation Notes

### Prisma Decimal Type for Money
```prisma
listingPrice Decimal @db.Decimal(12, 2) // Max $9,999,999,999.99
```
- Use Decimal for precise financial calculations
- Avoid floating point errors
- TypeScript: `import { Decimal } from '@prisma/client/runtime'`

### Json Type for Flexible Data
```prisma
permissions Json // Store array: ["view", "edit", "sign"]
steps Json       // Store workflow steps array
```
- Use Json for dynamic/flexible data structures
- Validate shape with Zod on application layer

### Cascade Deletes Strategy
```prisma
// Loop deleted → All related records deleted
loop TransactionLoop @relation(fields: [loopId], references: [id], onDelete: Cascade)

// User deleted → Set fields to null (keep history)
assignee LoopParty? @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
```

### Index Strategy
```prisma
@@index([organizationId])    // Multi-tenant filtering
@@index([status])             // Status-based queries
@@index([loopId])            // Relation queries
@@index([createdAt])         // Time-based sorting
```

---

## 🚀 Quick Start Commands

```bash
# Navigate to platform
cd "(platform)"

# Phase 1: Update Schema
# (Edit ../shared/prisma/schema.prisma with all models above)

# Phase 2: Create Migration via Supabase MCP
# Use MCP tools in your Claude session:
# - mcp__supabase__list_tables() to check current state
# - mcp__supabase__apply_migration({ name: "add_transaction_management", query: "..." })
# - mcp__supabase__list_migrations() to verify

# Phase 3: Enable RLS via Supabase MCP
# Use MCP tool:
# - mcp__supabase__execute_sql({ query: "ALTER TABLE ... ENABLE ROW LEVEL SECURITY;" })

# Phase 4: Create RLS Policies via Supabase MCP
# Use MCP tool:
# - mcp__supabase__execute_sql({ query: "CREATE POLICY ..." })

# Phase 5: Generate Prisma Client
npx prisma generate --schema=../shared/prisma/schema.prisma

# Phase 6: Create Seed Data
npx tsx prisma/seed.ts

# Phase 7: Test Queries
npx tsx scripts/test-transaction-queries.ts

# Verify
npx prisma studio --schema=../shared/prisma/schema.prisma
```

**⚠️ IMPORTANT:** Use Supabase MCP tools for ALL database operations (migrations, RLS, policies). Do NOT use `npx prisma migrate`!

---

## 🔄 Dependencies

**Requires (from setup):**
- Shared Prisma schema exists at `../shared/prisma/schema.prisma`
- Supabase connection configured
- User and Organization models exist
- Prisma CLI installed

**Blocks (must complete before):**
- **Session 2** (Storage) - Needs Document model
- **Session 3** (Loops API) - Needs TransactionLoop model
- **Session 4** (Documents API) - Needs Document, DocumentVersion models
- **Session 5** (Signatures API) - Needs SignatureRequest, DocumentSignature models
- **Session 6** (UI Components) - Needs TypeScript types from Prisma
- **Session 7** (Parties/Tasks) - Needs LoopParty, Task models
- **Session 8** (Workflows) - Needs Workflow model
- **Session 9** (Analytics) - Needs all models for queries

**Enables:**
- Full transaction management data layer
- Multi-tenant data isolation
- Type-safe database queries
- RLS security enforcement

---

## ⚠️ Critical Warnings

**DO NOT:**
- ❌ Skip organizationId on TransactionLoop - breaks multi-tenancy
- ❌ Forget RLS policies - security vulnerability
- ❌ Use Float for money - use Decimal
- ❌ Skip indexes on organizationId - slow queries
- ❌ Forget cascade deletes - orphaned records
- ❌ Skip migration - database out of sync

**MUST:**
- ✅ Test RLS policies thoroughly
- ✅ Verify cascade deletes work
- ✅ Add organizationId to ALL tenant-specific tables
- ✅ Use snake_case for @@map table names
- ✅ Index all foreign keys
- ✅ Generate Prisma Client after schema changes

---

---

## 📝 Session Summary (Create at End)

After completing all tasks in this session, create a summary file: `session1-summary.md`

**Include:**
- ✅ All completed tasks and checkboxes
- 📁 List of files created/updated
- 🧪 Tests added and coverage achieved
- ⚠️ Any issues or blockers encountered
- 📝 Notes for Session 2
- 🔗 Verified integration points

This summary will help track progress and provide context for future sessions.

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Foundation for all other sessions!

**Database Operations:** Use Supabase MCP tools for ALL migrations, RLS, and SQL operations!
