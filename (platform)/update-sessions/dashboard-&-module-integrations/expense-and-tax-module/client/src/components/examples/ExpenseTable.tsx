import { ExpenseTable } from '../expense-table';

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
];

export default function ExpenseTableExample() {
  return (
    <div className="p-8 bg-background">
      <ExpenseTable expenses={mockExpenses} />
    </div>
  );
}
