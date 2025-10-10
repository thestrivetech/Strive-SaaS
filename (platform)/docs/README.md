# Platform Documentation Index

**Strive Tech SaaS Platform** - Complete documentation hub

Last Updated: 2025-10-10

---

## 📋 Quick Navigation

| Category | Description | Location |
|----------|-------------|----------|
| 🏗️ **Architecture** | System design, APIs, security | [`architecture/`](./architecture/) |
| 📖 **Guides** | User & developer documentation | [`guides/`](./guides/) |
| 🚀 **Deployment** | Deployment, environment setup | [`deployment/`](./deployment/) |
| 📦 **Modules** | Module-specific documentation | [`modules/`](./modules/) |
| 📊 **Reports** | Audits, session reports, todos | [`reports/`](./reports/) |
| 🔧 **Development** | Active work, testing, planning | [`development/`](./development/) |

---

## 🏗️ Architecture

**Location:** [`architecture/`](./architecture/)

System architecture, API reference, and security documentation.

### Core Architecture
- [**AUTH-ARCHITECTURE.md**](./architecture/AUTH-ARCHITECTURE.md) - Authentication flow & Supabase integration
- [**API-REFERENCE.md**](./architecture/API-REFERENCE.md) - Server Actions, endpoints, API contracts

### Security
- [**APPLY-RLS-FIX.md**](./architecture/security/APPLY-RLS-FIX.md) - Row Level Security implementation
- [**SECURITY-REMEDIATION-REPORT.md**](./architecture/security/SECURITY-REMEDIATION-REPORT.md) - Security audit & fixes
- [**server-side-only-issues.txt**](./architecture/security/server-side-only-issues.txt) - Server-only imports explanation

---

## 📖 Guides

**Location:** [`guides/`](./guides/)

User guides and developer documentation for working with the platform.

### User Guides
- [**crm-user-guide.md**](./guides/user/crm-user-guide.md) - CRM module user documentation
- [**MODULE-DASHBOARD-GUIDE.md**](./guides/user/MODULE-DASHBOARD-GUIDE.md) - Dashboard navigation & usage

### Developer Guides
- [**AUTH-ONBOARDING-GUIDE.md**](./guides/developer/AUTH-ONBOARDING-GUIDE.md) - Auth setup & onboarding flow
- [**DASHBOARD-MODERNIZATION-REMAINING.md**](./guides/developer/DASHBOARD-MODERNIZATION-REMAINING.md) - Dashboard modernization tasks

---

## 🚀 Deployment

**Location:** [`deployment/`](./deployment/)

Everything needed to deploy and maintain the platform in production.

### Core Deployment
- [**DEPLOYMENT.md**](./deployment/DEPLOYMENT.md) - Main deployment guide
- [**DEPLOYMENT-CHECKLIST.md**](./deployment/DEPLOYMENT-CHECKLIST.md) - Pre-deployment checklist
- [**PRE-DEPLOYMENT-CHECKLIST.md**](./deployment/PRE-DEPLOYMENT-CHECKLIST.md) - Final verification steps
- [**ENVIRONMENT.md**](./deployment/ENVIRONMENT.md) - Environment variables & configuration

### Operations
- [**ROLLBACK.md**](./deployment/ROLLBACK.md) - Rollback procedures
- [**storage-setup.md**](./deployment/storage-setup.md) - Supabase Storage configuration
- [**transaction-deployment.md**](./deployment/transaction-deployment.md) - Transaction module deployment

---

## 📦 Modules

**Location:** [`modules/`](./modules/)

Module-specific documentation for each feature area.

### Available Modules

| Module | Description | Docs |
|--------|-------------|------|
| **CMS & Marketing** | Content management, campaigns | [`cms-marketing/`](./modules/cms-marketing/) |
| **Expense & Tax** | Expense tracking, tax management | [`expense-tax/`](./modules/expense-tax/) |
| **Marketplace** | Tool marketplace, integrations | [`marketplace/`](./modules/marketplace/) |
| **REI Dashboard** | Real Estate Intelligence analytics | [`reid/`](./modules/reid/) |

---

## 📊 Reports

**Location:** [`reports/`](./reports/)

Audit reports, session execution reports, and project tracking.

### Audits
**Location:** [`reports/audits/`](./reports/audits/)

- [**COMPONENT-AUDIT-REPORT.md**](./reports/audits/COMPONENT-AUDIT-REPORT.md) - Component quality audit
- [**DASHBOARD-VALIDATION-REPORT.md**](./reports/audits/DASHBOARD-VALIDATION-REPORT.md) - Dashboard validation results
- [**REPOSITORY-AUDIT.md**](./reports/audits/REPOSITORY-AUDIT.md) - Codebase audit findings
- [**UNUSED-FILES-AUDIT.md**](./reports/audits/UNUSED-FILES-AUDIT.md) - Dead code analysis

