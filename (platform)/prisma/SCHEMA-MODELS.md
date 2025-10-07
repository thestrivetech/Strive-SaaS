# Prisma Schema - Models Documentation

**Generated:** 2025-10-06T18:08:39.952Z
**Source:** `shared/prisma/schema.prisma`

> 📚 **Purpose:** Detailed model field reference
> - Use this when you need to know: "What fields does X have?"
> - For quick lookup, see: `SCHEMA-QUICK-REF.md`

**Total Models:** 83

---

## activities

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| type | ActivityType |
| title | String |
| description | String?       @db.Text |
| outcome | String? |
| duration_minutes | Int? |
| lead_id | String? |
| contact_id | String? |
| deal_id | String? |
| listing_id | String? |
| organization_id | String |
| created_by_id | String |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| completed_at | DateTime? |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | users         @relation("ActivityCreatedBy", fields: [created_by_id], references: [id], onDelete: Cascade) |
| lead | leads?        @relation(fields: [lead_id], references: [id], onDelete: SetNull) |
| contact | contacts?     @relation(fields: [contact_id], references: [id], onDelete: SetNull) |
| deal | deals?        @relation(fields: [deal_id], references: [id], onDelete: SetNull) |
| listing | listings?     @relation(fields: [listing_id], references: [id], onDelete: SetNull) |

---

## activity_feeds

| Field | Type |
|-------|------|
| id | String                @id @default(cuid()) |
| title | String |
| description | String? |
| type | DashboardActivityType |
| entity_type | String // e.g., 'workflow', 'expense', 'project' |
| entity_id | String // ID of the related entity |
| action | String // e.g., 'created', 'updated', 'completed' |
| metadata | Json? // Additional activity context |
| severity | DashboardActivitySeverity @default(INFO) |
| is_read | Boolean @default(false) |
| is_pinned | Boolean @default(false) |
| is_archived | Boolean @default(false) |
| created_at | DateTime @default(now()) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user_id | String? // User who triggered the activity |
| user | users?  @relation("ActivityFeedUser", fields: [user_id], references: [id]) |

---

## activity_logs

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
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
| id | String      @id @default(cuid()) |
| action | AdminAction |
| description | String |
| target_type | String // 'user', 'organization', 'subscription' |
| target_id | String // ID of the affected entity |
| metadata | Json?   @db.JsonB // Additional action context |
| ip_address | String? |
| user_agent | String? |
| success | Boolean @default(true) |
| error | String? @db.Text // Error message if failed |
| created_at | DateTime @default(now()) |
| admin_id | String |
| admin | users  @relation("AdminActions", fields: [admin_id], references: [id], onDelete: Cascade) |

---

## agent_templates

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| name | String        @db.VarChar(100) |
| description | String        @db.Text |
| category | AgentCategory |
| avatar | String?       @db.VarChar(500) |
| personality_config | Json @db.JsonB |
| model_config | Json @db.JsonB |
| tools_config | Json @db.JsonB |
| memory_config | Json @db.JsonB |
| tags | String[] @default([]) |
| features | String[] @default([]) |
| use_cases | String[] @default([]) |
| usage_count | Int      @default(0) |
| rating | Decimal? @db.Decimal(3, 2) |
| is_popular | Boolean  @default(false) |
| is_public | Boolean @default(false) |
| is_system | Boolean @default(false) |
| organization_id | String? |
| created_by_id | String? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organizations | organizations?     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users?             @relation("TemplateCreator", fields: [created_by_id], references: [id], onDelete: SetNull) |
| reviews | template_reviews[] |

---

## ai_conversations

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
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
| updated_at | DateTime      @updatedAt |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## ai_tools

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
| name | String |
| description | String? |
| toolType | ToolType |
| required_tier | SubscriptionTier |
| configuration | Json? |
| is_active | Boolean          @default(true) |
| created_at | DateTime         @default(now()) |
| updated_at | DateTime         @updatedAt |

---

## alert_triggers

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| alert_id | String |
| alert | property_alerts @relation(fields: [alert_id], references: [id], onDelete: Cascade) |
| triggered_by | Json // Data that triggered the alert |
| message | String        @db.Text |
| severity | AlertSeverity @default(MEDIUM) |
| email_sent | Boolean   @default(false) |
| sms_sent | Boolean   @default(false) |
| acknowledged | Boolean   @default(false) |
| acknowledged_at | DateTime? |
| acknowledged_by_id | String? |
| triggered_at | DateTime @default(now()) |

---

## analytics_events

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
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
| id | String             @id @default(cuid()) |
| name | String |
| description | String? |
| type | String |
| conditions | Json |
| value | Float? |
| is_active | Boolean            @default(true) |
| created_at | DateTime           @default(now()) |
| updated_at | DateTime           @updatedAt |
| goal_conversions | goal_conversions[] |

---

## appointments

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| organization_id | String |
| customer_id | String? |
| contact_id | String? |
| assigned_to | String |
| title | String |
| description | String? |
| start_time | DateTime |
| end_time | DateTime |
| status | AppointmentStatus @default(SCHEDULED) |
| type | AppointmentType   @default(OTHER) |
| location | String? |
| meeting_url | String? |
| reminders_sent | Json? |
| lead_id | String? |
| deal_id | String? |
| listing_id | String? |
| created_at | DateTime          @default(now()) |
| updated_at | DateTime          @updatedAt |
| users | users             @relation(fields: [assigned_to], references: [id]) |
| customers | customers?        @relation(fields: [customer_id], references: [id]) |
| contact | contacts?         @relation("ContactAppointments", fields: [contact_id], references: [id]) |
| organizations | organizations     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| lead | leads?            @relation(fields: [lead_id], references: [id], onDelete: SetNull) |
| deal | deals?            @relation(fields: [deal_id], references: [id], onDelete: SetNull) |
| listing | listings?         @relation(fields: [listing_id], references: [id], onDelete: SetNull) |

---

## attachments

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| organization_id | String |
| entity_type | String |
| entity_id | String |
| file_name | String |
| file_size | Int |
| mime_type | String |
| file_path | String |
| uploaded_by_id | String |
| created_at | DateTime      @default(now()) |
| updated_at | DateTime      @updatedAt |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [uploaded_by_id], references: [id]) |

