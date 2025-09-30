'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomerStatus, CustomerSource } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') as CustomerStatus | null;
  const currentSource = searchParams.get('source') as CustomerSource | null;

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('source');
    router.push(`?${params.toString()}`);
  };

  const hasFilters = currentStatus || currentSource;
  const filterCount = [currentStatus, currentSource].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {filterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!currentStatus}
            onCheckedChange={() => updateFilter('status', null)}
          >
            All Statuses
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentStatus === CustomerStatus.LEAD}
            onCheckedChange={(checked) =>
              updateFilter('status', checked ? CustomerStatus.LEAD : null)
            }
          >
            Lead
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentStatus === CustomerStatus.PROSPECT}
            onCheckedChange={(checked) =>
              updateFilter('status', checked ? CustomerStatus.PROSPECT : null)
            }
          >
            Prospect
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentStatus === CustomerStatus.ACTIVE}
            onCheckedChange={(checked) =>
              updateFilter('status', checked ? CustomerStatus.ACTIVE : null)
            }
          >
            Active
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentStatus === CustomerStatus.CHURNED}
            onCheckedChange={(checked) =>
              updateFilter('status', checked ? CustomerStatus.CHURNED : null)
            }
          >
            Churned
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!currentSource}
            onCheckedChange={() => updateFilter('source', null)}
          >
            All Sources
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentSource === CustomerSource.WEBSITE}
            onCheckedChange={(checked) =>
              updateFilter('source', checked ? CustomerSource.WEBSITE : null)
            }
          >
            Website
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentSource === CustomerSource.REFERRAL}
            onCheckedChange={(checked) =>
              updateFilter('source', checked ? CustomerSource.REFERRAL : null)
            }
          >
            Referral
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentSource === CustomerSource.SOCIAL}
            onCheckedChange={(checked) =>
              updateFilter('source', checked ? CustomerSource.SOCIAL : null)
            }
          >
            Social Media
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentSource === CustomerSource.EMAIL}
            onCheckedChange={(checked) =>
              updateFilter('source', checked ? CustomerSource.EMAIL : null)
            }
          >
            Email
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={currentSource === CustomerSource.OTHER}
            onCheckedChange={(checked) =>
              updateFilter('source', checked ? CustomerSource.OTHER : null)
            }
          >
            Other
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}