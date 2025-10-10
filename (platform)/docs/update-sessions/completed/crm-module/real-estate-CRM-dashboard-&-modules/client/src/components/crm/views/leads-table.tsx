import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PhaseBadge } from "@/components/crm/shared/phase-badge";
import { Lead } from "@/lib/types/real-estate/crm";
import { format } from "date-fns";
import { MoreHorizontal, Phone, Mail, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface LeadsTableProps {
  leads: Lead[];
  onPhaseChange?: (id: string, phase: Lead["phase"]) => void;
  onAction?: (id: string, action: string) => void;
}

type SortField = "name" | "phase" | "agentName" | "lastContact" | "value";
type SortDirection = "asc" | "desc";

export function LeadsTable({ leads, onPhaseChange, onAction }: LeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>("lastContact");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "lastContact") {
      aValue = a.lastContact ? new Date(a.lastContact).getTime() : 0;
      bValue = b.lastContact ? new Date(b.lastContact).getTime() : 0;
    } else if (sortField === "value") {
      aValue = parseFloat(a.value?.replace(/[$,]/g, "") || "0");
      bValue = parseFloat(b.value?.replace(/[$,]/g, "") || "0");
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <div className="rounded-md border" data-testid="table-leads">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <SortButton field="name" label="Name" />
            </TableHead>
            <TableHead>
              <SortButton field="phase" label="Status" />
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>
              <SortButton field="agentName" label="Assigned Agent" />
            </TableHead>
            <TableHead>
              <SortButton field="lastContact" label="Last Contact" />
            </TableHead>
            <TableHead>Next Reminder</TableHead>
            <TableHead className="text-right">
              <SortButton field="value" label="Value" />
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead) => {
            const initials = lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PhaseBadge status={lead.phase} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {lead.isClient ? "Client" : "Lead"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {lead.agentName || "Unassigned"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(lead.lastContact, "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  {lead.nextReminder && (
                    <span className="text-sm text-muted-foreground">
                      {format(lead.nextReminder, "MMM d, yyyy")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {lead.value && (
                    <span className="font-mono text-sm">{lead.value}</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        data-testid={`button-actions-${lead.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction?.(lead.id, "call")}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction?.(lead.id, "email")}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction?.(lead.id, "edit")}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction?.(lead.id, "delete")}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
