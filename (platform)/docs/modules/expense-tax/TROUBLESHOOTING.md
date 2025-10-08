# Expenses & Taxes Module - Troubleshooting Guide

**Common issues and solutions**

## Table of Contents

1. [Component Issues](#component-issues)
2. [Data & State Issues](#data--state-issues)
3. [Form & Validation Issues](#form--validation-issues)
4. [Performance Issues](#performance-issues)
5. [Build & Deploy Issues](#build--deploy-issues)
6. [Testing Issues](#testing-issues)

---

## Component Issues

### KPI Cards Not Loading

**Problem:** ExpenseKPIs component shows loading skeleton indefinitely

**Causes:**
- API endpoint not responding
- Network error
- Query configuration issue

**Solutions:**

1. **Check API endpoint:**
```typescript
// Verify endpoint is accessible
fetch('/api/v1/expenses/summary')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

2. **Check TanStack Query config:**
```typescript
// Ensure retry is enabled
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['expense-summary'],
  queryFn: fetchSummary,
  retry: 3, // Add retry
  retryDelay: 1000,
});
```

3. **Check browser console for errors:**
- Open DevTools → Console
- Look for fetch errors or CORS issues

---

### Category List Not Rendering

**Problem:** CategoryList shows empty or categories don't appear

**Causes:**
- Missing organizationId prop
- Mock data not loading
- Component render issue

**Solutions:**

1. **Verify organizationId is passed:**
```tsx
<CategoryManager organizationId={user.organizationId} />
```

2. **Check React DevTools:**
- Inspect component props
- Verify categories array has data

3. **Check console for errors:**
```bash
# Look for React errors
# Check for missing dependencies
```

---

### Modal Won't Open/Close

**Problem:** AddExpenseModal or AddCategoryModal stuck open or won't open

**Causes:**
- State management issue
- Event handler not called
- Dialog component issue

**Solutions:**

1. **Verify state management:**
```tsx
const [modalOpen, setModalOpen] = useState(false);

// Open
<Button onClick={() => setModalOpen(true)}>Add</Button>

// Close
<AddExpenseModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
/>
```

2. **Check event propagation:**
```tsx
// Ensure stopPropagation if nested clicks
onClick={(e) => {
  e.stopPropagation();
  setModalOpen(true);
}}
```

3. **Reset state on success:**
```tsx
onSuccess={() => {
  setModalOpen(false);
  refetch(); // Reload data
}}
```

---

### Charts Not Displaying

**Problem:** Recharts components not rendering or showing blank

**Causes:**
- Missing data
- Container size issue
- Recharts not loaded

**Solutions:**

1. **Verify data structure:**
```typescript
// Recharts requires specific format
const data = [
  { month: 'Jan', amount: 1000 },
  { month: 'Feb', amount: 1500 },
];

console.log('Chart data:', data);
```

2. **Ensure container has dimensions:**
```tsx
<div className="h-80 w-full"> {/* Must have height */}
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

3. **Check for Recharts import errors:**
```bash
npm install recharts
```

---

### Drag & Drop Not Working

**Problem:** Category reordering doesn't work

**Causes:**
- @dnd-kit not installed
- DndContext not wrapping items
- Touch events disabled

**Solutions:**

1. **Verify @dnd-kit installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

2. **Check DndContext wrapper:**
```tsx
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={categories}>
    {/* Sortable items */}
  </SortableContext>
</DndContext>
```

3. **Enable touch events:**
```typescript
// Add touch sensor
import { TouchSensor, useSensor } from '@dnd-kit/core';

const sensors = [
  useSensor(TouchSensor),
  // ... other sensors
];

<DndContext sensors={sensors}>
```

---

## Data & State Issues

### Data Not Refreshing

**Problem:** Component doesn't update after mutation

**Causes:**
- Query cache not invalidated
- Optimistic update issue
- Component not subscribed to query

**Solutions:**

1. **Invalidate queries after mutation:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const handleSubmit = async (data) => {
  await createExpense(data);

  // Invalidate queries to refetch
  queryClient.invalidateQueries({ queryKey: ['expenses'] });
  queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
};
```

2. **Use mutation hooks:**
```typescript
const mutation = useMutation({
  mutationFn: createExpense,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  },
});
```

3. **Force refetch:**
```typescript
const { data, refetch } = useQuery({
  queryKey: ['expenses'],
  queryFn: fetchExpenses,
});

// Manually trigger
await refetch();
```

---

### Wrong Organization Data

**Problem:** Seeing expenses from other organizations

**Causes:**
- Missing organizationId filter
- RLS not enabled (future)
- Session user wrong org

**Solutions:**

1. **Always filter by organizationId:**
```typescript
// ✅ Correct
const expenses = await prisma.expense.findMany({
  where: { organizationId: user.organizationId }
});

// ❌ Wrong
const expenses = await prisma.expense.findMany();
```

2. **Verify session user:**
```typescript
const session = await requireAuth();
console.log('User org:', session.user.organizationId);
```

3. **Check RLS policies (when using database):**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'expenses';
```

---

### Mock Data Not Appearing

**Problem:** Components show empty state with mock data

**Causes:**
- Mock data not imported
- Wrong data structure
- Component expecting API call

**Solutions:**

1. **Verify mock data is defined:**
```typescript
// Check component has inline mock data
const mockExpenses = [
  { id: 'exp-1', merchant: 'Test', amount: 100 },
  // ...
];
```

2. **Check mock data structure matches:**
```typescript
// Ensure fields match expected interface
interface Expense {
  id: string;
  merchant: string;
  amount: number;
  // ... all required fields
}
```

3. **Add console.log for debugging:**
```typescript
console.log('Mock expenses:', mockExpenses);
console.log('Length:', mockExpenses.length);
```

---

## Form & Validation Issues

### Form Validation Not Working

**Problem:** Form submits without validation or errors don't show

**Causes:**
- Zod schema not applied
- Form not using resolver
- Error display missing

**Solutions:**

1. **Verify Zod resolver:**
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(expenseFormSchema), // Must include
  defaultValues: { /* ... */ },
});
```

2. **Display validation errors:**
```tsx
{form.formState.errors.merchant && (
  <p className="text-sm text-red-600">
    {form.formState.errors.merchant.message}
  </p>
)}
```

3. **Check Zod schema:**
```typescript
const expenseFormSchema = z.object({
  merchant: z.string().min(1, 'Merchant is required'),
  amount: z.string().min(1, 'Amount is required'),
  // ...
});
```

---

### File Upload Fails

**Problem:** Receipt upload doesn't work or file rejected

**Causes:**
- Wrong file type
- File too large
- FormData not constructed correctly

**Solutions:**

1. **Verify file type:**
```typescript
const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];

