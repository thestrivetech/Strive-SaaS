# Strive Tech - Tri-Fold Repository

**Enterprise B2B SaaS Platform | AI-Powered Business Tools | Modern Web Experience**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-green)](https://www.prisma.io/)

---

## 🎯 What is This Repository?

This is the **Strive Tech tri-fold repository** containing **three independent Next.js applications** that work together to provide a complete business solution:

1. **[(chatbot)/](#chatbot---ai-chatbot-widget)** - Embeddable AI assistant widget
2. **[(platform)/](#platform---main-saas-application)** - Enterprise SaaS platform
3. **[(website)/](#website---marketing-site)** - Marketing and public website

All three projects share a common database and authentication system while maintaining independent deployments and codebases.

---

## 📁 Repository Structure

```
Strive-SaaS/
├── (chatbot)/          # AI Chatbot Widget → chat.strivetech.ai
├── (platform)/         # Main SaaS Platform → app.strivetech.ai
├── (website)/          # Marketing Website → strivetech.ai
├── shared/             # Shared Resources
│   ├── prisma/        # Database schema (13 models)
│   └── supabase/      # Auth & storage config
├── scripts/            # Repository utilities
├── dev-workspace/      # Development planning
├── CLAUDE.md          # AI assistant instructions
└── README.md          # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (for database & auth)
- **Vercel** account (for deployment)
- **Git** installed

### Initial Setup (First Time Only)

```bash
# Clone repository
git clone https://github.com/your-org/strive-saas.git
cd strive-saas

# Setup shared database
cd shared/prisma
npx prisma generate
npx prisma migrate dev
cd ../..

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Running Individual Projects

**Choose which project you want to work on:**

```bash
# Option 1: Chatbot Widget
cd "(chatbot)"
npm install
npm run dev
# → http://localhost:3000

# Option 2: Platform (SaaS)
cd "(platform)"
npm install
npm run dev
# → http://localhost:3000

# Option 3: Marketing Website
cd "(website)"
npm install
npm run dev
# → http://localhost:3000
```

---

## 📦 (chatbot)/ - AI Chatbot Widget

**Domain:** `chat.strivetech.ai`

### What It Does

Embeddable AI assistant that can be integrated into any website via iframe or script tag. Supports multiple AI models (GPT-4, Claude, Llama) with conversation history and RAG capabilities.

### Key Features

- 🤖 Multi-model AI support
- 💬 Real-time streaming responses
- 📝 Conversation history
- 🔍 RAG (Retrieval-Augmented Generation)
- 🎨 Customizable appearance
- 📱 Mobile responsive
- 🔗 Easy embed (iframe or script)

### Tech Stack

- Next.js 15.6.0 + App Router
- React 19.1.0
- TypeScript 5.6+
- Supabase (auth + database)
- OpenRouter + Groq (AI)
- TailwindCSS + shadcn/ui

### Getting Started

```bash
cd "(chatbot)"
npm install
npm run dev
```

**Documentation:**
- [Setup Guide]((chatbot)/README.md)
- [Development Rules]((chatbot)/CLAUDE.md)
- [Project Plan]((chatbot)/PLAN.md)

---

## 🏢 (platform)/ - Main SaaS Application

**Domain:** `app.strivetech.ai`

### What It Does

Enterprise B2B multi-tenant SaaS platform with AI-powered tools for business management. Supports multiple industries (Real Estate, Healthcare, etc.) with customizable dashboards and tools.

### Architecture: 3-Level Hierarchy

**Scalable structure designed for growth:**
- **Level 1: Industries** - Real Estate (live), Healthcare (future), Legal (future)
- **Level 2: Modules** - CRM, Transactions, Analytics (complete functional areas)
- **Level 3: Pages** - Dashboards, feature pages, detail pages

Pattern: `/real-estate/crm/contacts` = Industry > Module > Page

### Key Features

- 👥 **Multi-tenant architecture** with Row Level Security
- 🎭 **Role-based access** (SUPER_ADMIN: platform-admin, ADMIN: org-admin, MODERATOR, USER)
- 📊 **CRM system** with industry customizations
- 📁 **Project management** with tasks & collaboration
- 🤖 **AI assistant (Sai)** - embedded chatbot
- 🛠️ **Tool marketplace** with shared & industry tools
- 🏭 **Multi-industry support** with plugin architecture
- 💳 **6-tier per-seat pricing** (FREE, CUSTOM, STARTER $299, GROWTH $699, ELITE $999, ENTERPRISE custom)

### Tech Stack

- Next.js 15.5.4 + App Router
- React 19.1.0
- TypeScript 5.6+
- Prisma 6.16.2 + Supabase PostgreSQL
- Supabase Auth + Storage + RLS
- TanStack Query + Zustand
- Stripe (payments)
- Jest + Playwright (testing)

### Getting Started

```bash
cd "(platform)"
npm install
npx prisma generate --schema=../shared/prisma/schema.prisma
npm run dev
```

**Documentation:**
- [Setup Guide]((platform)/README.md)
- [Development Rules]((platform)/CLAUDE.md)
- [Project Plan]((platform)/PLAN.md)
- [Session Plans]((platform)/update-sessions/)

---

## 🌐 (website)/ - Marketing Site

**Domain:** `strivetech.ai`

### What It Does

Public-facing marketing website showcasing the Strive Tech platform, services, and resources. Handles lead generation and provides SSO integration with the main platform.

### Key Features

- 📄 **Company information** & about pages
- 🎨 **Product showcase** & feature highlights
- 📰 **Blog & resources** for content marketing
- 📧 **Contact forms** & lead generation
- 🔐 **SSO integration** with platform
- 🚀 **Modern design** with animations
- 📱 **Fully responsive** across devices

### Tech Stack

- Next.js 15 + App Router
- React 19.1.0
- TypeScript 5.6+
- Supabase (database + auth)
- TailwindCSS + shadcn/ui
- Framer Motion (animations)

### Getting Started

```bash
cd "(website)"
npm install
npm run dev
```

**Documentation:**
- [Setup Guide]((website)/README.md)
- [Development Rules]((website)/CLAUDE.md)
- [Project Plan]((website)/PLAN.md)

---

## 🔗 Shared Resources

### shared/prisma/ - Database Schema

**Single source of truth** for database structure used by all three projects.

**13 Database Models:**
- User, Organization, OrganizationMember
- Customer, Project, Task
- AIConversation, AIMessage, AITool
- Subscription, UsageTracking
- Appointment, Content, ActivityLog

**Usage from any project:**
```bash
# Generate Prisma client
npx prisma generate --schema=../shared/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name your_migration --schema=../shared/prisma/schema.prisma

# View database
npx prisma studio --schema=../shared/prisma/schema.prisma
```

### shared/supabase/ - Authentication & Storage

**Shared Supabase configuration** for SSO across all applications.

**Features:**
- 🔐 Authentication (JWT sessions)
- 📁 File storage (avatars, documents)
- ⚡ Real-time subscriptions
- 🛡️ Row Level Security (RLS)
- 👥 Multi-tenancy support

---

## 🔄 How Projects Work Together

### Authentication Flow (SSO)

```
1. User signs up on (website)/strivetech.ai
   ↓
2. Supabase Auth creates user session
   ↓
3. User can access (platform)/app.strivetech.ai without re-login
   ↓
4. User can use (chatbot)/chat.strivetech.ai with same session
```

### Database Architecture

All three projects connect to the **SAME Supabase PostgreSQL database**:

```
┌─────────────┐
│  (chatbot)  │────┐
└─────────────┘    │
                   │
┌─────────────┐    ├──► shared/prisma/schema.prisma
│ (platform)  │────┤         ↓
└─────────────┘    │    Supabase PostgreSQL
                   │    (RLS for multi-tenancy)
┌─────────────┐    │
│  (website)  │────┘
└─────────────┘
```

### Deployment Architecture

Each project deploys **independently** to Vercel:

```
(chatbot)/  → Vercel → chat.strivetech.ai
(platform)/ → Vercel → app.strivetech.ai
(website)/  → Vercel → strivetech.ai
```

**Benefits:**
- Independent scaling
- Isolated failures
- Separate environments (dev/staging/prod)
- Different deployment schedules

---

## 🛠️ Development Workflow

### Working on a Specific Project

```bash
# 1. Navigate to project
cd "(platform)"

# 2. Read project documentation
cat CLAUDE.md      # Development rules
cat PLAN.md        # Project roadmap
cat README.md      # Setup instructions

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.example .env.local
# Edit .env.local

# 5. Run development server
npm run dev

# 6. Make changes following project standards

# 7. Run tests before committing
npm run lint          # Zero warnings
npx tsc --noEmit      # Zero errors
npm test              # 80%+ coverage
```

### Updating Database Schema

```bash
# 1. Navigate to shared Prisma
cd shared/prisma

# 2. Edit schema.prisma
# Add/modify models

# 3. Create migration
npx prisma migrate dev --name your_migration_name

# 4. Generate client in each affected project
cd "../../(platform)"
npx prisma generate --schema=../shared/prisma/schema.prisma

cd "../(chatbot)"
npx prisma generate --schema=../shared/prisma/schema.prisma

cd "../(website)"
npx prisma generate --schema=../shared/prisma/schema.prisma
```

### Pre-Commit Checklist (ALL Projects)

✅ **Before committing any code:**

```bash
# Run in project directory
npm run lint          # Must pass (zero warnings)
npx tsc --noEmit      # Must pass (zero errors)
npm test              # Must pass (80%+ coverage)
```

---

## 📚 Documentation

### Repository-Level

- **[CLAUDE.md](CLAUDE.md)** - AI assistant instructions & standards
- **[README.md](README.md)** - This file (overview & setup)
- **[.env.example](.env.example)** - Environment variable template
- **[dev-workspace/](dev-workspace/)** - Development planning & logs

### Project-Specific

Each project has complete documentation:

| File | Description |
|------|-------------|
| `CLAUDE.md` | Development rules & patterns |
| `PLAN.md` | Project roadmap & phases |
| `README.md` | Setup & getting started |
| `docs/` | Additional documentation |

---

## 🔒 Environment Variables

### Required for All Projects

Create `.env.local` in each project directory:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."  # SERVER ONLY!

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Platform-Specific

**[(platform)/](#platform---main-saas-application) requires additional vars:**

```bash
# AI Providers
OPENROUTER_API_KEY="sk-or-..."
GROQ_API_KEY="gsk_..."

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Security Note:** Never commit `.env` or `.env.local` files!

---

## 🧪 Testing

### Test Requirements (ALL Projects)

- **Minimum Coverage:** 80% (enforced)
- **Test-Driven Development:** Write tests first
- **All Server Actions:** 100% coverage
- **All API Routes:** 100% coverage

### Running Tests

```bash
# Run all tests
npm test

# With coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🚀 Deployment

### Production Deployments

Each project deploys independently to Vercel:

```bash
# Deploy chatbot
cd "(chatbot)"
vercel --prod

# Deploy platform
cd "(platform)"
vercel --prod

# Deploy website
cd "(website)"
vercel --prod
```

### Production Domains

- **Chatbot:** https://chat.strivetech.ai
- **Platform:** https://app.strivetech.ai
- **Website:** https://strivetech.ai

### Environment Setup in Vercel

For each project, configure environment variables in:
`Vercel Dashboard → Project → Settings → Environment Variables`

Mark secrets (API keys, database passwords) as **"Secret"** in Vercel.

---

## 🤝 Contributing

### Development Standards

1. **Read project CLAUDE.md** before making changes
2. **Follow file size limits** (500 lines max, 200-300 recommended)
3. **Write tests first** (TDD approach)
4. **Server Components by default** ("use client" only when needed)
5. **Validate all inputs** with Zod schemas
6. **Never expose secrets** in code or commits

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes in appropriate project
cd "(platform)"
# ... make changes ...

# Run pre-commit checks
npm run lint
npx tsc --noEmit
npm test

# Commit if all checks pass
git add .
git commit -m "feat(platform): your change description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 📊 Project Status

### (chatbot)/ - AI Chatbot Widget
- ✅ Core functionality complete
- ✅ Multi-model AI support
- ✅ Conversation history
- 🚧 Advanced RAG features (in progress)

### (platform)/ - Main SaaS Platform
- 🚧 **In Development** - Production roadmap in progress
- ✅ Authentication & RBAC
- ✅ CRM system
- ✅ Project management
- 🚧 Industry plugins (Real Estate, Healthcare)
- 📋 See [(platform)/PLAN.md]((platform)/PLAN.md) for details

### (website)/ - Marketing Site
- 🚧 **In Development** - Migrating to new architecture
- ✅ Basic pages & content
- 🚧 Blog system
- 🚧 SSO integration

---

## 🆘 Troubleshooting

### "Module not found" errors

```bash
# Regenerate Prisma client
npx prisma generate --schema=../shared/prisma/schema.prisma

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Database connection issues

```bash
# Check Supabase is running
# Verify DATABASE_URL in .env.local

# Test connection
npx prisma db pull --schema=../shared/prisma/schema.prisma
```

### TypeScript errors

```bash
# Clear TypeScript cache
rm -rf node_modules
npm install
npx tsc --noEmit
```

---

## 📞 Support & Resources

### Documentation

- [Platform Documentation]((platform)/README.md)
- [Chatbot Documentation]((chatbot)/README.md)
- [Website Documentation]((website)/README.md)
- [Development Standards](CLAUDE.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

## 📝 License

Proprietary - Strive Tech © 2024

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| **Navigate to project** | `cd "(project)"` |
| **Install dependencies** | `npm install` |
| **Start dev server** | `npm run dev` |
| **Run tests** | `npm test` |
| **Build for production** | `npm run build` |
| **Deploy to Vercel** | `vercel --prod` |
| **Generate Prisma client** | `npx prisma generate --schema=../shared/prisma/schema.prisma` |
| **Create migration** | `npx prisma migrate dev --schema=../shared/prisma/schema.prisma` |

---

**Remember:** This is a tri-fold repository. Always work in the correct project directory: **(chatbot)**, **(platform)**, or **(website)**.

**Last Updated:** 2025-10-04
