# Guides Documentation

User guides and developer documentation for the Strive Tech SaaS Platform.

[← Back to Documentation Index](../README.md)

---

## 📋 Contents

### User Guides
- [**crm-user-guide.md**](./user/crm-user-guide.md) - CRM module user documentation
- [**MODULE-DASHBOARD-GUIDE.md**](./user/MODULE-DASHBOARD-GUIDE.md) - Dashboard navigation & usage

### Developer Guides
- [**AUTH-ONBOARDING-GUIDE.md**](./developer/AUTH-ONBOARDING-GUIDE.md) - Authentication setup & onboarding flow
- [**DASHBOARD-MODERNIZATION-REMAINING.md**](./developer/DASHBOARD-MODERNIZATION-REMAINING.md) - Dashboard modernization tasks

---

## 👥 User Guides

**Location:** [`user/`](./user/)

Documentation for end users of the platform.

### CRM User Guide

**File:** [crm-user-guide.md](./user/crm-user-guide.md)

Complete guide for using the CRM module:
- Managing contacts
- Tracking leads & deals
- Creating follow-up tasks
- Generating reports
- Customizing views

**Who should read this:** Sales teams, account managers, CRM users

### Module Dashboard Guide

**File:** [MODULE-DASHBOARD-GUIDE.md](./user/MODULE-DASHBOARD-GUIDE.md)

Guide to navigating module dashboards:
- Dashboard layout & sections
- Customizing widgets
- Filtering data
- Exporting reports
- Keyboard shortcuts

**Who should read this:** All platform users

---

## 🛠️ Developer Guides

**Location:** [`developer/`](./developer/)

Documentation for developers building on the platform.

### Authentication & Onboarding

**File:** [AUTH-ONBOARDING-GUIDE.md](./developer/AUTH-ONBOARDING-GUIDE.md)

Complete implementation guide:
- Setting up Supabase Auth
- Implementing lazy sync to Prisma
- Building onboarding flow
- Organization setup
- RBAC integration

**Key Topics:**
- Sign up / Login flow
- Session management
- Protected routes
- Onboarding steps
- Role assignment

**Who should read this:** Backend developers, full-stack developers

### Dashboard Modernization

**File:** [DASHBOARD-MODERNIZATION-REMAINING.md](./developer/DASHBOARD-MODERNIZATION-REMAINING.md)

Remaining modernization tasks:
- Component updates
- Layout improvements
- Performance optimizations
- Accessibility enhancements

**Who should read this:** Frontend developers, UI/UX engineers

---

## 🎯 Quick Reference

| Guide | Audience | Topic |
|-------|----------|-------|
| crm-user-guide.md | Users | CRM features & workflows |
| MODULE-DASHBOARD-GUIDE.md | Users | Dashboard navigation |
| AUTH-ONBOARDING-GUIDE.md | Developers | Auth implementation |
| DASHBOARD-MODERNIZATION-REMAINING.md | Developers | Dashboard updates |

---

## 📚 Related Documentation

### Architecture
- [Auth Architecture](../architecture/AUTH-ARCHITECTURE.md) - Technical auth flow
- [API Reference](../architecture/API-REFERENCE.md) - API contracts

### Modules
- [CMS & Marketing](../modules/cms-marketing/) - Content management docs
- [Expense & Tax](../modules/expense-tax/) - Expense tracking docs
- [Marketplace](../modules/marketplace/) - Marketplace docs

### Deployment
- [Deployment Guide](../deployment/DEPLOYMENT.md) - Production deployment
- [Environment Setup](../deployment/ENVIRONMENT.md) - Configuration

---

## 💡 Contributing New Guides

### User Guides
Place in [`user/`](./user/) directory with clear, non-technical language:
- Step-by-step instructions
- Screenshots (optional)
- Common workflows
- Troubleshooting tips

### Developer Guides
Place in [`developer/`](./developer/) directory with technical depth:
- Code examples
- Architecture decisions
- Implementation patterns
- Testing strategies

---

**Last Updated:** 2025-10-10
