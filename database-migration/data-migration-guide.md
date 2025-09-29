# 🔄 Strive Tech Database Migration Guide

## 📋 Complete Migration Checklist

### Phase 1: Export Current Data (If Any Exists)
```bash
# 1. Export all data from old database (run this BEFORE changing .env.local)
cd /Users/grant/Documents/GitHub/Strive-SaaS/app

# Export schema
npx prisma db pull --print > ../database-migration/current-schema.prisma

# Export data (if tables exist)
npx prisma db seed --preview-feature || echo "No seed data found"

# Create data dump (PostgreSQL)
pg_dump "$DATABASE_URL" > ../database-migration/data-backup.sql
```

### Phase 2: New Database Setup
```bash
# 2. Update .env.local with NEW Supabase credentials
# Replace these values in .env.local:
# - DATABASE_URL
# - DIRECT_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 3. Run the setup script
./database-migration/prisma-setup-commands.sh
```

### Phase 3: Data Migration (If Needed)
```bash
# 4. Import old data to new database (if you had data)
psql "$DATABASE_URL" < ../database-migration/data-backup.sql

# OR use Prisma Studio to manually transfer important records
npx prisma studio
```

## 🔧 New Database Credentials Template

Update your `/Users/grant/Documents/GitHub/Strive-SaaS/app/.env.local` with:

```bash
# NEW SUPABASE PROJECT CREDENTIALS
# Get from: https://supabase.com/dashboard/project/NEW_PROJECT_ID/settings/database
DATABASE_URL="postgresql://postgres.NEW_PROJECT_REF:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.NEW_PROJECT_REF.supabase.co:5432/postgres"

# Get from: https://supabase.com/dashboard/project/NEW_PROJECT_ID/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://NEW_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="NEW_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="NEW_SERVICE_ROLE_KEY"

# Keep these the same
JWT_SECRET="[GENERATE-32-CHAR-SECRET]"
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NODE_ENV="development"

# Optional - keep existing values or update
OPENROUTER_API_KEY="[YOUR-OPENROUTER-API-KEY]"
STRIPE_SECRET_KEY="sk_test_[YOUR-STRIPE-SECRET-KEY]"
STRIPE_PUBLISHABLE_KEY="pk_test_[YOUR-STRIPE-PUBLISHABLE-KEY]"
STRIPE_WEBHOOK_SECRET="whsec_[YOUR-WEBHOOK-SECRET]"

# Email configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="[YOUR-EMAIL@strivetech.ai]"
SMTP_PASSWORD="[YOUR-APP-PASSWORD]"
SMTP_FROM="noreply@strivetech.ai"

# Vercel (update if needed)
PROJECT_ID="prj_0N8RVEEEpCDUcnPRdihNJtrmLBK4"
TEAM_ID="team_bDltmM6Wm8T4Z9YxJAT87e4e"
VERCEL_TOKEN="VsKHSI97IJGEX6gEWHwKxqJ0"
```

## 🗂️ Database Schema Overview

Your new database will include these tables:

### Core Tables:
- **users** - User authentication and profiles
- **organizations** - Multi-tenant organizations
- **organization_members** - User-organization relationships
- **customers** - CRM customer data
- **projects** - Project management
- **tasks** - Task tracking and management

### AI & Advanced Features:
- **ai_conversations** - AI chat history
- **ai_tools** - Available AI tools and configurations
- **usage_tracking** - Resource usage monitoring
- **subscriptions** - Billing and subscription data

### Additional Features:
- **appointments** - Calendar and scheduling
- **content** - Content management system
- **activity_logs** - Audit trail and activity tracking

### Security Features:
- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Multi-tenant isolation** policies
- ✅ **UUID primary keys** for security
- ✅ **Proper foreign key constraints**
- ✅ **Database triggers** for updated_at timestamps

## 🚀 Quick Start After Migration

```bash
# Start development server
npm run dev

# Access database admin
npx prisma studio

# Run tests
npm test

# Deploy to Vercel
vercel --prod
```

## 🔍 Verification Steps

1. ✅ Database schema created
2. ✅ All tables and indexes present
3. ✅ Row Level Security enabled
4. ✅ Triggers and functions working
5. ✅ Prisma client generated
6. ✅ App connects to database
7. ✅ Can create test user/organization
8. ✅ Vercel deployment works

## 🆘 Troubleshooting

### Common Issues:
- **Connection Error**: Check DATABASE_URL format
- **Permission Error**: Verify SUPABASE_SERVICE_ROLE_KEY
- **Migration Error**: Ensure new database is empty
- **Build Error**: Run `npx prisma generate`

### Support Commands:
```bash
# Reset database (CAREFUL!)
npx prisma db push --force-reset

# Pull latest schema
npx prisma db pull

# Check connection
npx prisma db execute --stdin <<< "SELECT 1"
```

---

**📞 Need Help?**
- Check Supabase dashboard for connection issues
- Verify all environment variables are set
- Test connection with `npx prisma studio`