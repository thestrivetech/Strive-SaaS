# Expenses & Taxes Module - API Reference

**Planned API endpoints for database integration**

> **Note:** This module currently operates in Mock Data Mode. These endpoints are planned for implementation when migrating to real database.

## Base URL

```
Production: https://app.strivetech.ai/api/v1/expenses
Development: http://localhost:3000/api/v1/expenses
```

## Authentication

All endpoints require authentication via Supabase JWT:

```
Authorization: Bearer {jwt_token}
```

Token is automatically included via httpOnly cookies in Next.js Server Actions.

## Rate Limiting

- **Limit:** 100 requests per minute per organization
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Endpoints

### Expenses

#### Get Summary

```http
GET /api/v1/expenses/summary?organizationId={id}
```

**Description:** Retrieve expense summary statistics

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "ytdTotal": 125000,
  "monthlyTotal": 15000,
  "deductibleTotal": 100000,
  "receiptCount": 45,
  "totalCount": 67,
  "averageExpense": 1865.67,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (wrong org)
- `500` - Server error

---

#### List Expenses

```http
GET /api/v1/expenses?organizationId={id}&page={page}&limit={limit}
```

**Description:** Retrieve paginated expense list

**Query Parameters:**
- `organizationId` (required): Organization ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `category` (optional): Filter by category
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `isDeductible` (optional): Filter by deductible status
- `search` (optional): Search merchant names