### Session Reports
**Location:** [`reports/sessions/`](./reports/sessions/)

#### October 2025 Sessions
**Location:** [`reports/sessions/2025-10/`](./reports/sessions/2025-10/)

- SESSION-2025-10-07-PRESENTATION-FIX.md - Presentation mode fixes
- EXECUTION-REPORT-2025-10-07.md - Daily execution summary
- SESSION-6-EXECUTION-REPORT.md - Session 6 deliverables
- SESSION-8-COMPLETION-REPORT.md - Session 8 completion
- SESSION8-DEPLOYMENT-SUMMARY.md - Session 8 deployment
- PHASE-4-EXECUTION-REPORT.md - Phase 4 summary
- PHASES-4-9-VERIFICATION-REPORT.md - Multi-phase verification

#### Active Todos
**Location:** [`reports/sessions/todos/`](./reports/sessions/todos/)

- session-6-expense-table-modal.todo.md - Expense modal tasks

---

## 🔧 Development

**Location:** [`development/`](./development/)

Active development work, update sessions, and testing infrastructure.

### Testing
**Location:** [`development/testing/`](./development/testing/)

- [**playwright.config.ts**](./development/testing/playwright.config.ts) - E2E test configuration

### Update Sessions
**Location:** [`development/update-sessions/`](./development/update-sessions/)

Organized development sessions tracking feature development and platform updates.

#### Active Sessions
**Location:** [`development/update-sessions/active/`](./development/update-sessions/active/)

