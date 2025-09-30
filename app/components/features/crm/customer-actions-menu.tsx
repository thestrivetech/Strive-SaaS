'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Edit, Mail, History, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditCustomerDialog } from './edit-customer-dialog';
import { DeleteCustomerDialog } from './delete-customer-dialog';
import type { Customer } from '@prisma/client';
import { useState } from 'react';

interface CustomerActionsMenuProps {
  customer: Customer;
}

export function CustomerActionsMenu({ customer }: CustomerActionsMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/crm/${customer.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit customer
          </DropdownMenuItem>
          {customer.email && (
            <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Send email
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(`/crm/${customer.id}#history`)}>
            <History className="mr-2 h-4 w-4" />
            View history
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCustomerDialog
        customer={customer}
        asChild
      >
        <div style={{ display: editOpen ? 'block' : 'none' }} />
      </EditCustomerDialog>

      <DeleteCustomerDialog
        customerId={customer.id}
        customerName={customer.name}
      >
        <div style={{ display: deleteOpen ? 'block' : 'none' }} />
      </DeleteCustomerDialog>
    </>
  );
}