---

## build_logs

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| order_id | String |
| stage | String   @db.VarChar(50) |
| message | String   @db.Text |
| details | Json?    @db.JsonB |
| log_level | LogLevel @default(INFO) |
| created_at | DateTime @default(now()) |
| order | custom_agent_orders @relation(fields: [order_id], references: [id], onDelete: Cascade) |

---

## bundle_purchases

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| bundle_id | String |
| bundle | tool_bundles @relation(fields: [bundle_id], references: [id], onDelete: Cascade) |
| price_at_purchase | Int // Bundle price when purchased |
| purchase_date | DateTime       @default(now()) |
| status | PurchaseStatus @default(ACTIVE) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| purchased_by | String |
| purchaser | users  @relation("BundlePurchases", fields: [purchased_by], references: [id], onDelete: Cascade) |

---

## bundle_tools

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| bundle_id | String |
| bundle | tool_bundles      @relation(fields: [bundle_id], references: [id], onDelete: Cascade) |
| tool_id | String |
| tool | marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade) |

---

## campaign_content

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| campaign_id | String |
| campaign | campaigns     @relation(fields: [campaign_id], references: [id], onDelete: Cascade) |
| content_id | String |
| content | content_items @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| role | String |
| priority | Int    @default(0) |
| added_at | DateTime @default(now()) |

---

## campaigns

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| description | String? |
| type | CampaignType |
| status | CampaignStatus @default(DRAFT) |
| start_date | DateTime? |
| end_date | DateTime? |
| timezone | String    @default("UTC") |
| budget | Decimal? @db.Decimal(10, 2) |
| goal_type | String? |
| goal_value | Float? |
| impressions | Int     @default(0) |
| clicks | Int     @default(0) |
| conversions | Int     @default(0) |
| spend | Decimal @default(0) @db.Decimal(10, 2) |
| revenue | Decimal @default(0) @db.Decimal(10, 2) |
| analytics_data | Json? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users                @relation(fields: [created_by], references: [id]) |
| content | campaign_content[] |
| emails | email_campaigns[] |
| social_posts | social_media_posts[] |

---

