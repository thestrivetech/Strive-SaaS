# Supabase Realtime Enablement Guide
**Strive Tech SaaS Platform**

**Last Updated:** October 2, 2025
**Status:** ⚠️ **Manual Configuration Required**

---

## Overview

This guide provides step-by-step instructions to enable Supabase Realtime for database tables. Realtime subscriptions allow the application to receive live updates when data changes in PostgreSQL tables.

**Current Status:**
- ✅ Realtime client code implemented (`app/lib/realtime/client.ts`)
- ✅ Test scripts created (`app/scripts/test-realtime.ts`)
- ✅ Table names fixed (using snake_case: `tasks`, `customers`, `projects`, `notifications`)
- ⚠️ Realtime **NOT YET ENABLED** in Supabase Dashboard

**Time Required:** 5 minutes

---

## Why Enable Realtime?

**Without Realtime:**
- Application must poll database for updates (inefficient)
- Users need to refresh page to see new data
- Increased server load from constant polling
- Delayed user experience

**With Realtime:**
- ✅ Instant updates pushed to connected clients
- ✅ Live notifications appear immediately
- ✅ Collaborative features (task updates, team presence)
- ✅ Reduced server load (WebSocket connection)
- ✅ Better user experience

---

## Tables to Enable

Enable Realtime for these tables:

| Table | Purpose | Priority |
|-------|---------|----------|
| `notifications` | Live notification bell updates | 🔴 High |
| `tasks` | Live task status updates | 🟠 Medium |
| `projects` | Project collaboration updates | 🟡 Low |
| `customers` | CRM live updates | 🟡 Low |

---

## Step-by-Step Instructions

### Method 1: Via Supabase Dashboard (Recommended)

#### Step 1: Access Supabase Dashboard

1. Open your browser and go to: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in with your Supabase credentials
3. Select your project: **Strive Tech SaaS**

#### Step 2: Navigate to Realtime Settings

1. In the left sidebar, click **Database**
2. Click **Replication** tab (or **Realtime** depending on Supabase UI version)
3. You should see a list of your database tables

#### Step 3: Enable Realtime for Tables

For each table (`notifications`, `tasks`, `projects`, `customers`):

1. Find the table in the list
2. Toggle the **Realtime** switch to **ON** (enabled)
3. A green checkmark or "Enabled" status should appear

**Example:**
```
Table Name          | Realtime Status
--------------------|------------------
notifications       | ✅ Enabled
tasks               | ✅ Enabled
projects            | ✅ Enabled
customers           | ✅ Enabled
```

#### Step 4: Verify Configuration

1. Click **Database** → **Replication** again
2. Confirm all 4 tables show "Enabled" status
3. Changes take effect immediately (no restart needed)

---

### Method 2: Via SQL (Alternative)

If the dashboard UI is unavailable, you can enable Realtime via SQL:

```sql
-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable Realtime for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Enable Realtime for customers table
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Verify publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

**Execute in Supabase SQL Editor:**
1. Dashboard → SQL Editor → New Query
2. Paste the SQL above
3. Click **Run**
4. Verify output shows all 4 tables

---

## Testing Realtime

After enabling Realtime, test the functionality:

### Quick Test (Manual)

1. Open two browser tabs with your app
2. **Tab 1:** Dashboard page (showing notifications)
3. **Tab 2:** Create a new task or notification
4. **Tab 1:** Should update automatically without refresh

### Automated Test Script

```bash
# Run Realtime test script
cd app
npm run test:db:realtime

# Or using the shell script directly
./scripts/run-tests.sh realtime
```

**Expected Output:**
```
🧪 Testing Realtime Subscriptions...

✅ Task subscription created successfully
✅ Customer subscription created successfully
✅ Notification subscription created successfully
✅ All subscriptions active
```

---

## Troubleshooting

### Issue: Subscriptions Connect but Events Don't Fire

**Symptoms:**
- Subscription status shows "SUBSCRIBED"
- Creating/updating data doesn't trigger callbacks
- No errors in console

**Solution:**
1. Verify Realtime is enabled in Dashboard (Database → Replication)
2. Check table names are lowercase snake_case (`tasks` not `Task`)
3. Verify filter fields use snake_case (`user_id` not `userId`)

**Test Query:**
```sql
-- Check if table is in publication
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'notifications';
```

### Issue: "Realtime is disabled for this project"

**Cause:** Realtime feature not enabled in Supabase project settings

**Solution:**
1. Go to Dashboard → Settings → API
2. Scroll to **Realtime** section
3. Toggle **Enable Realtime** to ON
4. Save changes

### Issue: Connection Errors or Timeouts

**Cause:** Network or WebSocket connection issues

**Solution:**
1. Check browser console for WebSocket errors
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Check firewall/proxy isn't blocking WebSocket connections
4. Try different network (disable VPN if active)

### Issue: High Memory Usage

**Cause:** Too many active subscriptions or memory leaks

**Solution:**
1. Ensure subscriptions are cleaned up in `useEffect` return function
2. Limit subscriptions to active pages only
3. Use filters to reduce event volume
4. Monitor with Supabase Dashboard → Realtime tab

---

## Best Practices

### 1. Always Clean Up Subscriptions

```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel');

  channel
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, handler)
    .subscribe();

  // ✅ CRITICAL: Clean up on unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 2. Use Filters to Reduce Events

