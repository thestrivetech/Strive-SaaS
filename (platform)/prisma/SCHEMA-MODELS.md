# Prisma Schema - Models Documentation

**Generated:** 2025-10-10T20:18:20.046Z
**Source:** `(platform)/prisma/schema.prisma`

> 📚 **Purpose:** Detailed model field reference
> - Use this when you need to know: "What fields does X have?"
> - For quick lookup, see: `SCHEMA-QUICK-REF.md`

**Total Models:** 41

---

## Activity

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| type | ActivityType |
| title | String |
| description | String? |
| entity_type | String? |
| entity_id | String? |
| metadata | Json? |
| created_at | DateTime     @default(now()) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |

---

## AIProfile

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| property_address | String |
| profile_name | String |
| analysis_date | DateTime @default(now()) |
| ai_score | Int |
| score_breakdown | Json     // {location, financials, appreciation, cash_flow, risk |

---

## AIUsage

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| feature | AIFeature |
| action | String |
| tokens_used | Int |
| cost_cents | Int |
| timestamp | DateTime     @default(now()) |
| metadata | Json? |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |

---

## Alert

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| user_id | String |
| organization_id | String |
| title | String |
| description | String |
| alert_type | AlertType |
| severity | AlertSeverity |
| zip_code | String |
| city | String |
| state | String |
| metadata | Json |
| is_read | Boolean       @default(false) |
| is_dismissed | Boolean       @default(false) |
| created_at | DateTime      @default(now()) |
| expires_at | DateTime? |
| user | User         @relation(fields: [user_id], references: [id]) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## Appointment

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| title | String |
| description | String? |
| start_time | DateTime |
| end_time | DateTime |
| location | String? |
| attendees | String[] |
| status | AppointmentStatus @default(SCHEDULED) |
| created_at | DateTime          @default(now()) |
| updated_at | DateTime          @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |

---

## Automation

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
| organization_id | String |
| created_by_id | String |
| name | String |
| description | String |
| trigger_type | TriggerType |
| trigger_config | Json |
| action_type | ActionType |
| action_config | Json |
| status | AutomationStatus |
| last_run_at | DateTime? |
| next_run_at | DateTime? |
| run_count | Int              @default(0) |
| success_count | Int              @default(0) |
| error_count | Int              @default(0) |
| created_at | DateTime         @default(now()) |
| updated_at | DateTime         @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | User         @relation(fields: [created_by_id], references: [id]) |

---

## Bundle

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| name | String |
| slug | String        @unique |
| description | String |
| bundle_type | BundleType |
| price | Int           // in cents |
| discount_percentage | Int |
| is_active | Boolean       @default(true) |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| tools | BundleTools[] |
| purchases | Purchase[] |

---

## BundleTools

| Field | Type |
|-------|------|
| bundle_id | String |
| tool_id | String |
| bundle | Bundle @relation(fields: [bundle_id], references: [id], onDelete: Cascade) |
| tool | Tool   @relation(fields: [tool_id], references: [id], onDelete: Cascade) |

---

## Campaign

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| organization_id | String |
| created_by | String |
| name | String |
| description | String |
| type | CampaignType |
| status | CampaignStatus |
| start_date | DateTime? |
| end_date | DateTime? |
| target_audience | String? |
| budget | Decimal? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| organization | Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | User            @relation(fields: [created_by], references: [id]) |
| email_campaigns | EmailCampaign[] |

---

## Cart

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| user_id | String   @unique |
| tools | String[] // tool IDs |
| bundles | String[] // bundle IDs |
| total_price | Int |
| updated_at | DateTime @updatedAt |
| user | User @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## Contact

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| name | String |
| email | String |
| phone | String? |
| company | String? |
| role | String? |
| tags | String[] |
| notes | String? |
| created_at | DateTime     @default(now()) |
| updated_at | DateTime     @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |

---

## ContentItem

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| organization_id | String |
| author_id | String |
| title | String |
| slug | String |
| content | String |
| excerpt | String |
| type | ContentType |
| status | ContentStatus |
| published_at | DateTime? |
| scheduled_at | DateTime? |
| view_count | Int           @default(0) |
| share_count | Int           @default(0) |
| like_count | Int           @default(0) |
| comment_count | Int           @default(0) |
| category_id | String? |
| tags | String[] |
| seo_title | String? |
| seo_description | String? |
| featured_image | String? |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| author | User         @relation(fields: [author_id], references: [id]) |

---

## Conversation

