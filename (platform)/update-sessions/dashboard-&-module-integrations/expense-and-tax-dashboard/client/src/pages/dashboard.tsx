import { DollarSign, Receipt, TrendingDown, Calendar } from "lucide-react";
import { SummaryCard } from "@/components/summary-card";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { ExpenseTable } from "@/components/expense-table";
import { CategoryChart } from "@/components/category-chart";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { TaxEstimateCard } from "@/components/tax-estimate-card";

const mockExpenses = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 450.00,
    category: "Marketing",
    merchant: "Facebook Ads",
    hasReceipt: true,
  },
  {
    id: "2",
    date: "2024-01-14",
    amount: 125.50,
    category: "Travel",
    merchant: "Shell Gas Station",
    property: "123 Oak Street",
    hasReceipt: true,
  },
  {
    id: "3",
    date: "2024-01-12",
    amount: 89.99,
    category: "Office",
    merchant: "Office Depot",
    hasReceipt: false,
  },
  {
    id: "4",
    date: "2024-01-10",
    amount: 2500.00,
    category: "Commission",
    merchant: "Broker Fee",
    property: "456 Maple Ave",
    hasReceipt: true,
  },
  {
    id: "5",
    date: "2024-01-08",
    amount: 175.00,
    category: "Utilities",
    merchant: "Phone Bill",
    hasReceipt: true,
  },
  {
    id: "6",
    date: "2024-01-07",
    amount: 325.00,
    category: "Marketing",
    merchant: "Print Shop",
    property: "789 Pine Rd",
    hasReceipt: true,
  },
  {
    id: "7",
    date: "2024-01-05",
    amount: 95.00,
    category: "Travel",
    merchant: "Airport Parking",
    hasReceipt: true,
  },
  {
    id: "8",
    date: "2024-01-03",
    amount: 1200.00,
    category: "Commission",
    merchant: "Transaction Fee",
    property: "321 Elm St",
    hasReceipt: true,
  },
];

const categoryData = [
  { category: "Commission", amount: 12500 },
  { category: "Travel", amount: 4200 },
  { category: "Marketing", amount: 8300 },
  { category: "Office", amount: 2100 },
  { category: "Utilities", amount: 1800 },
];

const timelineData = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4100 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 5200 },
  { month: "May", amount: 4500 },
  { month: "Jun", amount: 3900 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Expense Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your business expenses
          </p>
        </div>
        <AddExpenseDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Expenses YTD"
          value="$45,231"
          trend="+12.5% from last year"
          trendUp={false}
          icon={DollarSign}
        />
        <SummaryCard
          title="This Month"
          value="$3,842"
          trend="-8.3% from last month"
          trendUp={true}
          icon={Calendar}
        />
        <SummaryCard
          title="Tax Deductible"
          value="$38,450"
          trend="85% of total"
          trendUp={true}
          icon={TrendingDown}
        />
        <SummaryCard
          title="Total Receipts"
          value="247"
          trend="12 pending"
          icon={Receipt}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
          <ExpenseTable expenses={mockExpenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart data={categoryData} />
          <CashFlowChart data={timelineData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-full flex items-center justify-center border rounded-lg p-8 text-center">
              <div>
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Receipt Gallery</h3>
                <p className="text-sm text-muted-foreground">
                  Your uploaded receipts will appear here
                </p>
              </div>
            </div>
          </div>
          <TaxEstimateCard
            totalExpenses={45231}
            deductibleExpenses={38450}
            taxRate={0.25}
          />
        </div>
      </div>
    </div>
  );
}
