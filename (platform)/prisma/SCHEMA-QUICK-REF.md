# Prisma Schema - Quick Reference

**Generated:** 2025-10-06T18:08:39.931Z
**Source:** `shared/prisma/schema.prisma`

> 🎯 **Purpose:** Lightning-fast schema reference to avoid expensive MCP calls
> - Use this for: "What tables exist?", "What enums are available?"
> - For field details, see: `SCHEMA-MODELS.md`
> - For enum values, see: `SCHEMA-ENUMS.md`

---

## 📊 Statistics

- **Models:** 83
- **Enums:** 76
- **Total:** 159 types

---

## 📋 Models (83)

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

### Content & CMS (12)
```
campaign_content
campaigns
content_categories
content_comments
content_items
content_revisions
content_tags
email_campaigns
legacy_content
media_assets
media_folders
social_media_posts
```

### AI (4)
```
ai_conversations
ai_tools
conversations
example_conversations
```

### Analytics (7)
```
analytics_events
analytics_goals
dashboard_metrics
goal_conversions
page_views
platform_metrics
web_vitals_metrics
```

### Marketplace (9)
```
bundle_purchases
bundle_tools
marketplace_tools
organization_tool_configs
shopping_carts
tool_blueprints
tool_bundles
tool_purchases
tool_reviews
```

### Admin (4)
```
admin_action_logs
feature_flags
onboarding_sessions
system_alerts
```

### Dashboard (4)
```
activity_feeds
dashboard_widgets
quick_actions
user_dashboards
```

### Other (26)
```
activities
activity_logs
agent_templates
alert_triggers
appointments
attachments
build_logs
custom_agent_orders
expense_categories
expense_reports
expenses
market_reports
neighborhood_insights
notifications
order_milestones
project_showcases
projects
property_alerts
receipts
tasks
tax_estimates
template_reviews
usage_tracking
user_preferences
user_sessions
workflows
```

---

## 🏷️ Enums (76)

```
AIContextType
AIModel
AppointmentStatus
AppointmentType
ContentStatus
ContentType
CustomerSource
CustomerStatus
NotificationType
OrgRole
Priority
ProjectStatus
ResourceType
SubscriptionStatus
SubscriptionTier
TaskStatus
ToolType
UserRole
Industry
LeadSource
LeadStatus
LeadScore
ContactType
ContactStatus
DealStage
DealStatus
PropertyType
ListingStatus
ActivityType
TransactionType
LoopStatus
DocumentStatus
SignatureStatus
SigningOrder
PartyRole
PartyStatus
TaskPriority
WorkflowStatus
ExpenseCategory
ExpenseStatus
ReportType
AdminAction
PaymentStatus
BillingCycle
Environment
AlertLevel
AlertCategory
CampaignType
CampaignStatus
EmailStatus
PostStatus
CommentStatus
SocialPlatform
ToolCategory
ToolTier
BundleType
PurchaseStatus
AreaType
AlertType
AlertFrequency
AlertSeverity
ReidReportType
WidgetType
DashboardTheme
LayoutDensity
DashboardActivityType
DashboardActivitySeverity
ActionType
MetricCategory
ComplexityLevel
OrderStatus
OrderPriority
AgentCategory
AIToolCategory
LogLevel
ShowcaseCategory
```

---

## 📖 See Also

- **Field Details:** `SCHEMA-MODELS.md` - All models with fields and types
- **Enum Values:** `SCHEMA-ENUMS.md` - All enums with possible values
- **Full Schema:** `schema.prisma` - Complete Prisma schema definition