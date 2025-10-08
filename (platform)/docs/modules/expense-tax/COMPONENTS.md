# Expense & Tax Module - Component Guide

**Complete reference for all 18 components in the Expenses & Taxes module**

## Table of Contents

1. [Dashboard Components](#dashboard-components) (7)
2. [Analytics Components](#analytics-components) (3)
3. [Reports Components](#reports-components) (3)
4. [Settings Components](#settings-components) (5)

---

## Dashboard Components

### 1. ExpenseKPIs

**Location:** `components/real-estate/expense-tax/dashboard/ExpenseKPIs.tsx`
**Type:** Client Component
**Purpose:** Display 4 KPI summary cards

**Props:** None

**Features:**
- Fetches data from `/api/v1/expenses/summary` (planned)
- Auto-refreshes every 30 seconds
- Loading skeleton states
- Error handling with user feedback

**Usage:**
```tsx
import { ExpenseKPIs } from '@/components/real-estate/expense-tax/dashboard/ExpenseKPIs';

<ExpenseKPIs />
```

**Data Structure:**
```typescript
interface KPISummary {
  ytdTotal: number;
  monthlyTotal: number;
  deductibleTotal: number;
  receiptCount: number;
  totalCount: number;
}
```

**Displays:**
- Total Expenses YTD (with count)
- This Month (current month spending)
- Tax Deductible (with percentage)
- Total Receipts (with count)

---

### 2. CategoryBreakdown

**Location:** `components/real-estate/expense-tax/charts/CategoryBreakdown.tsx`
**Type:** Client Component
**Purpose:** Pie chart showing expense distribution by category

**Props:** None

**Features:**
- Uses Recharts PieChart
- Interactive tooltips
- Responsive sizing
- Custom color scheme per category
- Percentage calculations

**Usage:**
```tsx
import { CategoryBreakdown } from '@/components/real-estate/expense-tax/charts/CategoryBreakdown';

<CategoryBreakdown />
```

**Chart Config:**
- Chart type: Pie
- Data points: Categories
- Metrics: Amount ($), Percentage (%)
- Colors: Category-specific hex colors

---

### 3. ExpenseTable

**Location:** `components/real-estate/expense-tax/tables/ExpenseTable.tsx`
**Type:** Client Component
**Purpose:** Sortable, filterable expense list

**Props:**
```typescript
interface ExpenseTableProps {
  organizationId: string;
}
```

**Features:**
- Column sorting (date, merchant, amount)
- Category filtering
- Search by merchant
- Pagination (50 items per page)
- Action buttons (edit, delete)

**Usage:**
```tsx
import { ExpenseTable } from '@/components/real-estate/expense-tax/tables/ExpenseTable';

<ExpenseTable organizationId={currentOrg.id} />
```

**Columns:**
- Date
- Merchant
- Category (color-coded badge)
- Amount (formatted currency)
- Deductible (checkmark icon)
- Actions (edit/delete)

---

### 4. ExpenseTableRow

**Location:** `components/real-estate/expense-tax/tables/ExpenseTableRow.tsx`
**Type:** Client Component
**Purpose:** Individual expense row with actions

**Props:**
```typescript
interface ExpenseTableRowProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}
```

**Usage:**
```tsx
import { ExpenseTableRow } from '@/components/real-estate/expense-tax/tables/ExpenseTableRow';

<ExpenseTableRow
  expense={expense}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### 5. TaxEstimateCard

**Location:** `components/real-estate/expense-tax/tax/TaxEstimateCard.tsx`
**Type:** Client Component
**Purpose:** Display current tax estimate with breakdown

**Props:**
```typescript
interface TaxEstimateCardProps {
  organizationId: string;
}
```

**Features:**
- Current tax estimate calculation
- Quarterly breakdown
- Tax rate configuration link
- Deductible expense total

**Usage:**
```tsx
import { TaxEstimateCard } from '@/components/real-estate/expense-tax/tax/TaxEstimateCard';

<TaxEstimateCard organizationId={currentOrg.id} />
```

**Calculation:**
```typescript
const taxEstimate = deductibleTotal * (taxRate / 100);
const quarterlyEstimate = taxEstimate / 4;
```

---

### 6. AddExpenseModal

**Location:** `components/real-estate/expense-tax/forms/AddExpenseModal.tsx`
**Type:** Client Component
**Purpose:** Modal form for creating/editing expenses

**Props:**
```typescript
interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Features:**
- React Hook Form + Zod validation
- All expense fields
- Receipt upload integration
- Loading states
- Error handling

**Usage:**
```tsx
import { AddExpenseModal } from '@/components/real-estate/expense-tax/forms/AddExpenseModal';

const [modalOpen, setModalOpen] = useState(false);

<AddExpenseModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSuccess={() => {
    setModalOpen(false);
    refetch();
  }}
/>
```

**Form Fields:**
- Date (date picker)
- Merchant (text, max 100 chars)
- Category (select dropdown)
- Amount (number, min 0.01)
- Notes (textarea, optional, max 1000 chars)
- Tax Deductible (checkbox)
- Receipt Upload (file upload)

**Validation Schema:**
```typescript
const expenseFormSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().min(1).max(100),
  category: z.string().min(1),
  amount: z.string().min(1),
  notes: z.string().max(1000).optional(),
  isDeductible: z.boolean(),
});
```

---

### 7. ReceiptUpload

**Location:** `components/real-estate/expense-tax/forms/ReceiptUpload.tsx`
**Type:** Client Component
**Purpose:** Drag-and-drop file upload for receipts

**Props:**
```typescript
interface ReceiptUploadProps {
  onFileSelect: (file: File | null) => void;
}
```

**Features:**
- Drag-and-drop support
- Click to browse
- File type validation (JPEG, PNG, PDF)
- File size validation (max 5MB)
- Preview thumbnail
- Remove file option

**Usage:**
```tsx
import { ReceiptUpload } from '@/components/real-estate/expense-tax/forms/ReceiptUpload';

const [receiptFile, setReceiptFile] = useState<File | null>(null);

<ReceiptUpload onFileSelect={setReceiptFile} />
```

**Accepted File Types:**
- `image/jpeg`
- `image/jpg`
- `image/png`
- `application/pdf`

---

## Analytics Components

### 8. SpendingTrends

**Location:** `components/real-estate/expense-tax/analytics/SpendingTrends.tsx`
**Type:** Client Component
**Purpose:** Line chart showing monthly spending trends

**Props:**
```typescript
interface SpendingTrendsProps {
  organizationId: string;
}
```

**Features:**
- 12-month trend line
- Interactive tooltips
- Grid lines
- Responsive sizing
- Currency formatting

**Usage:**
```tsx
import { SpendingTrends } from '@/components/real-estate/expense-tax/analytics/SpendingTrends';

<SpendingTrends organizationId={currentOrg.id} />
```

**Chart Config:**
- Chart type: Line
- X-axis: Month
- Y-axis: Amount ($)
- Color: Cyan gradient

---

### 9. MonthlyComparison

**Location:** `components/real-estate/expense-tax/analytics/MonthlyComparison.tsx`
**Type:** Client Component
**Purpose:** Bar chart comparing months

**Props:**
```typescript
interface MonthlyComparisonProps {
  organizationId: string;
}
```

**Features:**
- Side-by-side month comparison
- Color-coded bars
- Tooltips with percentages
- Responsive layout

**Usage:**
```tsx
import { MonthlyComparison } from '@/components/real-estate/expense-tax/analytics/MonthlyComparison';

<MonthlyComparison organizationId={currentOrg.id} />
```

**Chart Config:**
- Chart type: Bar
- X-axis: Month
- Y-axis: Amount ($)
- Bars: Current vs Previous

---

### 10. CategoryTrends

**Location:** `components/real-estate/expense-tax/analytics/CategoryTrends.tsx`
**Type:** Client Component
**Purpose:** Multi-line chart showing category trends over time

**Props:**
```typescript
interface CategoryTrendsProps {
  organizationId: string;
}
```

**Features:**
- Multiple trend lines (top 5 categories)
- Color-coded by category
- Interactive legend
- Tooltips

**Usage:**
```tsx
import { CategoryTrends } from '@/components/real-estate/expense-tax/analytics/CategoryTrends';

<CategoryTrends organizationId={currentOrg.id} />
```

**Chart Config:**
- Chart type: Multi-line
- X-axis: Month
- Y-axis: Amount ($)
- Lines: Top 5 categories

---

## Reports Components

### 11. ReportGenerator

**Location:** `components/real-estate/expense-tax/reports/ReportGenerator.tsx`
**Type:** Client Component
**Purpose:** Form to configure and generate expense reports

**Props:**
```typescript
interface ReportGeneratorProps {
  organizationId: string;
}
```

**Features:**
- Date range selection
- Category multi-select
- Deductible-only filter
- CSV export
- Report preview

**Usage:**
```tsx
import { ReportGenerator } from '@/components/real-estate/expense-tax/reports/ReportGenerator';

<ReportGenerator organizationId={currentOrg.id} />
```

**Report Options:**
- Start Date
- End Date
- Categories (multi-select)
- Deductible Only (checkbox)
- Format (CSV)

---

### 12. ReportList

**Location:** `components/real-estate/expense-tax/reports/ReportList.tsx`
**Type:** Client Component
**Purpose:** Display list of previously generated reports

**Props:**
```typescript
interface ReportListProps {
  organizationId: string;
}
```

**Features:**
- Report history
- Download links
- Report metadata
- Delete option

**Usage:**
```tsx
import { ReportList } from '@/components/real-estate/expense-tax/reports/ReportList';

<ReportList organizationId={currentOrg.id} />
```

---

### 13. ReportCard

**Location:** `components/real-estate/expense-tax/reports/ReportCard.tsx`
**Type:** Client Component
**Purpose:** Individual report display card

**Props:**
```typescript
interface ReportCardProps {
  report: Report;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Usage:**
```tsx
import { ReportCard } from '@/components/real-estate/expense-tax/reports/ReportCard';

<ReportCard
  report={report}
  onDownload={handleDownload}
  onDelete={handleDelete}
/>
```

---

## Settings Components

### 14. CategoryManager

**Location:** `components/real-estate/expense-tax/settings/CategoryManager.tsx`
**Type:** Client Component
**Purpose:** Main category management orchestration

**Props:**
```typescript
interface CategoryManagerProps {
  organizationId: string;
}
```

**Features:**
- Category list display
- Add category button
- Edit/delete handlers
- Modal integration
- Toast notifications

**Usage:**
```tsx
import { CategoryManager } from '@/components/real-estate/expense-tax/settings/CategoryManager';

<CategoryManager organizationId={currentOrg.id} />
```

**Initial Categories:**
- 12 system categories (protected)
- 6 custom categories (editable)

---

### 15. CategoryList

**Location:** `components/real-estate/expense-tax/settings/CategoryList.tsx`
**Type:** Client Component
**Purpose:** Sortable category list with drag-and-drop

**Props:**
```typescript
interface CategoryListProps {
  categories: ExpenseCategory[];
  onReorder: (categories: ExpenseCategory[]) => void;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (id: string) => void;
}
```

**Features:**
- @dnd-kit drag-and-drop
- Visual drag handles
- System category badges
- Edit/delete buttons (custom only)
- Sort order persistence

**Usage:**
```tsx
import { CategoryList } from '@/components/real-estate/expense-tax/settings/CategoryList';

<CategoryList
  categories={categories}
  onReorder={handleReorder}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Drag & Drop:**
- Library: @dnd-kit/core + @dnd-kit/sortable
- Keyboard accessible
- Touch-friendly
- Smooth animations

---

### 16. AddCategoryModal

**Location:** `components/real-estate/expense-tax/settings/AddCategoryModal.tsx`
**Type:** Client Component
**Purpose:** Modal form for adding/editing categories

**Props:**
```typescript
interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string }) => void;
  initialData?: { name: string; color: string };
  mode: 'add' | 'edit';
}
```

**Features:**
- React Hook Form + Zod
- Category name input
- Color picker (14 presets)
- Custom hex color input
- Live preview
- Validation

**Usage:**
```tsx
import { AddCategoryModal } from '@/components/real-estate/expense-tax/settings/AddCategoryModal';

<AddCategoryModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSubmit={handleSubmit}
  mode="add"
/>
```

**Validation:**
```typescript
const categorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});
```

**Preset Colors:**
14 preset colors available:
- Red: #ef4444
- Orange: #f59e0b
- Yellow: #eab308
- Lime: #84cc16
- Green: #22c55e
- Teal: #14b8a6
- Cyan: #06b6d4
- Sky: #0ea5e9
- Blue: #3b82f6
- Indigo: #6366f1
- Violet: #8b5cf6
- Purple: #a855f7
- Pink: #ec4899
- Rose: #f43f5e

---

### 17. ExpensePreferences

**Location:** `components/real-estate/expense-tax/settings/ExpensePreferences.tsx`
**Type:** Client Component
**Purpose:** Module preference configuration

**Props:**
```typescript
interface ExpensePreferencesProps {
  organizationId: string;
}
```

**Features:**
- Default category selection
- Auto-categorization toggle
- Email notifications toggle
- Receipt retention period
- Currency format selector
- Tax year selector

**Usage:**
```tsx
import { ExpensePreferences } from '@/components/real-estate/expense-tax/settings/ExpensePreferences';

<ExpensePreferences organizationId={currentOrg.id} />
```

**Preferences:**
```typescript
interface Preferences {
  defaultCategoryId: string;
  autoCategorizationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  receiptRetentionDays: number;  // 365-3650
  currencyFormat: 'USD' | 'EUR' | 'GBP';
  taxYear: number;  // 2023-2026
}
```

---

### 18. TaxConfiguration

**Location:** `components/real-estate/expense-tax/settings/TaxConfiguration.tsx`
**Type:** Client Component
**Purpose:** Tax rate and deduction configuration

**Props:**
```typescript
interface TaxConfigurationProps {
  organizationId: string;
}
```

**Features:**
- Tax rate input (0-100%)
- Tax year selector
- Jurisdiction dropdown
- Deduction categories checklist
- Tax disclaimer notice

**Usage:**
```tsx
import { TaxConfiguration } from '@/components/real-estate/expense-tax/settings/TaxConfiguration';

<TaxConfiguration organizationId={currentOrg.id} />
```

**Configuration:**
```typescript
interface TaxConfig {
  taxRate: number;  // 0-100
  taxYear: number;  // 2023-2026
  jurisdiction: string;  // US state or Federal
  deductionCategories: string[];  // Category IDs
}
```

**Deduction Categories:**
11 predefined categories:
- Repairs
- Utilities
- Marketing
- Insurance
- Legal
- Travel
- Office
- Maintenance
- Property Tax
- HOA Fees
- Other

---

## Design System Integration

All components follow the platform design system:

### Shared Components Used

- `ModuleHeroSection` - Hero sections with stats
- `EnhancedCard` - Glass effect cards
- `Button` - Standard button component
- `Input` - Form input fields
- `Select` - Dropdown selects
- `Checkbox` - Checkboxes
- `Label` - Form labels
- `Dialog` - Modal dialogs
- `Toast` - Notifications (sonner)

### Styling Patterns

- **Glass Effects:** `glassEffect="strong"` on major cards
- **Neon Borders:** Cyan, purple, green borders
- **Animations:** Framer Motion for transitions
- **Responsive:** Mobile-first breakpoints
- **Dark Mode:** Full dark mode support

### Color Scheme

- **Primary:** Cyan (#06b6d4)
- **Secondary:** Purple (#8b5cf6)
- **Success:** Green (#22c55e)
- **Warning:** Orange (#f59e0b)
- **Error:** Red (#ef4444)

---

## Common Patterns

### Data Fetching

```tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['expense-summary', organizationId],
  queryFn: () => fetch(`/api/v1/expenses/summary?orgId=${organizationId}`)
    .then(r => r.json()),
  refetchInterval: 30000,
  staleTime: 20000,
});
```

### Form Submission

```tsx
const onSubmit = async (data: FormData) => {
  try {
    setIsSubmitting(true);
    await createExpense(data);
    toast.success('Expense added successfully');
    onSuccess();
  } catch (error) {
    toast.error('Failed to add expense');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Loading States

```tsx
if (isLoading) {
  return <Skeleton count={4} />;
}

if (isError) {
  return <ErrorCard message="Failed to load data" />;
}
```

---

## Best Practices

1. **Always include organizationId** - Ensure multi-tenancy
2. **Use loading states** - Provide user feedback
3. **Handle errors gracefully** - Show user-friendly messages
4. **Validate inputs** - Use Zod schemas
5. **Optimize performance** - Lazy load heavy components
6. **Test thoroughly** - Write unit and integration tests
7. **Follow accessibility** - ARIA labels, keyboard navigation

---

**Last Updated:** 2025-10-08
**Total Components:** 18
**Status:** ✅ Complete
