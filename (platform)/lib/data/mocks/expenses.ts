/**
 * Mock Expenses Data
 *
 * Generate mock data for Expense & Tax module (expenses, categories, tax estimates, receipts, reports)
 */

import {
  generateId,
  randomFromArray,
  randomName,
  randomCurrency,
  randomPastDate,
  randomBoolean,
  randomInt,
  randomDate,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockExpense = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  amount: number; // in cents
  category_id: string;
  category_name: string; // denormalized for convenience
  vendor: string;
  date: Date;
  payment_method: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WIRE_TRANSFER' | 'OTHER';
  receipt_url: string | null;
  is_tax_deductible: boolean;
  tax_category:
    | 'ADVERTISING'
    | 'VEHICLE'
    | 'COMMISSIONS'
    | 'INSURANCE'
    | 'LEGAL'
    | 'OFFICE'
    | 'RENT'
    | 'REPAIRS'
    | 'SUPPLIES'
    | 'TRAVEL'
    | 'MEALS'
    | 'UTILITIES'
    | 'OTHER'
    | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
};

export type MockExpenseCategory = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string; // hex color for UI
  icon: string | null;
  is_default: boolean;
  is_custom: boolean; // Whether category is custom (user-created)
  expense_count: number;
  total_amount: number; // in cents
  created_at: Date;
  updated_at: Date;
};

export type MockTaxEstimate = {
  id: string;
  organization_id: string;
  year: number;
  quarter: number; // 1-4
  total_income: number; // in cents
  total_expenses: number; // in cents
  deductible_expenses: number; // in cents
  estimated_tax_rate: number; // percentage (e.g., 25 = 25%)
  estimated_tax_owed: number; // in cents
  tax_paid: number; // in cents
  created_at: Date;
  updated_at: Date;
};

export type MockReceipt = {
  id: string;
  expense_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
  uploaded_by_id: string;
};

export type MockTaxReport = {
  id: string;
  organization_id: string;
  title: string;
  report_type: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  year: number;
  quarter: number | null; // null for annual reports
  start_date: Date;
  end_date: Date;
  total_income: number;
  total_expenses: number;
  deductible_expenses: number;
  non_deductible_expenses: number;
  net_income: number;
  estimated_tax: number;
  category_breakdown: Array<{ category: string; amount: number; count: number }>;
  generated_at: Date;
};

// ============================================================================
// DATA POOLS
// ============================================================================

const PAYMENT_METHODS: MockExpense['payment_method'][] = [
  'CASH',
  'CHECK',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'WIRE_TRANSFER',
  'OTHER',
];

const TAX_CATEGORIES: NonNullable<MockExpense['tax_category']>[] = [
  'ADVERTISING',
  'VEHICLE',
  'COMMISSIONS',
  'INSURANCE',
  'LEGAL',
  'OFFICE',
  'RENT',
  'REPAIRS',
  'SUPPLIES',
  'TRAVEL',
  'MEALS',
  'UTILITIES',
  'OTHER',
];

const EXPENSE_TITLES = [
  'Office Rent - January 2025',
  'Marketing Campaign - Q1 2025',
  'Legal Consultation - Contract Review',
  'Office Supplies - Staples',
  'Business Insurance Premium',
  'Vehicle Maintenance - Oil Change',
  'Software Subscription - Adobe Creative Cloud',
  'Client Meeting - Lunch at The Bistro',
  'Property Inspection Services',
  'Advertising - Google Ads',
  'Conference Registration - Real Estate Summit',
  'Professional Development - Training Course',
  'Office Equipment - Printer',
  'Business Travel - Flight to Dallas',
  'Website Hosting - Annual Renewal',
  'Utilities - Internet Service',
  'Repairs - Office HVAC Maintenance',
  'Marketing Materials - Business Cards',
  'Legal Fees - LLC Formation',
  'Accounting Services - Tax Preparation',
  'Office Furniture - Desk Chairs',
  'Phone Service - Business Line',
  'Postage - Direct Mail Campaign',
  'Professional Membership - NAR Dues',
  'Vehicle Lease Payment - Company Car',
  'Meals - Client Dinner',
  'Hotel - Business Trip',
  'Parking - Downtown Garage',
  'Office Cleaning Services',
  'Bank Fees - Business Account',
  'Computer Equipment - Laptop',
  'Marketing - Social Media Ads',
  'Insurance - Liability Coverage',
  'Repairs - Plumbing Fix',
  'Utilities - Electric Bill',
  'Office Supplies - Paper',
  'Travel - Rental Car',
  'Marketing - Trade Show Booth',
  'Legal - Contract Drafting',
  'Commissions - Agent Split',
  'Advertising - Billboard',
  'Office Rent - February 2025',
  'Software - CRM Subscription',
  'Professional Services - Photography',
  'Repairs - Roof Leak Fix',
  'Utilities - Water Bill',
  'Marketing - Email Campaign',
  'Travel - Conference Hotel',
  'Office Supplies - Toner',
  'Insurance - Workers Comp',
];