| Field | Type |
|-------|------|
| id | String             @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| title | String |
| summary | String? |
| status | ConversationStatus @default(ACTIVE) |
| message_count | Int                @default(0) |
| started_at | DateTime           @default(now()) |
| last_message_at | DateTime           @updatedAt |
| created_at | DateTime           @default(now()) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |
| messages | Message[] |

---

## Customer

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| name | String |
| email | String |
| phone | String? |
| company | String? |
| address_street | String? |
| address_city | String? |
| address_state | String? |
| address_zip | String? |
| lifetime_value | Decimal      @default(0) |
| tags | String[] |
| created_at | DateTime     @default(now()) |
| updated_at | DateTime     @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |
| deals | Deal[] |

---

## Deal

| Field | Type |
|-------|------|
| id | String      @id @default(cuid()) |
| organization_id | String |
| title | String |
| value | Decimal |
| stage | DealStage |
| probability | Int         @default(50) |
| expected_close | DateTime? |
| lead_id | String? |
| customer_id | String? |
| assigned_to_id | String? |
| created_at | DateTime    @default(now()) |
| updated_at | DateTime    @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| lead | Lead?        @relation(fields: [lead_id], references: [id]) |
| customer | Customer?    @relation(fields: [customer_id], references: [id]) |
| assigned_to | User?        @relation("AssignedDeals", fields: [assigned_to_id], references: [id]) |

---

## Demographics

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| zip_code | String         @unique |
| city | String |
| state | String |
| population | Int |
| median_age | Int |
| median_income | Decimal |
| unemployment_rate | Decimal |
| education_level | EducationLevel |
| homeownership_rate | Decimal |
| avg_household_size | Decimal |
| growth_rate_1yr | Decimal |
| growth_rate_5yr | Decimal |

---

## Document

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
| loop_id | String |
| filename | String |
| file_url | String |
| file_size | Int |
| mime_type | String |
| category | DocumentCategory |
| uploaded_by_id | String |
| uploaded_at | DateTime         @default(now()) |
| loop | Loop        @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| uploaded_by | User        @relation(fields: [uploaded_by_id], references: [id]) |
| signatures | Signature[] |

---

## EmailCampaign

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| campaign_id | String |
| subject | String |
| from_name | String |
| from_email | String |
| preview_text | String |
| html_content | String |
| sent_count | Int      @default(0) |
| opened_count | Int      @default(0) |
| clicked_count | Int      @default(0) |
| bounced_count | Int      @default(0) |
| unsubscribed_count | Int      @default(0) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| campaign | Campaign @relation(fields: [campaign_id], references: [id], onDelete: Cascade) |

---

## Expense

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| organization_id | String |
| created_by_id | String |
| title | String |
| description | String? |
| amount | Int             // in cents |
| category_id | String |
| vendor | String |
| date | DateTime |
| payment_method | PaymentMethod |
| receipt_url | String? |
| is_tax_deductible | Boolean         @default(false) |
| tax_category | TaxCategory? |
| notes | String? |
| created_at | DateTime        @default(now()) |
| updated_at | DateTime        @updatedAt |
| organization | Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | User            @relation(fields: [created_by_id], references: [id]) |
| category | ExpenseCategory @relation(fields: [category_id], references: [id]) |
| receipts | Receipt[] |

---

## ExpenseCategory

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| name | String |
| description | String? |
| color | String |
| icon | String? |
| is_default | Boolean      @default(false) |
| is_custom | Boolean      @default(false) |
| expense_count | Int          @default(0) |
| total_amount | Int          @default(0) // in cents |
| created_at | DateTime     @default(now()) |
| updated_at | DateTime     @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| expenses | Expense[] |

---

## Lead

| Field | Type |
|-------|------|
| id | String      @id @default(cuid()) |
| organization_id | String |
| name | String |
| email | String |
| phone | String? |
| company | String? |
| source | LeadSource |
| status | LeadStatus |
| score | LeadScore |
| score_value | Int |
| budget | Decimal? |
| timeline | String? |
| notes | String? |
| tags | String[] |
| custom_fields | Json? |
| assigned_to_id | String? |
| last_contact_at | DateTime? |
| created_at | DateTime    @default(now()) |
| updated_at | DateTime    @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| assigned_to | User?        @relation("AssignedLeads", fields: [assigned_to_id], references: [id]) |
| deals | Deal[] |

---

## Listing

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| organization_id | String |
| agent_id | String |
| title | String |
| property_type | PropertyType |
| address | String |
| city | String |
| state | String |
| zip | String |
| price | Decimal |
| bedrooms | Int |
| bathrooms | Int |
| sqft | Int |
| status | ListingStatus |
| description | String |
| images | String[] |
| listed_date | DateTime |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| agent | User         @relation(fields: [agent_id], references: [id]) |

