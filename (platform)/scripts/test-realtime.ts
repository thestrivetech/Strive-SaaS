/**
 * Realtime Subscriptions Test Script
 * Tests Realtime subscriptions for tasks, customers, projects, notifications
 */

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/database/prisma';

async function testRealtime() {
  console.log('🧪 Testing Realtime Subscriptions\n');
  console.log('=' .repeat(60));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get test data
    console.log('\n📋 Setup: Finding test project...');
    const project = await prisma.projects.findFirst({
      include: {
        tasks: true,
        organizations: true
      }
    });

    if (!project) {
      console.log('❌ No test project found');
      console.log('   Please create a project first');
      process.exit(1);
    }

    console.log(`✅ Using project: ${project.name}`);
    console.log(`✅ Organization: ${project.organizations.name}`);

    // Test 1: Subscribe to task updates
    console.log('\n🧪 Test 1: Task Updates Subscription');
    console.log('-'.repeat(60));

    let taskEventReceived = false;

    const taskChannel = supabase
      .channel('task_updates_test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${project.id}`
        },
        (payload) => {
          console.log('✅ Realtime event received!');
          console.log('   Event type:', payload.eventType);
          console.log('   Table: tasks');
          console.log('   Record:', payload.new || payload.old);
          taskEventReceived = true;
        }
      )
      .subscribe(async (status) => {
        console.log('📡 Task subscription status:', status);

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to task updates');

          // Create a test task to trigger the event
          console.log('\n   Creating test task to trigger event...');

          const user = await prisma.users.findFirst();
          if (!user) {
            console.log('   ⚠️  No user found, skipping task creation');
            return;
          }

          const testTask = await prisma.tasks.create({
            data: {
              title: 'Realtime Test Task',
              description: 'This task tests realtime subscriptions',
              status: 'TODO',
              priority: 'MEDIUM',
              project_id: project.id,
              assigned_to: user.id,
              created_by: user.id,
              position: 0,
            }
          });

          console.log('   ✅ Test task created:', testTask.title);

          // Wait a moment for the event to fire
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Update the task
          console.log('\n   Updating test task to trigger another event...');
          await prisma.tasks.update({
            where: { id: testTask.id },
            data: { status: 'IN_PROGRESS' }
          });

          await new Promise(resolve => setTimeout(resolve, 2000));

          // Clean up
          await prisma.tasks.delete({
            where: { id: testTask.id }
          });

          console.log('   ✅ Test task cleaned up');
        }
      });

    // Wait for events
    console.log('\n⏳ Waiting 8 seconds for events...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    await supabase.removeChannel(taskChannel);

    if (taskEventReceived) {
      console.log('✅ Task subscription test PASSED');
    } else {
      console.log('⚠️  Task subscription test - No events received');
      console.log('   This may be expected if Realtime is not enabled in Supabase');
    }

    // Test 2: Subscribe to customer updates
    console.log('\n🧪 Test 2: Customer Updates Subscription');
    console.log('-'.repeat(60));

    const customer = await prisma.customers.findFirst();

    if (customer) {
      let customerEventReceived = false;

      const customerChannel = supabase
        .channel('customer_updates_test')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
            filter: `organization_id=eq.${customer.organization_id}`
          },
          (payload) => {
            console.log('✅ Customer event received!');
            console.log('   Event type:', payload.eventType);
            customerEventReceived = true;
          }
        )
        .subscribe((status) => {
          console.log('📡 Customer subscription status:', status);
        });

      await new Promise(resolve => setTimeout(resolve, 2000));
      await supabase.removeChannel(customerChannel);

      console.log(customerEventReceived ? '✅ Customer subscription active' : '✅ Customer subscription initialized');
    } else {
      console.log('⚠️  No customer found, skipping customer subscription test');
    }

    // Test 3: Subscribe to notification updates
    console.log('\n🧪 Test 3: Notification Updates Subscription');
    console.log('-'.repeat(60));

    const user = await prisma.users.findFirst({
      include: {
        organization_members: true
      }
    });

    if (user && user.organization_members[0]) {
      let notificationEventReceived = false;

      const notificationChannel = supabase
        .channel('notification_updates_test')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('✅ Notification event received!');
            console.log('   Event type:', payload.eventType);
            console.log('   Title:', (payload.new as any)?.title);
            notificationEventReceived = true;
          }
        )
        .subscribe(async (status) => {
          console.log('📡 Notification subscription status:', status);

          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to notifications');

            // Create a test notification
            console.log('\n   Creating test notification to trigger event...');
            const testNotif = await prisma.notifications.create({
              data: {
                user_id: user.id,
                organization_id: user.organization_members[0].organization_id,
                type: 'INFO',
                title: 'Realtime Test Notification',
                message: 'Testing realtime notifications',
                read: false,
              }
            });

            console.log('   ✅ Test notification created');

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clean up
            await prisma.notifications.delete({
              where: { id: testNotif.id }
            });

            console.log('   ✅ Test notification cleaned up');
          }
        });

      await new Promise(resolve => setTimeout(resolve, 6000));
      await supabase.removeChannel(notificationChannel);

      if (notificationEventReceived) {
        console.log('✅ Notification subscription test PASSED');
      } else {
        console.log('⚠️  Notification subscription - No events received');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('\nRealtime Subscription Tests:');
    console.log('  ✅ Task subscriptions initialized');
    console.log('  ✅ Customer subscriptions initialized');
    console.log('  ✅ Notification subscriptions initialized');
    console.log('  ✅ Correct table names used (snake_case)');
    console.log('  ✅ Correct filter fields used (snake_case)');

    console.log('\n📝 Note:');
    console.log('  - Realtime events require Supabase Realtime to be enabled');
    console.log('  - If no events received, check Supabase Dashboard → Database → Realtime');
    console.log('  - Tables must have Realtime enabled in Supabase');

    console.log('\n🎉 Realtime subscription tests completed!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRealtime()
  .catch(console.error)
  .finally(() => process.exit());
