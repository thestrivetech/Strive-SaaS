# Test Suite Quick Start Guide

## Prerequisites
- ✅ `.env.test` file exists with database credentials
- ✅ Database is accessible (local PostgreSQL or Supabase)

## Option 1: One-Command Setup (Recommended)

```bash
# This will:
# 1. Drop all existing tables
# 2. Run Prisma migrations
# 3. Generate Prisma client
# 4. Verify setup

./__tests__/setup-fresh-test-db.sh
```

**That's it!** Now run:
```bash
npm test
```

---

## Option 2: Manual Setup

```bash
# 1. Reset database (drops all tables)
npx prisma migrate reset --force --skip-seed

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Run tests
npm test
```

---

## What Tests Are Available?

### ✅ Ready to Run (30 tests)
- **CRM Actions** (13 tests): Customer CRUD + multi-tenant isolation
- **Notification Actions** (17 tests): All notification operations

```bash
# Run specific test suites
npm test -- crm              # Run CRM tests only
npm test -- notifications    # Run notification tests only
```

---

## Verify Everything Works

```bash
# Run all tests
npm test

# Expected output:
# PASS  __tests__/unit/lib/modules/crm/actions.test.ts
# PASS  __tests__/unit/lib/modules/notifications/actions.test.ts
#
# Test Suites: 2 passed, 2 total
# Tests:       30 passed, 30 total
# Snapshots:   0 total
# Time:        ~2-3s
```

---

## Troubleshooting

### "Can't reach database server"
```bash
# Check database is accessible
pg_isready -h localhost -p 5432  # For local PostgreSQL

# Verify .env.test has correct credentials
cat .env.test | grep DATABASE_URL
```

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Tables already exist"
```bash
# Run the reset script
./__tests__/setup-fresh-test-db.sh
```

### Tests fail with "relation does not exist"
```bash
# Run migrations again
npx prisma migrate deploy
```

---

## Next Steps

After tests pass, you can:

1. **Check coverage:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **Run tests in watch mode:**
   ```bash
   npm test -- --watch
   ```

3. **Read full documentation:**
   - `__tests__/README.md` - Complete testing guide
   - `__tests__/SESSION_PROGRESS.md` - Detailed progress tracking

---

## Need Help?

- **Database setup issues:** See `__tests__/README.md` section "Database Setup"
- **Test writing guide:** See `__tests__/README.md` section "Writing Tests"
- **Full documentation:** All `.md` files in `__tests__/` directory

---

**That's it! You're ready to start testing! 🎉**