## contacts

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| name | String |
| email | String? |
| phone | String? |
| company | String? |
| position | String? |
| type | ContactType    @default(PROSPECT) |
| status | ContactStatus  @default(ACTIVE) |
| notes | String?        @db.Text |
| tags | String[]       @default([]) |
| custom_fields | Json?          @db.JsonB |
| linkedin_url | String? |
| twitter_url | String? |
| preferred_contact_method | String? |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| last_contact_at | DateTime? |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| assigned_to | users?         @relation("ContactAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull) |
| activities | activities[] |
| deals | deals[] |
| appointments | appointments[] @relation("ContactAppointments") |

---

## content_categories

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| slug | String |
| description | String? |
| color | String? |
| is_active | Boolean @default(true) |
| sort_order | Int     @default(0) |
| meta_title | String? |
| meta_description | String? |
| parent_id | String? |
| parent | content_categories?  @relation("CategoryHierarchy", fields: [parent_id], references: [id]) |
| children | content_categories[] @relation("CategoryHierarchy") |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users           @relation(fields: [created_by], references: [id]) |
| content | content_items[] |

---

## content_comments

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| content_id | String |
| content | content_items @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| comment | String        @db.Text |
| status | CommentStatus @default(PENDING) |
| parent_id | String? |
| parent | content_comments?  @relation("CommentReplies", fields: [parent_id], references: [id]) |
| replies | content_comments[] @relation("CommentReplies") |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| author_id | String |
| author | users  @relation(fields: [author_id], references: [id]) |

---

## content_items

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| title | String |
| slug | String |
| excerpt | String? |
| content | String  @db.Text |
| type | ContentType |
| status | ContentStatus @default(DRAFT) |
| language | String        @default("en") |
| meta_title | String? |
| meta_description | String? |
| keywords | String[] |
| canonical_url | String? |
| featured_image | String? |
| gallery | String[] |
| video_url | String? |
| audio_url | String? |
| published_at | DateTime? |
| scheduled_for | DateTime? |
| expires_at | DateTime? |
| view_count | Int @default(0) |
| share_count | Int @default(0) |
| like_count | Int @default(0) |
| comment_count | Int @default(0) |
| analytics_data | Json? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| author_id | String |
| author | users               @relation("ContentAuthor", fields: [author_id], references: [id]) |
| category_id | String? |
| category | content_categories? @relation(fields: [category_id], references: [id]) |
| tags | content_tags[] |
| campaigns | campaign_content[] |
| revisions | content_revisions[] |
| comments | content_comments[] |

---

## content_revisions

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| content_id | String |
| content | content_items @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| title | String |
| content_body | String  @db.Text |
| excerpt | String? |
| version | Int |
| comment | String? |
| created_at | DateTime @default(now()) |
| created_by | String |
| creator | users  @relation(fields: [created_by], references: [id]) |

---

## content_tags

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| slug | String |
| color | String? |
| usage_count | Int @default(0) |
| created_at | DateTime @default(now()) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| content | content_items[] |

---

## conversations

| Field | Type |
|-------|------|
| id | String                 @id @default(cuid()) |
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
| updated_at | DateTime               @updatedAt |
| embedding | Unsupported("vector")? |
| organizations | organizations          @relation(fields: [organization_id], references: [id]) |

---

## custom_agent_orders

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| title | String          @db.VarChar(100) |
| description | String          @db.Text |
| requirements | Json            @db.JsonB |
| use_case | String          @db.VarChar(200) |
| complexity | ComplexityLevel |
| estimated_hours | Int? |
| estimated_cost | Decimal?        @db.Decimal(12, 2) |
| status | OrderStatus   @default(DRAFT) |
| priority | OrderPriority @default(NORMAL) |
| submitted_at | DateTime? |
| started_at | DateTime? |
| completed_at | DateTime? |
| delivered_at | DateTime? |
| progress | Int     @default(0) // 0-100 |
| current_stage | String? @db.VarChar(50) |
| agent_config | Json @db.JsonB |
| tools_config | Json @db.JsonB |
| organization_id | String |
| created_by_id | String |
| assigned_to_id | String? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organizations | organizations      @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users              @relation("OrderCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |
| assignee | users?             @relation("OrderAssignee", fields: [assigned_to_id], references: [id], onDelete: SetNull) |
| milestones | order_milestones[] |
| build_logs | build_logs[] |

---

## customers

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
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
| updated_at | DateTime       @updatedAt |
| appointments | appointments[] |
| users | users?         @relation(fields: [assigned_to], references: [id]) |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| projects | projects[] |

---

## dashboard_metrics

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| name | String |
| category | MetricCategory |
| query | Json // Database query or calculation logic |
| unit | String? // Unit of measurement (%, $, count, etc.) |
| format | String  @default("number") // number, currency, percentage |
| target_value | Float? // Target/goal value |
| warning_threshold | Float? // Warning threshold |
| critical_threshold | Float? // Critical threshold |
| chart_type | String? // line, bar, pie, gauge |
| color | String  @default("blue") |
| icon | String? |
| permissions | String[] // Required permissions |
| refresh_rate | Int       @default(300) // Seconds |
| last_calculated | DateTime? |
| cached_value | Float? // Cached metric value |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String? |
| organization | organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String? |
| creator | users?  @relation("DashboardMetricCreator", fields: [created_by], references: [id]) |

---

## dashboard_widgets

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| name | String |
| type | WidgetType |
| config | Json // Widget-specific settings |
| position | Json // Grid position and size |
| data_source | String? // Data source identifier |
| refresh_rate | Int     @default(300) // Refresh interval in seconds |
| is_visible | Boolean @default(true) |
| title | String? // Custom title override |
| chart_type | String? // For data visualization widgets |
| permissions | String[] // Required permissions to view |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users  @relation("DashboardWidgetCreator", fields: [created_by], references: [id]) |

---

## deals

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| title | String |
| description | String?        @db.Text |
| value | Decimal        @db.Decimal(12, 2) |
| stage | DealStage      @default(LEAD) |
| status | DealStatus     @default(ACTIVE) |
| probability | Int            @default(50) |
| expected_close_date | DateTime? |
| actual_close_date | DateTime? |
| lost_reason | String? |
| notes | String?        @db.Text |
| tags | String[]       @default([]) |
| custom_fields | Json?          @db.JsonB |
| lead_id | String? |
| contact_id | String? |
| listing_id | String? |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| assigned_to | users?         @relation("DealAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull) |
| lead | leads?         @relation(fields: [lead_id], references: [id], onDelete: SetNull) |
| contact | contacts?      @relation(fields: [contact_id], references: [id], onDelete: SetNull) |
| listing | listings?      @relation(fields: [listing_id], references: [id], onDelete: SetNull) |
| activities | activities[] |
| appointments | appointments[] |

---

## document_signatures

| Field | Type |
|-------|------|
| id | String             @id @default(cuid()) |
| status | SignatureStatus    @default(PENDING) |
| signed_at | DateTime? |
| signature_data | String?            @db.Text |
| ip_address | String? |
| user_agent | String? |
| auth_method | String? |
| decline_reason | String?            @db.Text |
| document_id | String |
| signer_id | String |
| request_id | String |
| document | documents          @relation(fields: [document_id], references: [id], onDelete: Cascade) |
| signer | loop_parties       @relation(fields: [signer_id], references: [id]) |
| request | signature_requests @relation(fields: [request_id], references: [id], onDelete: Cascade) |

---

## document_versions

| Field | Type |
|-------|------|
| id | String    @id @default(cuid()) |
| version_number | Int |
| storage_key | String |
| file_size | Int |
| created_at | DateTime  @default(now()) |
| created_by | String |
| document_id | String |
| creator | users     @relation(fields: [created_by], references: [id]) |
| document | documents @relation(fields: [document_id], references: [id], onDelete: Cascade) |

---

## documents

| Field | Type |
|-------|------|
| id | String                @id @default(cuid()) |
| filename | String |
| original_name | String |
| mime_type | String |
| file_size | Int |
| storage_key | String                @unique |
| version | Int                   @default(1) |
| status | DocumentStatus        @default(DRAFT) |
| category | String? |
| created_at | DateTime              @default(now()) |
| updated_at | DateTime              @updatedAt |
| loop_id | String |
| uploaded_by | String |
| loop | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| uploader | users                 @relation(fields: [uploaded_by], references: [id]) |
| signatures | document_signatures[] |
| versions | document_versions[] |

---

## email_campaigns

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| campaign_id | String? |
| campaign | campaigns? @relation(fields: [campaign_id], references: [id]) |
| subject | String |
| preheader | String? |
| content | String  @db.Text |
| plain_text | String? @db.Text |
| from_name | String |
| from_email | String |
| reply_to | String? |
| audience_segment | Json? |
| scheduled_for | DateTime? |
| sent_at | DateTime? |
| sent | Int @default(0) |
| delivered | Int @default(0) |
| opened | Int @default(0) |
| clicked | Int @default(0) |
| bounced | Int @default(0) |
| unsubscribed | Int @default(0) |
| status | EmailStatus @default(DRAFT) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users  @relation(fields: [created_by], references: [id]) |

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

## expense_categories

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| description | String? |
| is_deductible | Boolean @default(true) |
| tax_code | String? |
| is_active | Boolean @default(true) |
| sort_order | Int     @default(0) |
| is_system | Boolean @default(false) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String? |
| organization | organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## expense_reports

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| name | String |
| report_type | ReportType |
| start_date | DateTime |
| end_date | DateTime |
| categories | String[] @default([]) // Category IDs to include |
| listings | String[] @default([]) // Listing IDs to include |
| merchants | String[] @default([]) // Specific merchants |
| report_data | Json    @db.JsonB |
| total_expenses | Decimal @db.Decimal(12, 2) |
| total_deductible | Decimal @db.Decimal(12, 2) |
| pdf_url | String? // Generated PDF URL |
| csv_url | String? // Generated CSV URL |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String |
| creator | users  @relation("ExpenseReportCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |

---

## expenses

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
| date | DateTime |
| merchant | String |
| category | ExpenseCategory |
| amount | Decimal         @db.Decimal(12, 2) // Amount in dollars |
| listing_id | String? |
| listing | listings? @relation(fields: [listing_id], references: [id], onDelete: SetNull) |
| notes | String?   @db.Text |
| is_deductible | Boolean @default(true) |
| tax_category | String? |
| receipt_url | String? |
| receipt_name | String? |
| receipt_type | String? // image/pdf |
| status | ExpenseStatus @default(PENDING) |
| reviewed_at | DateTime? |
| reviewed_by_id | String? |
| reviewer | users?        @relation("ExpenseReviewer", fields: [reviewed_by_id], references: [id], onDelete: SetNull) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String |
| creator | users     @relation("ExpenseCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |
| receipt | receipts? |

---

## feature_flags

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String  @unique |
| description | String? @db.Text |
| is_enabled | Boolean @default(false) |
| rollout_percent | Float   @default(0) // 0-100 percentage rollout |
| target_tiers | SubscriptionTier[] @default([]) |
| target_orgs | String[]           @default([]) // Specific organization IDs |
| target_users | String[]           @default([]) // Specific user IDs |
| conditions | Json? @db.JsonB // Complex targeting conditions |
| environment | Environment @default(PRODUCTION) |
| category | String? // Feature category |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| created_by | String |
| creator | users  @relation("CreatedFeatureFlags", fields: [created_by], references: [id], onDelete: Cascade) |

---

## goal_conversions

| Field | Type |
|-------|------|
| id | String          @id @default(cuid()) |
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
| id | String         @id @default(cuid()) |
| name | String |
| email | String? |
| phone | String? |
| company | String? |
| source | LeadSource     @default(WEBSITE) |
| status | LeadStatus     @default(NEW_LEAD) |
| score | LeadScore      @default(COLD) |
| score_value | Int            @default(0) |
| budget | Decimal?       @db.Decimal(12, 2) |
| timeline | String? |
| notes | String?        @db.Text |
| tags | String[]       @default([]) |
| custom_fields | Json?          @db.JsonB |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| last_contact_at | DateTime? |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| assigned_to | users?         @relation("LeadAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull) |
| activities | activities[] |
| deals | deals[] |
| appointments | appointments[] |

---

## legacy_content

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
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
| updated_at | DateTime      @updatedAt |
| users | users         @relation("LegacyContent", fields: [author_id], references: [id]) |
| organizations | organizations @relation("LegacyContent", fields: [organization_id], references: [id], onDelete: Cascade) |

---

## listings

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| title | String |
| description | String?        @db.Text |
| address | String |
| city | String |
| state | String |
| zip_code | String |
| country | String         @default("USA") |
| property_type | PropertyType   @default(RESIDENTIAL) |
| bedrooms | Int? |
| bathrooms | Decimal?       @db.Decimal(3, 1) |
| square_feet | Int? |
| lot_size | Decimal?       @db.Decimal(10, 2) |
| year_built | Int? |
| price | Decimal        @db.Decimal(12, 2) |
| price_per_sqft | Decimal?       @db.Decimal(10, 2) |
| status | ListingStatus  @default(ACTIVE) |
| mls_number | String? |
| listing_date | DateTime? |
| expiration_date | DateTime? |
| images | String[]       @default([]) |
| virtual_tour_url | String? |
| features | String[]       @default([]) |
| notes | String?        @db.Text |
| tags | String[]       @default([]) |
| custom_fields | Json?          @db.JsonB |
| organization_id | String |
| assigned_to_id | String? |
| created_at | DateTime       @default(now()) |
| updated_at | DateTime       @updatedAt |
| organizations | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| assigned_to | users?         @relation("ListingAgent", fields: [assigned_to_id], references: [id], onDelete: SetNull) |
| deals | deals[] |
| activities | activities[] |
| appointments | appointments[] |
| expenses | expenses[] |

---

## loop_parties

| Field | Type |
|-------|------|
| id | String                @id @default(cuid()) |
| name | String |
| email | String |
| phone | String? |
| role | PartyRole |
| permissions | Json |
| status | PartyStatus           @default(ACTIVE) |
| invited_at | DateTime              @default(now()) |
| joined_at | DateTime? |
| loop_id | String |
| loop | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| signatures | document_signatures[] |
| assigned_tasks | transaction_tasks[] |

---

## market_reports

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| title | String |
| description | String?        @db.Text |
| report_type | ReidReportType |
| area_codes | String[] @default([]) |
| date_range | Json // Start and end dates |
| filters | Json // Applied filters |
| summary | String? @db.Text |
| insights | Json // Key insights and findings |
| charts | Json // Chart configurations |
| tables | Json // Table data |
| pdf_url | String? |
| csv_url | String? |
| is_public | Boolean @default(false) |
| share_token | String? @unique |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String |
| creator | users  @relation("ReportCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |

---

## marketplace_tools

| Field | Type |
|-------|------|
| id | String       @id @default(cuid()) |
| name | String |
| description | String       @db.Text |
| category | ToolCategory |
| tier | ToolTier |
| price | Int // Price in cents |
| is_active | Boolean      @default(true) |
| features | String[] @default([]) |
| capabilities | String[] @default([]) |
| integrations | String[] @default([]) |
| purchase_count | Int      @default(0) |
| rating | Decimal? @db.Decimal(3, 2) // 0.00 to 5.00 |
| icon | String? // Icon name or image URL |
| tags | String[] @default([]) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| purchases | tool_purchases[] |
| reviews | tool_reviews[] |
| bundles | bundle_tools[] |

---

## media_assets

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| name | String |
| original_name | String |
| file_name | String |
| file_url | String |
| mime_type | String |
| file_size | Int |
| width | Int? |
| height | Int? |
| duration | Float? |
| alt | String? |
| caption | String? |
| folder_id | String? |
| folder | media_folders? @relation(fields: [folder_id], references: [id]) |
| usage_count | Int       @default(0) |
| last_used | DateTime? |
| uploaded_at | DateTime @default(now()) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| uploaded_by | String |
| uploader | users  @relation(fields: [uploaded_by], references: [id]) |

---

## media_folders

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| name | String |
| path | String |
| parent_id | String? |
| parent | media_folders?  @relation("FolderHierarchy", fields: [parent_id], references: [id]) |
| children | media_folders[] @relation("FolderHierarchy") |
| created_at | DateTime @default(now()) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users          @relation(fields: [created_by], references: [id]) |
| assets | media_assets[] |

---

## neighborhood_insights

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| area_code | String // Zip code or district identifier |
| area_name | String // Neighborhood name |
| area_type | AreaType @default(ZIP) |
| market_data | Json // Market analysis data |
| median_price | Decimal? @db.Decimal(12, 2) |
| days_on_market | Int? |
| inventory | Int? |
| price_change | Float? // Percentage change |
| demographics | Json // Demographic analysis |
| median_age | Float? |
| median_income | Decimal? @db.Decimal(12, 2) |
| households | Int? |
| commute_time | Float? // Average in minutes |
| amenities | Json // Amenities data |
| school_rating | Float? // 1-10 scale |
| walk_score | Int? // 0-100 |
| bike_score | Int? // 0-100 |
| crime_index | Float? // Safety metric |
| park_proximity | Float? // Distance in miles |
| latitude | Float? |
| longitude | Float? |
| boundary | Json? // GeoJSON polygon |
| roi_analysis | Json? // ROI calculation data |
| rent_yield | Float? |
| appreciation_rate | Float? |
| investment_grade | String? // A, B, C, D rating |
| ai_profile | String?  @db.Text |
| ai_insights | String[] @default([]) |
| data_source | String[] @default([]) |
| last_updated | DateTime @default(now()) |
| data_quality | Float? // 0-1 confidence score |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String? |
| creator | users?            @relation("InsightCreator", fields: [created_by_id], references: [id], onDelete: SetNull) |
| alerts | property_alerts[] |

---

## notifications

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
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
| updated_at | DateTime         @updatedAt |
| organizations | organizations    @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users            @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## onboarding_sessions

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| session_token | String @unique |
| current_step | Int @default(1) |
| total_steps | Int @default(4) |
| org_name | String? |
| org_website | String? |
| org_description | String? @db.Text |
| selected_tier | SubscriptionTier? |
| billing_cycle | BillingCycle? // MONTHLY, YEARLY |
| stripe_payment_intent_id | String? |
| payment_status | PaymentStatus @default(PENDING) |
| is_completed | Boolean   @default(false) |
| completed_at | DateTime? |
| expires_at | DateTime // Session timeout (24 hours) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| user_id | String? // User who started onboarding |
| user | users?         @relation("OnboardingSessions", fields: [user_id], references: [id], onDelete: SetNull) |
| organization_id | String? // Created organization |
| organization | organizations? @relation("OnboardingSessions", fields: [organization_id], references: [id], onDelete: SetNull) |

---

## order_milestones

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| order_id | String |
| name | String    @db.VarChar(100) |
| description | String?   @db.Text |
| stage | String    @db.VarChar(50) |
| due_date | DateTime? |
| completed_at | DateTime? |
| is_completed | Boolean   @default(false) |
| sort_order | Int      @default(0) |
| created_at | DateTime @default(now()) |
| order | custom_agent_orders @relation(fields: [order_id], references: [id], onDelete: Cascade) |

---

## organization_members

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| user_id | String |
| organization_id | String |
| role | OrgRole       @default(MEMBER) |
| permissions | Json? |
| joined_at | DateTime      @default(now()) |
| created_at | DateTime      @default(now()) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [user_id], references: [id], onDelete: Cascade) |

---

## organization_tool_configs

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| organization_id | String |
| tool_id | String |
| industry | Industry |
| enabled | Boolean       @default(false) |
| settings | Json          @default("{ |

---

## organizations

| Field | Type |
|-------|------|
| id | String                      @id @default(cuid()) |
| name | String |
| slug | String                      @unique |
| description | String? |
| settings | Json? |
| subscription_status | SubscriptionStatus          @default(TRIAL) |
| billing_email | String? |
| created_at | DateTime                    @default(now()) |
| updated_at | DateTime                    @updatedAt |
| activity_logs | activity_logs[] |
| ai_conversations | ai_conversations[] |
| appointments | appointments[] |
| attachments | attachments[] |
| legacy_content | legacy_content[]            @relation("LegacyContent") |
| conversations | conversations[] |
| customers | customers[] |
| notifications | notifications[] |
| organization_members | organization_members[] |
| organization_tool_configs | organization_tool_configs[] |
| projects | projects[] |
| subscriptions | subscriptions? |
| usage_tracking | usage_tracking[] |
| transaction_loops | transaction_loops[] |
| workflow_templates | workflows[] |
| transaction_audit_logs | transaction_audit_logs[] |
| leads | leads[] |
| contacts | contacts[] |
| deals | deals[] |
| listings | listings[] |
| activities | activities[] |
| content | content_items[] |
| content_categories | content_categories[] |
| content_tags | content_tags[] |
| media_assets | media_assets[] |
| media_folders | media_folders[] |
| campaigns | campaigns[] |
| email_campaigns | email_campaigns[] |
| social_posts | social_media_posts[] |
| content_comments | content_comments[] |
| onboarding_sessions | onboarding_sessions[] @relation("OnboardingSessions") |
| expenses | expenses[] |
| expense_categories | expense_categories[] |
| tax_estimates | tax_estimates[] |
| expense_reports | expense_reports[] |
| dashboard_widgets | dashboard_widgets[] |
| activity_feeds | activity_feeds[] |
| quick_actions | quick_actions[] |
| dashboard_metrics | dashboard_metrics[] |
| neighborhood_insights | neighborhood_insights[] |
| property_alerts | property_alerts[] |
| market_reports | market_reports[] |
| tool_purchases | tool_purchases[] |
| bundle_purchases | bundle_purchases[] |
| tool_reviews | tool_reviews[] |
| shopping_carts | shopping_carts[] |
| agent_orders | custom_agent_orders[] |
| agent_templates | agent_templates[] |
| tool_blueprints | tool_blueprints[] |
| template_reviews | template_reviews[] |
| project_showcases | project_showcases[] |

---

## page_views

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
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
| id | String   @id @default(cuid()) |
| date | DateTime @unique @default(now()) |
| total_users | Int @default(0) |
| active_users | Int @default(0) // Active in last 30 days |
| new_users | Int @default(0) // New signups today |
| total_orgs | Int @default(0) |
| active_orgs | Int @default(0) // Active in last 30 days |
| new_orgs | Int @default(0) // New orgs today |
| mrr_cents | BigInt @default(0) // Monthly Recurring Revenue in cents |
| arr_cents | BigInt @default(0) // Annual Recurring Revenue in cents |
| churn_rate | Float  @default(0) // Monthly churn rate |
| free_count | Int @default(0) |
| starter_count | Int @default(0) |
| growth_count | Int @default(0) |
| elite_count | Int @default(0) |
| enterprise_count | Int @default(0) |
| total_storage | BigInt @default(0) // Storage used in bytes |
| api_calls | Int    @default(0) // API calls today |
| created_at | DateTime @default(now()) |

---

## project_showcases

| Field | Type |
|-------|------|
| id | String           @id @default(cuid()) |
| title | String           @db.VarChar(100) |
| description | String           @db.Text |
| category | ShowcaseCategory |
| image_url | String?  @db.VarChar(500) |
| demo_url | String?  @db.VarChar(500) |
| features | String[] @default([]) |
| technologies | String[] @default([]) |
| views | Int     @default(0) |
| likes | Int     @default(0) |
| is_public | Boolean @default(false) |
| is_featured | Boolean @default(false) |
| organization_id | String |
| created_by_id | String |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users         @relation("ShowcaseCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |

---

## projects

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
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
| updated_at | DateTime      @updatedAt |
| customers | customers?    @relation(fields: [customer_id], references: [id]) |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| users | users         @relation(fields: [project_manager_id], references: [id]) |
| tasks | tasks[] |

---

## property_alerts

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| description | String? @db.Text |
| alert_type | AlertType |
| criteria | Json // Alert criteria and thresholds |
| is_active | Boolean   @default(true) |
| area_codes | String[] @default([]) |
| radius | Float? // Radius in miles |
| latitude | Float? |
| longitude | Float? |
| email_enabled | Boolean        @default(true) |
| sms_enabled | Boolean        @default(false) |
| frequency | AlertFrequency @default(DAILY) |
| last_triggered | DateTime? |
| trigger_count | Int       @default(0) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String |
| creator | users                   @relation("AlertCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |
| insights | neighborhood_insights[] |
| triggers | alert_triggers[] |

---

## quick_actions

| Field | Type |
|-------|------|
| id | String  @id @default(cuid()) |
| name | String |
| description | String? |
| icon | String // Icon identifier |
| action_type | ActionType |
| target_url | String? // For navigation actions |
| api_endpoint | String? // For API actions |
| form_config | Json? // For form actions |
| color | String  @default("blue") |
| is_enabled | Boolean @default(true) |
| sort_order | Int     @default(0) |
| required_role | String[] // Required roles to see action |
| required_tier | String[] // Required subscription tiers |
| usage_count | Int       @default(0) |
| last_used | DateTime? |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String? |
| organization | organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String? |
| creator | users?  @relation("QuickActionCreator", fields: [created_by], references: [id]) |

---

## receipts

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
| expense_id | String   @unique |
| expense | expenses @relation(fields: [expense_id], references: [id], onDelete: Cascade) |
| original_name | String |
| file_name | String // Stored filename |
| file_url | String // Supabase Storage URL |
| file_size | Int |
| mime_type | String |
| extracted_data | Json?     @db.JsonB // OCR extracted text and data |
| processed_at | DateTime? |
| uploaded_at | DateTime @default(now()) |

---

## shopping_carts

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| tools | Json @default("[]") @db.JsonB // Array of tool IDs |
| bundles | Json @default("[]") @db.JsonB // Array of bundle IDs |
| total_price | Int  @default(0) // Total price in cents |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user_id | String @unique |
| user | users  @relation("ShoppingCart", fields: [user_id], references: [id], onDelete: Cascade) |

---

## signature_requests

| Field | Type |
|-------|------|
| id | String                @id @default(cuid()) |
| title | String |
| message | String?               @db.Text |
| status | SignatureStatus       @default(PENDING) |
| signing_order | SigningOrder          @default(PARALLEL) |
| expires_at | DateTime? |
| completed_at | DateTime? |
| created_at | DateTime              @default(now()) |
| updated_at | DateTime              @updatedAt |
| loop_id | String |
| requested_by | String |
| loop | transaction_loops     @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| requester | users                 @relation(fields: [requested_by], references: [id]) |
| signatures | document_signatures[] |

---

## social_media_posts

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| campaign_id | String? |
| campaign | campaigns? @relation(fields: [campaign_id], references: [id]) |
| content | String   @db.Text |
| media_urls | String[] |
| platforms | SocialPlatform[] |
| scheduled_for | DateTime? |
| published_at | DateTime? |
| platform_metrics | Json? |
| status | PostStatus @default(DRAFT) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users  @relation(fields: [created_by], references: [id]) |

---

## subscriptions

| Field | Type |
|-------|------|
| id | String             @id @default(cuid()) |
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
| updated_at | DateTime           @updatedAt |
| organizations | organizations      @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## system_alerts

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| title | String |
| message | String @db.Text |
| level | AlertLevel    @default(INFO) |
| category | AlertCategory |
| is_global | Boolean            @default(false) // Show to all users |
| target_roles | UserRole[]         @default([]) // Target specific roles |
| target_tiers | SubscriptionTier[] @default([]) // Target specific tiers |
| target_orgs | String[]           @default([]) // Specific organizations |
| is_dismissible | Boolean @default(true) |
| auto_hide_after | Int? // Auto-hide after X seconds |
| starts_at | DateTime  @default(now()) |
| ends_at | DateTime? |
| view_count | Int @default(0) |
| dismiss_count | Int @default(0) |
| is_active | Boolean @default(true) |
| is_archived | Boolean @default(false) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| created_by | String |
| creator | users  @relation("CreatedSystemAlerts", fields: [created_by], references: [id], onDelete: Cascade) |

---

## tasks

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
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
| updated_at | DateTime   @updatedAt |
| users_tasks_assigned_toTousers | users?     @relation("tasks_assigned_toTousers", fields: [assigned_to], references: [id]) |
| users_tasks_created_byTousers | users      @relation("tasks_created_byTousers", fields: [created_by], references: [id]) |
| tasks | tasks?     @relation("tasksTotasks", fields: [parent_task_id], references: [id]) |
| other_tasks | tasks[]    @relation("tasksTotasks") |
| projects | projects   @relation(fields: [project_id], references: [id], onDelete: Cascade) |

---

## tax_estimates

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| year | Int |
| quarter | Int? // 1-4 for quarterly estimates |
| total_income | Decimal @db.Decimal(12, 2) |
| business_income | Decimal @db.Decimal(12, 2) |
| other_income | Decimal @db.Decimal(12, 2) |
| total_deductions | Decimal @db.Decimal(12, 2) |
| business_deductions | Decimal @db.Decimal(12, 2) |
| standard_deduction | Decimal @db.Decimal(12, 2) |
| taxable_income | Decimal @db.Decimal(12, 2) |
| estimated_tax | Decimal @db.Decimal(12, 2) |
| tax_rate | Float // Effective tax rate |
| paid_amount | Decimal   @default(0) @db.Decimal(12, 2) |
| due_date | DateTime? |
| is_paid | Boolean   @default(false) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by_id | String |
| creator | users  @relation("TaxEstimateCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |

---

## template_reviews

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| template_id | String |
| rating | Int // 1-5 stars |
| review | String? @db.Text |
| organization_id | String |
| reviewer_id | String |
| created_at | DateTime @default(now()) |
| template | agent_templates @relation(fields: [template_id], references: [id], onDelete: Cascade) |
| organizations | organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| reviewer | users           @relation("TemplateReviewer", fields: [reviewer_id], references: [id], onDelete: Cascade) |

---

## tool_blueprints

| Field | Type |
|-------|------|
| id | String         @id @default(cuid()) |
| name | String         @db.VarChar(100) |
| description | String         @db.Text |
| category | AIToolCategory |
| components | Json @db.JsonB |
| connections | Json @db.JsonB |
| configuration | Json @db.JsonB |
| version | String          @default("1.0.0") @db.VarChar(20) |
| tags | String[]        @default([]) |
| complexity | ComplexityLevel |
| usage_count | Int     @default(0) |
| is_public | Boolean @default(false) |
| organization_id | String |
| created_by_id | String |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| organizations | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users         @relation("BlueprintCreator", fields: [created_by_id], references: [id], onDelete: Cascade) |

---

## tool_bundles

| Field | Type |
|-------|------|
| id | String     @id @default(cuid()) |
| name | String |
| description | String     @db.Text |
| bundle_type | BundleType |
| original_price | Int // Sum of individual tool prices |
| bundle_price | Int // Discounted bundle price |
| discount | Decimal    @db.Decimal(5, 2) // Discount percentage |
| is_active | Boolean @default(true) |
| is_popular | Boolean @default(false) |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |
| tools | bundle_tools[] |
| purchases | bundle_purchases[] |

---

## tool_purchases

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| tool_id | String |
| tool | marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade) |
| price_at_purchase | Int // Price when purchased (in cents) |
| purchase_date | DateTime       @default(now()) |
| status | PurchaseStatus @default(ACTIVE) |
| last_used | DateTime? |
| usage_count | Int       @default(0) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| purchased_by | String |
| purchaser | users  @relation("ToolPurchases", fields: [purchased_by], references: [id], onDelete: Cascade) |

---

## tool_reviews

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| tool_id | String |
| tool | marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade) |
| rating | Int // 1-5 stars |
| review | String? @db.Text |
| created_at | DateTime @default(now()) |
| organization_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| reviewer_id | String |
| reviewer | users  @relation("ToolReviews", fields: [reviewer_id], references: [id], onDelete: Cascade) |

---

## transaction_audit_logs

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
| action | String |
| entity_type | String |
| entity_id | String |
| old_values | Json? |
| new_values | Json? |
| ip_address | String? |
| user_agent | String? |
| timestamp | DateTime      @default(now()) |
| user_id | String |
| organization_id | String |
| user | users         @relation(fields: [user_id], references: [id]) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---

## transaction_loops

| Field | Type |
|-------|------|
| id | String               @id @default(cuid()) |
| property_address | String |
| transaction_type | TransactionType |
| listing_price | Decimal              @db.Decimal(12, 2) |
| status | LoopStatus           @default(DRAFT) |
| expected_closing | DateTime? |
| actual_closing | DateTime? |
| progress | Int                  @default(0) |
| created_at | DateTime             @default(now()) |
| updated_at | DateTime             @updatedAt |
| organization_id | String |
| created_by | String |
| organizations | organizations        @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users                @relation(fields: [created_by], references: [id]) |
| documents | documents[] |
| parties | loop_parties[] |
| transaction_tasks | transaction_tasks[] |
| signatures | signature_requests[] |
| workflows | workflows[] |

---

## transaction_tasks

| Field | Type |
|-------|------|
| id | String            @id @default(cuid()) |
| title | String |
| description | String?           @db.Text |
| status | TaskStatus        @default(TODO) |
| priority | TaskPriority      @default(MEDIUM) |
| due_date | DateTime? |
| completed_at | DateTime? |
| created_at | DateTime          @default(now()) |
| updated_at | DateTime          @updatedAt |
| loop_id | String |
| assigned_to | String? |
| created_by | String |
| loop | transaction_loops @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| assignee | loop_parties?     @relation(fields: [assigned_to], references: [id], onDelete: SetNull) |
| creator | users             @relation(fields: [created_by], references: [id]) |

---

## usage_tracking

| Field | Type |
|-------|------|
| id | String        @id @default(cuid()) |
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

## user_dashboards

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| user_id | String @unique |
| user | users  @relation(fields: [user_id], references: [id]) |
| layout | Json // Dashboard layout configuration |
| widgets | String[] // Widget IDs in display order |
| theme | DashboardTheme @default(LIGHT) |
| density | LayoutDensity  @default(NORMAL) |
| auto_refresh | Boolean        @default(true) |
| quick_actions | String[] // Quick action button IDs |
| pinned_modules | String[] // Pinned module shortcuts |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |

---

## user_preferences

| Field | Type |
|-------|------|
| id | String @id @default(cuid()) |
| user_id | String @unique |
| user | users  @relation(fields: [user_id], references: [id], onDelete: Cascade) |
| default_area_codes | String[] @default([]) |
| dashboard_layout | Json // Module positions and sizes |
| theme | String @default("dark") // dark/light |
| chart_type | String @default("line") |
| map_style | String @default("dark") |
| email_digest | Boolean @default(true) |
| sms_alerts | Boolean @default(false) |
| digest_frequency | String  @default("weekly") |
| price_format | String @default("USD") |
| area_unit | String @default("sqft") |
| date_format | String @default("MM/DD/YYYY") |
| created_at | DateTime @default(now()) |
| updated_at | DateTime @updatedAt |

---

## user_sessions

| Field | Type |
|-------|------|
| id | String    @id @default(cuid()) |
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
| id | String                   @id @default(cuid()) |
| clerk_user_id | String?                  @unique |
| email | String                   @unique |
| name | String? |
| avatar_url | String? |
| role | UserRole                 @default(USER) |
| subscription_tier | SubscriptionTier         @default(STARTER) |
| is_active | Boolean                  @default(true) |
| created_at | DateTime                 @default(now()) |
| updated_at | DateTime                 @updatedAt |
| activity_logs | activity_logs[] |
| ai_conversations | ai_conversations[] |
| appointments | appointments[] |
| attachments | attachments[] |
| legacy_content | legacy_content[]         @relation("LegacyContent") |
| customers | customers[] |
| notifications | notifications[] |
| organization_members | organization_members[] |
| projects | projects[] |
| tasks_tasks_assigned_toTousers | tasks[]                  @relation("tasks_assigned_toTousers") |
| tasks_tasks_created_byTousers | tasks[]                  @relation("tasks_created_byTousers") |
| transaction_loops | transaction_loops[] |
| uploaded_documents | documents[] |
| created_document_versions | document_versions[] |
| requested_signatures | signature_requests[] |
| created_transaction_tasks | transaction_tasks[] |
| created_workflows | workflows[] |
| transaction_audit_logs | transaction_audit_logs[] |
| assigned_leads | leads[]                  @relation("LeadAssignedTo") |
| assigned_contacts | contacts[]               @relation("ContactAssignedTo") |
| assigned_deals | deals[]                  @relation("DealAssignedTo") |
| assigned_listings | listings[]               @relation("ListingAgent") |
| created_activities | activities[]             @relation("ActivityCreatedBy") |
| authored_content | content_items[]      @relation("ContentAuthor") |
| content_categories | content_categories[] |
| media_assets | media_assets[] |
| media_folders | media_folders[] |
| campaigns | campaigns[] |
| email_campaigns | email_campaigns[] |
| social_posts | social_media_posts[] |
| content_revisions | content_revisions[] |
| content_comments | content_comments[] |
| admin_actions | admin_action_logs[]   @relation("AdminActions") |
| onboarding_sessions | onboarding_sessions[] @relation("OnboardingSessions") |
| created_feature_flags | feature_flags[]       @relation("CreatedFeatureFlags") |
| created_system_alerts | system_alerts[]       @relation("CreatedSystemAlerts") |
| created_expenses | expenses[]        @relation("ExpenseCreator") |
| reviewed_expenses | expenses[]        @relation("ExpenseReviewer") |
| created_tax_estimates | tax_estimates[]   @relation("TaxEstimateCreator") |
| created_expense_reports | expense_reports[] @relation("ExpenseReportCreator") |
| dashboard_widgets | dashboard_widgets[] @relation("DashboardWidgetCreator") |
| user_dashboard | user_dashboards? |
| activity_feeds | activity_feeds[]    @relation("ActivityFeedUser") |
| quick_actions | quick_actions[]     @relation("QuickActionCreator") |
| dashboard_metrics | dashboard_metrics[] @relation("DashboardMetricCreator") |
| reid_insights_created | neighborhood_insights[] @relation("InsightCreator") |
| reid_alerts_created | property_alerts[]       @relation("AlertCreator") |
| reid_reports_created | market_reports[]        @relation("ReportCreator") |
| reid_preferences | user_preferences? |
| tool_purchases | tool_purchases[]   @relation("ToolPurchases") |
| bundle_purchases | bundle_purchases[] @relation("BundlePurchases") |
| tool_reviews | tool_reviews[]     @relation("ToolReviews") |
| shopping_cart | shopping_carts?    @relation("ShoppingCart") |
| agent_orders_created | custom_agent_orders[] @relation("OrderCreator") |
| agent_orders_assigned | custom_agent_orders[] @relation("OrderAssignee") |
| agent_templates_created | agent_templates[]     @relation("TemplateCreator") |
| tool_blueprints_created | tool_blueprints[]     @relation("BlueprintCreator") |
| template_reviews_created | template_reviews[]    @relation("TemplateReviewer") |
| project_showcases_created | project_showcases[]   @relation("ShowcaseCreator") |

---

## web_vitals_metrics

| Field | Type |
|-------|------|
| id | String   @id @default(cuid()) |
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
| id | String             @id @default(cuid()) |
| name | String |
| description | String?            @db.Text |
| is_template | Boolean            @default(false) |
| steps | Json |
| status | WorkflowStatus     @default(ACTIVE) |
| created_at | DateTime           @default(now()) |
| updated_at | DateTime           @updatedAt |
| loop_id | String? |
| created_by | String |
| organization_id | String? |
| loop | transaction_loops? @relation(fields: [loop_id], references: [id], onDelete: Cascade) |
| creator | users              @relation(fields: [created_by], references: [id]) |
| organization | organizations?     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |

---
