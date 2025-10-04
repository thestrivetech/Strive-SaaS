import { useState } from "react";
import { Search, FileText, MoreHorizontal, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  property?: string;
  hasReceipt: boolean;
}

const categoryColors: Record<string, string> = {
  Commission: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Travel: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Marketing: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Office: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Utilities: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-expenses"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Commission">Commission</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense, index) => (
              <TableRow key={expense.id} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                <TableCell className="font-mono text-sm">
                  {expense.date}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {expense.merchant}
                    {expense.hasReceipt && (
                      <FileText className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={categoryColors[expense.category] || ""}
                  >
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.property || "—"}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  ${expense.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-actions-${expense.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Receipt</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
