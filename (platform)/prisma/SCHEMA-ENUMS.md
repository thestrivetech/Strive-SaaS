# Prisma Schema - Enums Documentation

**Generated:** 2025-10-11T00:05:10.920Z
**Source:** `(platform)/prisma/schema.prisma`

> 🏷️ **Purpose:** Complete enum values reference
> - Use this when you need to know: "What are the valid values for X enum?"
> - For quick lookup, see: `SCHEMA-QUICK-REF.md`

**Total Enums:** 88

---

## ActionType

```typescript
NAVIGATION
API_CALL
MODAL_FORM
EXTERNAL_LINK
WORKFLOW_TRIGGER
```

---

## ActivityType

```typescript
CALL
EMAIL
MEETING
TASK
NOTE
SHOWING
OPEN_HOUSE
FOLLOW_UP
```

---

## AdminAction

```typescript
USER_CREATE
USER_UPDATE
USER_SUSPEND
USER_DELETE
USER_IMPERSONATE
ORG_CREATE
ORG_UPDATE
ORG_SUSPEND
ORG_DELETE
SUBSCRIPTION_CREATE
SUBSCRIPTION_UPDATE
SUBSCRIPTION_CANCEL
FEATURE_FLAG_UPDATE
SYSTEM_CONFIG_UPDATE
DATA_EXPORT
BULK_ACTION
```

---

## AgentStatus

```typescript
IDLE
BUSY
OFFLINE
ERROR
```

---

## AIContextType

```typescript
GENERAL
PROJECT
CUSTOMER
TASK
```

---

## AIModel

```typescript
OPENAI_GPT4
CLAUDE_SONNET
GEMINI
GROK
KIMIK2
```

---

## AlertCategory

```typescript
SYSTEM
MAINTENANCE
FEATURE
SECURITY
BILLING
MARKETING
```

---

## AlertFrequency

```typescript
IMMEDIATE
DAILY
WEEKLY
MONTHLY
```

---

## AlertLevel

```typescript
INFO
WARNING
ERROR
SUCCESS
```

---

## AlertSeverity

```typescript
LOW
MEDIUM
HIGH
CRITICAL
```

---

## AlertType

```typescript
PRICE_DROP
PRICE_INCREASE
NEW_LISTING
SOLD
INVENTORY_CHANGE
MARKET_TREND
DEMOGRAPHIC_CHANGE
```

---

## AppointmentStatus

```typescript
SCHEDULED
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

---

## AppointmentType

```typescript
MEETING
CALL
SHOWING
OPEN_HOUSE
FOLLOW_UP
OTHER
```

---

## AreaType

```typescript
ZIP
SCHOOL_DISTRICT
NEIGHBORHOOD
COUNTY
MSA
```

---

## BillingCycle

```typescript
MONTHLY
YEARLY
```

---

## BundleStatus

```typescript
ACTIVE
ARCHIVED
DRAFT
```

---

## BundleType

```typescript
STARTER_PACK
GROWTH_PACK
ELITE_PACK
CUSTOM_PACK
```

---

## CalculationMethod

```typescript
STANDARD
SIMPLIFIED
CUSTOM
```

---

## CampaignStatus

```typescript
DRAFT
PLANNING
ACTIVE
PAUSED
COMPLETED
CANCELLED
```

---

## CampaignType

```typescript
CONTENT_MARKETING
EMAIL_MARKETING
SOCIAL_MEDIA
PAID_ADVERTISING
SEO_CAMPAIGN
LEAD_GENERATION
BRAND_AWARENESS
PRODUCT_LAUNCH
```

---

## CartItemType

```typescript
TOOL
BUNDLE
```

---

## CommentStatus

```typescript
PENDING
APPROVED
REJECTED
SPAM
```

---

## ContactStatus

```typescript
ACTIVE
INACTIVE
DO_NOT_CONTACT
```

---

## ContactType

```typescript
PROSPECT
CLIENT
PAST_CLIENT
PARTNER
VENDOR
```

---

## ContentStatus

```typescript
DRAFT
PUBLISHED
ARCHIVED
REVIEW
APPROVED
SCHEDULED
```

---

## ContentType

```typescript
PAGE
BLOG_POST
DOCUMENTATION
TEMPLATE
ARTICLE
LANDING_PAGE
EMAIL_TEMPLATE
SOCIAL_POST
PRESS_RELEASE
NEWSLETTER
CASE_STUDY
WHITEPAPER
```

---

## CustomerSource

```typescript
WEBSITE
REFERRAL
SOCIAL
EMAIL
OTHER
```

---

## CustomerStatus

```typescript
LEAD
PROSPECT
ACTIVE
CHURNED
```

---

## DashboardActivitySeverity

```typescript
INFO
SUCCESS
WARNING
ERROR
CRITICAL
```

---

## DashboardActivityType

```typescript
USER_ACTION
SYSTEM_EVENT
WORKFLOW_UPDATE
DATA_CHANGE
SECURITY_EVENT
INTEGRATION_EVENT
```

---

## DashboardTheme

```typescript
LIGHT
DARK
AUTO
```

---

## DealStage

```typescript
LEAD
QUALIFIED
PROPOSAL
NEGOTIATION
CLOSING
CLOSED_WON
CLOSED_LOST
```

---

## DealStatus

```typescript
ACTIVE
WON
LOST
ABANDONED
```

---

## DifficultyLevel

```typescript
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

