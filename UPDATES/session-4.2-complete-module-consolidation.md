# Session 4.2: Complete Module Consolidation

**Phase:** 4 - Quality & Optimization
**Priority:** 🟢 LOW
**Estimated Time:** 2-4 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Remove remaining mock data conditionals from 4 modules (~179 lines).

**Modules:**
- `lib/modules/activities/` - ~45 lines
- `lib/modules/analytics/` - ~60 lines
- `lib/modules/appointments/` - ~40 lines
- `lib/modules/marketplace/reviews/` - ~34 lines

---

## 📋 TASK (CONDENSED)

**Pattern to Remove:**
```typescript
// ❌ Remove this:
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

if (USE_MOCKS) {
  return mockProvider.findMany();
} else {
  return await prisma.activity.findMany({
    where: { organization_id: organizationId }
  });
}

// ✅ Replace with:
return await prisma.activity.findMany({
  where: { organization_id: organizationId }
});
```

**Process:**
1. Search for all `USE_MOCKS` references
2. Remove conditional blocks
3. Keep only Prisma query path
4. Delete mock provider imports
5. Update tests to use Prisma
6. Verify all modules work

**Verification:**
```bash
grep -r "USE_MOCKS" (platform)/lib/modules/
# Should return: 0 results

npm test
npm run build
```

**DO NOT report success unless:**
- All mock conditionals removed
- All modules using Prisma only
- Tests passing
- Build succeeds

---

**Next:** Session 4.3 - Restore Server-Only Protection
