import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * System Expense Categories
 *
 * IRS-aligned categories for real estate professionals (Schedule C)
 * These are global categories available to all organizations
 */
const systemCategories = [
  {
    name: 'Commission',
    code: 'COMMISSION',
    description: 'Real estate commission payments and splits',
    irs_category: 'Schedule C Line 10 - Commissions and fees',
    default_deductible: true,
    deduction_limit: null,
    color: '#3b82f6', // blue-500
    icon: 'DollarSign',
  },
  {
    name: 'Travel',
    code: 'TRAVEL',
    description: 'Business travel expenses including mileage, flights, hotels',
    irs_category: 'Schedule C Line 24a - Travel',
    default_deductible: true,
    deduction_limit: null,
    color: '#8b5cf6', // violet-500
    icon: 'Plane',
  },
  {
    name: 'Marketing',
    code: 'MARKETING',
    description: 'Advertising and marketing expenses',
    irs_category: 'Schedule C Line 8 - Advertising',
    default_deductible: true,
    deduction_limit: null,
    color: '#ec4899', // pink-500
    icon: 'Megaphone',
  },
  {
    name: 'Office Supplies',
    code: 'OFFICE',
    description: 'Office supplies and materials',
    irs_category: 'Schedule C Line 18 - Office expense',
    default_deductible: true,
    deduction_limit: null,
    color: '#10b981', // emerald-500
    icon: 'Briefcase',
  },
  {
    name: 'Utilities',
    code: 'UTILITIES',
    description: 'Phone, internet, electricity, and other utilities',
    irs_category: 'Schedule C Line 25 - Utilities',
    default_deductible: true,
    deduction_limit: null,
    color: '#f59e0b', // amber-500
    icon: 'Zap',
  },
  {
    name: 'Legal & Professional',
    code: 'LEGAL',
    description: 'Legal and professional services',
    irs_category: 'Schedule C Line 17 - Legal and professional services',
    default_deductible: true,
    deduction_limit: null,
    color: '#6366f1', // indigo-500
    icon: 'Scale',
  },
  {
    name: 'Insurance',
    code: 'INSURANCE',
    description: 'Business insurance premiums (not health insurance)',
    irs_category: 'Schedule C Line 15 - Insurance',
    default_deductible: true,
    deduction_limit: null,
    color: '#14b8a6', // teal-500
    icon: 'Shield',
  },
  {
    name: 'Repairs & Maintenance',
    code: 'REPAIRS',
    description: 'Repairs and maintenance for business property',
    irs_category: 'Schedule C Line 21 - Repairs and maintenance',
    default_deductible: true,
    deduction_limit: null,
    color: '#f97316', // orange-500
    icon: 'Wrench',
  },
  {
    name: 'Meals & Entertainment',
    code: 'MEALS',
    description: 'Business meals (50% deductible)',
    irs_category: 'Schedule C Line 24b - Meals (deductible at 50%)',
    default_deductible: true,
    deduction_limit: 50, // Only 50% deductible
    color: '#ef4444', // red-500
    icon: 'Utensils',
  },
  {
    name: 'Education & Training',
    code: 'EDUCATION',
    description: 'Continuing education and professional development',
    irs_category: 'Schedule C Line 27 - Other expenses',
    default_deductible: true,
    deduction_limit: null,
    color: '#06b6d4', // cyan-500
    icon: 'GraduationCap',
  },
  {
    name: 'Software & Technology',
    code: 'SOFTWARE',
    description: 'Software subscriptions and technology expenses',
    irs_category: 'Schedule C Line 18 - Office expense',
    default_deductible: true,
    deduction_limit: null,
    color: '#8b5cf6', // violet-500
    icon: 'Laptop',
  },
  {
    name: 'Other Expenses',
    code: 'OTHER',
    description: 'Other miscellaneous business expenses',
    irs_category: 'Schedule C Line 27 - Other expenses',
    default_deductible: false,
    deduction_limit: null,
    color: '#6b7280', // gray-500
    icon: 'MoreHorizontal',
  },
];

/**
 * Seed Categories
 *
 * Creates or updates system expense categories in the database
 */
async function seedCategories() {
  console.log('🌱 Seeding expense categories...');

  try {
    for (const category of systemCategories) {
      // Check if category already exists
      const existing = await prisma.expense_categories.findFirst({
        where: {
          code: category.code,
          organization_id: null, // System category
        },
      });

      let result;
      if (existing) {
        // Update existing
        result = await prisma.expense_categories.update({
          where: { id: existing.id },
          data: {
            name: category.name,
            description: category.description,
            irs_category: category.irs_category,
            default_deductible: category.default_deductible,
            deduction_limit: category.deduction_limit || null,
            color: category.color,
            icon: category.icon,
            is_active: true,
          },
        });
      } else {
        // Create new
        result = await prisma.expense_categories.create({
          data: {
            ...category,
            deduction_limit: category.deduction_limit || null,
            is_system: true,
            organization_id: null, // NULL = system category (available to all orgs)
            is_active: true,
          },
        });
      }

      console.log(`  ✓ ${category.name} (${result.code})`);
    }

    console.log(`\n✅ Successfully seeded ${systemCategories.length} system expense categories`);

    // Verify
    const count = await prisma.expense_categories.count({
      where: { is_system: true },
    });

    console.log(`📊 Total system categories in database: ${count}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  await seedCategories();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
