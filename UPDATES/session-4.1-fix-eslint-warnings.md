# Session 4.1: Fix ESLint Warnings

**Phase:** 4 - Quality & Optimization
**Priority:** 🟢 LOW (non-blocking)
**Estimated Time:** 4-6 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Fix 1,326 ESLint warnings to improve code quality and type safety.

**Warnings:**
- `@typescript-eslint/no-explicit-any`: 291 instances
- `@typescript-eslint/no-unused-vars`: ~1000+ instances
- Other: 35 instances

---

## 📋 TASK (CONDENSED)

**Strategy: Incremental Fix (not all at once)**

**Phase 4.1a: Fix `no-explicit-any` (291 instances)**
```typescript
// ❌ Before:
function handleData(data: any) {
  return data.value;
}

// ✅ After:
interface DataType {
  value: string;
}
function handleData(data: DataType) {
  return data.value;
}
```

**Phase 4.1b: Fix `no-unused-vars` (1000+ instances)**
```typescript
// ❌ Before:
import { useState, useEffect } from 'react'; // useEffect unused
const [count] = useState(0); // count unused

// ✅ After:
import { useState } from 'react';
const [, setCount] = useState(0); // Use underscore for unused
```

**Exemptions (Already Configured):**
- Test files: `**/*.test.ts`
- Error handlers: `lib/api/error-handler.ts`
- Third-party types: `lib/types/**/supabase.ts`

**Approach:**
1. Run `npm run lint` to see all warnings
2. Fix highest-impact files first (core modules)
3. Use batch replacements where patterns repeat
4. Add `// eslint-disable-next-line` for valid edge cases only
5. Track progress: Fix 50-100 warnings per session

**Verification:**
```bash
npm run lint | grep "warning" | wc -l
# Target: <100 warnings
```

**DO NOT report success unless:**
- Warnings reduced by at least 75% (to ~330)
- All high-impact files fixed
- No new warnings introduced
- Build still succeeds

---

## 📊 SUCCESS CRITERIA

✅ **Complete when:**
- ESLint warnings <100 (or documented why remaining exist)
- Type safety improved
- Code quality metrics better

---

**Next:** Session 4.2 - Complete Module Consolidation