**Response:**
```json
{
  "expenses": [
    {
      "id": "exp-123",
      "organizationId": "org-123",
      "userId": "user-123",
      "date": "2024-01-15T00:00:00Z",
      "merchant": "Office Depot",
      "category": "OFFICE",
      "amount": 250.50,
      "isDeductible": true,
      "taxCategory": "SUPPLIES",
      "notes": "Monthly office supplies",
      "receiptUrl": "https://storage.supabase.co/...",
      "listingId": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 67,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

---

#### Get Expense by ID

```http
GET /api/v1/expenses/{id}?organizationId={orgId}
```

**Description:** Retrieve single expense

**Path Parameters:**
- `id` (required): Expense ID

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "id": "exp-123",
  "organizationId": "org-123",
  "userId": "user-123",
  "date": "2024-01-15T00:00:00Z",
  "merchant": "Office Depot",
  "category": "OFFICE",
  "amount": 250.50,
  "isDeductible": true,
  "taxCategory": "SUPPLIES",
  "notes": "Monthly office supplies",
  "receiptUrl": "https://storage.supabase.co/...",
  "listingId": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found

---

#### Create Expense

```http
POST /api/v1/expenses
```

**Description:** Create new expense

**Request Body:**
```json
{
  "date": "2024-01-15T00:00:00Z",
  "merchant": "Office Depot",
  "category": "OFFICE",
  "amount": 250.50,
  "isDeductible": true,
  "taxCategory": "SUPPLIES",
  "notes": "Monthly office supplies",
  "listingId": null,
  "organizationId": "org-123"
}
```

**Validation:**
- `date`: Required, valid ISO 8601 date
- `merchant`: Required, 1-100 characters
- `category`: Required, valid ExpenseCategory enum
- `amount`: Required, positive number
- `isDeductible`: Required, boolean
- `taxCategory`: Optional, string
- `notes`: Optional, max 1000 characters
- `listingId`: Optional, valid listing ID
- `organizationId`: Required, valid UUID

**Response:**
```json
{
  "expense": {
    "id": "exp-456",
    "organizationId": "org-123",
    "userId": "user-123",
    "date": "2024-01-15T00:00:00Z",
    "merchant": "Office Depot",
    "category": "OFFICE",
    "amount": 250.50,
    "isDeductible": true,
    "taxCategory": "SUPPLIES",
    "notes": "Monthly office supplies",
    "receiptUrl": null,
    "listingId": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Expense created successfully"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden

---

#### Update Expense

```http
PUT /api/v1/expenses/{id}
```

**Description:** Update existing expense

**Path Parameters:**
- `id` (required): Expense ID

**Request Body:** Same as Create Expense (all fields optional)

**Response:** Same as Get Expense by ID

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found

---

#### Delete Expense

```http
DELETE /api/v1/expenses/{id}?organizationId={orgId}
```

**Description:** Delete expense (soft delete)

**Path Parameters:**
- `id` (required): Expense ID

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "message": "Expense deleted successfully",
  "id": "exp-123"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found

---

### Categories

#### List Categories

```http
GET /api/v1/expenses/categories?organizationId={id}
```

**Description:** Retrieve all categories (system + custom)

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "categories": [
    {
      "id": "cat-1",
      "organizationId": "org-123",
      "name": "Repairs",
      "color": "#ef4444",
      "isSystem": true,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "cat-custom-1",
      "organizationId": "org-123",
      "name": "Photography",
      "color": "#ec4899",
      "isSystem": false,
      "sortOrder": 13,
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-10T00:00:00Z"
    }
  ],
  "system": 12,
  "custom": 6
}
```

---

#### Create Category

```http
POST /api/v1/expenses/categories
```

**Description:** Create custom category

**Request Body:**
```json
{
  "name": "Photography",
  "color": "#ec4899",
  "organizationId": "org-123"
}
```

**Validation:**
- `name`: Required, 1-50 characters, unique per org
- `color`: Required, valid hex color (#RRGGBB)
- `organizationId`: Required, valid UUID

**Response:**
```json
{
  "category": {
    "id": "cat-custom-7",
    "organizationId": "org-123",
    "name": "Photography",
    "color": "#ec4899",
    "isSystem": false,
    "sortOrder": 19,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Category created successfully"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `409` - Duplicate name

---

#### Update Category

```http
PUT /api/v1/expenses/categories/{id}
```

**Description:** Update custom category (system categories cannot be updated)

**Path Parameters:**
- `id` (required): Category ID

**Request Body:**
```json
{
  "name": "Professional Photography",
  "color": "#ec4899",
  "organizationId": "org-123"
}
```

**Response:** Same as Create Category

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Cannot edit system category
- `404` - Not found

---

#### Delete Category

```http
DELETE /api/v1/expenses/categories/{id}?organizationId={orgId}
```

**Description:** Delete custom category (system categories cannot be deleted)

**Path Parameters:**
- `id` (required): Category ID

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "message": "Category deleted successfully",
  "id": "cat-custom-7"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Cannot delete system category
- `404` - Not found
- `409` - Category in use (has expenses)

---

#### Reorder Categories

```http
PUT /api/v1/expenses/categories/reorder
```

**Description:** Update category sort order

**Request Body:**
```json
{
  "organizationId": "org-123",
  "order": [
    { "id": "cat-1", "sortOrder": 1 },
    { "id": "cat-2", "sortOrder": 2 },
    { "id": "cat-3", "sortOrder": 3 }
  ]
}
```

**Response:**
```json
{
  "message": "Category order updated successfully",
  "updated": 18
}
```

---

### Receipts

#### Upload Receipt

```http
POST /api/v1/expenses/receipts
```

**Description:** Upload receipt file

**Content-Type:** `multipart/form-data`

**Form Data:**
- `expenseId` (required): Expense ID
- `file` (required): Receipt file (JPEG, PNG, PDF)

**Validation:**
- File types: `image/jpeg`, `image/png`, `application/pdf`
- Max file size: 5MB
- Required expenseId in same organization

**Response:**
```json
{
  "receipt": {
    "id": "rcpt-123",
    "expenseId": "exp-123",
    "filename": "receipt_20240115.jpg",
    "filesize": 1024000,
    "mimeType": "image/jpeg",
    "storageUrl": "https://storage.supabase.co/...",
    "uploadedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Receipt uploaded successfully"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid file type/size
- `401` - Unauthorized
- `404` - Expense not found

---

### Preferences

#### Get Preferences

```http
GET /api/v1/expenses/preferences?organizationId={id}
```

**Description:** Retrieve organization expense preferences

**Query Parameters:**
- `organizationId` (required): Organization ID

**Response:**
```json
{
  "id": "pref-123",
  "organizationId": "org-123",
  "defaultCategoryId": "cat-1",
  "autoCategorizationEnabled": true,
  "emailNotificationsEnabled": false,
  "receiptRetentionDays": 2555,
  "currencyFormat": "USD",
  "taxYear": 2024,
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

#### Update Preferences

```http
PUT /api/v1/expenses/preferences
```

**Description:** Update expense preferences

**Request Body:**
```json
{
  "organizationId": "org-123",
  "defaultCategoryId": "cat-1",
  "autoCategorizationEnabled": true,
  "emailNotificationsEnabled": false,
  "receiptRetentionDays": 2555,
  "currencyFormat": "USD",
  "taxYear": 2024
}
```

**Validation:**
- `receiptRetentionDays`: 365-3650
- `currencyFormat`: USD, EUR, GBP
- `taxYear`: 2023-2026

**Response:** Same as Get Preferences

---

### Tax Configuration

#### Get Tax Config

```http
GET /api/v1/expenses/tax-config?organizationId={id}
```

**Description:** Retrieve tax configuration

**Response:**
```json
{
  "id": "tax-123",
  "organizationId": "org-123",
  "taxRate": 25,
  "taxYear": 2024,
  "jurisdiction": "California",
  "deductionCategories": ["cat-1", "cat-2", "cat-4"],
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

#### Update Tax Config

```http
PUT /api/v1/expenses/tax-config
```

**Description:** Update tax configuration

**Request Body:**
```json
{
  "organizationId": "org-123",
  "taxRate": 25,
  "taxYear": 2024,
  "jurisdiction": "California",
  "deductionCategories": ["cat-1", "cat-2", "cat-4"]
}
```

**Validation:**
- `taxRate`: 0-100
- `taxYear`: 2023-2026
- `jurisdiction`: Valid US state or "Federal"
- `deductionCategories`: Array of valid category IDs

**Response:** Same as Get Tax Config

---

### Reports

#### Generate Report

```http
POST /api/v1/expenses/reports
```

**Description:** Generate expense report

**Request Body:**
```json
{
  "organizationId": "org-123",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "categories": ["cat-1", "cat-2"],
  "deductibleOnly": false,
  "format": "CSV"
}
```

**Response:**
```json
{
  "report": {
    "id": "rpt-123",
    "organizationId": "org-123",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "categories": ["cat-1", "cat-2"],
    "deductibleOnly": false,
    "format": "CSV",
    "totalExpenses": 15,
    "totalAmount": 3750.00,
    "downloadUrl": "https://storage.supabase.co/reports/...",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Report generated successfully"
}
```

---

#### List Reports

```http
GET /api/v1/expenses/reports?organizationId={id}
```

**Description:** Retrieve report history

**Response:**
```json
{
  "reports": [
    {
      "id": "rpt-123",
      "organizationId": "org-123",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z",
      "totalExpenses": 15,
      "totalAmount": 3750.00,
      "downloadUrl": "https://storage.supabase.co/...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_ERROR` | 409 | Resource already exists |
| `RATE_LIMIT_ERROR` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Prisma Schemas (Planned)

### Expense Model

```prisma
model Expense {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  userId         String   @map("user_id")
  date           DateTime
  merchant       String   @db.VarChar(100)
  category       ExpenseCategory
  amount         Decimal  @db.Decimal(10, 2)
  isDeductible   Boolean  @default(true) @map("is_deductible")
  taxCategory    String?  @map("tax_category") @db.VarChar(50)
  notes          String?  @db.VarChar(1000)
  receiptUrl     String?  @map("receipt_url")
  listingId      String?  @map("listing_id")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
  listing        Listing?     @relation(fields: [listingId], references: [id])

  @@index([organizationId])
  @@index([userId])
  @@index([date])
  @@index([category])
  @@map("expenses")
}

enum ExpenseCategory {
  COMMISSION
  TRAVEL
  MARKETING
  OFFICE
  UTILITIES
  LEGAL
  INSURANCE
  REPAIRS
  MEALS
  EDUCATION
  SOFTWARE
  OTHER
}
```

### Category Model

```prisma
model ExpenseCategory {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String   @db.VarChar(50)
  color          String   @db.VarChar(7)
  isSystem       Boolean  @default(false) @map("is_system")
  sortOrder      Int      @map("sort_order")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, name])
  @@index([organizationId])
  @@map("expense_categories")
}
```

---

**Last Updated:** 2025-10-08
**Status:** 📋 Planned (Mock Data Mode Active)
**Version:** 1.0.0
