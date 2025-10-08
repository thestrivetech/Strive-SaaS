/**
 * CRM Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockContact,
  generateMockContacts,
  generateMockLead,
  generateMockLeads,
  generateMockCustomer,
  generateMockCustomers,
  type MockContact,
  type MockLead,
  type MockCustomer,
} from '../mocks/crm';

// In-memory mock storage (resets on server restart)
let mockContactsStore: MockContact[] = [];
let mockLeadsStore: MockLead[] = [];
let mockCustomersStore: MockCustomer[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(orgId: string) {
  if (mockContactsStore.length === 0) {
    mockContactsStore = generateMockContacts(orgId, 25);
  }
  if (mockLeadsStore.length === 0) {
    mockLeadsStore = generateMockLeads(orgId, 15);
  }
  if (mockCustomersStore.length === 0) {
    mockCustomersStore = generateMockCustomers(orgId, 30);
  }
}

// ============================================================================
// CONTACTS PROVIDER
// ============================================================================

export const contactsProvider = {
  /**
   * Find all contacts for an organization
   */
  async findMany(orgId: string): Promise<MockContact[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch contacts');

      return mockContactsStore.filter(c => c.organization_id === orgId);
    }

    // TODO: Replace with real Prisma query when schema is ready
    // return await prisma.contact.findMany({
    //   where: { organization_id: orgId }
    // });

    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find contact by ID
   */
  async findById(id: string, orgId: string): Promise<MockContact | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch contact');

      return mockContactsStore.find(c => c.id === id && c.organization_id === orgId) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new contact
   */
  async create(data: Omit<MockContact, 'id' | 'created_at' | 'updated_at'>, orgId: string): Promise<MockContact> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create contact');

      const newContact = generateMockContact(orgId, data);
      mockContactsStore.push(newContact);
      return newContact;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update contact
   */
  async update(id: string, data: Partial<MockContact>, orgId: string): Promise<MockContact> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update contact');

      const index = mockContactsStore.findIndex(c => c.id === id && c.organization_id === orgId);
      if (index === -1) throw new Error('Contact not found');

      mockContactsStore[index] = {
        ...mockContactsStore[index],
        ...data,
        updated_at: new Date(),
      };

      return mockContactsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete contact
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete contact');

      const index = mockContactsStore.findIndex(c => c.id === id && c.organization_id === orgId);
      if (index === -1) throw new Error('Contact not found');

      mockContactsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// LEADS PROVIDER
// ============================================================================

export const leadsProvider = {
  async findMany(orgId: string): Promise<MockLead[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      return mockLeadsStore.filter(l => l.organization_id === orgId);
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async findById(id: string, orgId: string): Promise<MockLead | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      return mockLeadsStore.find(l => l.id === id && l.organization_id === orgId) || null;
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async create(data: Omit<MockLead, 'id' | 'created_at' | 'updated_at'>, orgId: string): Promise<MockLead> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const newLead = generateMockLead(orgId, data);
      mockLeadsStore.push(newLead);
      return newLead;
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async update(id: string, data: Partial<MockLead>, orgId: string): Promise<MockLead> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const index = mockLeadsStore.findIndex(l => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Lead not found');
      mockLeadsStore[index] = { ...mockLeadsStore[index], ...data, updated_at: new Date() };
      return mockLeadsStore[index];
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const index = mockLeadsStore.findIndex(l => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Lead not found');
      mockLeadsStore.splice(index, 1);
    } else {
      throw new Error('Real database not implemented yet - enable mock mode');
    }
  },
};

// ============================================================================
// CUSTOMERS PROVIDER
// ============================================================================

export const customersProvider = {
  async findMany(orgId: string): Promise<MockCustomer[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      return mockCustomersStore.filter(c => c.organization_id === orgId);
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async findById(id: string, orgId: string): Promise<MockCustomer | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      return mockCustomersStore.find(c => c.id === id && c.organization_id === orgId) || null;
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async create(data: Omit<MockCustomer, 'id' | 'created_at' | 'updated_at'>, orgId: string): Promise<MockCustomer> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const newCustomer = generateMockCustomer(orgId, data);
      mockCustomersStore.push(newCustomer);
      return newCustomer;
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async update(id: string, data: Partial<MockCustomer>, orgId: string): Promise<MockCustomer> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const index = mockCustomersStore.findIndex(c => c.id === id && c.organization_id === orgId);
      if (index === -1) throw new Error('Customer not found');
      mockCustomersStore[index] = { ...mockCustomersStore[index], ...data, updated_at: new Date() };
      return mockCustomersStore[index];
    }
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      const index = mockCustomersStore.findIndex(c => c.id === id && c.organization_id === orgId);
      if (index === -1) throw new Error('Customer not found');
      mockCustomersStore.splice(index, 1);
    } else {
      throw new Error('Real database not implemented yet - enable mock mode');
    }
  },
};
