# Transaction Management Integration Plan

## Overview
This document outlines the step-by-step integration of the Real Estate Transaction Management platform (DotLoop clone) into the existing Strive SaaS platform.

## Prerequisites
- Existing Next.js 15+ App Router setup
- Tailwind CSS + shadcn/ui components
- Authentication system in place
- Database connection established
- File storage system configured

## Integration Steps

### Phase 1: File Structure Setup

#### 1.1 Create Transaction Management Route Structure
```bash
# From platform root
mkdir -p app/(protected)/transactions/{dashboard,loops,documents,signatures,workflows,parties,compliance}
mkdir -p app/(protected)/transactions/loops/[id]
mkdir -p app/(protected)/transactions/documents/[id]
mkdir -p app/(protected)/transactions/signatures/[id]
```

#### 1.2 Move Transaction Components
```bash
# Copy components from update-sessions/real-estate-transaction/components/
cp -r update-sessions/real-estate-transaction/components/transaction components/
```

#### 1.3 Create API Routes
```bash
mkdir -p app/api/v1/transactions/{loops,documents,signatures,workflows,parties,compliance}
```

### Phase 2: Database Schema Integration

#### 2.1 Add Transaction Models to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
model TransactionLoop {
  id              String   @id @default(cuid())
  propertyAddress String
  transactionType TransactionType
  listingPrice    Decimal
  status          LoopStatus @default(DRAFT)
  expectedClosing DateTime?
  actualClosing   DateTime?
  progress        Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  createdBy       String
  creator         User     @relation(fields: [createdBy], references: [id])
  documents       Document[]
  parties         LoopParty[]
  tasks           Task[]
  signatures      SignatureRequest[]
  workflows       Workflow[]
  
  @@map("transaction_loops")
}

model Document {
  id             String   @id @default(cuid())
  filename       String
  originalName   String
  mimeType       String
  fileSize       Int
  storageKey     String
  version        Int      @default(1)
  status         DocumentStatus @default(DRAFT)
  category       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id])
  uploadedBy     String
  uploader       User     @relation(fields: [uploadedBy], references: [id])
  signatures     DocumentSignature[]
  versions       DocumentVersion[]
  
  @@map("documents")
}

model SignatureRequest {
  id             String   @id @default(cuid())
  title          String
  message        String?
  status         SignatureStatus @default(PENDING)
  signingOrder   SigningOrder @default(PARALLEL)
  expiresAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id])
  requestedBy    String
  requester      User     @relation(fields: [requestedBy], references: [id])
  signatures     DocumentSignature[]
  
  @@map("signature_requests")
}

model DocumentSignature {
  id             String   @id @default(cuid())
  status         SignatureStatus @default(PENDING)
  signedAt       DateTime?
  signatureData  String?   // Base64 signature image
  ipAddress      String?
  userAgent      String?
  authMethod     String?   // SMS, Email, ID verification
  
  // Relations
  documentId     String
  document       Document @relation(fields: [documentId], references: [id])
  signerId       String
  signer         LoopParty @relation(fields: [signerId], references: [id])
  requestId      String
  request        SignatureRequest @relation(fields: [requestId], references: [id])
  
  @@map("document_signatures")
}

model LoopParty {
  id             String   @id @default(cuid())
  name           String
  email          String
  phone          String?
  role           PartyRole
  permissions    Json     // Array of permission strings
  status         PartyStatus @default(ACTIVE)
  
  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id])
  signatures     DocumentSignature[]
  tasks          Task[]
  
  @@map("loop_parties")
}

model Task {
  id             String   @id @default(cuid())
  title          String
  description    String?
  status         TaskStatus @default(PENDING)
  priority       TaskPriority @default(MEDIUM)
  dueDate        DateTime?
  completedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  loopId         String
  loop           TransactionLoop @relation(fields: [loopId], references: [id])
  assignedTo     String?
  assignee       LoopParty? @relation(fields: [assignedTo], references: [id])
  
  @@map("tasks")
}

model Workflow {
  id             String   @id @default(cuid())
  name           String
  description    String?
  isTemplate     Boolean  @default(false)
  steps          Json     // Array of workflow steps
  status         WorkflowStatus @default(ACTIVE)
  
  // Relations
  loopId         String?
  loop           TransactionLoop? @relation(fields: [loopId], references: [id])
  
  @@map("workflows")
}

