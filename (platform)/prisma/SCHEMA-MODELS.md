# Prisma Schema - Models Documentation

**Generated:** 2025-10-11T00:05:10.918Z
**Source:** `(platform)/prisma/schema.prisma`

> 📚 **Purpose:** Detailed model field reference
> - Use this when you need to know: "What fields does X have?"
> - For quick lookup, see: `SCHEMA-QUICK-REF.md`

**Total Models:** 80

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

## agent_executions

| Field | Type |
|-------|------|
| id | String               @id |
| agent_id | String |
| agent | ai_agents            @relation(fields: [agent_id], references: [id], onDelete: Cascade) |
| workflow_execution_id | String? |
| workflow_execution | workflow_executions? @relation(fields: [workflow_execution_id], references: [id], onDelete: SetNull) |
| task | String               @db.Text |
| input | Json                 @db.JsonB |
| output | Json?                @db.JsonB |
| status | ExecutionStatus      @default(PENDING) |
| started_at | DateTime             @default(now()) |
| completed_at | DateTime? |
| duration | Int? |
| tokens_used | Int                  @default(0) |
| cost | Decimal              @default(0) @db.Decimal(12, 2) |
| model | String?              @db.VarChar(100) |
| provider | String?              @db.VarChar(50) |

---

## agent_teams

| Field | Type |
|-------|------|
| id | String          @id |
| name | String          @db.VarChar(100) |
| description | String?         @db.Text |
| structure | TeamStructure |
| coordination | Json            @db.JsonB |
| execution_count | Int             @default(0) |
| success_rate | Float? |
| created_at | DateTime        @default(now()) |
| updated_at | DateTime        @updatedAt |
| organization_id | String |
| organization | organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users           @relation("AgentTeamCreator", fields: [created_by], references: [id], onDelete: Cascade) |
| members | team_members[] |
| executions | team_executions[] |

---

## ai_agents

| Field | Type |
|-------|------|
| id | String             @id |
| name | String             @db.VarChar(100) |
| description | String?            @db.Text |
| avatar | String?            @db.VarChar(500) |
| personality | Json               @db.JsonB |
| model_config | Json               @db.JsonB |
| capabilities | String[]           @default([]) |
| memory | Json               @db.JsonB |
| execution_count | Int                @default(0) |
| success_rate | Float? |
| avg_response_time | Float? |
| is_active | Boolean            @default(true) |
| status | AgentStatus        @default(IDLE) |
| created_at | DateTime           @default(now()) |
| updated_at | DateTime           @updatedAt |
| organization_id | String |
| organization | organizations      @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users              @relation("AIAgentCreator", fields: [created_by], references: [id], onDelete: Cascade) |
| team_members | team_members[] |
| executions | agent_executions[] |

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

## alert_triggers

| Field | Type |
|-------|------|
| id | String          @id @default(uuid()) |
| alert_id | String |
| triggered_at | DateTime        @default(now()) @db.Timestamp(6) |
| trigger_data | Json            @db.JsonB |
| notification_sent | Boolean         @default(false) |
| alert | property_alerts @relation(fields: [alert_id], references: [id], onDelete: Cascade) |

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

## automation_workflows

| Field | Type |
|-------|------|
| id | String                @id |
| name | String                @db.VarChar(100) |
| description | String?               @db.Text |
| nodes | Json                  @db.JsonB |
| edges | Json                  @db.JsonB |
| variables | Json?                 @db.JsonB |
| is_active | Boolean               @default(true) |
| version | String                @default("1.0.0") @db.VarChar(20) |
| tags | String[]              @default([]) |
| execution_count | Int                   @default(0) |
| last_executed | DateTime? |
| template_id | String? |
| template | workflow_templates?   @relation(fields: [template_id], references: [id], onDelete: SetNull) |
| created_at | DateTime              @default(now()) |
| updated_at | DateTime              @updatedAt |
| organization_id | String |
| organization | organizations         @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users                 @relation("AutomationWorkflowCreator", fields: [created_by], references: [id], onDelete: Cascade) |
| executions | workflow_executions[] |

---

## campaign_content

| Field | Type |
|-------|------|
| id | String        @id @default(uuid()) |
| campaign_id | String |
| content_id | String |
| organization_id | String |
| position | Int           @default(0) |
| is_primary | Boolean       @default(false) |
| notes | String?       @db.Text |
| linked_at | DateTime      @default(now()) @db.Timestamp(6) |
| linked_by | String |
| campaign | campaigns     @relation(fields: [campaign_id], references: [id], onDelete: Cascade) |
| content | content       @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| linker | users         @relation("CampaignContentLinker", fields: [linked_by], references: [id]) |

---

## campaigns

