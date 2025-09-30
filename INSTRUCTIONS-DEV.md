# Development Instructions

## Project Structure (Updated 2025-09-29)

The project uses Next.js 15 App Router with the following structure:

```
app/                    # Next.js project root
├── app/                # App Router directory (where all routes live)
│   ├── (platform)/     # Platform routes
│   ├── (web)/          # Marketing routes
│   └── api/            # API routes
├── components/
├── lib/
└── [config files]
```

## Quick Start

1. **Run development server:**
   ```bash
   cd app
   npm run dev
   ```
   Server runs on http://localhost:3000

2. **Access Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   Database GUI on port 5555

3. **Test login:**
   - Visit: http://localhost:3000/login
   - Username/Email: jgramcoin@gmail.com
   - Password: TestPassword123!
   - Expected: Redirect to dashboard as ADMIN user


# Tokens & Context Window #

How many tokens does it take to read 4 files? Mainly The session chat log, and these three files: 
/Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md - /Users/grant/Documents/GitHub/Strive-SaaS/docs/README.md & 
/Users/grant/Documents/GitHub/Strive-SaaS/docs/APP_BUILD_PLAN.md 

⏺ Read(CLAUDE.md)
  ⎿  Read 267 lines (ctrl+o to expand)

⏺ Read(docs/README.md)
  ⎿  Read 615 lines (ctrl+o to expand)

⏺ Read(docs/APP_BUILD_PLAN.md)
  ⎿  Read 422 lines (ctrl+o to expand)

⏺ Read(chat-logs/Session5.md)
  ⎿  Read 455 lines (ctrl+o to expand)

⏺ Token Count Analysis

  Based on reading all 4 files:

  | File                   | Approximate Tokens |
  |------------------------|--------------------|
  | CLAUDE.md              | ~1,800 tokens      |
  | docs/README.md         | ~4,200 tokens      |
  | docs/APP_BUILD_PLAN.md | ~2,800 tokens      |
  | chat-logs/Session5.md  | ~3,100 tokens      |
  | Total                  | ~11,900 tokens     |

  Context Window Impact

  For a typical session start:
  - Reading these 4 files: ~11,900 tokens
  - Your system prompt + instructions: ~10,000 tokens
  - User conversation: ~5,000 tokens
  - Total baseline: ~26,900 tokens

  With 200K context window:
  - These files use ~6% of available context
  - Leaves 173K tokens for actual development work
  - Very efficient and sustainable

  Optimization Observations

  The current setup is already quite efficient:

  1. CLAUDE.md (1,800 tokens) - Concise, focuses on critical rules
  2. Session5.md (3,100 tokens) - Focused task list, not bloated
  3. APP_BUILD_PLAN.md (2,800 tokens) - Project overview only
  4. docs/README.md (4,200 tokens) - Most verbose but comprehensive

  Recommendation

  The current structure is good. ~12K tokens for full context is reasonable. However, if you want to optimize further:

  Option 1: Create Session Start Checklist (reduce to ~8K tokens)
  - Ultra-compact checklist that references full docs
  - Read full docs only when needed for specific tasks

  Option 2: Keep as-is (current ~12K tokens)
  - Already efficient at 6% of context window
  - Comprehensive context prevents mistakes
  - Worth the token cost for quality

  My suggestion: Keep current approach. 12K tokens for complete context is a worthwhile investment that prevents errors and ensures consistency.