Currently in-progress development work:
- **dashboard-module-integrations/** - Dashboard & module integration work
- **database-upgrade/** - Database schema upgrades & security
- **UI-UPDATE/** - UI modernization updates

#### Planning Documents
**Location:** [`development/update-sessions/planning/`](./development/update-sessions/planning/)

Planning documents and reference guides:
- project-directory-refactor.md - Directory structure refactor
- BROWSER-TESTING.md - Browser testing strategy
- GO-LIVE-CHECKLIST.md - Production launch checklist
- INTEGRATION-REVIEW-PROMPT.md - Integration review guide
- subscription_tier_update.md - Subscription tier changes
- update-guide.md - Update workflow guide

#### Completed Sessions Archive
**Location:** [`development/update-sessions/archive/completed/`](./development/update-sessions/archive/completed/)

Historical session documentation (309 markdown files):
- **cms-marketing-module/** - CMS & Marketing implementation
- **crm-module/** - CRM dashboard & features
- **expenses-taxes-module/** - Expense & Tax tracking
- **landing-onboard-price-admin/** - Landing, onboarding, pricing
- **main-dash/** - Main dashboard development
- **platform-updates/** - Platform-wide updates
- **REIDashboard/** - REI Analytics dashboard
- **tool-dashboard-marketplace/** - Marketplace implementation
- **transaction-workspace-modules/** - Transaction workspace

---

## 🗂️ Directory Structure

```
(platform)/docs/
├── README.md (this file)
│
├── architecture/
│   ├── README.md
│   ├── AUTH-ARCHITECTURE.md
│   ├── API-REFERENCE.md
│   └── security/
│       ├── APPLY-RLS-FIX.md
│       ├── SECURITY-REMEDIATION-REPORT.md
│       └── server-side-only-issues.txt
│
├── guides/
│   ├── README.md
│   ├── user/
│   │   ├── crm-user-guide.md
│   │   └── MODULE-DASHBOARD-GUIDE.md
│   └── developer/
│       ├── AUTH-ONBOARDING-GUIDE.md
│       └── DASHBOARD-MODERNIZATION-REMAINING.md
│
├── deployment/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── DEPLOYMENT-CHECKLIST.md
│   ├── PRE-DEPLOYMENT-CHECKLIST.md
│   ├── ENVIRONMENT.md
│   ├── ROLLBACK.md
│   ├── storage-setup.md
│   └── transaction-deployment.md
│
├── modules/
│   ├── README.md
│   ├── cms-marketing/
│   ├── expense-tax/
│   ├── marketplace/
│   └── reid/
│
├── reports/
│   ├── README.md
│   ├── audits/
│   │   ├── COMPONENT-AUDIT-REPORT.md
│   │   ├── DASHBOARD-VALIDATION-REPORT.md
│   │   ├── REPOSITORY-AUDIT.md
│   │   └── UNUSED-FILES-AUDIT.md
│   └── sessions/
│       ├── 2025-10/
│       │   └── [session reports]
│       └── todos/
│           └── [active todos]
│
└── development/
    ├── README.md
    ├── testing/
    │   └── playwright.config.ts
    └── update-sessions/
        ├── README.md
        ├── active/
        │   ├── dashboard-module-integrations/
        │   ├── database-upgrade/
        │   └── UI-UPDATE/
        ├── planning/
        │   └── [planning docs]
        └── archive/
            └── completed/
                └── [completed sessions]
```

---

## 📌 Quick Links

### Essential Docs
- **Project Overview:** [`../CLAUDE.md`](../CLAUDE.md) - Platform standards & rules
- **Development Plan:** [`../PLAN.md`](../PLAN.md) - Roadmap & phases
- **Setup Guide:** [`../README.md`](../README.md) - Getting started

### Database
- **Schema Reference:** [`../prisma/SCHEMA-QUICK-REF.md`](../prisma/SCHEMA-QUICK-REF.md)
- **Database Guides:** [`../lib/database/docs/`](../lib/database/docs/)
- **Supabase Setup:** [`../lib/database/docs/SUPABASE-SETUP.md`](../lib/database/docs/SUPABASE-SETUP.md)

### Other Projects
- **Chatbot Widget:** [`../../(chatbot)/`](../../(chatbot)/)
- **Marketing Website:** [`../../(website)/`](../../(website)/)
- **Repository Root:** [`../../CLAUDE.md`](../../CLAUDE.md)

---

## 🔍 Finding Documentation

### By Category

| What are you looking for? | Where to find it |
|---------------------------|------------------|
| Auth & user onboarding | `guides/developer/` |
| API contracts | `architecture/` |
| Security policies | `architecture/security/` |
| Deployment steps | `deployment/` |
| Module features | `modules/[module-name]/` |
| Audit findings | `reports/audits/` |
| Session history | `reports/sessions/` |
| Active development | `development/update-sessions/active/` |
| Testing setup | `development/testing/` |

### By Role

**New Developers:**
1. Read [`../CLAUDE.md`](../CLAUDE.md) - Platform standards
2. Read [`guides/developer/AUTH-ONBOARDING-GUIDE.md`](./guides/developer/AUTH-ONBOARDING-GUIDE.md)
3. Review [`architecture/AUTH-ARCHITECTURE.md`](./architecture/AUTH-ARCHITECTURE.md)
4. Check [`deployment/ENVIRONMENT.md`](./deployment/ENVIRONMENT.md)

**Users:**
1. Start with [`guides/user/`](./guides/user/)
2. Check module docs in [`modules/`](./modules/)

**DevOps/Deployment:**
1. Read [`deployment/DEPLOYMENT.md`](./deployment/DEPLOYMENT.md)
2. Review [`deployment/PRE-DEPLOYMENT-CHECKLIST.md`](./deployment/PRE-DEPLOYMENT-CHECKLIST.md)
3. Check [`deployment/ENVIRONMENT.md`](./deployment/ENVIRONMENT.md)

**Project Managers:**
1. Review [`reports/sessions/`](./reports/sessions/) for progress
2. Check [`development/update-sessions/active/`](./development/update-sessions/active/) for current work
3. See [`reports/audits/`](./reports/audits/) for quality metrics

---

## 📝 Contributing to Documentation

### Adding New Documentation

**1. Choose the right location:**
- Architecture/design docs → `architecture/`
- User/developer guides → `guides/user/` or `guides/developer/`
- Deployment guides → `deployment/`
- Module docs → `modules/[module-name]/`
- Session reports → `reports/sessions/[YYYY-MM]/`
- Audit reports → `reports/audits/`

**2. Update this README:**
Add your new document to the appropriate section above

**3. Update section README:**
Update the README in the relevant subfolder

### Naming Conventions
- Use kebab-case for folders: `my-new-module/`
- Use SCREAMING-SNAKE-CASE for important docs: `DEPLOYMENT-GUIDE.md`
- Use kebab-case for regular docs: `user-guide.md`
- Date-based folders: `YYYY-MM/` format

---

## 🏆 Documentation Quality Standards

✅ **All documentation should:**
- Have clear titles and purpose
- Include table of contents (if >200 lines)
- Use proper markdown formatting
- Include code examples where applicable
- Be up-to-date with current implementation
- Link to related documentation

❌ **Avoid:**
- Duplicate information (link instead)
- Outdated screenshots/examples
- Vague instructions
- Missing context

---

## 📮 Questions?

- **Platform Issues:** Check [`reports/audits/`](./reports/audits/)
- **Deployment Help:** See [`deployment/`](./deployment/)
- **Module Questions:** Check [`modules/`](./modules/)
- **Active Work Status:** Browse [`development/update-sessions/active/`](./development/update-sessions/active/)

---

**Last Reorganization:** 2025-10-10
**Total Documentation Files:** 340+ markdown files
**Documentation Coverage:** Architecture, Guides, Deployment, Modules, Reports, Development