| Field | Type |
|-------|------|
| id | String              @id @default(uuid()) |
| organization_id | String |
| name | String              @db.VarChar(200) |
| description | String?             @db.Text |
| slug | String              @db.VarChar(255) |
| type | CampaignType |
| status | CampaignStatus      @default(DRAFT) |
| start_date | DateTime?           @db.Timestamp(6) |
| end_date | DateTime?           @db.Timestamp(6) |
| created_at | DateTime            @default(now()) @db.Timestamp(6) |
| updated_at | DateTime            @updatedAt @db.Timestamp(6) |
| goals | Json?               @db.JsonB |
| budget | Decimal?            @db.Decimal(12, 2) |
| budget_spent | Decimal             @default(0) @db.Decimal(12, 2) |
| metrics | Json?               @db.JsonB |
| created_by | String |
| tags | String[]            @default([]) |
| is_archived | Boolean             @default(false) |
| organization | organizations       @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users               @relation("CampaignCreator", fields: [created_by], references: [id]) |
| email_campaigns | email_campaigns[] |
| social_media_posts | social_media_posts[] |
| campaign_content | campaign_content[] |

---

## commissions

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| organization_id | String |
| agent_id | String |
| deal_id | String? |
| transaction_loop_id | String? |
| commission_type | String    @db.VarChar(50) |
| gross_commission | Decimal   @db.Decimal(12, 2) |
| agent_split_percent | Decimal   @db.Decimal(5, 2) |
| agent_commission | Decimal   @db.Decimal(12, 2) |
| splits | Json?     @db.JsonB |
| broker_split | Decimal?  @db.Decimal(12, 2) |
| referral_fee | Decimal?  @db.Decimal(12, 2) |
| status | String    @db.VarChar(50) |
| expected_pay_date | DateTime? @db.Date |
| paid_date | DateTime? @db.Date |
| payment_method | String?   @db.VarChar(50) |
| invoice_number | String?   @db.VarChar(100) |
| property_address | String?   @db.VarChar(500) |
| sale_price | Decimal?  @db.Decimal(12, 2) |
| close_date | DateTime? @db.Date |
| notes | String?   @db.Text |
| tags | String[]  @default([]) |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| updated_at | DateTime  @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| agent | users @relation("CommissionEarner", fields: [agent_id], references: [id]) |
| deal | deals? @relation(fields: [deal_id], references: [id]) |
| transaction_loop | transaction_loops? @relation(fields: [transaction_loop_id], references: [id]) |

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
| view_count | Int           @default(0) |
| share_count | Int           @default(0) |
| like_count | Int           @default(0) |
| comment_count | Int           @default(0) |
| category_id | String? |
| meta_title | String? |
| meta_description | String? |
| keywords | String[]      @default([]) |
| featured_image | String? |
| users | users                   @relation(fields: [author_id], references: [id]) |
| organizations | organizations           @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| category | content_categories?     @relation(fields: [category_id], references: [id], onDelete: SetNull) |
| campaign_content | campaign_content[] |
| tags | content_tag_relations[] |
| comments | content_comments[] |
| revisions | content_revisions[] |

---

## content_categories

| Field | Type |
|-------|------|
| id | String        @id @default(uuid()) |
| organization_id | String |
| name | String        @db.VarChar(100) |
| slug | String        @db.VarChar(100) |
| description | String?       @db.Text |
| parent_id | String? |
| color | String?       @db.VarChar(7) |
| icon | String?       @db.VarChar(50) |
| is_active | Boolean       @default(true) |
| created_at | DateTime      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime      @updatedAt @db.Timestamp(6) |
| organization | organizations          @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| parent | content_categories?    @relation("CategoryHierarchy", fields: [parent_id], references: [id], onDelete: SetNull) |
| children | content_categories[]   @relation("CategoryHierarchy") |
| content | content[] |

---

## content_comments

| Field | Type |
|-------|------|
| id | String         @id @default(uuid()) |
| content_id | String |
| author_id | String |
| comment | String         @db.Text |
| parent_id | String? |
| status | CommentStatus  @default(PENDING) |
| created_at | DateTime       @default(now()) @db.Timestamp(6) |
| updated_at | DateTime       @updatedAt @db.Timestamp(6) |
| content | content            @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| author | users              @relation("ContentCommentAuthor", fields: [author_id], references: [id], onDelete: Cascade) |
| parent | content_comments?  @relation("CommentReplies", fields: [parent_id], references: [id], onDelete: SetNull) |
| replies | content_comments[] @relation("CommentReplies") |

---

## content_revisions

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| content_id | String |
| version | Int |
| title | String |
| content_body | String    @db.Text |
| excerpt | String?   @db.Text |
| created_by | String |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| content | content   @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| creator | users     @relation("ContentRevisionCreator", fields: [created_by], references: [id], onDelete: Cascade) |

---

## content_tag_relations

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| content_id | String |
| tag_id | String |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| content | content      @relation(fields: [content_id], references: [id], onDelete: Cascade) |
| tag | content_tags @relation(fields: [tag_id], references: [id], onDelete: Cascade) |

---

## content_tags

| Field | Type |
|-------|------|
| id | String        @id @default(uuid()) |
| organization_id | String |
| name | String        @db.VarChar(50) |
| slug | String        @db.VarChar(50) |
| color | String?       @db.VarChar(7) |
| created_at | DateTime      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime      @updatedAt @db.Timestamp(6) |
| organization | organizations           @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| content_relations | content_tag_relations[] |

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
| commissions | commissions[] |
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

## email_campaigns

