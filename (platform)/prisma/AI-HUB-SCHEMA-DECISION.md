# AI-HUB Module - Schema Architecture Decision

**Date:** 2025-10-10
**Session:** AI-HUB Session 1 - Database Foundation
**Status:** ✅ IMPLEMENTED

---

## 🎯 CRITICAL ARCHITECTURAL DECISION

### AI-HUB is a UNIFIED CONTROL CENTER, NOT a Separate System

**Decision Summary:**
AI-HUB is the centralized dashboard that aggregates and provides management for ALL AI and automation capabilities across the entire Strive Tech platform. It does NOT duplicate existing functionality - it provides a unified view and control panel.

---

## 📊 DATABASE STRATEGY

### EXISTING Tables (Used by AI-HUB Dashboard):

These tables were already in the schema and are now **displayed/managed** by AI-HUB:

| Table | Purpose | AI-HUB Usage |
|-------|---------|--------------|
| `ai_conversations` | General AI interactions across platform | Display all AI conversations |
| `conversations` | Chatbot (Sai) conversations | Show chatbot interactions |
| `workflows` | Transaction automation (real estate deals) | Display transaction workflows |
| `ai_tools` | Available AI tools in marketplace | Show AI capabilities |

**Key Point:** AI-HUB does NOT create new tables for these - it queries and displays existing data.

---

### NEW Tables (Added in Session 1):

These tables were added for AI-HUB **specific features** that didn't exist before:

#### AI Agent System (NeuroFlow)
| Table | Purpose |
|-------|---------|
| `ai_agents` | Configurable AI agent definitions |
| `agent_teams` | Multi-agent orchestration teams |
| `team_members` | Agent membership in teams |
| `agent_executions` | Individual agent task execution history |
| `team_executions` | Team-based task execution history |

#### Automation Workflows (Distinct from Transaction Workflows)
| Table | Purpose |
|-------|---------|
| `automation_workflows` | AI-powered automation workflows (separate from transaction workflows) |
| `workflow_executions` | Unified execution tracking for BOTH transaction & automation workflows |

#### Integrations & Templates
| Table | Purpose |
|-------|---------|
| `integrations` | External service connections (Slack, Gmail, webhooks, etc.) |
| `workflow_templates` | Marketplace templates for both workflow types |

---

## 🔑 KEY NAMING DECISIONS

### Problem: Naming Conflicts

Several AI-HUB features could have conflicted with existing tables:

**Conflict #1: Workflows**
- **Existing:** `workflows` table (for transaction automation)
- **New:** AI-HUB automation workflows
- **Solution:** Named new table `automation_workflows` to distinguish from transaction workflows

**Conflict #2: Conversations**
- **Existing:** `conversations` table (chatbot - Sai)
- **Existing:** `ai_conversations` table (general AI interactions)
- **Solution:** AI-HUB reuses BOTH existing tables (no new table needed)

**Conflict #3: AI Agents**
- **New Feature:** AI agent configurations
- **Solution:** Named `ai_agents` to follow existing pattern (`ai_conversations`, `ai_tools`)

### Naming Convention Applied:

```
ai_agents              ✅ Follows existing AI prefix pattern
agent_teams            ✅ Clear, no conflict
team_members           ✅ Clear, no conflict
automation_workflows   ✅ Distinguishes from transaction workflows
workflow_executions    ✅ Polymorphic - tracks BOTH types
agent_executions       ✅ Specific to agent tasks
team_executions        ✅ Specific to team tasks
integrations           ✅ Clear, no conflict
workflow_templates     ✅ Marketplace templates
```

---

## 📋 COMPLETE MODEL INVENTORY

### Total Schema Size
- **Total Models:** 51 (+9 from Session 1)
- **Total Enums:** 76 (+7 from Session 1)

### AI-HUB Models Breakdown

**EXISTING (Reused by AI-HUB):**
1. `ai_conversations` - AI interactions
2. `conversations` - Chatbot conversations
3. `workflows` - Transaction workflows
4. `ai_tools` - AI tools

**NEW (Added in Session 1):**
1. `ai_agents` - AI agent configurations
2. `agent_teams` - Agent team orchestration
3. `team_members` - Team membership
4. `automation_workflows` - AI automation workflows
5. `workflow_executions` - Execution tracking (polymorphic)
6. `agent_executions` - Agent task history
7. `team_executions` - Team task history
8. `integrations` - External integrations
9. `workflow_templates` - Workflow templates

**Total AI-HUB Scope:** 13 tables (4 existing + 9 new)

---

## 🔧 ENUMS ADDED

Session 1 added 7 new enums:

```prisma
enum AgentStatus {
  IDLE
  BUSY
  OFFLINE
  ERROR
}

enum TeamStructure {
  HIERARCHICAL    // Leader delegates to workers
  COLLABORATIVE   // All agents contribute equally
  PIPELINE        // Sequential processing
  DEMOCRATIC      // Voting/consensus-based
}

enum TeamRole {
  LEADER
  WORKER
  COORDINATOR
  SPECIALIST
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
  TESTING
}

enum TemplateCategory {
  SALES
  SUPPORT
  MARKETING
  DATA_PROCESSING
  AUTOMATION
  ANALYTICS
  CONTENT
  COMMUNICATION
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

---

## 🎨 AI-HUB DASHBOARD DISPLAY STRATEGY

### What the Dashboard Shows:

**AI Conversations Section:**
- Data from: `ai_conversations` table
- Data from: `conversations` table (chatbot)
- Combined view of all AI interactions

**Workflows Section:**
- Data from: `workflows` table (transaction automation)
- Data from: `automation_workflows` table (AI automation)
- Combined view with type filtering

**AI Agents Section:**
- Data from: `ai_agents` table
- Data from: `agent_teams` table
- Agent performance metrics

**Executions Section:**
- Data from: `workflow_executions` table (both types)
- Data from: `agent_executions` table
- Data from: `team_executions` table
- Unified execution history

**Tools & Integrations:**
- Data from: `ai_tools` table
- Data from: `integrations` table
- Available capabilities

**Templates Marketplace:**
- Data from: `workflow_templates` table
- Public + organization-specific templates

---

## 🔒 MULTI-TENANCY STRATEGY

**ALL new tables include:**
- `organization_id` field (for tenant isolation)
- Indexes on `organization_id` for performance
- Foreign key constraints to `organizations` table
- Cascade deletion when organization is deleted

**RLS Policies (To be added in Session 2):**
- Row Level Security on all 9 new tables
- Tenant isolation using `organization_members` join
- Public access for public templates only

---

## 🚀 FUTURE SESSION ROADMAP

### Session 2: Workflows Module
- Build automation workflow builder UI
- Implement React Flow canvas
- Create workflow execution engine
- Add RLS policies (CRITICAL)

### Session 3: AI Agents Module
- Agent configuration interface
- Agent testing playground
- Performance monitoring

### Session 4: Agent Teams Module
- Team builder interface
- Coordination pattern selector
- Team execution orchestration

### Session 5: Integrations Module
- Integration connection UI
- OAuth flows for external services
- Webhook management

### Session 6: Templates Marketplace
- Template browser
- Template creation wizard
- Rating & review system

### Session 7: Analytics & Monitoring
- Execution analytics dashboard
- Performance metrics
- Cost tracking

### Session 8: Testing & Deployment
- E2E testing suite
- Production deployment
- Performance optimization

---

## 📖 DOCUMENTATION LOCATIONS

**Schema Documentation:**
- Quick Reference: `prisma/SCHEMA-QUICK-REF.md` (51 models, 76 enums)
- Model Details: `prisma/SCHEMA-MODELS.md` (all field definitions)
- Enum Values: `prisma/SCHEMA-ENUMS.md` (all enum values)
- **Architecture Decision: `prisma/AI-HUB-SCHEMA-DECISION.md` (THIS FILE)**

**Session Documentation:**
- Session Plans: `docs/development/update-sessions/active/dashboard-&-module-integrations/AI-HUB-Module/session-*.plan.md`
- Architecture: `docs/development/update-sessions/active/dashboard-&-module-integrations/AI-HUB-Module/AI-HUB-ARCHITECTURE.md`
- Dashboard Guide: `docs/development/update-sessions/active/dashboard-&-module-integrations/AI-HUB-Module/DASHBOARD-MODERNIZATION-UPDATE.md`

**Integration Guide:**
- Platform CLAUDE.md: `(platform)/CLAUDE.md`
- Root CLAUDE.md: `CLAUDE.md` (repository-wide standards)

---

## ⚠️ CRITICAL NOTES FOR FUTURE DEVELOPMENT

### DO:
✅ Query existing tables (`ai_conversations`, `conversations`, `workflows`, `ai_tools`) for dashboard display
✅ Use `automation_workflows` for NEW AI automation (distinct from transaction workflows)
✅ Use `workflow_executions` for tracking BOTH workflow types (polymorphic field `workflow_type`)
✅ Filter ALL queries by `organization_id`
✅ Add RLS policies before production use

### DON'T:
❌ Create duplicate tables for existing functionality
❌ Confuse `workflows` (transaction) with `automation_workflows` (AI automation)
❌ Query without `organization_id` filter (data leak!)
❌ Skip RLS policies (security vulnerability!)
❌ Assume AI-HUB is a separate system (it's a unified control center)

---

**This decision document must be referenced by ALL future AI-HUB sessions to maintain architectural consistency.**

**Last Updated:** 2025-10-10
**Session:** 1 of 8 (Database Foundation)
**Status:** ✅ Complete - Schema implemented, documentation updated