---

## DocumentStatus

```typescript
DRAFT
PENDING
REVIEWED
SIGNED
ARCHIVED
```

---

## EmailStatus

```typescript
DRAFT
SCHEDULED
SENDING
SENT
FAILED
```

---

## Environment

```typescript
DEVELOPMENT
STAGING
PRODUCTION
```

---

## ExecutionStatus

```typescript
PENDING
RUNNING
COMPLETED
FAILED
CANCELLED
```

---

## ExpenseCategory

```typescript
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
```

---

## ExpenseStatus

```typescript
PENDING
APPROVED
REJECTED
NEEDS_REVIEW
```

---

## Industry

```typescript
REAL_ESTATE
HEALTHCARE
STRIVE
GENERAL
```

---

## IntegrationStatus

```typescript
CONNECTED
DISCONNECTED
ERROR
TESTING
```

---

## IntegrationType

```typescript
API
WEBHOOK
EMBED
STANDALONE
N8N_WORKFLOW
NATIVE
```

---

## LayoutDensity

```typescript
COMPACT
NORMAL
SPACIOUS
```

---

## LeadScore

```typescript
HOT
WARM
COLD
```

---

## LeadSource

```typescript
WEBSITE
REFERRAL
GOOGLE_ADS
SOCIAL_MEDIA
COLD_CALL
EMAIL_CAMPAIGN
EVENT
PARTNER
OTHER
```

---

## LeadStatus

```typescript
NEW_LEAD
IN_CONTACT
QUALIFIED
UNQUALIFIED
CONVERTED
LOST
```

---

## ListingStatus

```typescript
ACTIVE
PENDING
SOLD
EXPIRED
WITHDRAWN
CONTINGENT
```

---

## LoopStatus

```typescript
DRAFT
ACTIVE
UNDER_CONTRACT
CLOSING
CLOSED
CANCELLED
ARCHIVED
```

---

## MetricCategory

```typescript
FINANCIAL
OPERATIONAL
MARKETING
SALES
PRODUCTIVITY
SYSTEM
CUSTOM
```

---

## NotificationType

```typescript
INFO
SUCCESS
WARNING
ERROR
```

---

## OrgRole

```typescript
OWNER
ADMIN
MEMBER
VIEWER
```

---

## PartyRole

```typescript
BUYER
SELLER
BUYER_AGENT
LISTING_AGENT
LENDER
TITLE_COMPANY
INSPECTOR
APPRAISER
ATTORNEY
ESCROW_OFFICER
OTHER
```

---

## PartyStatus

```typescript
ACTIVE
INACTIVE
REMOVED
```

---

## PaymentMethod

```typescript
CREDIT_CARD
ACH
INVOICE
PLATFORM_CREDITS
```

---

## PaymentStatus

```typescript
PENDING
PROCESSING
SUCCEEDED
FAILED
CANCELLED
REQUIRES_ACTION
```

---

## PostStatus

```typescript
DRAFT
SCHEDULED
PUBLISHED
FAILED
```

---

## PriceModel

```typescript
FREE
ONE_TIME
MONTHLY
ANNUAL
USAGE_BASED
CUSTOM
```

---

## Priority

```typescript
LOW
MEDIUM
HIGH
CRITICAL
```

---

## ProjectStatus

```typescript
PLANNING
ACTIVE
ON_HOLD
COMPLETED
CANCELLED
```