| Field | Type |
|-------|------|
| id | String         @id @default(uuid()) |
| campaign_id | String |
| organization_id | String |
| name | String         @db.VarChar(200) |
| subject | String         @db.VarChar(255) |
| preview_text | String?        @db.VarChar(255) |
| body_html | String         @db.Text |
| body_plaintext | String?        @db.Text |
| from_name | String         @db.VarChar(100) |
| from_email | String         @db.VarChar(255) |
| reply_to | String?        @db.VarChar(255) |
| recipient_lists | String[]       @default([]) |
| recipient_count | Int            @default(0) |
| scheduled_at | DateTime?      @db.Timestamp(6) |
| sent_at | DateTime?      @db.Timestamp(6) |
| status | EmailStatus    @default(DRAFT) |
| total_sent | Int            @default(0) |
| total_delivered | Int            @default(0) |
| total_opened | Int            @default(0) |
| total_clicked | Int            @default(0) |
| total_bounced | Int            @default(0) |
| total_unsubscribed | Int            @default(0) |
| open_rate | Decimal?       @db.Decimal(5, 2) |
| click_rate | Decimal?       @db.Decimal(5, 2) |
| is_ab_test | Boolean        @default(false) |
| ab_test_config | Json?          @db.JsonB |
| created_at | DateTime       @default(now()) @db.Timestamp(6) |
| updated_at | DateTime       @updatedAt @db.Timestamp(6) |
| created_by | String |
| campaign | campaigns      @relation(fields: [campaign_id], references: [id], onDelete: Cascade) |
| organization | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users          @relation("EmailCampaignCreator", fields: [created_by], references: [id]) |

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
| id | String         @id @default(uuid()) |
| organization_id | String?        // NULL = system category, non-NULL = custom |
| name | String         @db.VarChar(100) |
| code | String         @db.VarChar(50) |
| description | String?        @db.Text |
| irs_category | String?        @db.VarChar(100) |
| default_deductible | Boolean        @default(true) |
| deduction_limit | Decimal?       @db.Decimal(5, 2) |
| color | String?        @db.VarChar(7) |
| icon | String?        @db.VarChar(50) |
| is_active | Boolean        @default(true) |
| is_system | Boolean        @default(false) |
| created_at | DateTime       @default(now()) @db.Timestamp(6) |
| updated_at | DateTime       @updatedAt @db.Timestamp(6) |
| organization | organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| expenses | expenses[] |

---

## expenses

| Field | Type |
|-------|------|
| id | String            @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| date | DateTime          @db.Timestamp(6) |
| merchant | String            @db.VarChar(255) |
| amount | Decimal           @db.Decimal(10, 2) |
| currency | String            @default("USD") @db.VarChar(3) |
| category_id | String |
| description | String?           @db.Text |
| notes | String?           @db.Text |
| listing_id | String? |
| is_deductible | Boolean           @default(true) |
| deduction_percent | Int               @default(100) |
| tax_year | Int |
| mileage_start | String?           @db.VarChar(500) |
| mileage_end | String?           @db.VarChar(500) |
| mileage_distance | Decimal?          @db.Decimal(8, 2) |
| mileage_purpose | String?           @db.VarChar(500) |
| quickbooks_id | String?           @unique |
| quickbooks_synced | DateTime?         @db.Timestamp(6) |
| status | ExpenseStatus     @default(PENDING) |
| approved_by | String? |
| approved_at | DateTime?         @db.Timestamp(6) |
| created_at | DateTime          @default(now()) @db.Timestamp(6) |
| updated_at | DateTime          @updatedAt @db.Timestamp(6) |
| organization | organizations     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users             @relation("ExpenseCreator", fields: [user_id], references: [id]) |
| category | expense_categories @relation(fields: [category_id], references: [id]) |
| listing | listings?         @relation(fields: [listing_id], references: [id], onDelete: SetNull) |
| approver | users?            @relation("ExpenseApprover", fields: [approved_by], references: [id]) |
| receipts | receipts[] |

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

## integrations

| Field | Type |
|-------|------|
| id | String            @id |
| name | String            @db.VarChar(100) |
| provider | String            @db.VarChar(50) |
| credentials | Json              @db.JsonB |
| config | Json              @db.JsonB |
| is_active | Boolean           @default(true) |
| last_tested | DateTime? |
| status | IntegrationStatus @default(DISCONNECTED) |
| created_at | DateTime          @default(now()) |
| updated_at | DateTime          @updatedAt |
| organization_id | String |
| organization | organizations     @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String |
| creator | users             @relation("IntegrationCreator", fields: [created_by], references: [id], onDelete: Cascade) |

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
| open_house_attendees | open_house_attendees[] |
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
| open_houses | open_houses[] |
| expenses | expenses[] |
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

## market_reports

