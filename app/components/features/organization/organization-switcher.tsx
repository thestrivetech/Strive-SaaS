'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Organization, OrganizationMember } from '@prisma/client';
import { CreateOrganizationDialog } from './create-organization-dialog';

interface OrganizationSwitcherProps {
  organizations: (OrganizationMember & { organization: Organization })[];
  currentOrgId: string;
}

export function OrganizationSwitcher({ organizations, currentOrgId }: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const currentOrg = organizations.find((org) => org.organizationId === currentOrgId);

  const handleOrgSwitch = (orgId: string) => {
    // In a real app, this would update the user's current organization context
    // For now, we'll just refresh the page with the new org in context
    // This would typically be handled by updating a cookie or session
    window.location.href = `?org=${orgId}`;
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <span className="truncate">
              {currentOrg?.organization.name || 'Select organization'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.organizationId}
              onClick={() => handleOrgSwitch(org.organizationId)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  currentOrgId === org.organizationId ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="truncate">{org.organization.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setShowCreateDialog(true);
            }}
            className="cursor-pointer"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        children={null}
        asChild={false}
      />
    </>
  );
}