import { DataTable } from "../DataTable";
import { TierBadge } from "../TierBadge";
import { StatusBadge } from "../StatusBadge";

export default function DataTableExample() {
  const data = [
    { id: "1", name: "Acme Corp", tier: "ENTERPRISE", users: 150, status: "ACTIVE" },
    { id: "2", name: "Tech Startup", tier: "GROWTH", users: 25, status: "TRIALING" },
    { id: "3", name: "Small Biz", tier: "STARTER", users: 5, status: "ACTIVE" },
  ];

  const columns = [
    { header: "Organization", accessor: "name" as const },
    { 
      header: "Tier", 
      accessor: "tier" as const,
      cell: (value: any) => <TierBadge tier={value} />
    },
    { header: "Users", accessor: "users" as const },
    { 
      header: "Status", 
      accessor: "status" as const,
      cell: (value: any) => <StatusBadge status={value} />
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      actions={(row) => [
        { label: "View Details", onClick: () => console.log("View", row.id) },
        { label: "Edit", onClick: () => console.log("Edit", row.id) },
        { label: "Delete", onClick: () => console.log("Delete", row.id) },
      ]}
    />
  );
}