model AuditLog {
  id             String   @id @default(cuid())
  action         String
  entityType     String
  entityId       String
  oldValues      Json?
  newValues      Json?
  ipAddress      String?
  userAgent      String?
  timestamp      DateTime @default(now())
  
  // Relations
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  
  @@map("audit_logs")
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

enum DocumentStatus {
  DRAFT
  PENDING
  REVIEWED
  SIGNED
  ARCHIVED
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
  SEQUENTIAL
  PARALLEL
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

enum WorkflowStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

#### 2.2 Run Database Migrations
```bash
npx prisma migrate dev --name add-transaction-management
npx prisma generate
```

### Phase 3: File Storage Integration

#### 3.1 Configure Storage Service
Create `lib/storage/index.ts`:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export class StorageService {
  private s3: S3Client
  private bucket: string

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
    this.bucket = process.env.S3_BUCKET_NAME!
  }

  async uploadDocument(
    file: Buffer,
    key: string,
    metadata: { contentType: string; originalName: string }
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: metadata.contentType,
      Metadata: {
        originalName: metadata.originalName
      }
    })

    await this.s3.send(command)
    return key
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    })
    
    return getSignedUrl(this.s3, command, { expiresIn })
  }
}

export const storageService = new StorageService()
```

### Phase 4: API Route Implementation

#### 4.1 Create Transaction Loop API
Create `app/api/v1/transactions/loops/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLoopSchema = z.object({
  propertyAddress: z.string().min(1),
  transactionType: z.enum(['PURCHASE_AGREEMENT', 'LISTING_AGREEMENT', 'LEASE_AGREEMENT']),
  listingPrice: z.number().positive(),
  expectedClosing: z.string().datetime().optional()
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const loops = await prisma.transactionLoop.findMany({
      where: {
        createdBy: session.user.id
      },
      include: {
        documents: {
          select: { id: true, filename: true, status: true }
        },
        parties: {
          select: { id: true, name: true, role: true }
        },
        _count: {
          select: { documents: true, parties: true, tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ loops })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loops' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = createLoopSchema.parse(body)

    const loop = await prisma.transactionLoop.create({
      data: {
        ...data,
        listingPrice: new Prisma.Decimal(data.listingPrice),
        expectedClosing: data.expectedClosing ? new Date(data.expectedClosing) : null,
        createdBy: session.user.id
      },
      include: {
        documents: true,
        parties: true
      }
    })

    return NextResponse.json({ loop }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create loop' }, { status: 500 })
  }
}
```

#### 4.2 Create Document Upload API
Create `app/api/v1/transactions/documents/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storageService } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const loopId = formData.get('loopId') as string
    const category = formData.get('category') as string

    if (!file || !loopId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Generate storage key
    const extension = file.name.split('.').pop()
    const storageKey = `transactions/${loopId}/documents/${uuidv4()}.${extension}`

    // Upload to storage
    const buffer = Buffer.from(await file.arrayBuffer())
    await storageService.uploadDocument(buffer, storageKey, {
      contentType: file.type,
      originalName: file.name
    })

    // Save document record
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storageKey,
        category,
        loopId,
        uploadedBy: session.user.id
      }
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
```

#### 4.3 Create Signature Request API
Create `app/api/v1/transactions/signatures/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSignatureRequestEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { loopId, documentIds, signerIds, title, message } = await req.json()

    // Create signature request
    const signatureRequest = await prisma.signatureRequest.create({
      data: {
        title,
        message,
        loopId,
        requestedBy: session.user.id
      }
    })

    // Create document signatures for each signer
    const signatures = []
    for (const documentId of documentIds) {
      for (const signerId of signerIds) {
        const signature = await prisma.documentSignature.create({
          data: {
            documentId,
            signerId,
            requestId: signatureRequest.id
          },
          include: {
            signer: true,
            document: true
          }
        })
        signatures.push(signature)
      }
    }

    // Send notification emails
    for (const signature of signatures) {
      await sendSignatureRequestEmail({
        to: signature.signer.email,
        signerName: signature.signer.name,
        documentName: signature.document.filename,
        signUrl: `${process.env.NEXTAUTH_URL}/transactions/signatures/${signature.id}/sign`,
        message
      })
    }

    return NextResponse.json({ signatureRequest, signatures }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create signature request' }, { status: 500 })
  }
}
```

### Phase 5: Component Integration

#### 5.1 Create Transaction Layout
Create `app/(protected)/transactions/layout.tsx`:

```typescript
import { TransactionSidebar } from '@/components/transaction/sidebar'
import { TransactionHeader } from '@/components/transaction/header'

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <TransactionSidebar />
      <div className="flex-1 flex flex-col">
        <TransactionHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 5.2 Create Dashboard Page
Create `app/(protected)/transactions/dashboard/page.tsx`:

```typescript
import { LoopDashboard } from '@/components/transaction/loops/loop-dashboard'
import { RecentActivity } from '@/components/transaction/dashboard/recent-activity'
import { QuickActions } from '@/components/transaction/dashboard/quick-actions'

export default function TransactionDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction Dashboard</h1>
        <QuickActions />
      </div>
      
      <LoopDashboard />
      <RecentActivity />
    </div>
  )
}
```

### Phase 6: Data Hooks Integration

#### 6.1 Create Transaction Hooks
Create `lib/hooks/use-transactions.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTransactionLoops(filters?: {
  status?: string
  type?: string
}) {
  return useQuery({
    queryKey: ['transaction-loops', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.type) params.set('type', filters.type)

      const response = await fetch(`/api/v1/transactions/loops?${params}`)
      if (!response.ok) throw new Error('Failed to fetch loops')
      return response.json()
    }
  })
}

export function useCreateLoop() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/transactions/loops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create loop')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-loops'] })
    }
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ file, loopId, category }: {
      file: File
      loopId: string
      category?: string
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('loopId', loopId)
      if (category) formData.append('category', category)

      const response = await fetch('/api/v1/transactions/documents/upload', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Failed to upload document')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents', data.document.loopId] 
      })
    }
  })
}
```

### Phase 7: Security & Compliance

#### 7.1 Add Audit Logging
Create `lib/audit/index.ts`:

```typescript
import { prisma } from '@/lib/prisma'

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ipAddress,
  userAgent
}: {
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent
    }
  })
}
```

#### 7.2 Add Document Encryption
Create `lib/crypto/document-encryption.ts`:

```typescript
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = process.env.DOCUMENT_ENCRYPTION_KEY!

export function encryptDocument(buffer: Buffer): {
  encryptedData: Buffer
  iv: Buffer
  authTag: Buffer
} {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, secretKey)
  cipher.setAAD(Buffer.from('document'))
  
  const encryptedData = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ])
  
  const authTag = cipher.getAuthTag()
  
  return { encryptedData, iv, authTag }
}

export function decryptDocument({
  encryptedData,
  iv,
  authTag
}: {
  encryptedData: Buffer
  iv: Buffer
  authTag: Buffer
}): Buffer {
  const decipher = crypto.createDecipher(algorithm, secretKey)
  decipher.setAuthTag(authTag)
  decipher.setAAD(Buffer.from('document'))
  
  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ])
}
```

### Phase 8: Testing Implementation

#### 8.1 Create Unit Tests
Create test files structure:
```bash
mkdir -p __tests__/transaction/{components,hooks,api}
```

#### 8.2 API Route Tests
Create `__tests__/transaction/api/loops.test.ts`:

```typescript
import { POST } from '@/app/api/v1/transactions/loops/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'

jest.mock('next-auth/next')
jest.mock('@/lib/prisma')

describe('/api/v1/transactions/loops', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    })
  })

  it('should create a new transaction loop', async () => {
    const requestBody = {
      propertyAddress: '123 Main St',
      transactionType: 'PURCHASE_AGREEMENT',
      listingPrice: 500000,
      expectedClosing: '2025-12-15T00:00:00.000Z'
    }

    const request = new NextRequest('http://localhost:3000/api/v1/transactions/loops', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.loop).toBeDefined()
    expect(data.loop.propertyAddress).toBe(requestBody.propertyAddress)
  })
})
```

### Phase 9: Deployment Configuration

#### 9.1 Environment Variables
Add to `.env`:
```bash
# Transaction Management
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-document-bucket
DOCUMENT_ENCRYPTION_KEY=your-32-byte-encryption-key

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
```

#### 9.2 Build Configuration
Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk']
  },
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com']
  }
}

module.exports = nextConfig
```

### Phase 10: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] File storage configured and tested
- [ ] All API endpoints functional and secure
- [ ] Document upload/download working
- [ ] Signature flow complete
- [ ] Audit logging implemented
- [ ] Error boundaries in place
- [ ] Performance optimized
- [ ] Security validated
- [ ] Compliance features tested
- [ ] Mobile responsive design
- [ ] User permissions working
- [ ] Email notifications functional

## Rollback Plan

If critical issues arise:
1. Disable transaction module routes in middleware
2. Revert database migrations: `npx prisma migrate reset`
3. Remove transaction menu items from navigation
4. Deploy previous stable version
5. Investigate issues in staging environment

## Post-Integration Support

1. Monitor transaction creation and document upload rates
2. Review audit logs for unusual activity
3. Track signature completion rates
4. Monitor file storage usage and costs
5. Gather user feedback for improvements
6. Plan additional workflow templates
7. Consider MLS integrations
8. Evaluate additional compliance features