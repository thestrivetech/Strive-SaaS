# Prisma Schema - Quick Reference

**Generated:** 2025-10-11T00:05:10.911Z
**Source:** `(platform)/prisma/schema.prisma`

> 🎯 **Purpose:** Lightning-fast schema reference to avoid expensive MCP calls
> - Use this for: "What tables exist?", "What enums are available?"
> - For field details, see: `SCHEMA-MODELS.md`
> - For enum values, see: `SCHEMA-ENUMS.md`

---

## 📊 Statistics

- **Models:** 80
- **Enums:** 88
- **Total:** 168 types

---

## 📋 Models (80)

### Core (4)
```
organization_members
organizations
subscriptions
users
```

### CRM (4)
```
contacts
customers
deals
leads
```

### Transactions (9)
```
document_signatures
document_versions
documents
listings
loop_parties
signature_requests
transaction_audit_logs
transaction_loops
transaction_tasks
```

### Content & CMS (10)
```
campaign_content
campaigns
content
content_categories
content_comments
content_revisions
content_tag_relations
content_tags
email_campaigns
social_media_posts
```

### AI (6)
```
ai_agents
ai_conversations
ai_tools
conversations
example_conversations
reid_ai_profiles
```

### Analytics (6)
```
analytics_events
analytics_goals
goal_conversions
page_views
platform_metrics
web_vitals_metrics
```

### Marketplace (6)
```
marketplace_bundle_items
marketplace_bundles
marketplace_cart
marketplace_purchases
marketplace_reviews
marketplace_tools
```

### Admin (4)
```
admin_action_logs
feature_flags
onboarding_sessions
system_alerts
```

### Other (31)
```
activities
activity_logs
agent_executions
agent_teams
alert_triggers
appointments
attachments
automation_workflows
commissions
expense_categories
expenses
integrations
market_reports
neighborhood_insights
notifications
open_house_attendees
open_houses
projects
property_alerts
receipts
reid_roi_simulations
tasks
tax_estimates
tax_reports
team_executions
team_members
usage_tracking
user_sessions
workflow_executions
workflow_templates
workflows
```

---

## 🏷️ Enums (88)

```
SubscriptionTier
OrgRole
LeadSource
LeadStatus
LeadScore
DealStage
LoopStatus
TaskStatus
TaskPriority
PartyRole
SignatureStatus
PropertyType
ListingStatus
ToolCategory
ToolTier
BundleType
PurchaseStatus
ContentType
ContentStatus
CampaignType
CampaignStatus
ReportType
AlertType
AlertSeverity
ActionType
AppointmentStatus
ActivityType
AIContextType
AIModel
AdminAction
AlertCategory
AlertFrequency
AlertLevel
AppointmentType
AreaType
BillingCycle
CommentStatus
ContactStatus
ContactType
CustomerSource
CustomerStatus
DashboardActivitySeverity
DashboardActivityType
DashboardTheme
DealStatus
DocumentStatus
EmailStatus
Environment
ExpenseCategory
ExpenseStatus
Industry
LayoutDensity
MetricCategory
NotificationType
PartyStatus
PaymentStatus
PostStatus
Priority
ProjectStatus
ReidReportType
ResourceType
SigningOrder
SocialPlatform
SubscriptionStatus
ToolType
TransactionType
UserRole
WidgetType
WorkflowStatus
AgentStatus
TeamStructure
TeamRole
ExecutionStatus
IntegrationStatus
TemplateCategory
DifficultyLevel
PriceModel
IntegrationType
ToolStatus
BundleStatus
PaymentMethod
ReviewStatus
PurchaseType
CartItemType
TaxReportType
TaxReportStatus
QuarterEnum
CalculationMethod
```

---

## 📖 See Also

- **Field Details:** `SCHEMA-MODELS.md` - All models with fields and types
- **Enum Values:** `SCHEMA-ENUMS.md` - All enums with possible values
- **Full Schema:** `schema.prisma` - Complete Prisma schema definition