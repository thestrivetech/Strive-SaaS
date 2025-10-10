# Prisma Schema - Models Documentation

**Generated:** 2025-10-10T20:40:33.752Z
**Source:** `(platform)/prisma/schema.prisma`

> 📚 **Purpose:** Detailed model field reference
> - Use this when you need to know: "What fields does X have?"
> - For quick lookup, see: `SCHEMA-QUICK-REF.md`

**Total Models:** 42

---

## activities

| Field | Type |
|-------|------|
| id | String        @id |
| type | ActivityType |
| title | String        @db.VarChar(255) |
| description | String? |
| outcome | String?       @db.VarChar(500) |
| duration_minutes | Int? |
| lead_id | String? |
| contact_id | String? |
| deal_id | String? |
| listing_id | String? |
| organization_id | String |
| created_by_id | String |
| created_at | DateTime?     @default(now()) @db.Timestamp(6) |
| updated_at | DateTime?     @default(now()) @db.Timestamp(6) |
| completed_at | DateTime?     @db.Timestamp(6) |
| contacts | contacts?     @relation(fields: [contact_id], references: [id], onUpdate: NoAction) |
| users | users         @relation(fields: [created_by_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| deals | deals?        @relation(fields: [deal_id], references: [id], onUpdate: NoAction) |
| leads | leads?        @relation(fields: [lead_id], references: [id], onUpdate: NoAction) |
| listings | listings?     @relation(fields: [listing_id], references: [id], onUpdate: NoAction) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## activity_logs

| Field | Type |
|-------|------|
| id | String        @id |
| organization_id | String |
| user_id | String? |
| action | String |
| resource_type | String |
| resource_id | String? |
| old_data | Json? |
| new_data | Json? |
| ip_address | String? |
| user_agent | String? |
| created_at | DateTime      @default(now()) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users?        @relation(fields: [user_id], references: [id]) |

---

## admin_action_logs

| Field | Type |
|-------|------|
| id | String      @id |
| action | AdminAction |
| description | String |
| target_type | String |
| target_id | String |
| metadata | Json? |
| ip_address | String? |
| user_agent | String? |
| success | Boolean     @default(true) |
| error | String? |
| created_at | DateTime    @default(now()) @db.Timestamp(6) |
| admin_id | String |
| users | users       @relation(fields: [admin_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## ai_conversations

| Field | Type |
|-------|------|
| id | String        @id |
| user_id | String |
| organization_id | String |
| title | String? |
| context_type | AIContextType @default(GENERAL) |
| context_id | String? |
| ai_model | AIModel       @default(OPENAI_GPT4) |
| conversation_data | Json |
| usage_tokens | Int           @default(0) |
| is_archived | Boolean       @default(false) |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## ai_tools

| Field | Type |
|-------|------|
| id | String           @id |
| name | String |
| description | String? |
| toolType | ToolType |
| required_tier | SubscriptionTier |
| configuration | Json? |
| is_active | Boolean          @default(true) |
| created_at | DateTime         @default(now()) |
| updated_at | DateTime |

---

## analytics_events

| Field | Type |
|-------|------|
| id | String   @id |
| source | String   @default("saas") |
| session_id | String |
| user_id | String? |
| event_type | String |
| event_name | String |
| element_id | String? |
| element_class | String? |
| element_text | String? |
| url | String |
| path | String |
| x_position | Int? |
| y_position | Int? |
| scroll_depth | Int? |
| properties | Json? |
| timestamp | DateTime @default(now()) |

---

## analytics_goals

| Field | Type |
|-------|------|
| id | String             @id |
| name | String |
| description | String? |
| type | String |
| conditions | Json |
| value | Float? |
| is_active | Boolean            @default(true) |
| created_at | DateTime           @default(now()) |
| updated_at | DateTime |
| goal_conversions | goal_conversions[] |

---

## appointments

| Field | Type |
|-------|------|
| id | String            @id |
| organization_id | String |
| customer_id | String? |
| assigned_to | String |
| title | String |
| description | String? |
| start_time | DateTime |
| end_time | DateTime |
| status | AppointmentStatus @default(SCHEDULED) |
| location | String? |
| meeting_url | String? |
| reminders_sent | Json? |
| created_at | DateTime          @default(now()) |
| updated_at | DateTime |
| lead_id | String? |
| deal_id | String? |
| listing_id | String? |
| type | AppointmentType?  @default(OTHER) |
| users | users             @relation(fields: [assigned_to], references: [id]) |
| customers | customers?        @relation(fields: [customer_id], references: [id]) |
| deals | deals?            @relation(fields: [deal_id], references: [id], onUpdate: NoAction) |
| leads | leads?            @relation(fields: [lead_id], references: [id], onUpdate: NoAction) |
| listings | listings?         @relation(fields: [listing_id], references: [id], onUpdate: NoAction) |
| organizations | organizations     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## attachments

| Field | Type |
|-------|------|
| id | String        @id |
| organization_id | String |
| entity_type | String |
| entity_id | String |
| file_name | String |
| file_size | Int |
| mime_type | String |
| file_path | String |
| uploaded_by_id | String |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [uploaded_by_id], references: [id]) |

---

## contacts

| Field | Type |
|-------|------|
| id | String         @id |
| name | String         @db.VarChar(255) |
| email | String?        @db.VarChar(255) |
| phone | String?        @db.VarChar(50) |
| company | String?        @db.VarChar(255) |
| position | String?        @db.VarChar(255) |
| type | ContactType?   @default(PROSPECT) |
| status | ContactStatus? @default(ACTIVE) |
| notes | String? |
| tags | String[]       @default([]) |
| custom_fields | Json? |
| linkedin_url | String?        @db.VarChar(500) |
| twitter_url | String?        @db.VarChar(500) |
| preferred_contact_method | String?        @db.VarChar(50) |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime?      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime?      @default(now()) @db.Timestamp(6) |
| last_contact_at | DateTime?      @db.Timestamp(6) |
| activities | activities[] |
| users | users?         @relation(fields: [assigned_to_id], references: [id], onUpdate: NoAction) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| deals | deals[] |

---

## content

| Field | Type |
|-------|------|
| id | String        @id |
| organization_id | String |
| title | String |
| slug | String |
| content_type | ContentType |
| content | String |
| excerpt | String? |
| status | ContentStatus @default(DRAFT) |
| author_id | String |
| published_at | DateTime? |
| seo_meta | Json? |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime |
| users | users         @relation(fields: [author_id], references: [id]) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## conversations

| Field | Type |
|-------|------|
| id | String                 @id |
| organization_id | String |
| industry | String                 @default("strive") |
| session_id | String |
| user_message | String |
| assistant_response | String |
| problem_detected | String? |
| solution_presented | String? |
| conversation_stage | String |
| outcome | String? |
| conversion_score | Float? |
| booking_completed | Boolean                @default(false) |
| response_time_ms | Int? |
| user_satisfaction | Int? |
| created_at | DateTime               @default(now()) |
| updated_at | DateTime |
| embedding | Unsupported("vector")? |
| organizations | organizations          @relation(fields: [organization_id], references: [id]) |

---

## customers

| Field | Type |
|-------|------|
| id | String         @id |
| organization_id | String |
| name | String |
| email | String? |
| phone | String? |
| company | String? |
| status | CustomerStatus @default(LEAD) |
| source | CustomerSource @default(WEBSITE) |
| tags | String[] |
| custom_fields | Json? |
| assigned_to | String? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime |
| appointments | appointments[] |
| users | users?         @relation(fields: [assigned_to], references: [id]) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| projects | projects[] |

---

## deals

| Field | Type |
|-------|------|
| id | String         @id |
| title | String         @db.VarChar(255) |
| description | String? |
| value | Decimal        @db.Decimal(12, 2) |
| stage | DealStage?     @default(LEAD) |
| status | DealStatus?    @default(ACTIVE) |
| probability | Int?           @default(50) |
| expected_close_date | DateTime?      @db.Timestamp(6) |
| actual_close_date | DateTime?      @db.Timestamp(6) |
| lost_reason | String?        @db.VarChar(500) |
| notes | String? |
| tags | String[]       @default([]) |
| custom_fields | Json? |
| lead_id | String? |
| contact_id | String? |
| listing_id | String? |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime?      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime?      @default(now()) @db.Timestamp(6) |
| activities | activities[] |
| appointments | appointments[] |
| users | users?         @relation(fields: [assigned_to_id], references: [id], onUpdate: NoAction) |
| contacts | contacts?      @relation(fields: [contact_id], references: [id], onUpdate: NoAction) |
| leads | leads?         @relation(fields: [lead_id], references: [id], onUpdate: NoAction) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| listings | listings?      @relation(fields: [listing_id], references: [id], onUpdate: NoAction, map: "fk_deals_listing_id") |

---

## document_signatures

| Field | Type |
|-------|------|
| id | String             @id |
| status | SignatureStatus    @default(PENDING) |
| signed_at | DateTime?          @db.Timestamp(6) |
| signature_data | String? |
| ip_address | String? |
| user_agent | String? |
| auth_method | String? |
| decline_reason | String? |
| document_id | String |
| signer_id | String |
| request_id | String |
| documents | documents          @relation(fields: [document_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| signature_requests | signature_requests @relation(fields: [request_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| loop_parties | loop_parties       @relation(fields: [signer_id], references: [id], onDelete: NoAction, onUpdate: NoAction) |

---

## document_versions

| Field | Type |
|-------|------|
| id | String    @id |
| version_number | Int |
| storage_key | String |
| file_size | Int |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| created_by | String |
| document_id | String |
| users | users     @relation(fields: [created_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |
| documents | documents @relation(fields: [document_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## documents

| Field | Type |
|-------|------|
| id | String                @id |
| filename | String |
| original_name | String |
| mime_type | String |
| file_size | Int |
| storage_key | String                @unique |
| version | Int                   @default(1) |
| status | DocumentStatus        @default(DRAFT) |
| category | String? |
| created_at | DateTime              @default(now()) @db.Timestamp(6) |
| updated_at | DateTime              @db.Timestamp(6) |
| loop_id | String |
| uploaded_by | String |
| document_signatures | document_signatures[] |
| document_versions | document_versions[] |
| transaction_loops | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| users | users                 @relation(fields: [uploaded_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |

---

## example_conversations

| Field | Type |
|-------|------|
| id | String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid |
| industry | String                 @default("strive") |
| user_input | String |
| assistant_response | String |
| problem_type | String? |
| solution_type | String? |
| outcome | String? |
| conversion_score | Float? |
| embedding | Unsupported("vector")? |
| created_at | DateTime?              @default(now()) @db.Timestamptz(6) |
| updated_at | DateTime?              @default(now()) @db.Timestamptz(6) |

---

## feature_flags

| Field | Type |
|-------|------|
| id | String             @id |
| name | String             @unique |
| description | String? |
| is_enabled | Boolean            @default(false) |
| rollout_percent | Float              @default(0) |
| target_tiers | SubscriptionTier[] @default([]) |
| target_orgs | String[]           @default([]) |
| target_users | String[]           @default([]) |
| conditions | Json? |
| environment | Environment        @default(PRODUCTION) |
| category | String? |
| created_at | DateTime           @default(now()) @db.Timestamp(6) |
| updated_at | DateTime           @default(now()) @db.Timestamp(6) |
| created_by | String |
| users | users              @relation(fields: [created_by], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## goal_conversions

| Field | Type |
|-------|------|
| id | String          @id |
| goal_id | String |
| session_id | String |
| user_id | String? |
| value | Float? |
| url | String |
| path | String |
| timestamp | DateTime        @default(now()) |
| analytics_goals | analytics_goals @relation(fields: [goal_id], references: [id], onDelete: Cascade) |

---

## leads

| Field | Type |
|-------|------|
| id | String         @id |
| name | String         @db.VarChar(255) |
| email | String?        @db.VarChar(255) |
| phone | String?        @db.VarChar(50) |
| company | String?        @db.VarChar(255) |
| source | LeadSource?    @default(WEBSITE) |
| status | LeadStatus?    @default(NEW_LEAD) |
| score | LeadScore?     @default(COLD) |
| score_value | Int?           @default(0) |
| budget | Decimal?       @db.Decimal(12, 2) |
| timeline | String?        @db.VarChar(200) |
| notes | String? |
| tags | String[]       @default([]) |
| custom_fields | Json? |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime?      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime?      @default(now()) @db.Timestamp(6) |
| last_contact_at | DateTime?      @db.Timestamp(6) |
| activities | activities[] |
| appointments | appointments[] |
| deals | deals[] |
| users | users?         @relation(fields: [assigned_to_id], references: [id], onUpdate: NoAction) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## listings

| Field | Type |
|-------|------|
| id | String         @id |
| title | String         @db.VarChar(255) |
| description | String? |
| address | String         @db.VarChar(500) |
| city | String         @db.VarChar(100) |
| state | String         @db.VarChar(100) |
| zip_code | String         @db.VarChar(20) |
| country | String?        @default("USA") @db.VarChar(100) |
| property_type | PropertyType?  @default(RESIDENTIAL) |
| bedrooms | Int? |
| bathrooms | Decimal?       @db.Decimal(3, 1) |
| square_feet | Int? |
| lot_size | Decimal?       @db.Decimal(10, 2) |
| year_built | Int? |
| price | Decimal        @db.Decimal(12, 2) |
| price_per_sqft | Decimal?       @db.Decimal(10, 2) |
| status | ListingStatus? @default(ACTIVE) |
| mls_number | String?        @db.VarChar(100) |
| listing_date | DateTime?      @db.Timestamp(6) |
| expiration_date | DateTime?      @db.Timestamp(6) |
| images | String[]       @default([]) |
| virtual_tour_url | String?        @db.VarChar(500) |
| features | String[]       @default([]) |
| notes | String? |
| tags | String[]       @default([]) |
| custom_fields | Json? |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime?      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime?      @default(now()) @db.Timestamp(6) |
| activities | activities[] |
| appointments | appointments[] |
| deals | deals[] |
| users | users?         @relation(fields: [assigned_to_id], references: [id], onUpdate: NoAction) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## loop_parties

| Field | Type |
|-------|------|
| id | String                @id |
| name | String |
| email | String |
| phone | String? |
| role | PartyRole |
| permissions | Json |
| status | PartyStatus           @default(ACTIVE) |
| invited_at | DateTime              @default(now()) @db.Timestamp(6) |
| joined_at | DateTime?             @db.Timestamp(6) |
| loop_id | String |
| document_signatures | document_signatures[] |
| transaction_loops | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| transaction_tasks | transaction_tasks[] |

---

## notifications

| Field | Type |
|-------|------|
| id | String           @id |
| user_id | String |
| organization_id | String |
| type | NotificationType |
| title | String |
| message | String |
| action_url | String? |
| entity_type | String? |
| entity_id | String? |
| read | Boolean          @default(false) |
| created_at | DateTime         @default(now()) |
| updated_at | DateTime |
| organizations | organizations    @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users            @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## onboarding_sessions

| Field | Type |
|-------|------|
| id | String            @id |
| session_token | String            @unique |
| current_step | Int               @default(1) |
| total_steps | Int               @default(4) |
| org_name | String? |
| org_website | String? |
| org_description | String? |
| selected_tier | SubscriptionTier? |
| billing_cycle | BillingCycle? |
| stripe_payment_intent_id | String? |
| payment_status | PaymentStatus     @default(PENDING) |
| is_completed | Boolean           @default(false) |
| completed_at | DateTime?         @db.Timestamp(6) |
| expires_at | DateTime          @db.Timestamp(6) |
| created_at | DateTime          @default(now()) @db.Timestamp(6) |
| updated_at | DateTime          @default(now()) @db.Timestamp(6) |
| user_id | String? |
| organization_id | String? |
| organizations | organizations?    @relation(fields: [organization_id], references: [id], onUpdate: NoAction) |
| users | users?            @relation(fields: [user_id], references: [id], onUpdate: NoAction) |

---

## organization_members

| Field | Type |
|-------|------|
| id | String        @id |
| user_id | String |
| organization_id | String |
| role | OrgRole       @default(MEMBER) |
| permissions | Json? |
| joined_at | DateTime      @default(now()) |
| created_at | DateTime      @default(now()) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## organizations

| Field | Type |
|-------|------|
| id | String                   @id |
| name | String |
| slug | String                   @unique |
| description | String? |
| settings | Json? |
| subscription_status | SubscriptionStatus       @default(TRIAL) |
| billing_email | String? |
| created_at | DateTime                 @default(now()) |
| updated_at | DateTime |
| activities | activities[] |
| activity_logs | activity_logs[] |
| ai_conversations | ai_conversations[] |
| appointments | appointments[] |
| attachments | attachments[] |
| contacts | contacts[] |
| content | content[] |
| conversations | conversations[] |
| customers | customers[] |
| deals | deals[] |
| leads | leads[] |
| listings | listings[] |
| notifications | notifications[] |
| onboarding_sessions | onboarding_sessions[] |
| organization_members | organization_members[] |
| projects | projects[] |
| subscriptions | subscriptions? |
| transaction_audit_logs | transaction_audit_logs[] |
| transaction_loops | transaction_loops[] |
| usage_tracking | usage_tracking[] |
| workflows | workflows[] |

---

## page_views

| Field | Type |
|-------|------|
| id | String   @id |
| source | String   @default("saas") |
| session_id | String |
| user_id | String? |
| url | String |
| path | String |
| title | String? |
| referrer | String? |
| user_agent | String? |
| ip_address | String? |
| country | String? |
| city | String? |
| device | String? |
| browser | String? |
| os | String? |
| utm_source | String? |
| utm_medium | String? |
| utm_campaign | String? |
| view_duration | Int? |
| timestamp | DateTime @default(now()) |

---

## platform_metrics

| Field | Type |
|-------|------|
| id | String   @id |
| date | DateTime @unique @default(now()) @db.Timestamp(6) |
| total_users | Int      @default(0) |
| active_users | Int      @default(0) |
| new_users | Int      @default(0) |
| total_orgs | Int      @default(0) |
| active_orgs | Int      @default(0) |
| new_orgs | Int      @default(0) |
| mrr_cents | BigInt   @default(0) |
| arr_cents | BigInt   @default(0) |
| churn_rate | Float    @default(0) |
| free_count | Int      @default(0) |
| starter_count | Int      @default(0) |
| growth_count | Int      @default(0) |
| elite_count | Int      @default(0) |
| enterprise_count | Int      @default(0) |
| total_storage | BigInt   @default(0) |
| api_calls | Int      @default(0) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |

---

## projects

| Field | Type |
|-------|------|
| id | String        @id |
| organization_id | String |
| customer_id | String? |
| name | String |
| description | String? |
| status | ProjectStatus @default(PLANNING) |
| priority | Priority      @default(MEDIUM) |
| start_date | DateTime? |
| due_date | DateTime? |
| completion_date | DateTime? |
| budget | Decimal?      @db.Decimal(10, 2) |
| progress_percentage | Int           @default(0) |
| project_manager_id | String |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime |
| customers | customers?    @relation(fields: [customer_id], references: [id]) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [project_manager_id], references: [id]) |
| tasks | tasks[] |

---

## signature_requests

| Field | Type |
|-------|------|
| id | String                @id |
| title | String |
| message | String? |
| status | SignatureStatus       @default(PENDING) |
| signing_order | SigningOrder          @default(PARALLEL) |
| expires_at | DateTime?             @db.Timestamp(6) |
| completed_at | DateTime?             @db.Timestamp(6) |
| created_at | DateTime              @default(now()) @db.Timestamp(6) |
| updated_at | DateTime              @db.Timestamp(6) |
| loop_id | String |
| requested_by | String |
| document_signatures | document_signatures[] |
| transaction_loops | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| users | users                 @relation(fields: [requested_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |

---

## subscriptions

| Field | Type |
|-------|------|
| id | String             @id |
| organization_id | String             @unique |
| stripe_subscription_id | String?            @unique |
| stripe_customer_id | String? |
| status | SubscriptionStatus @default(TRIAL) |
| tier | SubscriptionTier   @default(STARTER) |
| current_period_start | DateTime |
| current_period_end | DateTime |
| cancel_at_period_end | Boolean            @default(false) |
| metadata | Json? |
| created_at | DateTime           @default(now()) |
| updated_at | DateTime |
| organizations | organizations      @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## system_alerts

| Field | Type |
|-------|------|
| id | String             @id |
| title | String |
| message | String |
| level | AlertLevel         @default(INFO) |
| category | AlertCategory |
| is_global | Boolean            @default(false) |
| target_roles | UserRole[]         @default([]) |
| target_tiers | SubscriptionTier[] @default([]) |
| target_orgs | String[]           @default([]) |
| is_dismissible | Boolean            @default(true) |
| auto_hide_after | Int? |
| starts_at | DateTime           @default(now()) @db.Timestamp(6) |
| ends_at | DateTime?          @db.Timestamp(6) |
| view_count | Int                @default(0) |
| dismiss_count | Int                @default(0) |
| is_active | Boolean            @default(true) |
| is_archived | Boolean            @default(false) |
| created_at | DateTime           @default(now()) @db.Timestamp(6) |
| updated_at | DateTime           @default(now()) @db.Timestamp(6) |
| created_by | String |
| users | users              @relation(fields: [created_by], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## tasks

| Field | Type |
|-------|------|
| id | String     @id |
| project_id | String |
| parent_task_id | String? |
| title | String |
| description | String? |
| status | TaskStatus @default(TODO) |
| priority | Priority   @default(MEDIUM) |
| assigned_to | String? |
| created_by | String |
| due_date | DateTime? |
| estimated_hours | Decimal?   @db.Decimal(5, 2) |
| actual_hours | Decimal?   @db.Decimal(5, 2) |
| tags | String[] |
| position | Int |
| created_at | DateTime   @default(now()) |
| updated_at | DateTime |
| users_tasks_assigned_toTousers | users?     @relation("tasks_assigned_toTousers", fields: [assigned_to], references: [id]) |
| users_tasks_created_byTousers | users      @relation("tasks_created_byTousers", fields: [created_by], references: [id]) |
| tasks | tasks?     @relation("tasksTotasks", fields: [parent_task_id], references: [id]) |
| other_tasks | tasks[]    @relation("tasksTotasks") |
| projects | projects   @relation(fields: [project_id], references: [id], onDelete: Cascade) |

---

## transaction_audit_logs

| Field | Type |
|-------|------|
| id | String        @id |
| action | String |
| entity_type | String |
| entity_id | String |
| old_values | Json? |
| new_values | Json? |
| ip_address | String? |
| user_agent | String? |
| timestamp | DateTime      @default(now()) @db.Timestamp(6) |
| user_id | String |
| organization_id | String |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| users | users         @relation(fields: [user_id], references: [id], onDelete: NoAction, onUpdate: NoAction) |

---

## transaction_loops

| Field | Type |
|-------|------|
| id | String               @id |
| property_address | String |
| transaction_type | TransactionType |
| listing_price | Decimal              @db.Decimal(12, 2) |
| status | LoopStatus           @default(DRAFT) |
| expected_closing | DateTime?            @db.Timestamp(6) |
| actual_closing | DateTime?            @db.Timestamp(6) |
| progress | Int                  @default(0) |
| created_at | DateTime             @default(now()) @db.Timestamp(6) |
| updated_at | DateTime             @db.Timestamp(6) |
| organization_id | String |
| created_by | String |
| documents | documents[] |
| loop_parties | loop_parties[] |
| signature_requests | signature_requests[] |
| users | users                @relation(fields: [created_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |
| organizations | organizations        @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| transaction_tasks | transaction_tasks[] |
| workflows | workflows[] |

---

## transaction_tasks

| Field | Type |
|-------|------|
| id | String            @id |
| title | String |
| description | String? |
| status | TaskStatus        @default(TODO) |
| priority | TaskPriority      @default(MEDIUM) |
| due_date | DateTime?         @db.Timestamp(6) |
| completed_at | DateTime?         @db.Timestamp(6) |
| created_at | DateTime          @default(now()) @db.Timestamp(6) |
| updated_at | DateTime          @db.Timestamp(6) |
| loop_id | String |
| assigned_to | String? |
| created_by | String |
| loop_parties | loop_parties?     @relation(fields: [assigned_to], references: [id], onUpdate: NoAction) |
| users | users             @relation(fields: [created_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |
| transaction_loops | transaction_loops @relation(fields: [loop_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---

## usage_tracking

| Field | Type |
|-------|------|
| id | String        @id |
| organization_id | String |
| user_id | String |
| resource_type | ResourceType |
| resource_name | String |
| usage_amount | Int |
| billing_period | DateTime |
| metadata | Json? |
| created_at | DateTime      @default(now()) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## user_sessions

| Field | Type |
|-------|------|
| id | String    @id |
| source | String    @default("saas") |
| session_id | String    @unique |
| user_id | String? |
| start_time | DateTime  @default(now()) |
| end_time | DateTime? |
| duration | Int? |
| page_views | Int       @default(0) |
| bounced | Boolean   @default(false) |
| converted | Boolean   @default(false) |
| user_agent | String? |
| ip_address | String? |
| country | String? |
| city | String? |
| device | String? |
| browser | String? |
| os | String? |
| referrer | String? |
| entry_page | String? |
| exit_page | String? |

---

## users

| Field | Type |
|-------|------|
| id | String                   @id |
| clerk_user_id | String?                  @unique |
| email | String                   @unique |
| name | String? |
| avatar_url | String? |
| role | UserRole                 @default(EMPLOYEE) |
| subscription_tier | SubscriptionTier         @default(STARTER) |
| is_active | Boolean                  @default(true) |
| created_at | DateTime                 @default(now()) |
| updated_at | DateTime |
| activities | activities[] |
| activity_logs | activity_logs[] |
| admin_action_logs | admin_action_logs[] |
| ai_conversations | ai_conversations[] |
| appointments | appointments[] |
| attachments | attachments[] |
| contacts | contacts[] |
| content | content[] |
| customers | customers[] |
| deals | deals[] |
| document_versions | document_versions[] |
| documents | documents[] |
| feature_flags | feature_flags[] |
| leads | leads[] |
| listings | listings[] |
| notifications | notifications[] |
| onboarding_sessions | onboarding_sessions[] |
| organization_members | organization_members[] |
| projects | projects[] |
| signature_requests | signature_requests[] |
| system_alerts | system_alerts[] |
| tasks_tasks_assigned_toTousers | tasks[]                  @relation("tasks_assigned_toTousers") |
| tasks_tasks_created_byTousers | tasks[]                  @relation("tasks_created_byTousers") |
| transaction_audit_logs | transaction_audit_logs[] |
| transaction_loops | transaction_loops[] |
| transaction_tasks | transaction_tasks[] |
| workflows | workflows[] |

---

## web_vitals_metrics

| Field | Type |
|-------|------|
| id | String   @id |
| source | String   @default("saas") |
| session_id | String |
| user_id | String? |
| url | String |
| path | String |
| metric_name | String |
| metric_value | Float |
| metric_rating | String |
| metric_id | String |
| user_agent | String? |
| device | String? |
| browser | String? |
| connection_type | String? |
| timestamp | DateTime @default(now()) |

---

## workflows

| Field | Type |
|-------|------|
| id | String             @id |
| name | String |
| description | String? |
| is_template | Boolean            @default(false) |
| steps | Json |
| status | WorkflowStatus     @default(ACTIVE) |
| created_at | DateTime           @default(now()) @db.Timestamp(6) |
| updated_at | DateTime           @db.Timestamp(6) |
| loop_id | String? |
| created_by | String |
| organization_id | String? |
| users | users              @relation(fields: [created_by], references: [id], onDelete: NoAction, onUpdate: NoAction) |
| transaction_loops | transaction_loops? @relation(fields: [loop_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |
| organizations | organizations?     @relation(fields: [organization_id], references: [id], onDelete: Cascade, onUpdate: NoAction) |

---
