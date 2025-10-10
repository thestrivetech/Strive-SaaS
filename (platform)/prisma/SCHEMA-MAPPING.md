# Schema Mapping - Mock Data to Prisma Models

**Created:** 2025-10-10
**Purpose:** Map mock data types to production Prisma schema based on actual UI requirements

---

## 📊 COMPLETE MODEL INVENTORY

### **Summary:**
- **Old Schema:** 83 models (3,345 lines) - Over-engineered
- **Mock Data:** 11 categories, ~40 data types - UI-validated
- **New Schema:** ~42 models - Lean and production-ready

---

## 1. CORE MODELS (3)

Already exist in minimal schema:

### User
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  avatar_url        String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  organization_members OrganizationMember[]
  // ... (all other relations)
}
```

### Organization
```prisma
model Organization {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  subscription_tier SubscriptionTier @default(FREE)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  // Relations
  members OrganizationMember[]
  // ... (all other relations)
}
```

### OrganizationMember
```prisma
model OrganizationMember {
  id              String   @id @default(cuid())
  organization_id String
  user_id         String
  role            OrgRole  @default(MEMBER)
  created_at      DateTime @default(now())

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([organization_id, user_id])
  @@index([organization_id])
  @@index([user_id])
}
```

---

## 2. CRM MODELS (4)

**Mock Source:** `lib/data/mocks/crm.ts`

### Contact
**Mock Type:** `MockContact`
```typescript
// Mock Fields:
id, name, email, phone, company, role, tags, notes, created_at, updated_at, organization_id
```

**Prisma Model:**
```prisma
model Contact {
  id              String   @id @default(cuid())
  organization_id String
  name            String
  email           String
  phone           String?
  company         String?
  role            String?
  tags            String[]
  notes           String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([email])
}
```

### Lead
**Mock Type:** `MockLead`
```typescript
// Mock Fields:
id, name, email, phone, company, source, status, score, score_value, budget, timeline,
notes, tags, custom_fields, assigned_to_id, created_at, updated_at, last_contact_at, organization_id
```

**Prisma Model:**
```prisma
model Lead {
  id              String      @id @default(cuid())
  organization_id String
  name            String
  email           String
  phone           String?
  company         String?
  source          LeadSource
  status          LeadStatus
  score           LeadScore
  score_value     Int
  budget          Decimal?
  timeline        String?
  notes           String?
  tags            String[]
  custom_fields   Json?
  assigned_to_id  String?
  last_contact_at DateTime?
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to  User?        @relation(fields: [assigned_to_id], references: [id])

  @@index([organization_id])
  @@index([status])
  @@index([assigned_to_id])
}
```

### Customer
**Mock Type:** `MockCustomer`
```typescript
// Mock Fields:
id, name, email, phone, company, address{street, city, state, zip}, lifetime_value,
tags, created_at, updated_at, organization_id
```

**Prisma Model:**
```prisma
model Customer {
  id              String   @id @default(cuid())
  organization_id String
  name            String
  email           String
  phone           String?
  company         String?
  address_street  String?
  address_city    String?
  address_state   String?
  address_zip     String?
  lifetime_value  Decimal  @default(0)
  tags            String[]
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([email])
}
```

### Deal (Pipeline/Funnel)
**Mock Source:** Analytics funnel data
```prisma
model Deal {
  id              String      @id @default(cuid())
  organization_id String
  title           String
  value           Decimal
  stage           DealStage
  probability     Int         @default(50)
  expected_close  DateTime?
  lead_id         String?
  customer_id     String?
  assigned_to_id  String?
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  lead         Lead?        @relation(fields: [lead_id], references: [id])
  customer     Customer?    @relation(fields: [customer_id], references: [id])
  assigned_to  User?        @relation(fields: [assigned_to_id], references: [id])

  @@index([organization_id])
  @@index([stage])
}
```

---

## 3. TRANSACTION/WORKSPACE MODELS (7)

**Mock Source:** `lib/data/mocks/transactions.ts`

### Loop (Transaction Loop)
**Mock Type:** `MockLoop`
```typescript
// Mock Fields:
id, title, property_address, property_city, property_state, property_zip, status,
deal_type, purchase_price, closing_date, created_at, updated_at, organization_id, created_by_id
```

**Prisma Model:**
```prisma
model Loop {
  id              String     @id @default(cuid())
  organization_id String
  created_by_id   String
  title           String
  property_address String
  property_city   String
  property_state  String
  property_zip    String
  status          LoopStatus
  deal_type       DealType
  purchase_price  Decimal
  closing_date    DateTime?
  created_at      DateTime   @default(now())
  updated_at      DateTime   @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  created_by   User         @relation(fields: [created_by_id], references: [id])

  tasks          Task[]
  documents      Document[]
  parties        Party[]
  signatures     Signature[]
  activities     TransactionActivity[]

  @@index([organization_id])
  @@index([status])
  @@index([created_by_id])
}
```

### Task
**Mock Type:** `MockTask`
```prisma
model Task {
  id              String      @id @default(cuid())
  loop_id         String
  title           String
  description     String?
  status          TaskStatus
  priority        TaskPriority
  due_date        DateTime?
  assigned_to_id  String?
  completed_at    DateTime?
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  loop        Loop  @relation(fields: [loop_id], references: [id], onDelete: Cascade)
  assigned_to User? @relation(fields: [assigned_to_id], references: [id])

  @@index([loop_id])
  @@index([status])
  @@index([assigned_to_id])
}
```

### Document
**Mock Type:** `MockDocument`
```prisma
model Document {
  id              String           @id @default(cuid())
  loop_id         String
  filename        String
  file_url        String
  file_size       Int
  mime_type       String
  category        DocumentCategory
  uploaded_by_id  String
  uploaded_at     DateTime         @default(now())

  loop        Loop       @relation(fields: [loop_id], references: [id], onDelete: Cascade)
  uploaded_by User       @relation(fields: [uploaded_by_id], references: [id])
  signatures  Signature[]

  @@index([loop_id])
  @@index([category])
}
```

### Party
**Mock Type:** `MockParty`
```prisma
model Party {
  id         String    @id @default(cuid())
  loop_id    String
  name       String
  email      String
  phone      String?
  role       PartyRole
  created_at DateTime  @default(now())

  loop       Loop       @relation(fields: [loop_id], references: [id], onDelete: Cascade)
  signatures Signature[]

  @@index([loop_id])
  @@index([role])
}
```

### Signature
**Mock Type:** `MockSignature`
```prisma
model Signature {
  id             String          @id @default(cuid())
  loop_id        String
  document_id    String
  party_id       String
  status         SignatureStatus
  requested_at   DateTime        @default(now())
  signed_at      DateTime?
  signature_data String?

  loop     Loop     @relation(fields: [loop_id], references: [id], onDelete: Cascade)
  document Document @relation(fields: [document_id], references: [id], onDelete: Cascade)
  party    Party    @relation(fields: [party_id], references: [id], onDelete: Cascade)

  @@index([loop_id])
  @@index([status])
}
```

### Listing
**Mock Type:** `MockListing`
```prisma
model Listing {
  id              String        @id @default(cuid())
  organization_id String
  agent_id        String
  title           String
  property_type   PropertyType
  address         String
  city            String
  state           String
  zip             String
  price           Decimal
  bedrooms        Int
  bathrooms       Int
  sqft            Int
  status          ListingStatus
  description     String
  images          String[]
  listed_date     DateTime
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  agent        User         @relation(fields: [agent_id], references: [id])

  @@index([organization_id])
  @@index([status])
  @@index([property_type])
}
```

### TransactionActivity
**Mock Type:** `MockTransactionActivity`
```prisma
model TransactionActivity {
  id          String                    @id @default(cuid())
  loop_id     String
  user_id     String
  action      TransactionAction
  entity_type TransactionEntityType
  entity_id   String
  details     String?
  timestamp   DateTime                  @default(now())

  loop Loop @relation(fields: [loop_id], references: [id], onDelete: Cascade)
  user User @relation(fields: [user_id], references: [id])

  @@index([loop_id])
  @@index([timestamp])
}
```

---

## 4. MARKETPLACE MODELS (5)

**Mock Source:** `lib/data/mocks/marketplace.ts`

### Tool
**Mock Type:** `MockTool`
```prisma
model Tool {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  description     String
  long_description String?
  category        ToolCategory
  tier            ToolTier
  price           Int            // in cents
  billing_period  BillingPeriod
  features        String[]
  icon_url        String?
  tags            String[]
  is_active       Boolean        @default(true)
  install_count   Int            @default(0)
  average_rating  Decimal        @default(0)
  review_count    Int            @default(0)
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  purchases Purchase[]
  reviews   Review[]
  bundles   BundleTools[]

  @@index([category])
  @@index([tier])
}
```

### Bundle
**Mock Type:** `MockBundle`
```prisma
model Bundle {
  id                  String        @id @default(cuid())
  name                String
  slug                String        @unique
  description         String
  bundle_type         BundleType
  price               Int           // in cents
  discount_percentage Int
  is_active           Boolean       @default(true)
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  tools     BundleTools[]
  purchases Purchase[]

  @@index([bundle_type])
}

