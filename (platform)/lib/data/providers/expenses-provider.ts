/**
 * Expenses Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockExpense,
  generateMockExpenses,
  generateMockExpenseCategory,
  generateMockExpenseCategories,
  generateMockTaxEstimate,
  generateMockTaxEstimates,
  generateMockReceipt,
  generateMockReceipts,
  generateMockTaxReport,
  type MockExpense,
  type MockExpenseCategory,
  type MockTaxEstimate,
  type MockReceipt,
  type MockTaxReport,
} from '../mocks/expenses';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockExpensesStore: MockExpense[] = [];
let mockCategoriesStore: MockExpenseCategory[] = [];
let mockTaxEstimatesStore: MockTaxEstimate[] = [];
let mockReceiptsStore: MockReceipt[] = [];
const mockReportsStore: MockTaxReport[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData(orgId: string) {
  if (mockExpensesStore.length === 0) {
    // Generate 100 expenses spread across 12 months
    mockExpensesStore = generateMockExpenses(orgId, 100);

    // Generate 15 categories
    mockCategoriesStore = generateMockExpenseCategories(orgId, 15);

    // Update category totals based on actual expenses
    mockCategoriesStore.forEach((category) => {
      const categoryExpenses = mockExpensesStore.filter(
        (e) => e.category_name === category.name && e.organization_id === orgId
      );
      category.expense_count = categoryExpenses.length;
      category.total_amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    });

    // Generate 4 tax estimates (one per quarter)
    mockTaxEstimatesStore = generateMockTaxEstimates(orgId, 4);

    // Generate receipts for 70% of expenses
    mockReceiptsStore = generateMockReceipts(mockExpensesStore, 0.7);

    // Generate 2-3 tax reports
    const currentYear = new Date().getFullYear();
    mockReportsStore.push(generateMockTaxReport(orgId, currentYear, 1)); // Q1
    mockReportsStore.push(generateMockTaxReport(orgId, currentYear)); // Annual
    mockReportsStore.push(generateMockTaxReport(orgId, currentYear - 1)); // Previous year
  }
}

// ============================================================================
// EXPENSES PROVIDER
// ============================================================================

export const expensesProvider = {
  /**
   * Find all expenses with optional filters
   */
  async findMany(
    orgId: string,
    filters?: {
      category_id?: string;
      start_date?: Date;
      end_date?: Date;
      is_tax_deductible?: boolean;
      min_amount?: number;
      max_amount?: number;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<MockExpense[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch expenses');

      let expenses = mockExpensesStore.filter((e) => e.organization_id === orgId);

      // Apply filters
      if (filters?.category_id) {
        expenses = expenses.filter((e) => e.category_id === filters.category_id);
      }

      if (filters?.start_date) {
        expenses = expenses.filter((e) => e.date >= filters.start_date!);
      }

      if (filters?.end_date) {
        expenses = expenses.filter((e) => e.date <= filters.end_date!);
      }

      if (filters?.is_tax_deductible !== undefined) {
        expenses = expenses.filter((e) => e.is_tax_deductible === filters.is_tax_deductible);
      }

      if (filters?.min_amount !== undefined) {
        expenses = expenses.filter((e) => e.amount >= filters.min_amount!);
      }

      if (filters?.max_amount !== undefined) {
        expenses = expenses.filter((e) => e.amount <= filters.max_amount!);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        expenses = expenses.filter(
          (e) =>
            e.title.toLowerCase().includes(searchLower) ||
            e.vendor.toLowerCase().includes(searchLower) ||
            (e.description && e.description.toLowerCase().includes(searchLower))
        );
      }

      // Sort by date descending
      expenses.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Apply pagination
      if (filters?.offset !== undefined) {
        expenses = expenses.slice(filters.offset);
      }

      if (filters?.limit !== undefined) {
        expenses = expenses.slice(0, filters.limit);
      }

      return expenses;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find expense by ID
   */
  async findById(id: string, orgId: string): Promise<MockExpense | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch expense');

      return (
        mockExpensesStore.find((e) => e.id === id && e.organization_id === orgId) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new expense
   */
  async create(data: Partial<MockExpense>, orgId: string): Promise<MockExpense> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create expense');

      const newExpense = generateMockExpense(orgId, data);
      mockExpensesStore.push(newExpense);

      // Update category totals
      const category = mockCategoriesStore.find(
        (c) => c.name === newExpense.category_name && c.organization_id === orgId
      );
      if (category) {
        category.expense_count += 1;
        category.total_amount += newExpense.amount;
      }

      return newExpense;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update expense
   */
  async update(id: string, data: Partial<MockExpense>, orgId: string): Promise<MockExpense> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update expense');

      const index = mockExpensesStore.findIndex(
        (e) => e.id === id && e.organization_id === orgId
      );
      if (index === -1) throw new Error('Expense not found');

      const oldExpense = mockExpensesStore[index];
      const oldAmount = oldExpense.amount;
      const oldCategory = oldExpense.category_name;

      mockExpensesStore[index] = {
        ...mockExpensesStore[index],
        ...data,
        updated_at: new Date(),
      };

      // Update category totals if amount or category changed
      if (data.amount !== undefined || data.category_name !== undefined) {
        // Remove from old category
        const oldCat = mockCategoriesStore.find(
          (c) => c.name === oldCategory && c.organization_id === orgId
        );
        if (oldCat) {
          oldCat.expense_count -= 1;
          oldCat.total_amount -= oldAmount;
        }

        // Add to new category
        const newCat = mockCategoriesStore.find(
          (c) =>
            c.name === (data.category_name || oldCategory) && c.organization_id === orgId
        );
        if (newCat) {
          newCat.expense_count += 1;
          newCat.total_amount += data.amount || oldAmount;
        }
      }

      return mockExpensesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete expense
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete expense');

      const index = mockExpensesStore.findIndex(
        (e) => e.id === id && e.organization_id === orgId
      );
      if (index === -1) throw new Error('Expense not found');

      const expense = mockExpensesStore[index];

      // Update category totals
      const category = mockCategoriesStore.find(
        (c) => c.name === expense.category_name && c.organization_id === orgId
      );
      if (category) {
        category.expense_count -= 1;
        category.total_amount -= expense.amount;
      }

      mockExpensesStore.splice(index, 1);

      // Also delete related receipts
      mockReceiptsStore = mockReceiptsStore.filter((r) => r.expense_id !== id);

      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get expense summary statistics
   */
  async getSummary(
    orgId: string,
    year?: number
  ): Promise<{
    totalExpenses: number;
    currentMonth: number;
    deductibleTotal: number;
    receiptCount: number;
    byCategory: Array<{ category: string; amount: number; count: number }>;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      let expenses = mockExpensesStore.filter((e) => e.organization_id === orgId);

      // Filter by year if provided
      if (year) {
        expenses = expenses.filter((e) => e.date.getFullYear() === year);
      }

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const deductibleTotal = expenses
        .filter((e) => e.is_tax_deductible)
        .reduce((sum, e) => sum + e.amount, 0);

      // Current month expenses
      const now = new Date();
      const currentMonthExpenses = expenses.filter(
        (e) => e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear()
      );
      const currentMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Receipt count
      const receiptCount = mockReceiptsStore.filter((r) =>
        expenses.some((e) => e.id === r.expense_id)
      ).length;

      // By category
      const categoryMap = new Map<string, { amount: number; count: number }>();
      expenses.forEach((e) => {
        const current = categoryMap.get(e.category_name) || { amount: 0, count: 0 };
        categoryMap.set(e.category_name, {
          amount: current.amount + e.amount,
          count: current.count + 1,
        });
      });

      const byCategory = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        totalExpenses,
        currentMonth,
        deductibleTotal,
        receiptCount,
        byCategory,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// CATEGORIES PROVIDER
// ============================================================================

export const categoriesProvider = {
  /**
   * Find all categories
   */
  async findAll(orgId: string): Promise<MockExpenseCategory[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch categories');

      return mockCategoriesStore.filter((c) => c.organization_id === orgId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find category by ID
   */
  async findById(id: string, orgId: string): Promise<MockExpenseCategory | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch category');

      return (
        mockCategoriesStore.find((c) => c.id === id && c.organization_id === orgId) || null
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create a new category
   */
  async create(data: Partial<MockExpenseCategory>, orgId: string): Promise<MockExpenseCategory> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to create category');

      const newCategory = generateMockExpenseCategory(orgId, data);
      mockCategoriesStore.push(newCategory);

      return newCategory;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update category
   */
  async update(
    id: string,
    data: Partial<MockExpenseCategory>,
    orgId: string
  ): Promise<MockExpenseCategory> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update category');

      const index = mockCategoriesStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Category not found');

      mockCategoriesStore[index] = {
        ...mockCategoriesStore[index],
        ...data,
      };

      return mockCategoriesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete category
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete category');

      const index = mockCategoriesStore.findIndex(
        (c) => c.id === id && c.organization_id === orgId
      );
      if (index === -1) throw new Error('Category not found');

      mockCategoriesStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get category breakdown with percentages
   */
  async getBreakdown(
    orgId: string
  ): Promise<Array<{ category: MockExpenseCategory; percentage: number; amount: number }>> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      const categories = mockCategoriesStore.filter((c) => c.organization_id === orgId);
      const totalAmount = categories.reduce((sum, c) => sum + c.total_amount, 0);

      return categories
        .map((category) => ({
          category,
          percentage: totalAmount > 0 ? (category.total_amount / totalAmount) * 100 : 0,
          amount: category.total_amount,
        }))
        .sort((a, b) => b.amount - a.amount);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// TAX PROVIDER
// ============================================================================

export const taxProvider = {
  /**
   * Get tax estimate for specific year and quarter
   */
  async getEstimate(orgId: string, year: number, quarter: number): Promise<MockTaxEstimate> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch tax estimate');

      const estimate = mockTaxEstimatesStore.find(
        (e) => e.organization_id === orgId && e.year === year && e.quarter === quarter
      );

      if (!estimate) {
        // Generate new estimate if not found
        const newEstimate = generateMockTaxEstimate(orgId, year, quarter);
        mockTaxEstimatesStore.push(newEstimate);
        return newEstimate;
      }

      return estimate;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get current quarter tax estimate
   */
  async getCurrentEstimate(orgId: string): Promise<MockTaxEstimate> {
    if (dataConfig.useMocks) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

      return this.getEstimate(orgId, currentYear, currentQuarter);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get year summary (all quarters)
   */
  async getYearSummary(
    orgId: string,
    year: number
  ): Promise<{
    yearTotal: number;
    deductibleTotal: number;
    quarters: MockTaxEstimate[];
  }> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();

      const quarters = mockTaxEstimatesStore
        .filter((e) => e.organization_id === orgId && e.year === year)
        .sort((a, b) => a.quarter - b.quarter);

      const yearTotal = quarters.reduce((sum, q) => sum + q.total_expenses, 0);
      const deductibleTotal = quarters.reduce((sum, q) => sum + q.deductible_expenses, 0);

      return {
        yearTotal,
        deductibleTotal,
        quarters,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update tax estimate
   */
  async updateEstimate(
    id: string,
    data: Partial<MockTaxEstimate>,
    orgId: string
  ): Promise<MockTaxEstimate> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to update tax estimate');

      const index = mockTaxEstimatesStore.findIndex(
        (e) => e.id === id && e.organization_id === orgId
      );
      if (index === -1) throw new Error('Tax estimate not found');

      mockTaxEstimatesStore[index] = {
        ...mockTaxEstimatesStore[index],
        ...data,
        updated_at: new Date(),
      };

      return mockTaxEstimatesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// RECEIPTS PROVIDER
// ============================================================================

export const receiptsProvider = {
  /**
   * Find receipts by expense ID
   */
  async findByExpense(expenseId: string, orgId: string): Promise<MockReceipt[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch receipts');

      // Verify expense belongs to organization
      const expense = mockExpensesStore.find(
        (e) => e.id === expenseId && e.organization_id === orgId
      );
      if (!expense) throw new Error('Expense not found');

      return mockReceiptsStore.filter((r) => r.expense_id === expenseId);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find receipt by ID
   */
  async findById(id: string, orgId: string): Promise<MockReceipt | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch receipt');

      const receipt = mockReceiptsStore.find((r) => r.id === id);
      if (!receipt) return null;

      // Verify receipt's expense belongs to organization
      const expense = mockExpensesStore.find(
        (e) => e.id === receipt.expense_id && e.organization_id === orgId
      );
      if (!expense) return null;

      return receipt;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Upload receipt
   */
  async upload(data: Partial<MockReceipt>, orgId: string): Promise<MockReceipt> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to upload receipt');

      if (!data.expense_id) throw new Error('expense_id is required');

      // Verify expense belongs to organization
      const expense = mockExpensesStore.find(
        (e) => e.id === data.expense_id && e.organization_id === orgId
      );
      if (!expense) throw new Error('Expense not found');

      const newReceipt = generateMockReceipt(data.expense_id, data.uploaded_by_id || 'demo-user');
      mockReceiptsStore.push(newReceipt);

      return newReceipt;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete receipt
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete receipt');

      const receipt = mockReceiptsStore.find((r) => r.id === id);
      if (!receipt) throw new Error('Receipt not found');

      // Verify receipt's expense belongs to organization
      const expense = mockExpensesStore.find(
        (e) => e.id === receipt.expense_id && e.organization_id === orgId
      );
      if (!expense) throw new Error('Receipt not found');

      const index = mockReceiptsStore.findIndex((r) => r.id === id);
      mockReceiptsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// REPORTS PROVIDER
// ============================================================================

export const reportsProvider = {
  /**
   * Find all reports
   */
  async findAll(orgId: string): Promise<MockTaxReport[]> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch reports');

      return mockReportsStore
        .filter((r) => r.organization_id === orgId)
        .sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find report by ID
   */
  async findById(id: string, orgId: string): Promise<MockTaxReport | null> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to fetch report');

      return mockReportsStore.find((r) => r.id === id && r.organization_id === orgId) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Generate a new tax report
   */
  async generate(
    orgId: string,
    params: {
      reportType: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
      year: number;
      quarter?: number;
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<MockTaxReport> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to generate report');

      const newReport = generateMockTaxReport(orgId, params.year, params.quarter);
      mockReportsStore.push(newReport);

      return newReport;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete report
   */
  async delete(id: string, orgId: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData(orgId);
      await simulateDelay();
      maybeThrowError('Failed to delete report');

      const index = mockReportsStore.findIndex((r) => r.id === id && r.organization_id === orgId);
      if (index === -1) throw new Error('Report not found');

      mockReportsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