if (!validTypes.includes(file.type)) {
  toast.error('Invalid file type. Use JPEG, PNG, or PDF.');
  return;
}
```

2. **Check file size:**
```typescript
const maxSize = 5 * 1024 * 1024; // 5MB

if (file.size > maxSize) {
  toast.error('File too large. Maximum 5MB.');
  return;
}
```

3. **Construct FormData correctly:**
```typescript
const formData = new FormData();
formData.append('expenseId', expenseId);
formData.append('file', file);

await uploadReceipt(formData);
```

---

### Amount Validation Issues

**Problem:** Negative amounts or zero accepted

**Causes:**
- Missing validation
- Wrong input type
- Zod schema allows it

**Solutions:**

1. **Add manual validation:**
```typescript
const onSubmit = async (data) => {
  const amount = parseFloat(data.amount);

  if (amount <= 0) {
    toast.error('Amount must be greater than zero');
    return;
  }

  // Continue...
};
```

2. **Update Zod schema:**
```typescript
const expenseFormSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => parseFloat(val) > 0, 'Amount must be positive'),
});
```

3. **Use number input with min:**
```tsx
<Input
  type="number"
  step="0.01"
  min="0.01"
  {...form.register('amount')}
/>
```

---

## Performance Issues

### Slow Table Rendering

**Problem:** ExpenseTable takes long to render with many rows

**Causes:**
- Too many rows rendering at once
- Missing virtualization
- Heavy re-renders

**Solutions:**

1. **Add pagination:**
```typescript
const [page, setPage] = useState(1);
const limit = 50;

const paginatedExpenses = expenses.slice(
  (page - 1) * limit,
  page * limit
);
```

2. **Implement virtualization (planned):**
```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: expenses.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

3. **Optimize re-renders:**
```typescript
// Use React.memo for row components
const ExpenseTableRow = React.memo(({ expense }) => {
  // ...
});
```

---

### Charts Laggy

**Problem:** Recharts animations choppy or slow

**Causes:**
- Too much data
- Heavy animations
- Re-rendering entire chart

**Solutions:**

1. **Limit data points:**
```typescript
// Show only last 12 months
const chartData = data.slice(-12);
```

2. **Disable animations for large datasets:**
```tsx
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="amount"
    isAnimationActive={data.length < 50} // Disable if too many
  />
</LineChart>
```