| Field | Type |
|-------|------|
| id | String          @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| name | String          @db.VarChar(200) |
| description | String?         @db.Text |
| report_type | ReidReportType |
| status | ContentStatus   @default(DRAFT) |
| area_type | AreaType? |
| zip_codes | String[]        @default([]) |
| cities | String[]        @default([]) |
| states | String[]        @default([]) |
| date_range_start | DateTime?       @db.Date |
| date_range_end | DateTime?       @db.Date |
| configuration | Json?           @db.JsonB |
| data | Json?           @db.JsonB |
| insights | Json?           @db.JsonB |
| file_path | String?         @db.VarChar(500) |
| file_size | Int? |
| file_format | String?         @db.VarChar(20) |
| is_public | Boolean         @default(false) |
| shared_with_users | String[]        @default([]) |
| public_url | String?         @unique @db.VarChar(500) |
| share_token | String?         @unique @db.VarChar(100) |
| expires_at | DateTime?       @db.Timestamp(6) |
| is_template | Boolean         @default(false) |
| template_id | String? |
| schedule | Json?           @db.JsonB |
| view_count | Int             @default(0) |
| download_count | Int             @default(0) |
| last_viewed_at | DateTime?       @db.Timestamp(6) |
| tags | String[]        @default([]) |
| generated_at | DateTime?       @db.Timestamp(6) |
| created_at | DateTime        @default(now()) @db.Timestamp(6) |
| updated_at | DateTime        @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users @relation("MarketReportCreator", fields: [user_id], references: [id]) |

---

## marketplace_bundle_items

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| bundle_id | String |
| tool_id | String |
| position | Int      @default(0) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| bundle | marketplace_bundles @relation(fields: [bundle_id], references: [id], onDelete: Cascade) |
| tool | marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade) |

---

## marketplace_bundles

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| name | String   @db.VarChar(100) |
| description | String   @db.Text |
| long_description | String?  @db.Text |
| price_amount | Decimal  @db.Decimal(10, 2) |
| currency | String   @default("USD") @db.VarChar(3) |
| discount_percent | Int |
| required_tier | SubscriptionTier |
| status | BundleStatus @default(ACTIVE) |
| is_featured | Boolean  @default(false) |
| is_popular | Boolean  @default(false) |
| icon_url | String?  @db.VarChar(500) |
| images | String[] @default([]) |
| purchase_count | Int      @default(0) |
| view_count | Int      @default(0) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| updated_at | DateTime @updatedAt @db.Timestamp(6) |
| items | marketplace_bundle_items[] |
| purchases | marketplace_purchases[] |
| cart_items | marketplace_cart[] |

---

## marketplace_cart

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| tool_id | String? |
| bundle_id | String? |
| item_type | CartItemType |
| quantity | Int      @default(1) |
| added_at | DateTime @default(now()) @db.Timestamp(6) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| updated_at | DateTime @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users @relation(fields: [user_id], references: [id], onDelete: Cascade) |
| tool | marketplace_tools? @relation(fields: [tool_id], references: [id], onDelete: Cascade) |
| bundle | marketplace_bundles? @relation(fields: [bundle_id], references: [id], onDelete: Cascade) |

---

## marketplace_purchases

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| tool_id | String? |
| bundle_id | String? |
| purchase_type | PurchaseType |
| amount | Decimal  @db.Decimal(10, 2) |
| currency | String   @default("USD") @db.VarChar(3) |
| payment_method | PaymentMethod |
| payment_status | PaymentStatus @default(PENDING) |
| stripe_payment_id | String?  @unique @db.VarChar(255) |
| stripe_invoice_id | String?  @db.VarChar(255) |
| is_subscription | Boolean  @default(false) |
| subscription_start | DateTime? @db.Timestamp(6) |
| subscription_end | DateTime? @db.Timestamp(6) |
| auto_renew | Boolean  @default(false) |
| status | PurchaseStatus @default(ACTIVE) |
| activated_at | DateTime? @db.Timestamp(6) |
| cancelled_at | DateTime? @db.Timestamp(6) |
| refunded_at | DateTime? @db.Timestamp(6) |
| usage_count | Int      @default(0) |
| last_used_at | DateTime? @db.Timestamp(6) |
| purchase_date | DateTime @default(now()) @db.Timestamp(6) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| updated_at | DateTime @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users @relation(fields: [user_id], references: [id]) |
| tool | marketplace_tools? @relation(fields: [tool_id], references: [id]) |
| bundle | marketplace_bundles? @relation(fields: [bundle_id], references: [id]) |

---

## marketplace_reviews

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| tool_id | String |
| organization_id | String |
| user_id | String |
| rating | Int |
| title | String?  @db.VarChar(200) |
| review | String?  @db.Text |
| verified_purchase | Boolean  @default(false) |
| helpful_count | Int      @default(0) |
| flagged_count | Int      @default(0) |
| status | ReviewStatus @default(PENDING) |
| moderated_at | DateTime? @db.Timestamp(6) |
| moderated_by | String? |
| moderation_notes | String?   @db.Text |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| updated_at | DateTime @updatedAt @db.Timestamp(6) |
| tool | marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users @relation(fields: [user_id], references: [id], onDelete: Cascade) |
| moderator | users? @relation("ReviewModerator", fields: [moderated_by], references: [id]) |

---

## marketplace_tools

