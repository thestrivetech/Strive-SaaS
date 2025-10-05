# CLAUDE.md - Strive Tech Tri-Fold Repository

**Claude's Session Memory | v4.0 | Tri-Fold Architecture**

> ## 🔴 CRITICAL: TRI-FOLD REPOSITORY STRUCTURE
>
> This repository contains **THREE SEPARATE PROJECTS**, each with its own:
> - Independent Next.js application
> - Separate package.json and dependencies
> - Own CLAUDE.md with project-specific rules
> - Own PLAN.md with development roadmap
> - Own README.md with setup instructions
>
> **ALWAYS navigate to the correct project directory before working!**

---
# 🤖 AGENTS - CRITICAL USAGE REQUIREMENTS

> **⚠️ MANDATORY READING BEFORE EVERY AGENT INVOCATION:**
>
> **📖 Read this file FIRST:** `.claude/agents/USAGE-GUIDE.md`
>
> **NO EXCEPTIONS** - The usage guide MUST be read before invoking agents on ANY multi-step task.
> It contains comprehensive patterns, anti-patterns, and lessons learned from failures.

## 🔴 CRITICAL RULES (Quick Reference)

**Agent Definitions:** `.claude/agents/strive-dev-[1-10].md` (all identical, full-stack experts)
**Memory File:** All agents use this CLAUDE.md as their base knowledge

### Before Invoking Agents:

1. **✅ READ AGENT-USAGE-GUIDE.md** (no exceptions - it's your checklist)
2. **✅ Structure tasks with explicit verification requirements**
3. **✅ Use blocking language:** "DO NOT report success unless..."
4. **✅ Require proof:** Command outputs in agent reports
5. **✅ Include final validation agent** for multi-agent tasks

### Core Pattern (Summary - See AGENT-USAGE-GUIDE.md for details):

```
Every agent task MUST include:
- Exact scope (wildcards, explicit directories)
- Comprehensive search first (grep for complete list)
- Verification commands with expected outputs
- Blocking requirement (what prevents success)
- Return format (files changed + verification proof)

Example:
  Agent 1: Find ALL files → Complete list
  Agent 2: Fix ALL from list → Verify changes
  Agent 3: VALIDATION → Final check (block if fail)
```

### Lessons Learned:

**What went wrong:** Agents reported success but:
- Missed 40% of affected files
- Created TypeScript errors
- Updated wrong config files
- Claimed "all done" without verification

**What works:**
- Explicit verification commands in task prompts
- Blocking language ("DO NOT report success unless...")
- Require command outputs as proof
- Final validation agent that blocks on errors

### Quick Anti-Patterns:

❌ **DON'T:** "Fix the imports" (vague)
✅ **DO:** "Fix ALL imports in app/**/*.tsx - use grep to find complete list first"

❌ **DON'T:** Trust "✅ All done" without proof
✅ **DO:** Require verification command outputs in report

❌ **DON'T:** Parallel agents with overlapping scope
✅ **DO:** Clear non-overlapping boundaries

## 📋 Mandatory Pre-Flight Checklist

Before invoking agents:

- [ ] **Read AGENT-USAGE-GUIDE.md** (in root directory)
- [ ] Task has clear, bounded scopes
- [ ] Verification commands specified
- [ ] Blocking language included
- [ ] Return format with proof required
- [ ] Final validation agent planned (multi-agent tasks)
- [ ] Prompt <250 lines per agent

**If you haven't read AGENT-USAGE-GUIDE.md → STOP and read it now.**

---

## 📁 Repository Structure

```
Strive-SaaS/                    # Root (this is NOT a Next.js project)
├── (chatbot)/                  # AI Chatbot Widget
├── (platform)/                 # Main SaaS Platform
├── (website)/                  # Marketing Website
├── shared/                     # Shared Resources
│   ├── prisma/                # Shared Prisma schema
│   └── supabase/              # Shared Supabase config
├── scripts/                    # Repository-wide scripts
├── dev-workspace/             # Development logs & planning
├── CLAUDE.md                  # THIS FILE - Repository overview
└── README.md                  # Repository documentation
```

---

## 🎯 THREE PROJECTS OVERVIEW

### 1. (chatbot)/ - AI Chatbot Widget
**Domain:** `chat.strivetech.ai` (embedded widget)
**Purpose:** Embeddable AI assistant that can be integrated into any website
**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase
**Deployment:** Standalone widget + iframe embed

**Key Features:**
- Embeddable chat widget
- KimiK2 AI model - Fine tuned with logic and RAG system for multi-industry knowledge
- Conversation history
- RAG (Retrieval-Augmented Generation)
- Real-time streaming responses

**📖 Documentation:**
- Project rules: [`(chatbot)/CLAUDE.md`]((chatbot)/CLAUDE.md)
- Development plan: [`(chatbot)/PLAN.md`]((chatbot)/PLAN.md)
- Setup guide: [`(chatbot)/README.md`]((chatbot)/README.md)

---

### 2. (platform)/ - Main SaaS Platform
**Domain:** `app.strivetech.ai`
**Purpose:** Enterprise B2B multi-tenant SaaS with AI-powered tools
**Tech Stack:** Next.js 15 + React 19 + TypeScript + Prisma + Supabase
**Deployment:** Production SaaS application

**Key Features:**
- Role-based dashboards (Admin, Employee, Client)
- CRM system with industry customizations
- Project management
- AI Assistant (Sai) - embeds (chatbot)
- Tool marketplace
- Multi-industry support (Real Estate, Healthcare, etc.)
- 4-tier subscription model -> (Starter, Growth, Elite, & Custom -> Last option is "Enterprise" which is requires a sales call and will be fully custom solutions dependant on clients needs)

**📖 Documentation:**
- Project rules: [`(platform)/CLAUDE.md`]((platform)/CLAUDE.md)
- Development plan: [`(platform)/PLAN.md`]((platform)/PLAN.md)
- Session plans: [`(platform)/update-sessions/`]((platform)/update-sessions/)
- Setup guide: [`(platform)/README.md`]((platform)/README.md)

---

### 3. (website)/ - Marketing Website
**Domain:** `strivetech.ai`
**Purpose:** Marketing and public-facing website
**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase
**Deployment:** Public marketing site

**Key Features:**
- Company information
- Product showcase
- Blog & resources
- Contact & lead generation
- Integration with SaaS platform (SSO)

**📖 Documentation:**
- Project rules: [`(website)/CLAUDE.md`]((website)/CLAUDE.md)
- Development plan: [`(website)/PLAN.md`]((website)/PLAN.md)
- Setup guide: [`(website)/README.md`]((website)/README.md)

---

## 🔗 Shared Resources

### shared/prisma/
**Shared Prisma Schema** - Single source of truth for database structure

All three projects connect to the **SAME Supabase database** using this shared schema:
```bash
# From any project directory:
npx prisma generate --schema=../shared/prisma/schema.prisma
npx prisma migrate dev --schema=../shared/prisma/schema.prisma
```

**Database Models (13 total):**
- User, Organization, OrganizationMember
- Customer, Project, Task
- AIConversation, AIMessage, AITool
- Subscription, UsageTracking
- Appointment, Content, ActivityLog

### shared/supabase/
**Shared Supabase Configuration** - Auth, Storage, Realtime setup

All three projects use the **SAME Supabase project** for:
- Authentication (SSO across all apps)
- File storage
- Real-time subscriptions
- Row Level Security (RLS)

---

## 🔴 CRITICAL: BEFORE ANY WORK

### Step 1: Identify Correct Project
```bash
# Ask yourself: Which project am I working on?
# - Chatbot widget features? → cd (chatbot)/
# - Main platform features? → cd (platform)/
# - Marketing site content? → cd (website)/
```

### Step 2: Read Project-Specific CLAUDE.md
```bash
# ALWAYS read the project's CLAUDE.md first!
# Each project has different rules and patterns

cd (chatbot)/  && cat CLAUDE.md   # Chatbot rules
cd (platform)/ && cat CLAUDE.md   # Platform rules
cd (website)/  && cat CLAUDE.md   # Website rules
```

### Step 3: Follow Project-Specific Standards
- Each project has its own tech stack decisions
- Each project has its own file structure
- Each project has its own testing strategy
- **DO NOT mix standards between projects!**

---

## 🚨 UNIVERSAL RULES (ALL PROJECTS)

### 🔴 READ-BEFORE-EDIT MANDATE
**MANDATORY STEPS BEFORE ANY ACTION:**

1. **READ FIRST** - Always use Read tool on any file before editing
2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files already exist
3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones
4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first

### File Size Standards (Enforced Across All Projects)
**Hard Limit:** 500 lines per file (enforced by ESLint)
- Applies to all `.ts`/`.tsx` files
- Exception: Pure data/content files (no logic)
- Blocks PRs when exceeded

**Soft Targets:**
- UI Components: 200 lines
- Server Components: 250 lines
- Services/Logic: 300 lines
- API Routes: 150 lines

### Root Directory Standards
**CRITICAL:** Keep repository root clean!

**Prohibited in root:**
```
❌ .claude/ .serena/           # AI configs (add to .gitignore)
❌ chat-logs/ session-logs/    # Session data (move to dev-workspace/)
❌ Random *.md files           # Use project-specific docs/
❌ test-*.ts                   # Tests belong in project __tests__/
❌ *.log files                 # Logs (add to .gitignore)
```

**Allowed in root:**
```
✅ (chatbot)/ (platform)/ (website)/  # Project directories
✅ shared/                              # Shared resources
✅ scripts/                             # Repo-wide scripts
✅ dev-workspace/                       # Development planning
✅ .gitignore, .env.example            # Config files
✅ CLAUDE.md, README.md                # Root documentation ONLY
```

### Security (Universal)
```typescript
// 1. ALWAYS validate input
const schema = z.object({ email: z.string().email() });

// 2. SQL injection prevention
✅ prisma.user.findMany({ where: { name }})
❌ prisma.$queryRaw(`SELECT * WHERE name='${name}'`)

// 3. XSS prevention
✅ <div>{userContent}</div>
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 4. NEVER expose secrets
❌ Commit .env files (especially .env.local!)
❌ Hardcode API keys
❌ Expose SUPABASE_SERVICE_ROLE_KEY to client
❌ Commit DOCUMENT_ENCRYPTION_KEY (in .env.local ONLY!)
```

**⚠️ CRITICAL: Environment Variables & Secrets**

| Secret | Location | Committed? | Notes |
|--------|----------|------------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | ❌ NEVER | Bypasses RLS - admin only |
| `DOCUMENT_ENCRYPTION_KEY` | `.env.local` | ❌ NEVER | Lost key = lost documents! |
| `STRIPE_SECRET_KEY` | `.env.local` | ❌ NEVER | Payment processing |
| `DATABASE_URL` | `.env.local` | ❌ NEVER | Contains password |
| All other secrets | `.env.local` | ❌ NEVER | Production credentials |
| Placeholder values | `.env.example` | ✅ YES | Template with fake values |

**Platform-Specific: Document Encryption Key**
- Added in Session 2 (Transaction Management Dashboard)
- Required for: Transaction document encryption (AES-256-GCM)
- Generate once: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Backup securely - this key cannot be recovered if lost!
- Location: `(platform)/.env.local` → `DOCUMENT_ENCRYPTION_KEY`

### Testing (Universal)
```bash
# Every project MUST maintain 80%+ test coverage
npm test -- --coverage

# Pre-commit checks (ALL projects)
npm run lint        # Zero warnings
npx tsc --noEmit    # Zero errors
npm test            # 80%+ coverage
```

---

## 🔄 How Projects Interact

### Database: Shared Supabase (via Prisma)
All three projects connect to the **SAME** Supabase database:
```
(chatbot)/  ──┐
(platform)/ ──┼──► Shared Prisma Schema ──► Supabase PostgreSQL
(website)/  ──┘
```

### Authentication: Supabase Auth (SSO)
Users can authenticate once and access all three apps:
```
User logs in on (website)
  ↓
Session stored in Supabase Auth
  ↓
Can access (platform) without re-login
  ↓
Can use (chatbot) with same user context
```

### Deployment: Independent
Each project deploys separately to Vercel:
```
(chatbot)/  → chat.strivetech.ai
(platform)/ → app.strivetech.ai
(website)/  → strivetech.ai
```

### Data Flow Example
```
1. User signs up on (website)/
   → Creates User record in shared database

2. User logs into (platform)/
   → Same Supabase session, no re-auth needed
   → Can access CRM, Projects, etc.

3. User embeds (chatbot)/ on their site
   → Chatbot recognizes user via session
   → Loads user's conversation history from shared DB
```

---

## 🎯 Decision Tree: Which Project?

**Ask yourself:**

1. **Is it about the AI chatbot widget or conversational interface?**
   → Work in `(chatbot)/`

2. **Is it about the main SaaS platform features?**
   - Dashboard, CRM, Projects, Tools, Admin
   → Work in `(platform)/`

3. **Is it about marketing, public content, or landing pages?**
   - Company info, blog, product pages
   → Work in `(website)/`

4. **Is it about database schema or Supabase config?**
   → Work in `shared/` (affects ALL projects!)

5. **Is it about repository-wide tooling or scripts?**
   → Work in `scripts/` or root config files

---

## 📋 Common Commands

### Navigate to Project
```bash
# Chatbot
cd "(chatbot)"

# Platform
cd "(platform)"

# Website
cd "(website)"
```

### Development (from project directory)
```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests
```

### Database (from any project, uses shared schema)
```bash
# Generate Prisma client
npx prisma generate --schema=../shared/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name description --schema=../shared/prisma/schema.prisma

# View database
npx prisma studio --schema=../shared/prisma/schema.prisma
```

---

## ⚠️ CRITICAL WARNINGS

### ❌ NEVER DO THIS
```bash
# DON'T work from root directory
npm install              # Wrong! No package.json here
npm run dev              # Wrong! This isn't a Next.js project

# DON'T mix project standards
# - (chatbot)/ has its own patterns
# - (platform)/ has its own patterns
# - (website)/ has its own patterns
# READ each project's CLAUDE.md!

# DON'T create duplicate code
# If it's needed by multiple projects:
# → Put it in shared/
# → Or create a package
# → Or use git submodules
```

### ✅ DO THIS
```bash
# Navigate to correct project FIRST
cd "(platform)"
npm install
npm run dev

# Read project-specific documentation
cat CLAUDE.md
cat PLAN.md

# Use shared resources correctly
npx prisma generate --schema=../shared/prisma/schema.prisma
```

---

## 📚 Additional Documentation

### Repository-Wide
- [Root README](README.md) - Setup and overview
- [Development Workspace](dev-workspace/) - Planning and logs
- [Scripts](scripts/) - Utility scripts

### Project-Specific
Each project has complete documentation in its directory:
- `CLAUDE.md` - Development rules and standards
- `PLAN.md` - Project roadmap and phases
- `README.md` - Setup and getting started
- `docs/` - Additional documentation (if exists)

---

## 🎯 Core Principles (Universal)

1. **Server-first** - Minimize client JS
2. **Type safety** - TypeScript + Zod everywhere
3. **Security by default** - Never trust input
4. **Test-driven** - Write tests first (80% minimum)
5. **Clean architecture** - Separation of concerns
6. **One solution per problem** - No duplicates
7. **Production mindset** - Every line matters

---

## 🔗 Quick Reference

**When starting work:**
1. Identify which project: (chatbot), (platform), or (website)
2. Navigate to that project: `cd "(project)"`
3. Read project CLAUDE.md: `cat CLAUDE.md`
4. Follow project-specific standards
5. Run project-specific commands

**When touching database:**
1. Navigate to `shared/prisma/`
2. Update schema if needed
3. Run migrations: `npx prisma migrate dev`
4. Generate client in each affected project

**When deploying:**
1. Each project deploys independently
2. Check project PLAN.md for deployment steps
3. Verify environment variables in Vercel
4. Test cross-project integration (auth, data)

---

**Remember:** This is a **TRI-FOLD REPOSITORY**, not a monorepo. Each project is independent with shared resources. Always work in the correct project directory and follow that project's specific standards.

**Last Updated:** 2025-10-04
**Version:** 4.0 (Tri-Fold Architecture)
- memory