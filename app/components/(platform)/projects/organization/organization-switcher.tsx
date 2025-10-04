'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, PlusCircle, Loader2 } from 'lucide-react';
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
import { setCurrentOrganization } from '@/lib/modules/organization/context';
import { toast } from 'sonner';

interface OrganizationSwitcherProps {
  organizations: (OrganizationMember & { organization: Organization })[];
  currentOrgId: string;
  userId: string;
}

export function OrganizationSwitcher({ organizations, currentOrgId, userId }: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const router = useRouter();

  const currentOrg = organizations.find((org) => org.organizationId === currentOrgId);

  const handleOrgSwitch = async (orgId: string) => {
    if (orgId === currentOrgId) {
      setOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await setCurrentOrganization(orgId, userId);
      setOpen(false);
      toast.success('Organization switched successfully');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch organization';
      toast.error(message);
    } finally {
      setIsSwitching(false);
    }
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
            {isSwitching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span className="truncate">
                  {currentOrg?.organization.name || 'Select organization'}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
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