---

## PropertyType

```typescript
RESIDENTIAL
COMMERCIAL
LAND
MULTI_FAMILY
CONDO
TOWNHOUSE
LUXURY
```

---

## PurchaseStatus

```typescript
ACTIVE
CANCELLED
REFUNDED
EXPIRED
```

---

## PurchaseType

```typescript
TOOL
BUNDLE
```

---

## QuarterEnum

```typescript
Q1
Q2
Q3
Q4
```

---

## ReidReportType

```typescript
NEIGHBORHOOD_ANALYSIS
MARKET_OVERVIEW
COMPARATIVE_STUDY
INVESTMENT_ANALYSIS
DEMOGRAPHIC_REPORT
CUSTOM
```

---

## ReportType

```typescript
MONTHLY
QUARTERLY
YEARLY
CUSTOM
TAX_SUMMARY
```

---

## ResourceType

```typescript
AI_TOKENS
API_CALLS
STORAGE
SEATS
```

---

## ReviewStatus

```typescript
PENDING
APPROVED
REJECTED
FLAGGED
```

---

## SignatureStatus

```typescript
PENDING
SENT
VIEWED
SIGNED
DECLINED
EXPIRED
```

---

## SigningOrder

```typescript
SEQUENTIAL
PARALLEL
```

---

## SocialPlatform

```typescript
FACEBOOK
TWITTER
INSTAGRAM
LINKEDIN
YOUTUBE
TIKTOK
PINTEREST
```

---

## SubscriptionStatus

```typescript
ACTIVE
INACTIVE
TRIAL
PAST_DUE
CANCELLED
```

---

## SubscriptionTier

```typescript
STARTER
GROWTH
ELITE
ENTERPRISE
FREE
CUSTOM
```

---

## TaskPriority

```typescript
LOW
MEDIUM
HIGH
URGENT
```

---

## TaskStatus

```typescript
TODO
IN_PROGRESS
REVIEW
DONE
CANCELLED
```

---

## TaxReportStatus

```typescript
GENERATING
COMPLETED
FAILED
EXPIRED
```

---

## TaxReportType

```typescript
FORM_1099_MISC
FORM_1099_NEC
SCHEDULE_C
SCHEDULE_E
EXPENSE_SUMMARY
CATEGORY_BREAKDOWN
QUARTERLY_ESTIMATE
ANNUAL_SUMMARY
CUSTOM
```

---

## TeamRole

```typescript
LEADER
WORKER
COORDINATOR
SPECIALIST
```

---

## TeamStructure

```typescript
HIERARCHICAL
COLLABORATIVE
PIPELINE
DEMOCRATIC
```

---

## TemplateCategory

```typescript
SALES
SUPPORT
MARKETING
DATA_PROCESSING
AUTOMATION
ANALYTICS
CONTENT
COMMUNICATION
```

---

## ToolCategory

```typescript
LEAD_GENERATION
LEAD_NURTURING
LISTING_OPTIMIZATION
PROPERTY_SHOPPING
MARKET_INTELLIGENCE
INVESTMENT_ANALYSIS
DOCUMENT_PROCESSING
COMMISSION_FINANCIAL
BOOKING_SCHEDULING
COMMUNICATION
CRM_TOOLS
ANALYTICS_TOOLS
AUTOMATION_TOOLS
INTEGRATION_TOOLS
```

---

## ToolStatus

```typescript
ACTIVE
COMING_SOON
BETA
DEPRECATED
DISABLED
```

---

## ToolTier

```typescript
T1
T2
T3
```

---

## ToolType

```typescript
CHATBOT
ANALYSIS
AUTOMATION
INTEGRATION
```

---

## TransactionType

```typescript
PURCHASE_AGREEMENT
LISTING_AGREEMENT
LEASE_AGREEMENT
COMMERCIAL_PURCHASE
COMMERCIAL_LEASE
```

---

## UserRole

```typescript
SUPER_ADMIN
ADMIN
MODERATOR
EMPLOYEE
```

---

## WidgetType

```typescript
KPI_CARD
CHART
TABLE
ACTIVITY_FEED
QUICK_ACTIONS
MODULE_SHORTCUTS
PROGRESS_TRACKER
NOTIFICATION_PANEL
CALENDAR
WEATHER
```

---

## WorkflowStatus

```typescript
ACTIVE
COMPLETED
CANCELLED
```

---
