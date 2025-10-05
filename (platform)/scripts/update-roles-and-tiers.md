# Role and Tier Migration Reference

## Updated Enums

### UserRole (Prisma & TypeScript)
- **Old:** `SUPER_ADMIN`, `ORG_ADMIN`, `MODERATOR`, `EMPLOYEE`, `CLIENT`
- **New:** `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `EMPLOYEE`
- **Changes:**
  - `ORG_ADMIN` → `ADMIN`
  - `CLIENT` → removed (migrated to `EMPLOYEE` in database)

### SubscriptionTier (Prisma & TypeScript)
- **Old:** `FREE`, `BASIC`, `PRO`, `ENTERPRISE`
- **New:** `STARTER`, `GROWTH`, `ELITE`, `ENTERPRISE`
- **Changes:**
  - `FREE` → `STARTER`
  - `BASIC` → `STARTER`
  - `PRO` → `GROWTH`
  - `ELITE` → new tier (between GROWTH and ENTERPRISE)

## Search and Replace Patterns

### Role Updates
```
Find: 'ORG_ADMIN'
Replace: 'ADMIN'

Find: CLIENT
Replace: (context-dependent - check if role or general client term)

Find: ['ADMIN', 'MODERATOR', 'EMPLOYEE', 'CLIENT']
Replace: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EMPLOYEE']
```

### Tier Updates
```
Find: 'FREE'
Replace: 'STARTER'

Find: 'BASIC'
Replace: 'STARTER'

Find: 'PRO'
Replace: 'GROWTH'

Find: TIER_1
Replace: STARTER

Find: TIER_2
Replace: GROWTH

Find: TIER_3
Replace: ELITE
```

## Files Already Updated
- ✅ `shared/prisma/schema.prisma` - enum definitions
- ✅ Database migration applied
- ✅ Prisma client generated
- ✅ `(platform)/lib/auth/constants.ts` - role and tier constants

## Files Still Need Updating
Search for these patterns and update:

### Role References
- All RBAC functions
- Middleware auth checks
- Test files
- Component prop types

### Tier References
- Tier gate components
- Upgrade prompt
- Middleware tier checks
- Tool constants
- Dashboard tier checks

## Migration Commands

### Already Run
```sql
-- Database migration applied successfully
-- Enum values updated in database
```

### Still Needed
```bash
# Update TypeScript files (done via manual edits)
# Run type check after all updates
cd "(platform)" && npx tsc --noEmit
```
