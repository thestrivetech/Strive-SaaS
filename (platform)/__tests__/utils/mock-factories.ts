/**
 * Mock Data Factories
 * Generate realistic test data using Faker.js
 */

import { faker } from '@faker-js/faker';
import type {
  users,
  organizations,
  organization_members,
  customers,
  projects,
  tasks,
  notifications,
  attachments,
  ai_conversations,
  subscriptions,
} from '@prisma/client';
import {
  UserRole,
  SubscriptionTier,
  OrgRole,
  SubscriptionStatus,
  NotificationType,
  ProjectStatus,
  TaskStatus,
  Priority,
} from '@prisma/client';

/**
 * Generate a mock user
 */
export function mockUser(overrides: Partial<users> = {}): Partial<users> {
  return {
    id: faker.string.uuid(),
    clerkUserId: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    role: faker.helpers.arrayElement(Object.values(UserRole)),
    subscriptionTier: faker.helpers.arrayElement(Object.values(SubscriptionTier)),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock organization
 */
export function mockOrganization(overrides: Partial<organizations> = {}): Partial<organizations> {
  const name = faker.company.name();
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: faker.company.catchPhrase(),
    settings: null,
    subscriptionStatus: faker.helpers.arrayElement(Object.values(SubscriptionStatus)),
    billingEmail: faker.internet.email().toLowerCase(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock organization member
 */
export function mockOrganizationMember(overrides: Partial<organization_members> = {}): Partial<organization_members> {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    role: faker.helpers.arrayElement(Object.values(OrgRole)),
    permissions: null,
    joinedAt: faker.date.past(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

/**
 * Generate a mock customer
 */
export function mockCustomer(overrides: Partial<customers> = {}): Partial<customers> {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    industry: faker.company.buzzNoun(),
    website: faker.internet.url(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    zipCode: faker.location.zipCode(),
    notes: faker.lorem.paragraph(),
    assignedToId: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock project
 */
export function mockProject(overrides: Partial<projects> = {}): Partial<projects> {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    status: faker.helpers.arrayElement(Object.values(ProjectStatus)),
    startDate: faker.date.future(),
    endDate: faker.date.future(),
    budget: parseFloat(faker.finance.amount()),
    managerId: faker.string.uuid(),
    customerId: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock task
 */
export function mockTask(overrides: Partial<tasks> = {}): Partial<tasks> {
  return {
    id: faker.string.uuid(),
    projectId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(Object.values(TaskStatus)),
    priority: faker.helpers.arrayElement(Object.values(Priority)),
    assignedToId: null,
    createdById: faker.string.uuid(),
    dueDate: faker.date.future(),
    completedAt: null,
    estimatedHours: faker.number.int({ min: 1, max: 40 }),
    actualHours: null,
    tags: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock notification
 */
export function mockNotification(overrides: Partial<notifications> = {}): Partial<notifications> {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    type: faker.helpers.arrayElement(Object.values(NotificationType)),
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    actionUrl: faker.internet.url(),
    entityType: faker.helpers.arrayElement(['PROJECT', 'TASK', 'CUSTOMER']),
    entityId: faker.string.uuid(),
    read: false,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock attachment
 */
export function mockAttachment(overrides: Partial<attachments> = {}): Partial<attachments> {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    uploadedById: faker.string.uuid(),
    entityType: faker.helpers.arrayElement(['PROJECT', 'TASK', 'CUSTOMER']),
    entityId: faker.string.uuid(),
    filename: faker.system.fileName(),
    originalFilename: faker.system.fileName(),
    mimeType: 'application/pdf',
    size: faker.number.int({ min: 1000, max: 5000000 }),
    storageUrl: faker.internet.url(),
    storagePath: faker.system.filePath(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock AI conversation
 */
export function mockAIConversation(overrides: Partial<ai_conversations> = {}): Partial<ai_conversations> {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    messages: [],
    metadata: {},
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate a mock subscription
 */
export function mockSubscription(overrides: Partial<subscriptions> = {}): Partial<subscriptions> {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    tier: faker.helpers.arrayElement(Object.values(SubscriptionTier)),
    status: faker.helpers.arrayElement(Object.values(SubscriptionStatus)),
    currentPeriodStart: faker.date.recent(),
    currentPeriodEnd: faker.date.future(),
    cancelAtPeriodEnd: false,
    stripeCustomerId: faker.string.alphanumeric(20),
    stripeSubscriptionId: faker.string.alphanumeric(20),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Generate multiple items of a type
 */
export function mockMany<T>(factory: (overrides?: Partial<T>) => T, count: number, overrides: Partial<T> = {}): T[] {
  return Array.from({ length: count }, () => factory(overrides));
}