| Field | Type |
|-------|------|
| id | String   @id @default(uuid()) |
| name | String   @db.VarChar(100) |
| description | String   @db.Text |
| long_description | String?  @db.Text |
| category | ToolCategory |
| tags | String[] @default([]) |
| price_model | PriceModel |
| price_amount | Decimal  @default(0) @db.Decimal(10, 2) |
| currency | String   @default("USD") @db.VarChar(3) |
| required_tier | SubscriptionTier |
| features | Json     @db.JsonB |
| tech_stack | Json?    @db.JsonB |
| integration_type | IntegrationType |
| status | ToolStatus @default(ACTIVE) |
| is_featured | Boolean  @default(false) |
| is_popular | Boolean  @default(false) |
| provider | String   @db.VarChar(100) |
| documentation_url | String?  @db.VarChar(500) |
| demo_url | String?  @db.VarChar(500) |
| support_url | String?  @db.VarChar(500) |
| icon_url | String?  @db.VarChar(500) |
| images | String[] @default([]) |
| video_url | String?  @db.VarChar(500) |
| version | String   @default("1.0.0") @db.VarChar(20) |
| last_updated | DateTime @updatedAt @db.Timestamp(6) |
| purchase_count | Int      @default(0) |
| view_count | Int      @default(0) |
| avg_rating | Float?   @db.Real |
| review_count | Int      @default(0) |
| created_at | DateTime @default(now()) @db.Timestamp(6) |
| updated_at | DateTime @updatedAt @db.Timestamp(6) |
| reviews | marketplace_reviews[] |
| purchases | marketplace_purchases[] |
| bundle_items | marketplace_bundle_items[] |
| cart_items | marketplace_cart[] |

---

## neighborhood_insights

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| organization_id | String |
| area_name | String    @db.VarChar(200) |
| area_code | String    @db.VarChar(50) |
| area_type | AreaType |
| zip_code | String?   @db.VarChar(10) |
| city | String?   @db.VarChar(100) |
| state | String?   @db.VarChar(2) |
| county | String?   @db.VarChar(100) |
| median_price | Decimal?  @db.Decimal(12, 2) |
| avg_price | Decimal?  @db.Decimal(12, 2) |
| price_per_sqft | Decimal?  @db.Decimal(10, 2) |
| price_change | Float? |
| days_on_market | Int? |
| inventory | Int? |
| median_age | Float? |
| median_income | Decimal?  @db.Decimal(12, 2) |
| households | Int? |
| school_rating | Float? |
| walk_score | Int? |
| bike_score | Int? |
| crime_index | String?   @db.VarChar(50) |
| park_proximity | Float? |
| commute_time | Int? |
| rent_yield | Float? |
| appreciation_rate | Float? |
| investment_grade | String?   @db.VarChar(20) |
| data_source | String?   @db.VarChar(100) |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| updated_at | DateTime  @updatedAt @db.Timestamp(6) |
| created_by_id | String |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users @relation("NeighborhoodInsightCreator", fields: [created_by_id], references: [id]) |
| alerts | property_alerts[] |

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

## open_house_attendees

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| open_house_id | String |
| name | String    @db.VarChar(200) |
| email | String?   @db.VarChar(255) |
| phone | String?   @db.VarChar(50) |
| attended | Boolean   @default(false) |
| feedback | String?   @db.Text |
| interest_level | String?   @db.VarChar(20) |
| converted_to_lead | Boolean   @default(false) |
| lead_id | String? |
| registered_at | DateTime  @default(now()) @db.Timestamp(6) |
| checked_in_at | DateTime? @db.Timestamp(6) |
| open_house | open_houses @relation(fields: [open_house_id], references: [id], onDelete: Cascade) |
| lead | leads? @relation(fields: [lead_id], references: [id]) |

---

## open_houses

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| organization_id | String |
| listing_id | String |
| host_agent_id | String |
| title | String    @db.VarChar(200) |
| description | String?   @db.Text |
| start_time | DateTime  @db.Timestamp(6) |
| end_time | DateTime  @db.Timestamp(6) |
| status | String    @db.VarChar(50) |
| registration_required | Boolean @default(false) |
| max_attendees | Int? |
| attendee_count | Int       @default(0) |
| lead_count | Int       @default(0) |
| marketing_materials | Json?     @db.JsonB |
| flyer_url | String?   @db.VarChar(500) |
| social_media_posts | Json?     @db.JsonB |
| feedback_collected | Json?     @db.JsonB |
| success_rating | Int? |
| notes | String?   @db.Text |
| tags | String[]  @default([]) |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| updated_at | DateTime  @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| listing | listings @relation(fields: [listing_id], references: [id], onDelete: Cascade) |
| host_agent | users @relation("OpenHouseHost", fields: [host_agent_id], references: [id]) |
| attendees | open_house_attendees[] |

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
| ai_agents | ai_agents[] |
| agent_teams | agent_teams[] |
| automation_workflows | automation_workflows[] |
| integrations | integrations[] |
| workflow_templates | workflow_templates[] |
| marketplace_purchases | marketplace_purchases[] |
| marketplace_cart | marketplace_cart[] |
| marketplace_reviews | marketplace_reviews[] |
| neighborhood_insights | neighborhood_insights[] |
| property_alerts | property_alerts[] |
| market_reports | market_reports[] |
| reid_roi_simulations | reid_roi_simulations[] |
| reid_ai_profiles | reid_ai_profiles[] |
| open_houses | open_houses[] |
| commissions | commissions[] |
| expense_categories | expense_categories[] |
| expenses | expenses[] |
| receipts | receipts[] |
| tax_estimates | tax_estimates[] |
| tax_reports | tax_reports[] |
| campaigns | campaigns[] |
| email_campaigns | email_campaigns[] |
| social_media_posts | social_media_posts[] |
| campaign_content | campaign_content[] |
| content_categories | content_categories[] |
| content_tags | content_tags[] |

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

