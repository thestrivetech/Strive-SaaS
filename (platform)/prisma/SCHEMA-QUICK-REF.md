# Prisma Schema - Quick Reference

**Generated:** 2025-10-10T20:40:33.745Z
**Source:** `(platform)/prisma/schema.prisma`

> 🎯 **Purpose:** Lightning-fast schema reference to avoid expensive MCP calls
> - Use this for: "What tables exist?", "What enums are available?"
> - For field details, see: `SCHEMA-MODELS.md`
> - For enum values, see: `SCHEMA-ENUMS.md`

---

## 📊 Statistics

- **Models:** 42
- **Enums:** 69
- **Total:** 111 types

---

## 📋 Models (42)

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

### Content & CMS (1)
```
content
```

### AI (4)
```
ai_conversations
ai_tools
conversations
example_conversations
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

### Admin (4)
```
admin_action_logs
feature_flags
onboarding_sessions
system_alerts
```

### Other (10)
```
activities
activity_logs
appointments
attachments
notifications
projects
tasks
usage_tracking
user_sessions
workflows
```

---

## 🏷️ Enums (69)

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
```

---

## 📖 See Also

- **Field Details:** `SCHEMA-MODELS.md` - All models with fields and types
- **Enum Values:** `SCHEMA-ENUMS.md` - All enums with possible values
- **Full Schema:** `schema.prisma` - Complete Prisma schema definition