const VENDORS = [
  'Staples',
  'Office Depot',
  'Amazon Business',
  'Comcast Business',
  'AT&T',
  'Adobe',
  'Microsoft',
  'Google Ads',
  'Facebook Ads',
  'Quickbooks',
  'Salesforce',
  'Zillow',
  'Realtor.com',
  'DocuSign',
  'FedEx',
  'UPS',
  'USPS',
  'Exxon',
  'Shell',
  'Chevron',
  'Enterprise Rent-A-Car',
  'Hertz',
  'Hilton Hotels',
  'Marriott',
  'Delta Airlines',
  'American Airlines',
  'United Airlines',
  'Home Depot',
  'Lowe\'s',
  'Best Buy',
];

const DEFAULT_CATEGORIES: Array<{
  name: string;
  description: string;
  color: string;
  icon: string;
  tax_category: NonNullable<MockExpense['tax_category']>;
}> = [
  {
    name: 'Advertising & Marketing',
    description: 'Marketing campaigns, ads, promotional materials',
    color: '#3b82f6',
    icon: 'Megaphone',
    tax_category: 'ADVERTISING',
  },
  {
    name: 'Vehicle Expenses',
    description: 'Car payments, gas, maintenance, parking',
    color: '#8b5cf6',
    icon: 'Car',
    tax_category: 'VEHICLE',
  },
  {
    name: 'Commissions',
    description: 'Agent commissions, referral fees',
    color: '#10b981',
    icon: 'DollarSign',
    tax_category: 'COMMISSIONS',
  },
  {
    name: 'Insurance',
    description: 'Business insurance, liability, E&O',
    color: '#f59e0b',
    icon: 'Shield',
    tax_category: 'INSURANCE',
  },
  {
    name: 'Legal & Professional',
    description: 'Legal fees, attorney costs, consulting',
    color: '#ef4444',
    icon: 'Scale',
    tax_category: 'LEGAL',
  },
  {
    name: 'Office Expenses',
    description: 'Supplies, equipment, furniture',
    color: '#06b6d4',
    icon: 'Briefcase',
    tax_category: 'OFFICE',
  },
  {
    name: 'Rent & Lease',
    description: 'Office rent, equipment leases',
    color: '#6366f1',
    icon: 'Home',
    tax_category: 'RENT',
  },
  {
    name: 'Repairs & Maintenance',
    description: 'Building repairs, equipment maintenance',
    color: '#84cc16',
    icon: 'Wrench',
    tax_category: 'REPAIRS',
  },
  {
    name: 'Supplies',
    description: 'Office supplies, materials, consumables',
    color: '#14b8a6',
    icon: 'Package',
    tax_category: 'SUPPLIES',
  },
  {
    name: 'Travel',
    description: 'Business travel, flights, hotels',
    color: '#f97316',
    icon: 'Plane',
    tax_category: 'TRAVEL',
  },
  {
    name: 'Meals & Entertainment',
    description: 'Client meals, business lunches',
    color: '#ec4899',
    icon: 'Coffee',
    tax_category: 'MEALS',
  },
  {
    name: 'Utilities',
    description: 'Phone, internet, electric, water',
    color: '#a855f7',
    icon: 'Zap',
    tax_category: 'UTILITIES',
  },
  {
    name: 'Technology',
    description: 'Software, hardware, IT services',
    color: '#0ea5e9',
    icon: 'Laptop',
    tax_category: 'OFFICE',
  },
  {
    name: 'Education & Training',
    description: 'Courses, certifications, conferences',
    color: '#22c55e',
    icon: 'GraduationCap',
    tax_category: 'OTHER',
  },
  {
    name: 'Other Expenses',
    description: 'Miscellaneous business expenses',
    color: '#64748b',
    icon: 'MoreHorizontal',
    tax_category: 'OTHER',
  },
];