3. **Use React.memo:**
```typescript
export const SpendingTrends = React.memo(({ data }) => {
  // Chart component
});
```

---

### Modal Slow to Open

**Problem:** AddExpenseModal takes time to appear

**Causes:**
- Heavy form initialization
- Large component size
- Dialog animation lag

**Solutions:**

1. **Lazy load modal:**
```typescript
const AddExpenseModal = React.lazy(() =>
  import('./AddExpenseModal')
);

<Suspense fallback={<div>Loading...</div>}>
  {modalOpen && <AddExpenseModal />}
</Suspense>
```

2. **Reduce animation duration:**
```tsx
// In Dialog component
<Dialog
  open={open}
  onOpenChange={onClose}
  className="animate-in fade-in-0 duration-200" // Faster
>
```

3. **Optimize form defaults:**
```typescript
// Move defaults outside component
const defaultValues = {
  date: new Date().toISOString().split('T')[0],
  isDeductible: true,
};

const form = useForm({ defaultValues });
```

---

## Build & Deploy Issues

### Build Fails - File Size Limit

**Problem:** ESLint blocks build due to file size

```bash
Error: File exceeds 500 line limit
```

**Solutions:**

1. **Split large files:**
```typescript
// Before: 600 lines in one file
ExpenseTable.tsx

// After: Split into smaller files
ExpenseTable.tsx (300 lines)
ExpenseTableRow.tsx (150 lines)
ExpenseTableHeader.tsx (100 lines)
```

2. **Extract constants:**
```typescript
// Move mock data to separate file
// mockExpenses.ts
export const mockExpenses = [ /* ... */ ];

// Component.tsx
import { mockExpenses } from './mockExpenses';
```

3. **Check current file sizes:**
```bash
find components/real-estate/expense-tax -name "*.tsx" -exec wc -l {} + | sort -rn
```

---

### TypeScript Errors

**Problem:** Build fails with TypeScript errors

**Solutions:**

1. **Check for `any` types:**
```bash
npm run lint | grep "no-explicit-any"
```

2. **Fix type issues:**
```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
interface ExpenseData {
  id: string;
  amount: number;
}
const data: ExpenseData = fetchData();
```

3. **Run type check:**
```bash
npx tsc --noEmit
```

---

### Environment Variables Missing

**Problem:** App crashes due to missing env vars

**Solutions:**

1. **Create .env.local:**
```bash
cp .env.example .env.local
```

2. **Add required variables:**
```bash
# .env.local
NEXT_PUBLIC_USE_MOCKS=true
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

3. **Restart dev server:**
```bash
npm run dev
```

---

## Testing Issues

### Tests Timeout

**Problem:** Tests hang and eventually timeout

**Solutions:**

1. **Increase timeout:**
```typescript
jest.setTimeout(10000); // 10 seconds
```

2. **Mock slow operations:**
```typescript
// Mock fetch with immediate response
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => mockData,
});
```

3. **Use fake timers:**
```typescript
jest.useFakeTimers();
// ... test
jest.runAllTimers();
jest.useRealTimers();
```

---

### Tests Fail - Query Client

**Problem:** Tests fail with Query Client errors

```bash
Error: No QueryClient set
```

**Solutions:**

1. **Wrap in QueryClientProvider:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

render(
  <QueryClientProvider client={queryClient}>
    <Component />
  </QueryClientProvider>
);
```

2. **Create fresh client per test:**
```typescript
beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
});
```

---

### Mock Not Working

**Problem:** Mock data not used in tests

**Solutions:**

1. **Clear mocks between tests:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

2. **Verify mock is called:**
```typescript
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArg);
```

3. **Reset mock implementation:**
```typescript
mockFunction.mockReset();
mockFunction.mockImplementation(() => newValue);
```

---

## Getting Help

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API calls
3. **Use React DevTools** to inspect component state
4. **Add console.logs** to trace execution
5. **Check session logs** for detailed implementation notes

### Resources

- **Documentation:** `/docs/modules/expense-tax/`
- **Session History:** `/update-sessions/dashboard-&-module-integrations/expenses-&-taxes-module/`
- **Component Guide:** `./COMPONENTS.md`
- **API Reference:** `./API.md`
- **Testing Guide:** `./TESTING.md`

### Report Issues

If issue persists:

1. **Gather information:**
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/environment details

2. **Check existing issues:**
   - Review session summaries
   - Check known limitations

3. **Create detailed report:**
   - Include code snippets
   - Provide screenshots
   - List debugging steps tried

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** ✅ Complete