---

## Loop

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| organization_id | String |
| created_by_id | String |
| title | String |
| property_address | String |
| property_city | String |
| property_state | String |
| property_zip | String |
| status | LoopStatus |
| deal_type | DealType |
| purchase_price | Decimal |
| closing_date | DateTime? |
| created_at | DateTime   @default(now()) |
| updated_at | DateTime   @updatedAt |
| organization | Organization          @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | User                  @relation(fields: [created_by_id], references: [id]) |
| tasks | Task[] |
| documents | Document[] |
| parties | Party[] |
| signatures | Signature[] |
| activities | TransactionActivity[] |

---

## MarketData

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| zip_code | String |
| city | String |
| state | String |
| county | String |
| median_price | Decimal |
| price_change_1mo | Decimal |
| price_change_3mo | Decimal |
| price_change_1yr | Decimal |
| avg_days_on_market | Int |
| inventory_count | Int |
| sales_volume | Decimal |
| price_per_sqft | Decimal |
| market_temperature | MarketTemperature |
| demand_score | Int |
| supply_score | Int |
| investment_score | Int |
| last_updated | DateTime          @default(now()) |

---

## Message

| Field | Type |
|-------|------|
| id | String      @id @default(cuid()) |
| conversation_id | String |
| role | MessageRole |
| content | String |
| tokens_used | Int? |
| timestamp | DateTime    @default(now()) |
| conversation | Conversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade) |

---

## Organization

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
| name | String |
| slug | String           @unique |
| subscription_tier | SubscriptionTier @default(FREE) |
| created_at | DateTime         @default(now()) |
| updated_at | DateTime         @updatedAt |
| members | OrganizationMember[] |
| contacts | Contact[] |
| leads | Lead[] |
| customers | Customer[] |
| deals | Deal[] |
| loops | Loop[] |
| content_items | ContentItem[] |
| campaigns | Campaign[] |
| expenses | Expense[] |
| expense_categories | ExpenseCategory[] |
| tax_estimates | TaxEstimate[] |
| tax_reports | TaxReport[] |
| roi_simulations | ROISimulation[] |
| alerts | Alert[] |
| ai_profiles | AIProfile[] |
| conversations | Conversation[] |
| automations | Automation[] |
| ai_usage | AIUsage[] |
| appointments | Appointment[] |
| activities | Activity[] |
| widgets | Widget[] |
| purchases | Purchase[] |
| reviews | Review[] |
| listings | Listing[] |

---

## OrganizationMember

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| role | OrgRole      @default(MEMBER) |
| created_at | DateTime     @default(now()) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## Party

| Field | Type |
|-------|------|
| id | String    @id @default(cuid()) |
| loop_id | String |
| name | String |
| email | String |
| phone | String? |
| role | PartyRole |
| created_at | DateTime  @default(now()) |
| loop | Loop        @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| signatures | Signature[] |

---

## Purchase

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| tool_id | String? |
| bundle_id | String? |
| price_at_purchase | Int |
| status | PurchaseStatus |
| purchased_at | DateTime        @default(now()) |
| expires_at | DateTime? |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |
| tool | Tool?        @relation(fields: [tool_id], references: [id]) |
| bundle | Bundle?      @relation(fields: [bundle_id], references: [id]) |

---

## Receipt

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| expense_id | String |
| file_url | String |
| file_name | String |
| file_size | Int |
| mime_type | String |
| uploaded_at | DateTime @default(now()) |
| uploaded_by_id | String |
| expense | Expense @relation(fields: [expense_id], references: [id], onDelete: Cascade) |
| uploaded_by | User    @relation(fields: [uploaded_by_id], references: [id]) |

---

