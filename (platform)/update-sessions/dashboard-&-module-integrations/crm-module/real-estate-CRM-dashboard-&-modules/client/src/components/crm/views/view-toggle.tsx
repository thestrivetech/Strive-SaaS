import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

export type ViewType = "grid" | "table";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className={view === "grid" ? "" : "no-default-active-elevate"}
        data-testid="button-view-grid"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Grid
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className={view === "table" ? "" : "no-default-active-elevate"}
        data-testid="button-view-table"
      >
        <Table className="h-4 w-4 mr-1" />
        Table
      </Button>
    </div>
  );
}
