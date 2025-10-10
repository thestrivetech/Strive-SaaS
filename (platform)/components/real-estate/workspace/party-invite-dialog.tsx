'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { inviteParty, type CreatePartyInput } from '@/lib/modules/transactions/parties';
import { PartyRole } from '@prisma/client';

interface PartyInviteDialogProps {
  loopId: string;
  onSuccess?: () => void;
}

export function PartyInviteDialog({ loopId, onSuccess }: PartyInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      loopId,
      name: '',
      email: '',
      phone: '',
      role: 'BUYER' as PartyRole,
      permissions: ['view'] as ('view' | 'edit' | 'sign' | 'upload')[],
    },
  });

  async function onSubmit(data: CreatePartyInput) {
    try {
      setIsSubmitting(true);
      const result = await inviteParty(data);

      if (result.success) {
        toast({
          title: 'Party invited successfully',
          description: `An invitation email has been sent to ${data.email}`,
        });
        setOpen(false);
        form.reset();
        onSuccess?.();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to invite party',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Party
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Party to Transaction</DialogTitle>
          <DialogDescription>
            Add a buyer, seller, agent, or other party to this transaction loop.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Invitation will be sent to this email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Party Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUYER">Buyer</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                      <SelectItem value="BUYER_AGENT">Buyer&apos;s Agent</SelectItem>
                      <SelectItem value="LISTING_AGENT">Listing Agent</SelectItem>
                      <SelectItem value="LENDER">Lender</SelectItem>
                      <SelectItem value="TITLE_COMPANY">Title Company</SelectItem>
                      <SelectItem value="INSPECTOR">Inspector</SelectItem>
                      <SelectItem value="APPRAISER">Appraiser</SelectItem>
                      <SelectItem value="ATTORNEY">Attorney</SelectItem>
                      <SelectItem value="ESCROW_OFFICER">Escrow Officer</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>
                      Select what actions this party can perform
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                    {([
                      { id: 'view', label: 'View documents and progress' },
                      { id: 'edit', label: 'Edit transaction details' },
                      { id: 'sign', label: 'Sign documents' },
                      { id: 'upload', label: 'Upload documents' },
                    ] as const).map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, permission.id])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value) => value !== permission.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {permission.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
