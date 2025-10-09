/**
 * Transactions Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockLoop,
  generateMockLoops,
  generateMockTask,
  generateMockTasks,
  generateMockDocument,
  generateMockDocuments,
  generateMockParty,
  generateMockParties,
  generateMockSignature,
  generateMockListing,
  generateMockListings,
  generateMockTransactionActivity,
  type MockLoop,
  type MockTask,
  type MockDocument,
  type MockParty,
  type MockSignature,
  type MockListing,
  type MockTransactionActivity,
} from '../mocks/transactions';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockLoopsStore: MockLoop[] = [];
let mockTasksStore: MockTask[] = [];
let mockDocumentsStore: MockDocument[] = [];
let mockPartiesStore: MockParty[] = [];
let mockSignaturesStore: MockSignature[] = [];
let mockListingsStore: MockListing[] = [];
let mockActivitiesStore: MockTransactionActivity[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(orgId: string) {
  if (mockLoopsStore.length === 0) {
    mockLoopsStore = generateMockLoops(orgId, 15);

    // Generate related data for each loop
    mockLoopsStore.forEach((loop) => {
      // Tasks
      const tasks = generateMockTasks(loop.id, 8);
      mockTasksStore.push(...tasks);

      // Documents
      const documents = generateMockDocuments(loop.id, 6);
      mockDocumentsStore.push(...documents);

      // Parties
      const parties = generateMockParties(loop.id, 5);
      mockPartiesStore.push(...parties);

      // Signatures (for each document and party)
      documents.slice(0, 3).forEach((doc) => {
        parties.slice(0, 2).forEach((party) => {
          const signature = generateMockSignature(loop.id, doc.id, party.id);
          mockSignaturesStore.push(signature);
        });
      });

      // Activities
      for (let i = 0; i < 10; i++) {
        mockActivitiesStore.push(generateMockTransactionActivity(loop.id));
      }
    });
  }

  if (mockListingsStore.length === 0) {
    mockListingsStore = generateMockListings(orgId, 25);
  }
}

// ============================================================================
// LOOPS PROVIDER
// ============================================================================

export const loopsProvider = {
  /**
   * Find all loops for an organization
   */
  async findMany(orgId: string): Promise<MockLoop[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch loops');

      return mockLoopsStore.filter((l) => l.organization_id === orgId);
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find loop by ID
   */
  async findById(id: string, orgId: string): Promise<MockLoop | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch loop');

      return mockLoopsStore.find((l) => l.id === id && l.organization_id === orgId) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new loop
   */
  async create(data: Partial<MockLoop>, orgId: string): Promise<MockLoop> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create loop');

      const newLoop = generateMockLoop(orgId, data);
      mockLoopsStore.push(newLoop);

      // Create default tasks for new loop
      const defaultTasks = generateMockTasks(newLoop.id, 5);
      mockTasksStore.push(...defaultTasks);

      return newLoop;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update loop
   */
  async update(id: string, data: Partial<MockLoop>, orgId: string): Promise<MockLoop> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update loop');

      const index = mockLoopsStore.findIndex((l) => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Loop not found');

      mockLoopsStore[index] = {
        ...mockLoopsStore[index],
        ...data,
        updated_at: new Date(),
      };

      return mockLoopsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete loop
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete loop');

      const index = mockLoopsStore.findIndex((l) => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Loop not found');

      mockLoopsStore.splice(index, 1);

      // Also delete related data
      mockTasksStore = mockTasksStore.filter((t) => t.loop_id !== id);
      mockDocumentsStore = mockDocumentsStore.filter((d) => d.loop_id !== id);
      mockPartiesStore = mockPartiesStore.filter((p) => p.loop_id !== id);
      mockSignaturesStore = mockSignaturesStore.filter((s) => s.loop_id !== id);
      mockActivitiesStore = mockActivitiesStore.filter((a) => a.loop_id !== id);

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get statistics for loops
   */
  async getStats(orgId?: string): Promise<{
    activeLoops: number;
    totalTasks: number;
    completionRate: number;
    totalDocuments: number;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId || 'demo-org');
      await simulateDelay();

      const loops = orgId ? mockLoopsStore.filter((l) => l.organization_id === orgId) : mockLoopsStore;
      const tasks = orgId
        ? mockTasksStore.filter((t) => loops.some((l) => l.id === t.loop_id))
        : mockTasksStore;
      const documents = orgId
        ? mockDocumentsStore.filter((d) => loops.some((l) => l.id === d.loop_id))
        : mockDocumentsStore;

      const activeLoops = loops.filter((l) => l.status === 'ACTIVE').length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const totalDocuments = documents.length;

      return {
        activeLoops,
        totalTasks,
        completionRate: Math.round(completionRate),
        totalDocuments,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// TASKS PROVIDER
// ============================================================================

export const tasksProvider = {
  /**
   * Find all tasks (optionally filtered by loop)
   */
  async findMany(orgId: string, loopId?: string): Promise<MockTask[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch tasks');

      let tasks = mockTasksStore;

      // Filter by loop if provided
      if (loopId) {
        tasks = tasks.filter((t) => t.loop_id === loopId);
      } else {
        // Filter by organization's loops
        const orgLoopIds = mockLoopsStore
          .filter((l) => l.organization_id === orgId)
          .map((l) => l.id);
        tasks = tasks.filter((t) => orgLoopIds.includes(t.loop_id));
      }

      return tasks;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find task by ID
   */
  async findById(id: string, orgId: string): Promise<MockTask | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch task');

      const task = mockTasksStore.find((t) => t.id === id);
      if (!task) return null;

      // Verify task belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === task.loop_id);
      if (!loop || loop.organization_id !== orgId) return null;

      return task;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new task
   */
  async create(data: Partial<MockTask>, orgId: string): Promise<MockTask> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create task');

      if (!data.loop_id) throw new Error('loop_id is required');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === data.loop_id && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      const newTask = generateMockTask(data.loop_id, data);
      mockTasksStore.push(newTask);

      return newTask;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update task
   */
  async update(id: string, data: Partial<MockTask>, orgId: string): Promise<MockTask> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update task');

      const index = mockTasksStore.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found');

      // Verify task belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockTasksStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Task not found');

      mockTasksStore[index] = {
        ...mockTasksStore[index],
        ...data,
        updated_at: new Date(),
      };

      // Set completed_at when marking as completed
      if (data.status === 'COMPLETED' && !mockTasksStore[index].completed_at) {
        mockTasksStore[index].completed_at = new Date();
      }

      return mockTasksStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete task
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete task');

      const index = mockTasksStore.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found');

      // Verify task belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockTasksStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Task not found');

      mockTasksStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// DOCUMENTS PROVIDER
// ============================================================================

export const documentsProvider = {
  /**
   * Find all documents for a loop
   */
  async findMany(loopId: string, orgId: string): Promise<MockDocument[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch documents');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === loopId && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      return mockDocumentsStore.filter((d) => d.loop_id === loopId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find document by ID
   */
  async findById(id: string, orgId: string): Promise<MockDocument | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch document');

      const document = mockDocumentsStore.find((d) => d.id === id);
      if (!document) return null;

      // Verify document belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === document.loop_id);
      if (!loop || loop.organization_id !== orgId) return null;

      return document;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new document
   */
  async create(data: Partial<MockDocument>, orgId: string): Promise<MockDocument> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create document');

      if (!data.loop_id) throw new Error('loop_id is required');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === data.loop_id && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      const newDocument = generateMockDocument(data.loop_id, data);
      mockDocumentsStore.push(newDocument);

      return newDocument;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete document
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete document');

      const index = mockDocumentsStore.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Document not found');

      // Verify document belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockDocumentsStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Document not found');

      mockDocumentsStore.splice(index, 1);

      // Also delete related signatures
      mockSignaturesStore = mockSignaturesStore.filter((s) => s.document_id !== id);

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// PARTIES PROVIDER
// ============================================================================

export const partiesProvider = {
  /**
   * Find all parties for a loop
   */
  async findMany(loopId: string, orgId: string): Promise<MockParty[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch parties');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === loopId && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      return mockPartiesStore.filter((p) => p.loop_id === loopId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new party
   */
  async create(data: Partial<MockParty>, orgId: string): Promise<MockParty> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create party');

      if (!data.loop_id) throw new Error('loop_id is required');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === data.loop_id && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      const newParty = generateMockParty(data.loop_id, data);
      mockPartiesStore.push(newParty);

      return newParty;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update party
   */
  async update(id: string, data: Partial<MockParty>, orgId: string): Promise<MockParty> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update party');

      const index = mockPartiesStore.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Party not found');

      // Verify party belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockPartiesStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Party not found');

      mockPartiesStore[index] = {
        ...mockPartiesStore[index],
        ...data,
      };

      return mockPartiesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete party
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete party');

      const index = mockPartiesStore.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Party not found');

      // Verify party belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockPartiesStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Party not found');

      mockPartiesStore.splice(index, 1);

      // Also delete related signatures
      mockSignaturesStore = mockSignaturesStore.filter((s) => s.party_id !== id);

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// SIGNATURES PROVIDER
// ============================================================================

export const signaturesProvider = {
  /**
   * Find all signatures for a loop
   */
  async findMany(loopId: string, orgId: string): Promise<MockSignature[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch signatures');

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === loopId && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      return mockSignaturesStore.filter((s) => s.loop_id === loopId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find signature by ID
   */
  async findById(id: string, orgId: string): Promise<MockSignature | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch signature');

      const signature = mockSignaturesStore.find((s) => s.id === id);
      if (!signature) return null;

      // Verify signature belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === signature.loop_id);
      if (!loop || loop.organization_id !== orgId) return null;

      return signature;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new signature request
   */
  async create(data: Partial<MockSignature>, orgId: string): Promise<MockSignature> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create signature');

      if (!data.loop_id || !data.document_id || !data.party_id) {
        throw new Error('loop_id, document_id, and party_id are required');
      }

      // Verify loop belongs to organization
      const loop = mockLoopsStore.find((l) => l.id === data.loop_id && l.organization_id === orgId);
      if (!loop) throw new Error('Loop not found');

      const newSignature = generateMockSignature(
        data.loop_id,
        data.document_id,
        data.party_id,
        data
      );
      mockSignaturesStore.push(newSignature);

      return newSignature;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update signature (e.g., mark as signed)
   */
  async update(id: string, data: Partial<MockSignature>, orgId: string): Promise<MockSignature> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update signature');

      const index = mockSignaturesStore.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Signature not found');

      // Verify signature belongs to organization's loop
      const loop = mockLoopsStore.find((l) => l.id === mockSignaturesStore[index].loop_id);
      if (!loop || loop.organization_id !== orgId) throw new Error('Signature not found');

      mockSignaturesStore[index] = {
        ...mockSignaturesStore[index],
        ...data,
      };

      // Set signed_at when marking as signed
      if (data.status === 'SIGNED' && !mockSignaturesStore[index].signed_at) {
        mockSignaturesStore[index].signed_at = new Date();
      }

      return mockSignaturesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// LISTINGS PROVIDER
// ============================================================================

export interface ListingFilters {
  status?: MockListing['status'][];
  property_type?: MockListing['property_type'][];
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  sqft_min?: number;
  sqft_max?: number;
  city?: string;
  state?: string;
}

export const listingsProvider = {
  /**
   * Find all listings for an organization with optional filters
   */
  async findMany(orgId: string, filters?: ListingFilters): Promise<MockListing[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch listings');

      let listings = mockListingsStore.filter((l) => l.organization_id === orgId);

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        listings = listings.filter((l) => filters.status!.includes(l.status));
      }

      if (filters?.property_type && filters.property_type.length > 0) {
        listings = listings.filter((l) => filters.property_type!.includes(l.property_type));
      }

      if (filters?.price_min !== undefined) {
        listings = listings.filter((l) => l.price >= filters.price_min!);
      }

      if (filters?.price_max !== undefined) {
        listings = listings.filter((l) => l.price <= filters.price_max!);
      }

      if (filters?.bedrooms_min !== undefined) {
        listings = listings.filter((l) => l.bedrooms >= filters.bedrooms_min!);
      }

      if (filters?.bathrooms_min !== undefined) {
        listings = listings.filter((l) => l.bathrooms >= filters.bathrooms_min!);
      }

      if (filters?.sqft_min !== undefined) {
        listings = listings.filter((l) => l.sqft >= filters.sqft_min!);
      }

      if (filters?.sqft_max !== undefined) {
        listings = listings.filter((l) => l.sqft <= filters.sqft_max!);
      }

      if (filters?.city) {
        listings = listings.filter((l) => l.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }

      if (filters?.state) {
        listings = listings.filter((l) => l.state === filters.state);
      }

      return listings;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find listing by ID
   */
  async findById(id: string, orgId: string): Promise<MockListing | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch listing');

      return mockListingsStore.find((l) => l.id === id && l.organization_id === orgId) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Search listings by query
   */
  async search(filters: ListingFilters, orgId: string): Promise<MockListing[]> {
    if (dataConfig.useMocks) {
      return this.findMany(orgId, filters);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get listing statistics
   */
  async getStats(orgId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalValue: number;
    avgPrice: number;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      const listings = mockListingsStore.filter((l) => l.organization_id === orgId);
      const activeListings = listings.filter((l) => l.status === 'ACTIVE');

      const totalValue = listings.reduce((sum, l) => sum + l.price, 0);
      const avgPrice = listings.length > 0 ? totalValue / listings.length : 0;

      return {
        totalListings: listings.length,
        activeListings: activeListings.length,
        totalValue,
        avgPrice: Math.round(avgPrice),
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new listing
   */
  async create(data: Partial<MockListing>, orgId: string): Promise<MockListing> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create listing');

      const newListing = generateMockListing(orgId, data);
      mockListingsStore.push(newListing);

      return newListing;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update listing
   */
  async update(id: string, data: Partial<MockListing>, orgId: string): Promise<MockListing> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update listing');

      const index = mockListingsStore.findIndex((l) => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Listing not found');

      mockListingsStore[index] = {
        ...mockListingsStore[index],
        ...data,
      };

      return mockListingsStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete listing
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete listing');

      const index = mockListingsStore.findIndex((l) => l.id === id && l.organization_id === orgId);
      if (index === -1) throw new Error('Listing not found');

      mockListingsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// TRANSACTION ACTIVITY PROVIDER
// ============================================================================

export const transactionActivityProvider = {
  /**
   * Find recent activities for a loop
   */
  async findMany(loopId: string, limit: number = 10): Promise<MockTransactionActivity[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch activities');

      return mockActivitiesStore
        .filter((a) => a.loop_id === loopId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new activity
   */
  async create(activity: Partial<MockTransactionActivity>): Promise<MockTransactionActivity> {
    if (dataConfig.useMocks) {
      await simulateDelay();

      if (!activity.loop_id) throw new Error('loop_id is required');

      const newActivity = generateMockTransactionActivity(activity.loop_id, 'demo-user', activity);
      mockActivitiesStore.push(newActivity);

      return newActivity;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// TRANSACTION ANALYTICS PROVIDER
// ============================================================================

export const transactionAnalyticsProvider = {
  /**
   * Get overview analytics for transactions
   */
  async getOverview(orgId: string): Promise<{
    totalTransactions: number;
    activeTransactions: number;
    closedThisMonth: number;
    totalVolume: number;
    avgTransactionValue: number;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      const loops = mockLoopsStore.filter((l) => l.organization_id === orgId);
      const activeLoops = loops.filter((l) => l.status === 'ACTIVE');

      // Closed this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const closedThisMonth = loops.filter(
        (l) => l.status === 'CLOSED' && l.closing_date && l.closing_date >= firstDayOfMonth
      ).length;

      const totalVolume = loops.reduce((sum, l) => sum + l.purchase_price, 0);
      const avgTransactionValue = loops.length > 0 ? totalVolume / loops.length : 0;

      return {
        totalTransactions: loops.length,
        activeTransactions: activeLoops.length,
        closedThisMonth,
        totalVolume,
        avgTransactionValue: Math.round(avgTransactionValue),
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get transaction velocity data (closed per month)
   */
  async getVelocity(params: { months: number }): Promise<
    Array<{ month: string; count: number; volume: number }>
  > {
    if (dataConfig.useMocks) {
      await simulateDelay();

      const { months } = params;
      const data: Array<{ month: string; count: number; volume: number }> = [];

      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        // Mock data: random count and volume
        const count = randomInt(2, 8);
        const volume = randomCurrency(500000, 5000000);

        data.push({
          month: monthName,
          count,
          volume,
        });
      }

      return data;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// Helper for velocity mock data
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCurrency(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}
