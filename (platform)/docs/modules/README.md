# Modules Documentation

Module-specific documentation for each feature area of the Strive Tech SaaS Platform.

[← Back to Documentation Index](../README.md)

---

## 📋 Available Modules

| Module | Status | Documentation |
|--------|--------|---------------|
| **CMS & Marketing** | ✅ Complete | [`cms-marketing/`](./cms-marketing/) |
| **Expense & Tax** | ✅ Complete | [`expense-tax/`](./expense-tax/) |
| **Marketplace** | ✅ Complete | [`marketplace/`](./marketplace/) |
| **REI Dashboard** | ✅ Complete | [`reid/`](./reid/) |
| **CRM** | 📝 See user guides | [`../guides/user/crm-user-guide.md`](../guides/user/crm-user-guide.md) |

---

## 📦 CMS & Marketing Module

**Location:** [`cms-marketing/`](./cms-marketing/)

Content management system and marketing campaign tools.

### Documentation Files
- **contentpilot-user-guide.md** - User documentation
- **contentpilot-deployment-checklist.md** - Deployment steps
- **contentpilot-environment-variables.md** - Configuration
- **contentpilot-troubleshooting.md** - Common issues & solutions

### Features
- Content creation & editing
- Campaign management
- Email marketing
- Social media integration
- Analytics & reporting
- SEO optimization

### Tech Stack
- Rich text editor (TipTap)
- Email service integration
- Content scheduling
- Template management

---

## 💰 Expense & Tax Module

**Location:** [`expense-tax/`](./expense-tax/)

Expense tracking and tax management for real estate professionals.

### Documentation Files
- **README.md** - Module overview
- **API.md** - API endpoints & Server Actions
- **COMPONENTS.md** - Component documentation
- **TESTING.md** - Test suites & coverage
- **TROUBLESHOOTING.md** - Common issues

### Features
- Expense tracking
- Receipt upload & OCR
- Tax category management
- Deduction calculations
- Quarterly reports
- Export to accounting software

### Tech Stack
- File upload (Supabase Storage)
- OCR integration
- PDF generation
- Multi-currency support

---

## 🛒 Marketplace Module

**Location:** [`marketplace/`](./marketplace/)

Tool and dashboard marketplace for extending platform capabilities.

### Documentation Files
- **MARKETPLACE-DESIGN-REVIEW.md** - Design decisions
- **MARKETPLACE-FUNCTIONAL-TEST-REPORT.md** - Functional testing
- **MARKETPLACE-INTEGRATION-TEST-REPORT.md** - Integration testing
- **MARKETPLACE-PHASE-5-SUMMARY.md** - Phase 5 completion
- **MARKETPLACE-REMAINING-TASKS.md** - Outstanding tasks
- **MARKETPLACE-TESTING-QUICK-START.md** - Testing guide
- **MARKETPLACE_DEPLOYMENT_CHECKLIST.md** - Deployment checklist

### Features
- Browse tools & dashboards
- Install marketplace items
- Shopping cart & checkout
- Subscription management
- Tool configuration
- Usage tracking

### Payment Integration
- Stripe integration
- One-time purchases
- Subscription billing
- Usage-based pricing

---

## 📊 REI Dashboard Module

**Location:** [`reid/`](./reid/)

Real Estate Intelligence analytics and insights dashboard.

### Documentation Files
- **REID-DASHBOARD.md** - Dashboard documentation
- **REID-USER-GUIDE.md** - User guide

### Features
- Market analytics
- Property insights
- Trend analysis
- Comparative market analysis
- Investment metrics
- Portfolio tracking

### Data Sources
- MLS integration (planned)
- Public records
- Market data APIs
- Internal transaction data

---

## 🎯 Module Architecture

All modules follow the same architectural pattern:

```
lib/modules/[module-name]/
├── actions.ts           # Server Actions (mutations)
├── queries.ts          # Data fetching (reads)
├── schemas.ts          # Zod validation schemas
└── index.ts            # Public API

app/real-estate/[module-name]/
├── page.tsx            # Module dashboard
├── [feature]/          # Feature pages
└── layout.tsx          # Module layout
```

### Key Principles
- **Self-contained:** Each module is independent
- **No cross-imports:** Modules don't import from each other
- **RBAC enforced:** All actions check permissions
- **Multi-tenant:** All queries filter by organization
- **Type-safe:** Zod schemas + TypeScript

---

## 📚 Related Documentation

### Architecture
- [API Reference](../architecture/API-REFERENCE.md) - Server Actions & endpoints
- [Auth Architecture](../architecture/AUTH-ARCHITECTURE.md) - RBAC implementation

### Guides
- [CRM User Guide](../guides/user/crm-user-guide.md) - CRM module usage
- [Dashboard Guide](../guides/user/MODULE-DASHBOARD-GUIDE.md) - Dashboard navigation

### Development
- [Active Sessions](../development/update-sessions/active/) - Current module work
- [Completed Sessions](../development/update-sessions/archive/completed/) - Module implementation history

---

## 🔧 Module Development

### Creating a New Module

1. **Create module directory:**
   ```bash
   mkdir -p lib/modules/my-module
   mkdir -p app/real-estate/my-module
   ```

2. **Implement backend:**
   - `schemas.ts` - Define Zod schemas
   - `queries.ts` - Read operations
   - `actions.ts` - Write operations
   - `index.ts` - Export public API

3. **Implement frontend:**
   - `page.tsx` - Module dashboard
   - Feature pages as needed
   - Components in `components/real-estate/my-module/`

4. **Add documentation:**
   - Create `docs/modules/my-module/README.md`
   - Document API, components, testing
   - Add to this index

5. **Testing:**
   - Unit tests for business logic
   - Integration tests for actions
   - E2E tests for critical flows

### Module Checklist
- [ ] Backend logic in `lib/modules/[name]/`
- [ ] Frontend UI in `app/real-estate/[name]/`
- [ ] Zod schemas for all inputs
- [ ] RBAC checks in all actions
- [ ] Multi-tenant filtering in all queries
- [ ] Tests with 80%+ coverage
- [ ] Documentation in `docs/modules/[name]/`
- [ ] Added to this README

---

## 🔍 Quick Reference

| Module | Purpose | Key Features |
|--------|---------|--------------|
| CMS & Marketing | Content management | Campaigns, email, social |
| Expense & Tax | Financial tracking | Expenses, receipts, tax reports |
| Marketplace | Tool marketplace | Browse, purchase, install tools |
| REI Dashboard | Analytics | Market data, insights, trends |

---

## 💡 Contributing Module Documentation

When adding or updating module documentation:

1. **Create module folder** in `docs/modules/[module-name]/`
2. **Add README.md** with module overview
3. **Document features** - What it does, how to use it
4. **Include API docs** - Server Actions, endpoints
5. **Add troubleshooting** - Common issues & solutions
6. **Update this index** - Add your module to the table above

---

**Last Updated:** 2025-10-10
**Total Modules:** 5 (CMS & Marketing, Expense & Tax, Marketplace, REI, CRM)