## property_alerts

| Field | Type |
|-------|------|
| id | String          @id @default(uuid()) |
| organization_id | String |
| user_id | String? |
| name | String          @db.VarChar(200) |
| description | String?         @db.Text |
| alert_type | AlertType |
| is_active | Boolean         @default(true) |
| area_type | AreaType? |
| zip_codes | String[]        @default([]) |
| cities | String[]        @default([]) |
| states | String[]        @default([]) |
| conditions | Json            @db.JsonB |
| frequency | AlertFrequency |
| delivery_channels | String[]        @default([]) |
| last_triggered_at | DateTime?       @db.Timestamp(6) |
| trigger_count | Int             @default(0) |
| priority | Priority        @default(MEDIUM) |
| email_addresses | String[]        @default([]) |
| webhook_url | String?         @db.VarChar(500) |
| tags | String[]        @default([]) |
| created_at | DateTime        @default(now()) @db.Timestamp(6) |
| updated_at | DateTime        @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users? @relation("PropertyAlertCreator", fields: [user_id], references: [id]) |
| insight | neighborhood_insights? @relation(fields: [insight_id], references: [id]) |
| triggers | alert_triggers[] |
| insight_id | String? |

---

## receipts

| Field | Type |
|-------|------|
| id | String      @id @default(uuid()) |
| organization_id | String |
| expense_id | String |
| file_name | String      @db.VarChar(255) |
| file_url | String      @db.VarChar(500) |
| file_type | String      @db.VarChar(50) |
| file_size_bytes | BigInt |
| ocr_text | String?     @db.Text |
| ocr_confidence | Decimal?    @db.Decimal(5, 2) |
| ocr_processed_at | DateTime?   @db.Timestamp(6) |
| ocr_metadata | Json?       @db.JsonB |
| merchant_name | String?     @db.VarChar(255) |
| receipt_date | DateTime?   @db.Timestamp(6) |
| receipt_total | Decimal?    @db.Decimal(10, 2) |
| is_verified | Boolean     @default(false) |
| verified_by | String? |
| verified_at | DateTime?   @db.Timestamp(6) |
| created_at | DateTime    @default(now()) @db.Timestamp(6) |
| updated_at | DateTime    @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| expense | expenses    @relation(fields: [expense_id], references: [id], onDelete: Cascade) |
| verifier | users?      @relation("ReceiptVerifier", fields: [verified_by], references: [id]) |

---

## reid_ai_profiles

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| organization_id | String |
| user_id | String? |
| profile_type | String    @db.VarChar(50) |
| target_type | String?   @db.VarChar(50) |
| address | String?   @db.VarChar(500) |
| zip_code | String?   @db.VarChar(10) |
| city | String?   @db.VarChar(100) |
| state | String?   @db.VarChar(2) |
| county | String?   @db.VarChar(100) |
| neighborhood | String?   @db.VarChar(200) |
| latitude | Decimal?  @db.Decimal(10, 8) |
| longitude | Decimal?  @db.Decimal(11, 8) |
| summary | String    @db.Text |
| detailed_analysis | String    @db.Text |
| strengths | Json      @db.JsonB |
| weaknesses | Json      @db.JsonB |
| opportunities | Json      @db.JsonB |
| overall_score | Float? |
| investment_score | Float? |
| lifestyle_score | Float? |
| growth_potential | Float? |
| risk_score | Float? |
| metrics | Json?     @db.JsonB |
| recommendations | Json?     @db.JsonB |
| data_sources | String[]  @default([]) |
| ai_model | AIModel   @default(KIMIK2) |
| model_version | String?   @db.VarChar(50) |
| confidence_score | Float? |
| is_public | Boolean   @default(false) |
| is_verified | Boolean   @default(false) |
| verified_by | String? |
| verified_at | DateTime? @db.Timestamp(6) |
| view_count | Int       @default(0) |
| last_viewed_at | DateTime? @db.Timestamp(6) |
| expires_at | DateTime? @db.Timestamp(6) |
| last_refreshed_at | DateTime? @db.Timestamp(6) |
| tags | String[]  @default([]) |
| notes | String?   @db.Text |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| updated_at | DateTime  @updatedAt @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users? @relation("AIProfileCreator", fields: [user_id], references: [id], onDelete: SetNull) |

---

## reid_roi_simulations

| Field | Type |
|-------|------|
| id | String    @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| name | String    @db.VarChar(200) |
| description | String?   @db.Text |
| property_address | String?   @db.VarChar(500) |
| zip_code | String?   @db.VarChar(10) |
| city | String?   @db.VarChar(100) |
| state | String?   @db.VarChar(2) |
| inputs | Json      @db.JsonB |
| results | Json      @db.JsonB |
| scenario_type | String?   @db.VarChar(50) |
| parent_simulation_id | String? |
| is_shared | Boolean   @default(false) |
| shared_with_users | String[]  @default([]) |
| is_template | Boolean   @default(false) |
| template_category | String?   @db.VarChar(100) |
| calculation_version | String?   @db.VarChar(20) |
| tags | String[]  @default([]) |
| notes | String?   @db.Text |
| created_at | DateTime  @default(now()) @db.Timestamp(6) |
| updated_at | DateTime  @updatedAt @db.Timestamp(6) |
| last_viewed_at | DateTime? @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users @relation("ROISimulationCreator", fields: [user_id], references: [id]) |
| parent_simulation | reid_roi_simulations? @relation("SimulationScenarios", fields: [parent_simulation_id], references: [id], onDelete: SetNull) |
| child_scenarios | reid_roi_simulations[] @relation("SimulationScenarios") |

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