const REPORT_TYPES: MockTaxReport['report_type'][] = ['QUARTERLY', 'ANNUAL', 'CUSTOM'];

// ============================================================================
// EXPENSE GENERATORS
// ============================================================================

/**
 * Generate a mock expense
 */
export function generateMockExpense(orgId: string, overrides?: Partial<MockExpense>): MockExpense {
  const category = overrides?.category_name
    ? DEFAULT_CATEGORIES.find((c) => c.name === overrides.category_name) || randomFromArray(DEFAULT_CATEGORIES)
    : randomFromArray(DEFAULT_CATEGORIES);

  const isTaxDeductible = overrides?.is_tax_deductible ?? (randomBoolean() || randomBoolean() || randomBoolean()); // 87.5% deductible
  const date = overrides?.date || randomPastDate(365);
  const createdAt = overrides?.created_at || date;

  // Generate realistic amounts based on category
  let minAmount = 1000; // $10
  let maxAmount = 50000; // $500
  if (category.tax_category === 'RENT') {
    minAmount = 100000; // $1,000
    maxAmount = 500000; // $5,000
  } else if (category.tax_category === 'VEHICLE') {
    minAmount = 3000; // $30
    maxAmount = 20000; // $200
  } else if (category.tax_category === 'COMMISSIONS') {
    minAmount = 50000; // $500
    maxAmount = 500000; // $5,000
  } else if (category.tax_category === 'TRAVEL') {
    minAmount = 10000; // $100
    maxAmount = 150000; // $1,500
  }

  return {
    id: generateId(),
    organization_id: orgId,
    title: randomFromArray(EXPENSE_TITLES),
    description: randomBoolean() ? 'Expense description and additional details' : null,
    amount: randomInt(minAmount, maxAmount),
    category_id: category.name.toLowerCase().replace(/\s+/g, '-'),
    category_name: category.name,
    vendor: randomFromArray(VENDORS),
    date,
    payment_method: randomFromArray(PAYMENT_METHODS),
    receipt_url: randomBoolean() && randomBoolean() ? `/mock-receipts/${generateId()}.pdf` : null,
    is_tax_deductible: isTaxDeductible,
    tax_category: isTaxDeductible ? category.tax_category : null,
    notes: randomBoolean() ? 'Additional notes about this expense' : null,
    created_at: createdAt,
    updated_at: createdAt,
    created_by_id: 'demo-user',
    ...overrides,
  };
}

/**
 * Generate multiple mock expenses
 */
