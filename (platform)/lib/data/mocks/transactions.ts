/**
 * Mock Transactions Data
 *
 * Generate mock data for Workspace/Transactions module (loops, tasks, documents, parties, signatures, listings)
 */

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
  randomDate,
  CITIES,
  STATES,
  STREETS,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockLoop = {
  id: string;
  title: string;
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string;
  status: 'ACTIVE' | 'PENDING' | 'CLOSING' | 'CLOSED' | 'CANCELLED';
  deal_type: 'PURCHASE' | 'SALE' | 'LEASE' | 'REFINANCE';
  purchase_price: number;
  closing_date: Date | null;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
  created_by_id: string;
};

export type MockTask = {
  id: string;
  loop_id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: Date | null;
  assigned_to_id: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type MockDocument = {
  id: string;
  loop_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  category: 'CONTRACT' | 'DISCLOSURE' | 'INSPECTION' | 'APPRAISAL' | 'OTHER';
  uploaded_by_id: string;
  uploaded_at: Date;
};

export type MockParty = {
  id: string;
  loop_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'BUYER' | 'SELLER' | 'AGENT' | 'ATTORNEY' | 'LENDER' | 'INSPECTOR' | 'TITLE_COMPANY';
  created_at: Date;
};

export type MockSignature = {
  id: string;
  loop_id: string;
  document_id: string;
  party_id: string;
  status: 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED';
  requested_at: Date;
  signed_at: Date | null;
  signature_data: string | null;
};

export type MockListing = {
  id: string;
  title: string;
  property_type: 'HOUSE' | 'CONDO' | 'TOWNHOUSE' | 'LAND' | 'COMMERCIAL' | 'MULTI_FAMILY';
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'OFF_MARKET';
  description: string;
  images: string[];
  listed_date: Date;
  organization_id: string;
  agent_id: string;
};

export type MockTransactionActivity = {
  id: string;
  loop_id: string;
  user: { id: string; name: string; email: string };
  action: 'CREATE' | 'UPDATE' | 'COMPLETE' | 'COMMENT';
  entityType: 'loop' | 'task' | 'document' | 'party' | 'signature';
  entityId: string;
  timestamp: Date;
  details: string | null;
};

// ============================================================================
// DATA POOLS
// ============================================================================

const DEAL_TYPES: MockLoop['deal_type'][] = ['PURCHASE', 'SALE', 'LEASE', 'REFINANCE'];
const LOOP_STATUSES: MockLoop['status'][] = ['ACTIVE', 'PENDING', 'CLOSING', 'CLOSED', 'CANCELLED'];

const TASK_STATUSES: MockTask['status'][] = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
const TASK_PRIORITIES: MockTask['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const TASK_TITLES = [
  'Schedule home inspection',
  'Review purchase agreement',
  'Complete mortgage application',
  'Order title search',
  'Coordinate final walkthrough',
  'Submit earnest money deposit',
  'Review disclosure documents',
  'Schedule appraisal',
  'Finalize closing date',
  'Review settlement statement',
  'Coordinate moving company',
  'Transfer utilities',
  'Update insurance policy',
  'Complete homeowner association registration',
  'Review HOA documents',
  'Schedule pest inspection',
  'Review home warranty options',
  'Negotiate repair requests',
  'Complete buyer questionnaire',
  'Schedule closing appointment',
];

const DOCUMENT_CATEGORIES: MockDocument['category'][] = [
  'CONTRACT',
  'DISCLOSURE',
  'INSPECTION',
  'APPRAISAL',
  'OTHER',
];

const DOCUMENT_NAMES = [
  'Purchase Agreement.pdf',
  'Seller Disclosure.pdf',
  'Home Inspection Report.pdf',
  'Appraisal Report.pdf',
  'Title Report.pdf',
  'Closing Disclosure.pdf',
  'Homeowners Insurance Policy.pdf',
  'HOA Documents.pdf',
  'Property Survey.pdf',
  'Pest Inspection Report.pdf',
  'Repair Addendum.pdf',
  'Final Walkthrough Checklist.pdf',
  'Wire Transfer Instructions.pdf',
  'Settlement Statement.pdf',
  'Deed.pdf',
];

const PARTY_ROLES: MockParty['role'][] = [
  'BUYER',
  'SELLER',
  'AGENT',
  'ATTORNEY',
  'LENDER',
  'INSPECTOR',
  'TITLE_COMPANY',
];

const SIGNATURE_STATUSES: MockSignature['status'][] = ['PENDING', 'SIGNED', 'DECLINED', 'EXPIRED'];

const PROPERTY_TYPES: MockListing['property_type'][] = [
  'HOUSE',
  'CONDO',
  'TOWNHOUSE',
  'LAND',
  'COMMERCIAL',
  'MULTI_FAMILY',
];

const LISTING_STATUSES: MockListing['status'][] = ['ACTIVE', 'PENDING', 'SOLD', 'OFF_MARKET'];

const PROPERTY_DESCRIPTIONS = [
  'Beautiful single-family home with modern updates and spacious backyard.',
  'Charming condo in prime location with stunning city views.',
  'Spacious townhouse with attached garage and private patio.',
  'Prime commercial property in high-traffic area.',
  'Investment opportunity: Multi-family property with strong rental income.',
  'Rare find: Undeveloped land with development potential.',
  'Move-in ready home with granite countertops and hardwood floors.',
  'Luxurious estate with custom finishes and premium amenities.',
  'Cozy starter home in family-friendly neighborhood.',
  'Updated ranch-style home with open floor plan.',
];

const ACTIVITY_ACTIONS: MockTransactionActivity['action'][] = [
  'CREATE',
  'UPDATE',
  'COMPLETE',
  'COMMENT',
];

const ACTIVITY_ENTITY_TYPES: MockTransactionActivity['entityType'][] = [
  'loop',
  'task',
  'document',
  'party',
  'signature',
];

// ============================================================================
// LOOP GENERATORS
// ============================================================================

/**
 * Generate a mock transaction loop
 */
export function generateMockLoop(orgId: string, overrides?: Partial<MockLoop>): MockLoop {
  const address = randomAddress();
  const dealType = overrides?.deal_type || randomFromArray(DEAL_TYPES);
  const status = overrides?.status || randomFromArray(LOOP_STATUSES);
  const createdAt = randomPastDate(90);

  // Generate appropriate closing date based on status
  let closingDate: Date | null = null;
  if (status === 'CLOSING') {
    closingDate = randomFutureDate(30);
  } else if (status === 'CLOSED') {
    closingDate = randomPastDate(30);
  } else if (status === 'ACTIVE' || status === 'PENDING') {
    closingDate = randomBoolean() ? randomFutureDate(60) : null;
  }

  return {
    id: generateId(),
    title: `${dealType.toLowerCase()} - ${address.street}`,
    property_address: address.street,
    property_city: address.city,
    property_state: address.state,
    property_zip: address.zip,
    status,
    deal_type: dealType,
    purchase_price: randomCurrency(150000, 2500000),
    closing_date: closingDate,
    created_at: createdAt,
    updated_at: createdAt,
    organization_id: orgId,
    created_by_id: 'demo-user',
    ...overrides,
  };
}

/**
 * Generate multiple mock loops
 */
export function generateMockLoops(orgId: string, count: number = 15): MockLoop[] {
  const loops: MockLoop[] = [];

  // Distribution of statuses
  const statusCounts = {
    ACTIVE: Math.floor(count * 0.4), // 40%
    PENDING: Math.floor(count * 0.2), // 20%
    CLOSING: Math.floor(count * 0.15), // 15%
    CLOSED: Math.floor(count * 0.2), // 20%
    CANCELLED: Math.floor(count * 0.05), // 5%
  };

  // Adjust for exact count
  const totalAssigned = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  statusCounts.ACTIVE += count - totalAssigned;

  // Generate loops for each status
  for (const [status, statusCount] of Object.entries(statusCounts)) {
    for (let i = 0; i < statusCount; i++) {
      loops.push(generateMockLoop(orgId, { status: status as MockLoop['status'] }));
    }
  }

  return loops;
}

// ============================================================================
// TASK GENERATORS
// ============================================================================

/**
 * Generate a mock task for a loop
 */
export function generateMockTask(loopId: string, overrides?: Partial<MockTask>): MockTask {
  const status = overrides?.status || randomFromArray(TASK_STATUSES);
  const priority = overrides?.priority || randomFromArray(TASK_PRIORITIES);
  const createdAt = randomPastDate(30);

  // Completed tasks have completion date
  const completedAt = status === 'COMPLETED' ? randomPastDate(15) : null;

  // Most tasks have due dates
  const dueDate = randomBoolean() || randomBoolean() ? randomFutureDate(45) : null;

  return {
    id: generateId(),
    loop_id: loopId,
    title: randomFromArray(TASK_TITLES),
    description: randomBoolean() ? 'Task description and additional details' : null,
    status,
    priority,
    due_date: dueDate,
    assigned_to_id: randomBoolean() ? 'demo-user' : null,
    completed_at: completedAt,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

/**
 * Generate multiple tasks for a loop
 */
export function generateMockTasks(loopId: string, count: number = 8): MockTask[] {
  return Array.from({ length: count }, () => generateMockTask(loopId));
}

// ============================================================================
// DOCUMENT GENERATORS
// ============================================================================

/**
 * Generate a mock document for a loop
 */
export function generateMockDocument(loopId: string, overrides?: Partial<MockDocument>): MockDocument {
  const filename = overrides?.filename || randomFromArray(DOCUMENT_NAMES);
  const category = overrides?.category || randomFromArray(DOCUMENT_CATEGORIES);

  return {
    id: generateId(),
    loop_id: loopId,
    filename,
    file_url: `/mock-documents/${loopId}/${filename}`,
    file_size: randomInt(50000, 5000000), // 50KB to 5MB
    mime_type: 'application/pdf',
    category,
    uploaded_by_id: 'demo-user',
    uploaded_at: randomPastDate(30),
    ...overrides,
  };
}

/**
 * Generate multiple documents for a loop
 */
export function generateMockDocuments(loopId: string, count: number = 6): MockDocument[] {
  return Array.from({ length: count }, () => generateMockDocument(loopId));
}

// ============================================================================
// PARTY GENERATORS
// ============================================================================

/**
 * Generate a mock party for a loop
 */
export function generateMockParty(loopId: string, overrides?: Partial<MockParty>): MockParty {
  const name = randomName();
  const role = overrides?.role || randomFromArray(PARTY_ROLES);

  return {
    id: generateId(),
    loop_id: loopId,
    name,
    email: randomEmail(name),
    phone: randomBoolean() ? randomPhone() : null,
    role,
    created_at: randomPastDate(45),
    ...overrides,
  };
}

/**
 * Generate multiple parties for a loop
 */
export function generateMockParties(loopId: string, count: number = 5): MockParty[] {
  const parties: MockParty[] = [];

  // Ensure at least one buyer and one seller/agent
  parties.push(generateMockParty(loopId, { role: 'BUYER' }));
  parties.push(generateMockParty(loopId, { role: 'SELLER' }));
  parties.push(generateMockParty(loopId, { role: 'AGENT' }));

  // Fill remaining with random roles
  for (let i = 3; i < count; i++) {
    parties.push(generateMockParty(loopId));
  }

  return parties;
}

// ============================================================================
// SIGNATURE GENERATORS
// ============================================================================

/**
 * Generate a mock signature request
 */
export function generateMockSignature(
  loopId: string,
  documentId: string,
  partyId: string,
  overrides?: Partial<MockSignature>
): MockSignature {
  const status = overrides?.status || randomFromArray(SIGNATURE_STATUSES);
  const requestedAt = randomPastDate(20);

  // Signed signatures have signature date and data
  const signedAt = status === 'SIGNED' ? randomPastDate(10) : null;
  const signatureData = status === 'SIGNED' ? 'base64-encoded-signature-data' : null;

  return {
    id: generateId(),
    loop_id: loopId,
    document_id: documentId,
    party_id: partyId,
    status,
    requested_at: requestedAt,
    signed_at: signedAt,
    signature_data: signatureData,
    ...overrides,
  };
}

// ============================================================================
// LISTING GENERATORS
// ============================================================================

/**
 * Generate a mock property listing
 */
export function generateMockListing(orgId: string, overrides?: Partial<MockListing>): MockListing {
  const address = randomAddress();
  const propertyType = overrides?.property_type || randomFromArray(PROPERTY_TYPES);
  const status = overrides?.status || randomFromArray(LISTING_STATUSES);

  // Different property types have different bedroom/bathroom ranges
  let bedrooms = 0;
  let bathrooms = 0;
  let sqft = 0;

  switch (propertyType) {
    case 'HOUSE':
      bedrooms = randomInt(2, 5);
      bathrooms = randomInt(2, 4);
      sqft = randomInt(1200, 4500);
      break;
    case 'CONDO':
      bedrooms = randomInt(1, 3);
      bathrooms = randomInt(1, 2);
      sqft = randomInt(700, 1800);
      break;
    case 'TOWNHOUSE':
      bedrooms = randomInt(2, 4);
      bathrooms = randomInt(2, 3);
      sqft = randomInt(1000, 2500);
      break;
    case 'MULTI_FAMILY':
      bedrooms = randomInt(4, 8);
      bathrooms = randomInt(3, 6);
      sqft = randomInt(2500, 6000);
      break;
    case 'COMMERCIAL':
    case 'LAND':
      bedrooms = 0;
      bathrooms = 0;
      sqft = randomInt(5000, 50000);
      break;
  }

  // Generate mock images (3-8 images)
  const imageCount = randomInt(3, 8);
  const images = Array.from(
    { length: imageCount },
    (_, i) => `/mock-images/listing-${address.street.replace(/\s/g, '-')}-${i + 1}.jpg`
  );

  return {
    id: generateId(),
    title: `${propertyType.replace('_', ' ')} for ${randomBoolean() ? 'Sale' : 'Lease'} - ${address.city}`,
    property_type: propertyType,
    address: address.street,
    city: address.city,
    state: address.state,
    zip: address.zip,
    price: randomCurrency(100000, 5000000),
    bedrooms,
    bathrooms,
    sqft,
    status,
    description: randomFromArray(PROPERTY_DESCRIPTIONS),
    images,
    listed_date: randomPastDate(180),
    organization_id: orgId,
    agent_id: 'demo-user',
    ...overrides,
  };
}

/**
 * Generate multiple listings
 */
export function generateMockListings(orgId: string, count: number = 25): MockListing[] {
  const listings: MockListing[] = [];

  // Distribution of property types
  const typeCounts = {
    HOUSE: Math.floor(count * 0.5), // 50%
    CONDO: Math.floor(count * 0.2), // 20%
    TOWNHOUSE: Math.floor(count * 0.15), // 15%
    MULTI_FAMILY: Math.floor(count * 0.08), // 8%
    COMMERCIAL: Math.floor(count * 0.05), // 5%
    LAND: Math.floor(count * 0.02), // 2%
  };

  // Adjust for exact count
  const totalAssigned = Object.values(typeCounts).reduce((a, b) => a + b, 0);
  typeCounts.HOUSE += count - totalAssigned;

  // Generate listings for each type
  for (const [propertyType, typeCount] of Object.entries(typeCounts)) {
    for (let i = 0; i < typeCount; i++) {
      listings.push(
        generateMockListing(orgId, {
          property_type: propertyType as MockListing['property_type'],
        })
      );
    }
  }

  return listings;
}

// ============================================================================
// ACTIVITY GENERATORS
// ============================================================================

/**
 * Generate a mock transaction activity
 */
export function generateMockTransactionActivity(
  loopId: string,
  userId: string = 'demo-user',
  overrides?: Partial<MockTransactionActivity>
): MockTransactionActivity {
  const action = overrides?.action || randomFromArray(ACTIVITY_ACTIONS);
  const entityType = overrides?.entityType || randomFromArray(ACTIVITY_ENTITY_TYPES);

  let details = null;
  switch (action) {
    case 'CREATE':
      details = `Created ${entityType}`;
      break;
    case 'UPDATE':
      details = `Updated ${entityType}`;
      break;
    case 'COMPLETE':
      details = `Completed ${entityType}`;
      break;
    case 'COMMENT':
      details = 'Added a comment';
      break;
  }

  return {
    id: generateId(),
    loop_id: loopId,
    user: {
      id: userId,
      name: randomName(),
      email: randomEmail(),
    },
    action,
    entityType,
    entityId: generateId(),
    timestamp: randomPastDate(30),
    details: overrides?.details || details,
    ...overrides,
  };
}