model BundleTools {
  bundle_id String
  tool_id   String

  bundle Bundle @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
  tool   Tool   @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  @@id([bundle_id, tool_id])
}
```

### Purchase
**Mock Type:** `MockPurchase`
```prisma
model Purchase {
  id                 String          @id @default(cuid())
  organization_id    String
  user_id            String
  tool_id            String?
  bundle_id          String?
  price_at_purchase  Int
  status             PurchaseStatus
  purchased_at       DateTime        @default(now())
  expires_at         DateTime?

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])
  tool         Tool?        @relation(fields: [tool_id], references: [id])
  bundle       Bundle?      @relation(fields: [bundle_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
  @@index([status])
}
```

### Review
**Mock Type:** `MockReview`
```prisma
model Review {
  id              String   @id @default(cuid())
  tool_id         String
  user_id         String
  organization_id String
  rating          Int      // 1-5
  review_text     String?
  created_at      DateTime @default(now())

  tool         Tool         @relation(fields: [tool_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([tool_id])
  @@index([rating])
}
```

### Cart
**Mock Type:** `MockCart`
```prisma
model Cart {
  id          String   @id @default(cuid())
  user_id     String   @unique
  tools       String[] // tool IDs
  bundles     String[] // bundle IDs
  total_price Int
  updated_at  DateTime @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

---

## 5. CMS/CONTENT MODELS (3)

**Mock Source:** `lib/data/mocks/content.ts`

### ContentItem
**Mock Type:** `MockContentItem`
```prisma
model ContentItem {
  id              String         @id @default(cuid())
  organization_id String
  author_id       String
  title           String
  slug            String
  content         String
  excerpt         String
  type            ContentType
  status          ContentStatus
  published_at    DateTime?
  scheduled_at    DateTime?
  view_count      Int            @default(0)
  share_count     Int            @default(0)
  like_count      Int            @default(0)
  comment_count   Int            @default(0)
  category_id     String?
  tags            String[]
  seo_title       String?
  seo_description String?
  featured_image  String?
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  author       User         @relation(fields: [author_id], references: [id])

  @@unique([organization_id, slug])
  @@index([organization_id])
  @@index([status])
  @@index([type])
}
```

### Campaign
**Mock Type:** `MockCampaign`
```prisma
model Campaign {
  id              String         @id @default(cuid())
  organization_id String
  created_by      String
  name            String
  description     String
  type            CampaignType
  status          CampaignStatus
  start_date      DateTime?
  end_date        DateTime?
  target_audience String?
  budget          Decimal?
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  organization    Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator         User            @relation(fields: [created_by], references: [id])
  email_campaigns EmailCampaign[]

  @@index([organization_id])
  @@index([status])
  @@index([type])
}
```

### EmailCampaign
**Mock Type:** `MockEmailCampaign`
```prisma
model EmailCampaign {
  id                 String   @id @default(cuid())
  campaign_id        String
  subject            String
  from_name          String
  from_email         String
  preview_text       String
  html_content       String
  sent_count         Int      @default(0)
  opened_count       Int      @default(0)
  clicked_count      Int      @default(0)
  bounced_count      Int      @default(0)
  unsubscribed_count Int      @default(0)
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt

  campaign Campaign @relation(fields: [campaign_id], references: [id], onDelete: Cascade)

  @@index([campaign_id])
}
```

---

## 6. EXPENSE & TAX MODELS (5)

**Mock Source:** `lib/data/mocks/expenses.ts`

### Expense
**Mock Type:** `MockExpense`
```prisma
model Expense {
  id                String         @id @default(cuid())
  organization_id   String
  created_by_id     String
  title             String
  description       String?
  amount            Int            // in cents
  category_id       String
  vendor            String
  date              DateTime
  payment_method    PaymentMethod
  receipt_url       String?
  is_tax_deductible Boolean        @default(false)
  tax_category      TaxCategory?
  notes             String?
  created_at        DateTime       @default(now())
  updated_at        DateTime       @updatedAt

  organization Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  created_by   User            @relation(fields: [created_by_id], references: [id])
  category     ExpenseCategory @relation(fields: [category_id], references: [id])
  receipts     Receipt[]

  @@index([organization_id])
  @@index([category_id])
  @@index([date])
  @@index([is_tax_deductible])
}
```

### ExpenseCategory
**Mock Type:** `MockExpenseCategory`
```prisma
model ExpenseCategory {
  id              String    @id @default(cuid())
  organization_id String
  name            String
  description     String?
  color           String
  icon            String?
  is_default      Boolean   @default(false)
  is_custom       Boolean   @default(false)
  expense_count   Int       @default(0)
  total_amount    Int       @default(0) // in cents
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  expenses     Expense[]

  @@index([organization_id])
}
```

### TaxEstimate
**Mock Type:** `MockTaxEstimate`
```prisma
model TaxEstimate {
  id                  String   @id @default(cuid())
  organization_id     String
  year                Int
  quarter             Int      // 1-4
  total_income        Int      // in cents
  total_expenses      Int      // in cents
  deductible_expenses Int      // in cents
  estimated_tax_rate  Int      // percentage
  estimated_tax_owed  Int      // in cents
  tax_paid            Int      // in cents
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@unique([organization_id, year, quarter])
  @@index([organization_id])
}
```

### Receipt
**Mock Type:** `MockReceipt`
```prisma
model Receipt {
  id              String   @id @default(cuid())
  expense_id      String
  file_url        String
  file_name       String
  file_size       Int
  mime_type       String
  uploaded_at     DateTime @default(now())
  uploaded_by_id  String

  expense     Expense @relation(fields: [expense_id], references: [id], onDelete: Cascade)
  uploaded_by User    @relation(fields: [uploaded_by_id], references: [id])

  @@index([expense_id])
}
```

### TaxReport
**Mock Type:** `MockTaxReport`
```prisma
model TaxReport {
  id                      String     @id @default(cuid())
  organization_id         String
  title                   String
  report_type             ReportType
  year                    Int
  quarter                 Int?
  start_date              DateTime
  end_date                DateTime
  total_income            Int
  total_expenses          Int
  deductible_expenses     Int
  non_deductible_expenses Int
  net_income              Int
  estimated_tax           Int
  category_breakdown      Json
  generated_at            DateTime   @default(now())

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([year])
}
```

---

## 7. REID/ANALYTICS MODELS (6)

**Mock Source:** `lib/data/mocks/reid.ts`

### MarketData
**Mock Type:** `MockMarketData`
```prisma
model MarketData {
  id                String            @id @default(cuid())
  zip_code          String
  city              String
  state             String
  county            String
  median_price      Decimal
  price_change_1mo  Decimal
  price_change_3mo  Decimal
  price_change_1yr  Decimal
  avg_days_on_market Int
  inventory_count   Int
  sales_volume      Decimal
  price_per_sqft    Decimal
  market_temperature MarketTemperature
  demand_score      Int
  supply_score      Int
  investment_score  Int
  last_updated      DateTime          @default(now())

  @@unique([zip_code])
  @@index([city, state])
  @@index([market_temperature])
}
```

### Demographics
**Mock Type:** `MockDemographics`
```prisma
model Demographics {
  id                  String         @id @default(cuid())
  zip_code            String         @unique
  city                String
  state               String
  population          Int
  median_age          Int
  median_income       Decimal
  unemployment_rate   Decimal
  education_level     EducationLevel
  homeownership_rate  Decimal
  avg_household_size  Decimal
  growth_rate_1yr     Decimal
  growth_rate_5yr     Decimal

  @@index([city, state])
}
```

### ROISimulation
**Mock Type:** `MockROISimulation`
```prisma
model ROISimulation {
  id                 String   @id @default(cuid())
  user_id            String
  organization_id    String
  property_price     Decimal
  down_payment       Decimal
  loan_amount        Decimal
  interest_rate      Decimal
  loan_term          Int      // years
  monthly_payment    Decimal
  property_tax       Decimal
  insurance          Decimal
  hoa_fees           Decimal
  maintenance        Decimal
  monthly_expenses   Decimal
  rental_income      Decimal
  monthly_cash_flow  Decimal
  annual_cash_flow   Decimal
  cash_on_cash_return Decimal
  cap_rate           Decimal
  total_roi_5yr      Decimal
  total_roi_10yr     Decimal
  appreciation_rate  Decimal
  equity_5yr         Decimal
  equity_10yr        Decimal
  created_at         DateTime @default(now())

  user         User         @relation(fields: [user_id], references: [id])
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([organization_id])
}
```

### Alert
**Mock Type:** `MockAlert`
```prisma
model Alert {
  id           String      @id @default(cuid())
  user_id      String
  organization_id String
  title        String
  description  String
  alert_type   AlertType
  severity     AlertSeverity
  zip_code     String
  city         String
  state        String
  metadata     Json
  is_read      Boolean     @default(false)
  is_dismissed Boolean     @default(false)
  created_at   DateTime    @default(now())
  expires_at   DateTime?

  user         User         @relation(fields: [user_id], references: [id])
  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([organization_id])
  @@index([alert_type])
}
```

### School
**Mock Type:** `MockSchool`
```prisma
model School {
  id            String     @id @default(cuid())
  name          String
  type          SchoolType
  address       String
  city          String
  state         String
  zip_code      String
  rating        Int        // 1-10
  test_scores   Int        // 0-100
  student_count Int
  teacher_ratio Int
  distance_miles Decimal
  grade_levels  String
  district      String

  @@index([zip_code])
  @@index([type])
  @@index([rating])
}
```

### AIProfile
**Mock Type:** `MockAIProfile`
```prisma
model AIProfile {
  id                String   @id @default(cuid())
  organization_id   String
  user_id           String
  property_address  String
  profile_name      String
  analysis_date     DateTime @default(now())
  ai_score          Int
  score_breakdown   Json     // {location, financials, appreciation, cash_flow, risk}
  insights          String[]
  market_comparison Json     // {average_roi, average_cash_flow, appreciation_rate}
  recommendation    String   // 'strong-buy' | 'buy' | 'hold' | 'pass'
  estimated_roi     Decimal
  estimated_cash_flow Decimal
  status            String   @default("active")
  zip_code          String
  city              String
  state             String

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
  @@index([status])
}
```

---

## 8. AI HUB MODELS (4)

**Mock Source:** `lib/data/mocks/ai-hub.ts`

### Conversation
**Mock Type:** `MockConversation`
```prisma
model Conversation {
  id              String            @id @default(cuid())
  organization_id String
  user_id         String
  title           String
  summary         String?
  status          ConversationStatus @default(ACTIVE)
  message_count   Int                @default(0)
  started_at      DateTime           @default(now())
  last_message_at DateTime           @updatedAt
  created_at      DateTime           @default(now())

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])
  messages     Message[]

  @@index([organization_id])
  @@index([user_id])
  @@index([status])
}
```

### Message
**Mock Type:** `MockMessage`
```prisma
model Message {
  id              String       @id @default(cuid())
  conversation_id String
  role            MessageRole
  content         String
  tokens_used     Int?
  timestamp       DateTime     @default(now())

  conversation Conversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)

  @@index([conversation_id])
  @@index([timestamp])
}
```

### Automation
**Mock Type:** `MockAutomation`
```prisma
model Automation {
  id              String          @id @default(cuid())
  organization_id String
  created_by_id   String
  name            String
  description     String
  trigger_type    TriggerType
  trigger_config  Json
  action_type     ActionType
  action_config   Json
  status          AutomationStatus
  last_run_at     DateTime?
  next_run_at     DateTime?
  run_count       Int              @default(0)
  success_count   Int              @default(0)
  error_count     Int              @default(0)
  created_at      DateTime         @default(now())
  updated_at      DateTime         @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  created_by   User         @relation(fields: [created_by_id], references: [id])

  @@index([organization_id])
  @@index([status])
}
```

### AIUsage
**Mock Type:** `MockAIUsage`
```prisma
model AIUsage {
  id              String      @id @default(cuid())
  organization_id String
  user_id         String
  feature         AIFeature
  action          String
  tokens_used     Int
  cost_cents      Int
  timestamp       DateTime    @default(now())
  metadata        Json?

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
  @@index([feature])
  @@index([timestamp])
}
```

---

## 9. SUPPORTING MODELS (3)

### Appointment
**Mock Source:** Analytics/appointments provider
```prisma
model Appointment {
  id              String         @id @default(cuid())
  organization_id String
  user_id         String
  title           String
  description     String?
  start_time      DateTime
  end_time        DateTime
  location        String?
  attendees       String[]
  status          AppointmentStatus @default(SCHEDULED)
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
  @@index([start_time])
}
```

### Activity
**Mock Source:** Activities provider
```prisma
model Activity {
  id              String       @id @default(cuid())
  organization_id String
  user_id         String
  type            ActivityType
  title           String
  description     String?
  entity_type     String?
  entity_id       String?
  metadata        Json?
  created_at      DateTime     @default(now())

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
  @@index([created_at])
}
```

### Widget
**Mock Source:** Dashboard provider
```prisma
model Widget {
  id              String   @id @default(cuid())
  organization_id String
  user_id         String
  type            String
  title           String
  config          Json
  position        Json     // {x, y, w, h}
  is_visible      Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [user_id], references: [id])

  @@index([organization_id])
  @@index([user_id])
}
```

---

## 10. ENUMS

All enums from mock data:

```prisma
// CRM Enums
enum LeadSource {
  WEBSITE
  REFERRAL
  GOOGLE_ADS
  SOCIAL_MEDIA
  COLD_CALL
  EMAIL_CAMPAIGN
  EVENT
  PARTNER
  OTHER
}

enum LeadStatus {
  NEW_LEAD
  IN_CONTACT
  QUALIFIED
  UNQUALIFIED
  CONVERTED
  LOST
}

enum LeadScore {
  HOT
  WARM
  COLD
}

enum DealStage {
  PROSPECTING
  QUALIFICATION
  PROPOSAL
  NEGOTIATION
  CLOSING
  WON
  LOST
}

// Transaction Enums
enum LoopStatus {
  ACTIVE
  PENDING
  CLOSING
  CLOSED
  CANCELLED
}

enum DealType {
  PURCHASE
  SALE
  LEASE
  REFINANCE
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  BLOCKED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum DocumentCategory {
  CONTRACT
  DISCLOSURE
  INSPECTION
  APPRAISAL
  OTHER
}

enum PartyRole {
  BUYER
  SELLER
  AGENT
  ATTORNEY
  LENDER
  INSPECTOR
  TITLE_COMPANY
}

enum SignatureStatus {
  PENDING
  SIGNED
  DECLINED
  EXPIRED
}

enum PropertyType {
  HOUSE
  CONDO
  TOWNHOUSE
  LAND
  COMMERCIAL
  MULTI_FAMILY
}

enum ListingStatus {
  ACTIVE
  PENDING
  SOLD
  OFF_MARKET
}

enum TransactionAction {
  CREATE
  UPDATE
  COMPLETE
  COMMENT
}

enum TransactionEntityType {
  loop
  task
  document
  party
  signature
}

// Marketplace Enums
enum ToolCategory {
  FOUNDATION
  GROWTH
  ELITE
  CUSTOM
  ADVANCED
  INTEGRATION
}

enum ToolTier {
  T1
  T2
  T3
}

enum BillingPeriod {
  MONTHLY
  YEARLY
  ONE_TIME
}

enum BundleType {
  STARTER_PACK
  GROWTH_PACK
  ELITE_PACK
  CUSTOM_PACK
}

enum PurchaseStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  TRIAL
}

// Content Enums
enum ContentType {
  BLOG_POST
  PAGE
  ARTICLE
  LANDING_PAGE
}

enum ContentStatus {
  PUBLISHED
  DRAFT
  SCHEDULED
  ARCHIVED
}

enum CampaignType {
  EMAIL
  SOCIAL
  SMS
  MULTI_CHANNEL
}

enum CampaignStatus {
  DRAFT
  PLANNING
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

// Expense Enums
enum PaymentMethod {
  CASH
  CHECK
  CREDIT_CARD
  DEBIT_CARD
  WIRE_TRANSFER
  OTHER
}

enum TaxCategory {
  ADVERTISING
  VEHICLE
  COMMISSIONS
  INSURANCE
  LEGAL
  OFFICE
  RENT
  REPAIRS
  SUPPLIES
  TRAVEL
  MEALS
  UTILITIES
  OTHER
}

enum ReportType {
  QUARTERLY
  ANNUAL
  CUSTOM
}

// REID Enums
enum MarketTemperature {
  HOT
  WARM
  MODERATE
  COOL
  COLD
}

enum EducationLevel {
  HIGH_SCHOOL
  SOME_COLLEGE
  BACHELORS
  GRADUATE
}

enum AlertType {
  PRICE_DROP
  HOT_MARKET
  NEW_LISTING
  INVESTMENT_OPPORTUNITY
  MARKET_SHIFT
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum SchoolType {
  ELEMENTARY
  MIDDLE
  HIGH
  PRIVATE
  CHARTER
}

// AI Hub Enums
enum ConversationStatus {
  ACTIVE
  ARCHIVED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum TriggerType {
  SCHEDULE
  EVENT
  MANUAL
  WEBHOOK
}

enum ActionType {
  EMAIL
  SMS
  API_CALL
  CREATE_TASK
  UPDATE_RECORD
  NOTIFICATION
}

enum AutomationStatus {
  ACTIVE
  PAUSED
  DRAFT
  ERROR
}

enum AIFeature {
  CHAT
  AUTOMATION
  INSIGHTS
  CONTENT_GEN
  ANALYSIS
}

// Supporting Enums
enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum ActivityType {
  CREATE
  UPDATE
  DELETE
  VIEW
  SHARE
  COMMENT
}

enum SubscriptionTier {
  FREE
  CUSTOM
  STARTER
  GROWTH
  ELITE
  ENTERPRISE
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

---

## Summary Statistics

### Model Count by Category:
- Core: 3
- CRM: 4
- Transactions: 7
- Marketplace: 6 (5 + BundleTools junction)
- Content: 3
- Expense & Tax: 5
- REID/Analytics: 6
- AI Hub: 4
- Supporting: 3

**Total: 41 models** (52% reduction from 83!)

### Enum Count: 37 enums

### Key Relationships:
- User → Organization (via OrganizationMember)
- Organization → All data models (multi-tenancy)
- Loop → Task, Document, Party, Signature, TransactionActivity
- Tool ↔ Bundle (via BundleTools)
- Campaign → EmailCampaign
- Expense → ExpenseCategory, Receipt

---

## Migration Strategy

### Phase 1: Core + CRM (Week 1)
1. Keep existing User, Organization, OrganizationMember
2. Add Contact, Lead, Customer, Deal
3. Update CRM providers to use Prisma
4. Test CRM module thoroughly

### Phase 2: Transactions (Week 2)
1. Add Loop, Task, Document, Party, Signature, Listing, TransactionActivity
2. Update workspace providers
3. Test transaction flows

### Phase 3: Marketplace + Content (Week 3)
1. Add Tool, Bundle, Purchase, Review, Cart
2. Add ContentItem, Campaign, EmailCampaign
3. Update marketplace and CMS providers

### Phase 4: Expense + REID (Week 4)
1. Add Expense, ExpenseCategory, TaxEstimate, Receipt, TaxReport
2. Add MarketData, Demographics, ROISimulation, Alert, School, AIProfile
3. Update expense and REID providers

### Phase 5: AI Hub + Supporting (Week 5)
1. Add Conversation, Message, Automation, AIUsage
2. Add Appointment, Activity, Widget
3. Final integration testing

---

**Next Step:** Create the actual Prisma schema file with all models and relationships
