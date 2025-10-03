'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/(shared)/ui/alert-dialog';
import { Button } from '@/components/(shared)/ui/button';
import { deleteCustomer } from '@/lib/modules/crm/actions';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteCustomerDialogProps {
  customerId: string;
  customerName: string;
  children?: React.ReactNode;
  redirectPath?: string;
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
  children,
  redirectPath = '/crm',
}: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast.success(`${customerName} has been deleted.`);
      setOpen(false);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete customer';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const trigger = children || (
    <Button variant="outline" size="sm" className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{customerName}</span> and all associated data.
            This action cannot be undone.
            <br />
            <br />
            <span className="text-destructive font-medium">
              All projects, appointments, and activity logs related to this customer will also be deleted.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Customer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}