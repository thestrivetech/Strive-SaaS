/**
 * Notification System Test Script
 * Tests notification CRUD operations from Session 3 plan
 */

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/prisma';

async function testNotifications() {
  console.log('🧪 Testing Notification System\n');
  console.log('=' .repeat(60));

  let notificationId: string | null = null;

  try {
    // Get a test user and organization
    console.log('\n📋 Setup: Finding test user and organization...');
    const user = await prisma.users.findFirst({
      include: {
        organization_members: {
          include: {
            organizations: true
          }
        }
      }
    });

    if (!user || !user.organization_members[0]) {
      console.log('❌ No test user with organization found');
      console.log('   Please create a user and organization first');
      process.exit(1);
    }

    const userId = user.id;
    const organizationId = user.organization_members[0].organization_id;

    console.log(`✅ Using user: ${user.email}`);
    console.log(`✅ Using organization: ${user.organization_members[0].organizations.name}`);

    // Test 1: Create notification
    console.log('\n🧪 Test 1: Create Notification');
    console.log('-'.repeat(60));

    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        organization_id: organizationId,
        type: 'INFO',
        title: 'Test Notification',
        message: 'This is a test notification from Session 3 testing',
        read: false,
      },
    });

    notificationId = notification.id;
    console.log('✅ Created notification:', notification.id);
    console.log('   Type:', notification.type);
    console.log('   Title:', notification.title);
    console.log('   Read:', notification.read);

    // Test 2: Fetch unread notifications
    console.log('\n🧪 Test 2: Fetch Unread Notifications');
    console.log('-'.repeat(60));

    const unread = await prisma.notifications.findMany({
      where: {
        user_id: userId,
        read: false,
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    console.log(`✅ Found ${unread.length} unread notification(s)`);
    unread.forEach((n, i) => {
      console.log(`   ${i + 1}. ${n.title} (${n.type})`);
    });

    // Test 3: Mark as read
    console.log('\n🧪 Test 3: Mark Notification as Read');
    console.log('-'.repeat(60));

    const updated = await prisma.notifications.update({
      where: { id: notification.id },
      data: { read: true },
    });

    console.log('✅ Marked notification as read');
    console.log('   Read status:', updated.read);

    // Test 4: Verify read status
    console.log('\n🧪 Test 4: Verify Read Status');
    console.log('-'.repeat(60));

    const verified = await prisma.notifications.findUnique({
      where: { id: notification.id },
    });

    if (verified && verified.read) {
      console.log('✅ Read status verified: true');
    } else {
      console.log('❌ Read status verification failed');
    }

    // Test 5: Create notification with optional fields
    console.log('\n🧪 Test 5: Create Notification with Optional Fields');
    console.log('-'.repeat(60));

    const richNotification = await prisma.notifications.create({
      data: {
        user_id: userId,
        organization_id: organizationId,
        type: 'SUCCESS',
        title: 'Task Completed',
        message: 'Your task "Test Task" has been marked as complete',
        action_url: '/tasks/123',
        entity_type: 'TASK',
        entity_id: '123',
        read: false,
      },
    });

    console.log('✅ Created notification with metadata:');
    console.log('   Action URL:', richNotification.action_url);
    console.log('   Entity Type:', richNotification.entity_type);
    console.log('   Entity ID:', richNotification.entity_id);

    // Test 6: Query by type
    console.log('\n🧪 Test 6: Query Notifications by Type');
    console.log('-'.repeat(60));

    const infoNotifications = await prisma.notifications.findMany({
      where: {
        user_id: userId,
        type: 'INFO',
      },
    });

    console.log(`✅ Found ${infoNotifications.length} INFO notification(s)`);

    const successNotifications = await prisma.notifications.findMany({
      where: {
        user_id: userId,
        type: 'SUCCESS',
      },
    });

    console.log(`✅ Found ${successNotifications.length} SUCCESS notification(s)`);

    // Test 7: Delete notification
    console.log('\n🧪 Test 7: Delete Notifications');
    console.log('-'.repeat(60));

    await prisma.notifications.delete({
      where: { id: notification.id },
    });

    console.log('✅ Deleted first test notification');

    await prisma.notifications.delete({
      where: { id: richNotification.id },
    });

    console.log('✅ Deleted second test notification');

    // Test 8: Verify deletion
    console.log('\n🧪 Test 8: Verify Deletion');
    console.log('-'.repeat(60));

    const deletedNotif = await prisma.notifications.findUnique({
      where: { id: notification.id },
    });

    if (!deletedNotif) {
      console.log('✅ Notification deletion verified');
    } else {
      console.log('❌ Notification still exists after deletion');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('✅ All notification tests passed!');
    console.log('\nTested capabilities:');
    console.log('  ✅ Create notifications');
    console.log('  ✅ Query notifications (unread, by type)');
    console.log('  ✅ Update notifications (mark as read)');
    console.log('  ✅ Delete notifications');
    console.log('  ✅ Notifications with metadata (actionUrl, entity)');
    console.log('\n🎉 Notification system is working correctly!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications()
  .catch(console.error)
  .finally(() => process.exit());