```typescript
// ❌ BAD: Receives all task updates
.on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handler)

// ✅ GOOD: Only receives updates for specific project
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'tasks',
  filter: 'project_id=eq.abc123'  // Filter by project
}, handler)
```

### 3. Handle Connection State

```typescript
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    console.log('✅ Connected to Realtime');
  } else if (status === 'CHANNEL_ERROR') {
    console.error('❌ Realtime connection error');
  } else if (status === 'TIMED_OUT') {
    console.error('⏱️ Realtime connection timed out');
  }
});
```

### 4. Use Specific Event Types

```typescript
// ✅ More efficient: Subscribe to specific events
.on('postgres_changes', { event: 'INSERT', ... }, handleInsert)
.on('postgres_changes', { event: 'UPDATE', ... }, handleUpdate)

// ⚠️ Less efficient: Catch all events
.on('postgres_changes', { event: '*', ... }, handleAllEvents)
```

---

## Monitoring Realtime Usage

### Supabase Dashboard

1. Go to **Dashboard → Realtime**
2. View metrics:
   - Active connections
   - Messages per second
   - Peak concurrent connections
   - Data transfer

### Set Usage Alerts

1. Dashboard → Settings → Billing
2. Set threshold alerts for:
   - Concurrent connections (warn at 80% of plan limit)
   - Monthly data transfer
   - Peak usage patterns

---

## Performance Considerations

### Connection Limits by Plan

| Plan | Max Concurrent Connections |
|------|---------------------------|
| Free | 200 |
| Pro  | 500 |
| Team | 1000+ |

**Current Plan:** Check Dashboard → Settings → Billing

### Optimization Tips

1. **Combine Channels:** Use one channel for multiple table subscriptions
2. **Filter Aggressively:** Reduce event volume with precise filters
3. **Debounce Handlers:** Avoid excessive UI updates
4. **Lazy Subscribe:** Only subscribe when user is viewing relevant page

---

## Security Notes

### RLS Still Applies

Even with Realtime enabled, Row Level Security (RLS) policies are enforced:

- Users only receive events for rows they have permission to see
- RLS filters events at the database level
- No additional client-side filtering needed

**Example:**
```typescript
// User will only receive notifications where user_id matches their ID
// This is enforced by RLS policy, not client code
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, handler)
  .subscribe();
```

---

## Next Steps After Enabling

1. ✅ Enable Realtime for all 4 tables
2. ✅ Run test script: `npm run test:db:realtime`
3. ✅ Test in browser with two tabs open
4. ✅ Monitor connection in Supabase Dashboard
5. ✅ Update Session 3 summary to mark Realtime as enabled

---

## Related Documentation

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Session 3 Summary](./session-logs/session3_summary.md)
- [PRISMA-SUPABASE-STRATEGY.md](./PRISMA-SUPABASE-STRATEGY.md) - Realtime use cases
- [test-realtime.ts](../../app/scripts/test-realtime.ts) - Test script

---

## Quick Reference

### Enable Realtime (Dashboard)
1. Dashboard → Database → Replication
2. Toggle ON for: notifications, tasks, projects, customers

### Test Realtime
```bash
npm run test:db:realtime
```

### Verify Publication (SQL)
```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

### Clean Up Subscription
```typescript
return () => supabase.removeChannel(channel);
```

---

**Status After Enablement:** 🟢 Ready for Production

**Estimated Impact:**
- Notification delivery: Instant (vs 30s polling)
- Server load: -70% (eliminated polling)
- User experience: Significantly improved
- Concurrent users: Supports 200-500+ (depending on plan)

---

**Last Updated:** October 2, 2025
**Next Review:** After Realtime enablement in dashboard