## social_media_posts

| Field | Type |
|-------|------|
| id | String         @id @default(uuid()) |
| campaign_id | String |
| organization_id | String |
| title | String?        @db.VarChar(200) |
| post_text | String         @db.Text |
| hashtags | String[]       @default([]) |
| mentions | String[]       @default([]) |
| platform | SocialPlatform |
| platform_config | Json?          @db.JsonB |
| media_urls | String[]       @default([]) |
| media_metadata | Json?          @db.JsonB |
| link_url | String?        @db.VarChar(500) |
| link_preview | Json?          @db.JsonB |
| scheduled_at | DateTime?      @db.Timestamp(6) |
| published_at | DateTime?      @db.Timestamp(6) |
| status | PostStatus     @default(DRAFT) |
| external_post_id | String?        @db.VarChar(255) |
| external_url | String?        @db.VarChar(500) |
| impressions | Int            @default(0) |
| reach | Int            @default(0) |
| likes | Int            @default(0) |
| comments | Int            @default(0) |
| shares | Int            @default(0) |
| clicks | Int            @default(0) |
| engagement_rate | Decimal?       @db.Decimal(5, 2) |
| is_carousel | Boolean        @default(false) |
| is_video | Boolean        @default(false) |
| is_story | Boolean        @default(false) |
| is_reel | Boolean        @default(false) |
| created_at | DateTime       @default(now()) @db.Timestamp(6) |
| updated_at | DateTime       @updatedAt @db.Timestamp(6) |
| created_by | String |
| campaign | campaigns      @relation(fields: [campaign_id], references: [id], onDelete: Cascade) |
| organization | organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| creator | users          @relation("SocialPostCreator", fields: [created_by], references: [id]) |

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

## tax_estimates

| Field | Type |
|-------|------|
| id | String        @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| tax_year | Int |
| quarter | Int? |
| period_start | DateTime      @db.Date |
| period_end | DateTime      @db.Date |
| total_income | Decimal       @db.Decimal(12, 2) |
| total_expenses | Decimal       @db.Decimal(12, 2) |
| total_deductions | Decimal       @db.Decimal(12, 2) |
| net_income | Decimal       @db.Decimal(12, 2) |
| estimated_tax_rate | Decimal       @db.Decimal(5, 2) |
| federal_tax_estimated | Decimal       @db.Decimal(12, 2) |
| state_tax_estimated | Decimal       @db.Decimal(12, 2) |
| self_employment_tax | Decimal       @db.Decimal(12, 2) |
| total_tax_estimated | Decimal       @db.Decimal(12, 2) |
| amount_paid | Decimal       @db.Decimal(12, 2) @default(0) |
| payment_due_date | DateTime?     @db.Date |
| payment_status | PaymentStatus @default(PENDING) |
| quickbooks_id | String?       @unique |
| quickbooks_synced | DateTime?     @db.Timestamp(6) |
| calculation_method | String        @db.VarChar(50) |
| assumptions | Json?         @db.JsonB |
| created_at | DateTime      @default(now()) @db.Timestamp(6) |
| updated_at | DateTime      @updatedAt @db.Timestamp(6) |
| calculated_at | DateTime      @default(now()) @db.Timestamp(6) |
| organization | organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users         @relation("TaxEstimateCreator", fields: [user_id], references: [id]) |

---

## tax_reports

| Field | Type |
|-------|------|
| id | String          @id @default(uuid()) |
| organization_id | String |
| user_id | String |
| name | String          @db.VarChar(255) |
| template_type | TaxReportType |
| tax_year | Int |
| period_start | DateTime?       @db.Date |
| period_end | DateTime?       @db.Date |
| status | TaxReportStatus @default(GENERATING) |
| file_url | String?         @db.VarChar(500) |
| file_format | String?         @db.VarChar(10) |
| file_size_bytes | BigInt? |
| total_income | Decimal?        @db.Decimal(12, 2) |
| total_expenses | Decimal?        @db.Decimal(12, 2) |
| total_deductions | Decimal?        @db.Decimal(12, 2) |
| categories_count | Int? |
| expenses_count | Int? |
| is_shared | Boolean         @default(false) |
| shared_with | Json?           @db.JsonB |
| share_expires_at | DateTime?       @db.Timestamp(6) |
| quickbooks_id | String?         @unique |
| quickbooks_synced | DateTime?       @db.Timestamp(6) |
| generated_at | DateTime?       @db.Timestamp(6) |
| generation_time_ms | Int? |
| template_version | String?         @default("1.0") @db.VarChar(10) |
| created_at | DateTime        @default(now()) @db.Timestamp(6) |
| updated_at | DateTime        @updatedAt @db.Timestamp(6) |
| organization | organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| user | users           @relation("TaxReportCreator", fields: [user_id], references: [id]) |

