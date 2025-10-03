# Structure Refactoring Session - Start Prompt Template

**Purpose:** Use this prompt to start each restructuring session with full project context.

---

## Session Start Prompt

```
I'm starting a new session to refactor the Strive SaaS platform to align with the industry-as-plugin architecture.

Please read the following files to understand the project context and development standards:

1. **Development Standards & Rules:**
   - /Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md

2. **Architecture Documentation:**
   - /Users/grant/Documents/GitHub/Strive-SaaS/docs/structure/STRUCTURE-OVERVIEW-1.md (PRIMARY - industry-as-plugin architecture)
   - /Users/grant/Documents/GitHub/Strive-SaaS/docs/structure/MULTI-INDUSTRY-ARCHITECTURE.md (future evolution)
   - /Users/grant/Documents/GitHub/Strive-SaaS/docs/structure/TYPES-GUIDE.md (type system)
   - /Users/grant/Documents/GitHub/Strive-SaaS/docs/structure/tools-guide.md (tool organization)

3. **Current State:**
   - /Users/grant/Documents/GitHub/Strive-SaaS/README.md (project overview)
   - /Users/grant/Documents/GitHub/Strive-SaaS/project-directory-map.txt (current directory structure - first 500 lines)

After reading these files, please:

1. Confirm you understand the target architecture:
   - Core modules in `lib/modules/` (CRM, Projects, AI, Tasks)
   - Industry implementations in `lib/industries/[industry]/` (features, tools, overrides)
   - Shared tools in `lib/tools/shared/` (universal marketplace tools)

2. Review the current state of the codebase to identify what needs to be refactored

3. Present a concise plan for today's session focusing on [SESSION_FOCUS]

**Session Focus:** [DESCRIBE WHAT YOU WANT TO ACCOMPLISH THIS SESSION]

**Critical Reminders:**
- Always READ files before editing them
- Use Glob/Grep to check if files/structures already exist before creating
- Prefer editing existing files over creating new ones
- Follow the 500-line file size limit (hard limit enforced by ESLint)
- Write tests FIRST (TDD approach)
- Maintain 80%+ test coverage
```

---

## How to Use This Template

1. Copy the session start prompt above
2. Replace `[SESSION_FOCUS]` with your specific goal for the session
3. Paste into Claude Code to start your session
4. Claude will read all reference files and provide context-aware assistance

---

## Session Log Template

After each session, create a session log in this directory following this structure:

```markdown
# Session [N] - [BRIEF DESCRIPTION]

**Date:** YYYY-MM-DD
**Duration:** ~X hours
**Status:** ✅ Complete | 🚧 In Progress | ⏸️ Paused

## Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## What Was Accomplished
- ✅ Completed task 1
- ✅ Completed task 2

## What Remains
- [ ] Remaining task 1
- [ ] Remaining task 2

## Files Changed
- `path/to/file1.ts` - Description of changes
- `path/to/file2.ts` - Description of changes

## Next Session
Focus on: [WHAT TO DO NEXT]

## Notes
- Any important observations or decisions made
- Blockers encountered
- Questions for future consideration
```
