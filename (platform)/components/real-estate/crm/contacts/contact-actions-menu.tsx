'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Trash2, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { deleteContact } from './actions';
import type { ContactWithAssignee } from './actions';

interface ContactActionsMenuProps {
  contact: ContactWithAssignee;
  onEdit?: () => void;
}

export function ContactActionsMenu({ contact, onEdit }: ContactActionsMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/crm/contacts/${contact.id}`);
    }
  };

  const handleLogCall = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to contact detail page with communication dialog open
    router.push(`/crm/contacts/${contact.id}?action=log-call`);
  };

  const handleSendEmail = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`;
    } else {
      toast({
        title: 'No email address',
        description: 'This contact does not have an email address.',
        variant: 'destructive',
      });
    }
  };

  const handleLogNote = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/crm/contacts/${contact.id}?action=log-note`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContact(contact.id);
      toast({
        title: 'Contact deleted',
        description: `${contact.name} has been deleted successfully.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete contact',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit as any}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogCall as any}>
            <Phone className="mr-2 h-4 w-4" />
            Log call
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendEmail as any} disabled={!contact.email}>
            <Mail className="mr-2 h-4 w-4" />
            Send email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogNote as any}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Add note
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contact.name}? This action cannot be undone.
              All associated activities will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