---

## team_executions

| Field | Type |
|-------|------|
| id | String          @id |
| team_id | String |
| team | agent_teams     @relation(fields: [team_id], references: [id], onDelete: Cascade) |
| task | String          @db.Text |
| pattern | TeamStructure |
| input | Json            @db.JsonB |
| output | Json?           @db.JsonB |
| status | ExecutionStatus @default(PENDING) |
| started_at | DateTime        @default(now()) |
| completed_at | DateTime? |
| duration | Int? |
| agent_results | Json[]          @default([]) |

---

## team_members

| Field | Type |
|-------|------|
| id | String      @id |
| team_id | String |
| team | agent_teams @relation(fields: [team_id], references: [id], onDelete: Cascade) |
| agent_id | String |
| agent | ai_agents   @relation(fields: [agent_id], references: [id], onDelete: Cascade) |
| role | TeamRole |
| priority | Int         @default(0) |
| joined_at | DateTime    @default(now()) |

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
| commissions | commissions[] |
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
| ai_agents | ai_agents[]              @relation("AIAgentCreator") |
| agent_teams | agent_teams[]            @relation("AgentTeamCreator") |
| automation_workflows | automation_workflows[]   @relation("AutomationWorkflowCreator") |
| integrations | integrations[]           @relation("IntegrationCreator") |
| workflow_templates | workflow_templates[]     @relation("WorkflowTemplateCreator") |
| marketplace_purchases | marketplace_purchases[] |
| marketplace_cart | marketplace_cart[] |
| marketplace_reviews | marketplace_reviews[] |
| moderated_reviews | marketplace_reviews[]    @relation("ReviewModerator") |
| neighborhood_insights_created | neighborhood_insights[]  @relation("NeighborhoodInsightCreator") |
| property_alerts_created | property_alerts[]        @relation("PropertyAlertCreator") |
| market_reports_created | market_reports[]         @relation("MarketReportCreator") |
| roi_simulations_created | reid_roi_simulations[]   @relation("ROISimulationCreator") |
| ai_profiles_created | reid_ai_profiles[]       @relation("AIProfileCreator") |
| open_houses_hosted | open_houses[]            @relation("OpenHouseHost") |
| commissions_earned | commissions[]            @relation("CommissionEarner") |
| expenses_created | expenses[]               @relation("ExpenseCreator") |
| expenses_approved | expenses[]               @relation("ExpenseApprover") |
| receipts_verified | receipts[]               @relation("ReceiptVerifier") |
| tax_estimates_created | tax_estimates[]          @relation("TaxEstimateCreator") |
| tax_reports_created | tax_reports[]            @relation("TaxReportCreator") |
| campaigns_created | campaigns[]              @relation("CampaignCreator") |
| email_campaigns_created | email_campaigns[]        @relation("EmailCampaignCreator") |
| social_posts_created | social_media_posts[]     @relation("SocialPostCreator") |
| campaign_content_linked | campaign_content[]       @relation("CampaignContentLinker") |
| content_comments_authored | content_comments[]       @relation("ContentCommentAuthor") |
| content_revisions_created | content_revisions[]      @relation("ContentRevisionCreator") |

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

## workflow_executions

| Field | Type |
|-------|------|
| id | String                 @id |
| workflow_id | String |
| workflow_type | String |
| automation_workflow | automation_workflows?  @relation(fields: [workflow_id], references: [id], onDelete: Cascade) |
| status | ExecutionStatus        @default(PENDING) |
| started_at | DateTime               @default(now()) |
| completed_at | DateTime? |
| duration | Int? |
| input | Json?                  @db.JsonB |
| output | Json?                  @db.JsonB |
| error | String?                @db.Text |
| logs | Json[]                 @default([]) |
| nodes_executed | Int                    @default(0) |
| tokens_used | Int                    @default(0) |
| cost | Decimal                @default(0) @db.Decimal(12, 2) |
| agent_executions | agent_executions[] |

---

## workflow_templates

| Field | Type |
|-------|------|
| id | String                 @id |
| name | String                 @db.VarChar(100) |
| description | String                 @db.Text |
| category | TemplateCategory |
| nodes | Json                   @db.JsonB |
| edges | Json                   @db.JsonB |
| variables | Json?                  @db.JsonB |
| icon | String?                @db.VarChar(100) |
| tags | String[]               @default([]) |
| difficulty | DifficultyLevel        @default(BEGINNER) |
| estimated_time | Int? |
| usage_count | Int                    @default(0) |
| rating | Float? |
| is_public | Boolean                @default(false) |
| is_featured | Boolean                @default(false) |
| created_at | DateTime               @default(now()) |
| updated_at | DateTime               @updatedAt |
| organization_id | String? |
| organization | organizations?         @relation(fields: [organization_id], references: [id], onDelete: Cascade) |
| created_by | String? |
| creator | users?                 @relation("WorkflowTemplateCreator", fields: [created_by], references: [id], onDelete: SetNull) |
| automation_workflows | automation_workflows[] |

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