## Review

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| tool_id | String |
| user_id | String |
| organization_id | String |
| rating | Int          // 1-5 |
| review_text | String? |
| created_at | DateTime     @default(now()) |
| tool | Tool         @relation(fields: [tool_id], references: [id], onDelete: Cascade) |
| user | User         @relation(fields: [user_id], references: [id]) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## ROISimulation

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| user_id | String |
| organization_id | String |
| property_price | Decimal |
| down_payment | Decimal |
| loan_amount | Decimal |
| interest_rate | Decimal |
| loan_term | Int          // years |
| monthly_payment | Decimal |
| property_tax | Decimal |
| insurance | Decimal |
| hoa_fees | Decimal |
| maintenance | Decimal |
| monthly_expenses | Decimal |
| rental_income | Decimal |
| monthly_cash_flow | Decimal |
| annual_cash_flow | Decimal |
| cash_on_cash_return | Decimal |
| cap_rate | Decimal |
| total_roi_5yr | Decimal |
| total_roi_10yr | Decimal |
| appreciation_rate | Decimal |
| equity_5yr | Decimal |
| equity_10yr | Decimal |
| created_at | DateTime     @default(now()) |
| user | User         @relation(fields: [user_id], references: [id]) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## School

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| name | String |
| type | SchoolType |
| address | String |
| city | String |
| state | String |
| zip_code | String |
| rating | Int        // 1-10 |
| test_scores | Int        // 0-100 |
| student_count | Int |
| teacher_ratio | Int |
| distance_miles | Decimal |
| grade_levels | String |
| district | String |

---

## Signature

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| loop_id | String |
| document_id | String |
| party_id | String |
| status | SignatureStatus |
| requested_at | DateTime        @default(now()) |
| signed_at | DateTime? |
| signature_data | String? |
| loop | Loop     @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| document | Document @relation(fields: [document_id], references: [id], onDelete: Cascade) |
| party | Party    @relation(fields: [party_id], references: [id], onDelete: Cascade) |

---

## Task

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| loop_id | String |
| title | String |
| description | String? |
| status | TaskStatus |
| priority | TaskPriority |
| due_date | DateTime? |
| assigned_to_id | String? |
| completed_at | DateTime? |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| loop | Loop  @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| assigned_to | User? @relation("AssignedTasks", fields: [assigned_to_id], references: [id]) |

---

## TaxEstimate

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| year | Int |
| quarter | Int          // 1-4 |
| total_income | Int          // in cents |
| total_expenses | Int          // in cents |
| deductible_expenses | Int          // in cents |
| estimated_tax_rate | Int          // percentage |
| estimated_tax_owed | Int          // in cents |
| tax_paid | Int          // in cents |
| created_at | DateTime     @default(now()) |
| updated_at | DateTime     @updatedAt |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## TaxReport

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| organization_id | String |
| title | String |
| report_type | ReportType |
| year | Int |
| quarter | Int? |
| start_date | DateTime |
| end_date | DateTime |
| total_income | Int |
| total_expenses | Int |
| deductible_expenses | Int |
| non_deductible_expenses | Int |
| net_income | Int |
| estimated_tax | Int |
| category_breakdown | Json |
| generated_at | DateTime     @default(now()) |
| organization | Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## Tool

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| name | String |
| slug | String         @unique |
| description | String |
| long_description | String? |
| category | ToolCategory |
| tier | ToolTier |
| price | Int            // in cents |
| billing_period | BillingPeriod |
| features | String[] |
| icon_url | String? |
| tags | String[] |
| is_active | Boolean        @default(true) |
| install_count | Int            @default(0) |
| average_rating | Decimal        @default(0) |
| review_count | Int            @default(0) |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| purchases | Purchase[] |
| reviews | Review[] |
| bundles | BundleTools[] |

---

## TransactionActivity

| Field | Type |
|-------|------|
| id | String                @id @default(cuid()) |
| loop_id | String |
| user_id | String |
| action | TransactionAction |
| entity_type | TransactionEntityType |
| entity_id | String |
| details | String? |
| timestamp | DateTime              @default(now()) |
| loop | Loop @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| user | User @relation(fields: [user_id], references: [id]) |

---

## User

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| email | String   @unique |
| name | String? |
| avatar_url | String? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_members | OrganizationMember[] |
| contacts | Contact[] |
| leads | Lead[]               @relation("AssignedLeads") |
| customers | Customer[] |
| deals | Deal[]               @relation("AssignedDeals") |
| loops | Loop[] |
| tasks | Task[]               @relation("AssignedTasks") |
| documents | Document[] |
| content_items | ContentItem[] |
| campaigns | Campaign[] |
| expenses | Expense[] |
| receipts | Receipt[] |
| roi_simulations | ROISimulation[] |
| alerts | Alert[] |
| ai_profiles | AIProfile[] |
| conversations | Conversation[] |
| automations | Automation[] |
| ai_usage | AIUsage[] |
| appointments | Appointment[] |
| activities | Activity[] |
| widgets | Widget[] |
| transaction_activities | TransactionActivity[] |
| purchases | Purchase[] |
| reviews | Review[] |
| cart | Cart? |
| listings | Listing[] |

---

## Widget

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| organization_id | String |
| user_id | String |
| type | String |
| title | String |
| config | Json |
| position | Json     // {x, y, w, h |

---