export function generateMockExpenses(orgId: string, count: number = 100): MockExpense[] {
  const expenses: MockExpense[] = [];
  const now = new Date();

  // Generate expenses spread across 12 months
  for (let i = 0; i < count; i++) {
    const monthsAgo = Math.floor((i / count) * 12); // Distribute across year
    const daysAgo = randomInt(monthsAgo * 30, (monthsAgo + 1) * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    expenses.push(
      generateMockExpense(orgId, {
        date,
        created_at: date,
      })
    );
  }

  return expenses;
}

// ============================================================================
// CATEGORY GENERATORS
// ============================================================================

/**
 * Generate a mock expense category
 */
export function generateMockExpenseCategory(
  orgId: string,
  overrides?: Partial<MockExpenseCategory>
): MockExpenseCategory {
  const defaultCategory = randomFromArray(DEFAULT_CATEGORIES);
  const createdAt = overrides?.created_at || randomPastDate(365);
  const isDefault = overrides?.is_default !== undefined ? overrides.is_default : true;

  return {
    id: generateId(),
    organization_id: orgId,
    name: defaultCategory.name,
    description: defaultCategory.description,
    color: defaultCategory.color,
    icon: defaultCategory.icon,
    is_default: isDefault,
    is_custom: !isDefault, // Custom categories are not default
    expense_count: 0, // Will be calculated
    total_amount: 0, // Will be calculated
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

/**
 * Generate multiple expense categories
 */
export function generateMockExpenseCategories(orgId: string, count: number = 15): MockExpenseCategory[] {
  return DEFAULT_CATEGORIES.slice(0, count).map((cat) =>
    generateMockExpenseCategory(orgId, {
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
    })
  );
}

// ============================================================================
// TAX ESTIMATE GENERATORS
// ============================================================================

/**
 * Generate a mock tax estimate
 */
export function generateMockTaxEstimate(
  orgId: string,
  year: number,
  quarter: number
): MockTaxEstimate {
  const totalIncome = randomInt(5000000, 20000000); // $50k - $200k
  const totalExpenses = randomInt(2000000, 8000000); // $20k - $80k
  const deductibleExpenses = Math.floor(totalExpenses * 0.85); // 85% deductible

  const taxableIncome = totalIncome - deductibleExpenses;
  const taxRate = 25; // 25% tax rate
  const estimatedTaxOwed = Math.floor(taxableIncome * (taxRate / 100));
  const taxPaid = Math.floor(estimatedTaxOwed * randomInt(50, 100) / 100); // 50-100% paid

  return {
    id: generateId(),
    organization_id: orgId,
    year,
    quarter,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    deductible_expenses: deductibleExpenses,
    estimated_tax_rate: taxRate,
    estimated_tax_owed: estimatedTaxOwed,
    tax_paid: taxPaid,
    created_at: new Date(year, (quarter - 1) * 3, 1),
    updated_at: new Date(year, (quarter - 1) * 3, 1),
  };
}

/**
 * Generate tax estimates for multiple quarters
 */
export function generateMockTaxEstimates(orgId: string, count: number = 4): MockTaxEstimate[] {
  const currentYear = new Date().getFullYear();
  const estimates: MockTaxEstimate[] = [];

  for (let i = 0; i < count; i++) {
    estimates.push(generateMockTaxEstimate(orgId, currentYear, i + 1));
  }

  return estimates;
}

// ============================================================================
// RECEIPT GENERATORS
// ============================================================================

/**
 * Generate a mock receipt
 */
export function generateMockReceipt(expenseId: string, userId: string): MockReceipt {
  const fileSize = randomInt(50000, 2000000); // 50KB - 2MB

  return {
    id: generateId(),
    expense_id: expenseId,
    file_url: `/mock-receipts/${expenseId}/${generateId()}.pdf`,
    file_name: `receipt-${generateId()}.pdf`,
    file_size: fileSize,
    mime_type: 'application/pdf',
    uploaded_at: randomPastDate(30),
    uploaded_by_id: userId,
  };
}

/**
 * Generate receipts for multiple expenses
 */
export function generateMockReceipts(
  expenses: MockExpense[],
  receiptRate: number = 0.7
): MockReceipt[] {
  const receipts: MockReceipt[] = [];

  expenses.forEach((expense) => {
    if (Math.random() < receiptRate) {
      receipts.push(generateMockReceipt(expense.id, expense.created_by_id));
    }
  });

  return receipts;
}

// ============================================================================
// TAX REPORT GENERATORS
// ============================================================================

/**
 * Generate a mock tax report
 */
export function generateMockTaxReport(
  orgId: string,
  year: number,
  quarter?: number
): MockTaxReport {
  const reportType: MockTaxReport['report_type'] = quarter ? 'QUARTERLY' : 'ANNUAL';

  let startDate: Date;
  let endDate: Date;

  if (quarter) {
    startDate = new Date(year, (quarter - 1) * 3, 1);
    endDate = new Date(year, quarter * 3, 0);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
  }

  const totalIncome = randomInt(10000000, 50000000); // $100k - $500k
  const totalExpenses = randomInt(4000000, 20000000); // $40k - $200k
  const deductibleExpenses = Math.floor(totalExpenses * 0.85);
  const nonDeductibleExpenses = totalExpenses - deductibleExpenses;
  const netIncome = totalIncome - totalExpenses;
  const estimatedTax = Math.floor((totalIncome - deductibleExpenses) * 0.25);

  // Generate category breakdown
  const categoryBreakdown = DEFAULT_CATEGORIES.slice(0, 8).map((cat) => ({
    category: cat.name,
    amount: randomInt(100000, 2000000), // $1k - $20k
    count: randomInt(5, 25),
  }));

  const title = quarter
    ? `Q${quarter} ${year} Tax Report`
    : `Annual ${year} Tax Report`;

  return {
    id: generateId(),
    organization_id: orgId,
    title,
    report_type: reportType,
    year,
    quarter: quarter || null,
    start_date: startDate,
    end_date: endDate,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    deductible_expenses: deductibleExpenses,
    non_deductible_expenses: nonDeductibleExpenses,
    net_income: netIncome,
    estimated_tax: estimatedTax,
    category_breakdown: categoryBreakdown,
    generated_at: new Date(),
  };
}
