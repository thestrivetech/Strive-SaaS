'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/(shared)/ui/checkbox';
import { Button } from '@/components/(shared)/ui/button';
import { Badge } from '@/components/(shared)/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/(shared)/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface BulkSelectorProps<T extends { id: string }> {
  items: T[];
  actions: BulkAction[];
  onBulkAction: (actionId: string, selectedIds: string[]) => void | Promise<void>;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

export function BulkSelector<T extends { id: string }>({
  items,
  actions,
  onBulkAction,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  isLoading = false,
}: BulkSelectorProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());

  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled
    ? new Set(controlledSelectedIds)
    : internalSelectedIds;

  const setSelectedIds = (ids: Set<string>) => {
    if (isControlled) {
      onSelectionChange?.(Array.from(ids));
    } else {
      setInternalSelectedIds(ids);
    }
  };

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAction = async (actionId: string) => {
    await onBulkAction(actionId, Array.from(selectedIds));
    setSelectedIds(new Set()); // Clear selection after action
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={allSelected || (someSelected ? 'indeterminate' : false)}
        onCheckedChange={handleSelectAll}
        aria-label={allSelected ? 'Deselect all' : 'Select all'}
      />

      {selectedCount > 0 && (
        <>
          <Badge variant="secondary" className="font-normal">
            {selectedCount} selected
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Bulk Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {actions.map((action, index) => (
                <div key={action.id}>
                  {index > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleAction(action.id)}
                    disabled={action.disabled}
                    className={
                      action.variant === 'destructive' ? 'text-destructive' : ''
                    }
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

export function BulkSelectCheckbox({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (id: string) => void;
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={() => onCheckedChange(id)}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Select item ${id}`}
    />
  );
}