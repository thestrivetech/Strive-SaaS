import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  label: string;
  value: string;
}

interface FiltersBarProps {
  filters: {
    name: string;
    placeholder: string;
    options: FilterOption[];
    value?: string;
  }[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (name: string, value: string) => void;
  onClearAll?: () => void;
}

export function FiltersBar({
  filters,
  activeFilters = {},
  onFilterChange,
  onClearAll,
}: FiltersBarProps) {
  const activeCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key]
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4" />
        Filters
      </div>
      {filters.map((filter) => (
        <Select
          key={filter.name}
          value={activeFilters[filter.name] || ""}
          onValueChange={(value) => onFilterChange?.(filter.name, value)}
        >
          <SelectTrigger
            className="w-[180px]"
            data-testid={`select-filter-${filter.name}`}
          >
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary">{activeCount} active</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
