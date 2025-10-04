'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateCustomer } from '@/lib/modules/crm/actions';
import { updateCustomerSchema, type UpdateCustomerInput } from '@/lib/modules/crm/schemas';
import { CustomerStatus, CustomerSource, type customers } from '@prisma/client';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface EditCustomerDialogProps {
  customer: customers;
  children?: React.ReactNode;
  asChild?: boolean;
}

export function EditCustomerDialog({ customer, children, asChild = false }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      status: customer.status,
      source: customer.source,
      tags: customer.tags || [],
    },
  });

  // Reset form when customer changes
  useEffect(() => {
    form.reset({
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      status: customer.status,
      source: customer.source,
      tags: customer.tags || [],
    });
  }, [customer, form]);

  async function onSubmit(data: UpdateCustomerInput) {
    setIsSubmitting(true);
    try {
      await updateCustomer(data);
      toast.success('Customer updated successfully!');
      setOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update customer';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const trigger = children || (
    <Button variant="outline" size="sm">
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild || !!children}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information for {customer.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CustomerStatus.LEAD}>Lead</SelectItem>
                        <SelectItem value={CustomerStatus.PROSPECT}>Prospect</SelectItem>
                        <SelectItem value={CustomerStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={CustomerStatus.CHURNED}>Churned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CustomerSource.WEBSITE}>Website</SelectItem>
                        <SelectItem value={CustomerSource.REFERRAL}>Referral</SelectItem>
                        <SelectItem value={CustomerSource.SOCIAL}>Social Media</SelectItem>
                        <SelectItem value={CustomerSource.EMAIL}>Email</SelectItem>
                        <SelectItem value={CustomerSource.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}