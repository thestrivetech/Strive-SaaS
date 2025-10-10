/**
 * Mock CRM Data
 *
 * Generate mock data for CRM module (contacts, leads, customers)
 */

import { Prisma } from '@prisma/client';
import {
  generateId,
  randomFromArray,
  randomName,
  randomEmail,
  randomPhone,
  randomAddress,
  randomCurrency,
  randomPastDate,
  randomFutureDate,
  randomBoolean,
  randomInt,
  COMPANY_NAMES,
} from './generators';

export type MockContact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  tags: string[];
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
};

export type MockLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: 'WEBSITE' | 'REFERRAL' | 'GOOGLE_ADS' | 'SOCIAL_MEDIA' | 'COLD_CALL' | 'EMAIL_CAMPAIGN' | 'EVENT' | 'PARTNER' | 'OTHER';
  status: 'NEW_LEAD' | 'IN_CONTACT' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST';
  score: 'HOT' | 'WARM' | 'COLD';
  score_value: number;
  budget: Prisma.Decimal | null;
  timeline: string | null;
  notes: string | null;
  tags: string[];
  custom_fields: Prisma.JsonValue;
  assigned_to_id: string | null;
  created_at: Date;
  updated_at: Date;
  last_contact_at: Date | null;
  organization_id: string;
};

export type MockCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  lifetime_value: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  organization_id: string;
};

const LEAD_SOURCES: MockLead['source'][] = ['WEBSITE', 'REFERRAL', 'GOOGLE_ADS', 'SOCIAL_MEDIA', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'EVENT', 'PARTNER', 'OTHER'];
const LEAD_STATUSES: MockLead['status'][] = ['NEW_LEAD', 'IN_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'];
const LEAD_SCORES: MockLead['score'][] = ['HOT', 'WARM', 'COLD'];
const CONTACT_ROLES = ['CEO', 'CTO', 'Manager', 'Director', 'VP Sales', 'Coordinator'];
const TAGS = ['VIP', 'Hot Lead', 'Follow Up', 'Dormant', 'High Value', 'Repeat Customer'];

export function generateMockContact(orgId: string, overrides?: Partial<MockContact>): MockContact {
  const name = randomName();
  const createdAt = randomPastDate(180);

  return {
    id: generateId(),
    name,
    email: randomEmail(name),
    phone: randomBoolean() ? randomPhone() : null,
    company: randomBoolean() ? randomFromArray(COMPANY_NAMES) : null,
    role: randomBoolean() ? randomFromArray(CONTACT_ROLES) : null,
    tags: Array.from({ length: randomInt(0, 3) }, () => randomFromArray(TAGS)),
    notes: randomBoolean() ? 'Sample notes about this contact' : null,
    created_at: createdAt,
    updated_at: createdAt,
    organization_id: orgId,
    ...overrides,
  };
}

export function generateMockLead(orgId: string, overrides?: Partial<MockLead>): MockLead {
  const name = randomName();
  const createdAt = randomPastDate(90);
  const score = randomFromArray(LEAD_SCORES);
  const scoreValue = score === 'HOT' ? randomInt(80, 100) : score === 'WARM' ? randomInt(50, 79) : randomInt(0, 49);

  return {
    id: generateId(),
    name,
    email: randomEmail(name),
    phone: randomBoolean() ? randomPhone() : null,
    company: randomBoolean() ? randomFromArray(COMPANY_NAMES) : null,
    source: randomFromArray(LEAD_SOURCES),
    status: randomFromArray(LEAD_STATUSES),
    score,
    score_value: scoreValue,
    budget: randomBoolean() ? new Prisma.Decimal(randomCurrency(5000, 500000)) : null,
    timeline: randomBoolean() ? randomFromArray(['1-3 months', '3-6 months', '6-12 months', '12+ months']) : null,
    notes: randomBoolean() ? 'Sample lead notes' : null,
    tags: Array.from({ length: randomInt(0, 3) }, () => randomFromArray(TAGS)),
    custom_fields: randomBoolean() ? { industry: 'Real Estate', priority: randomFromArray(['High', 'Medium', 'Low']) } : null,
    assigned_to_id: randomBoolean() ? 'demo-user' : null,
    created_at: createdAt,
    updated_at: createdAt,
    last_contact_at: randomBoolean() ? randomPastDate(30) : null,
    organization_id: orgId,
    ...overrides,
  };
}

export function generateMockCustomer(orgId: string, overrides?: Partial<MockCustomer>): MockCustomer {
  const name = randomName();
  const createdAt = randomPastDate(365);

  return {
    id: generateId(),
    name,
    email: randomEmail(name),
    phone: randomBoolean() ? randomPhone() : null,
    company: randomBoolean() ? randomFromArray(COMPANY_NAMES) : null,
    address: randomBoolean() ? randomAddress() : null,
    lifetime_value: randomCurrency(10000, 1000000),
    tags: Array.from({ length: randomInt(0, 3) }, () => randomFromArray(TAGS)),
    created_at: createdAt,
    updated_at: createdAt,
    organization_id: orgId,
    ...overrides,
  };
}

// Generate bulk data
export function generateMockContacts(orgId: string, count: number): MockContact[] {
  return Array.from({ length: count }, () => generateMockContact(orgId));
}

export function generateMockLeads(orgId: string, count: number): MockLead[] {
  return Array.from({ length: count }, () => generateMockLead(orgId));
}

export function generateMockCustomers(orgId: string, count: number): MockCustomer[] {
  return Array.from({ length: count }, () => generateMockCustomer(orgId));
}
