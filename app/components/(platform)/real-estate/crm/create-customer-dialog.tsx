'use client';

import { useState } from 'react';
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
} from '@/components/(shared)/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/(shared)/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/(shared)/ui/select';
import { Input } from '@/components/(shared)/ui/input';
import { Button } from '@/components/(shared)/ui/button';
import { createCustomer } from '@/lib/modules/crm/actions';
import { createCustomerSchema, type CreateCustomerInput } from '@/lib/modules/crm/schemas';
import { CustomerStatus, CustomerSource } from '@prisma/client';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCustomerDialogProps {
  organizationId: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

export function CreateCustomerDialog({ organizationId, children, asChild = false }: CreateCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: CustomerStatus.LEAD,
      source: CustomerSource.WEBSITE,
      tags: [],
      organizationId,
    },
  });

  async function onSubmit(data: CreateCustomerInput) {
    setIsSubmitting(true);
    try {
      await createCustomer(data);
      toast.success('Customer created successfully!');
      setOpen(false);
      form.reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: CustomerStatus.LEAD,
        source: CustomerSource.WEBSITE,
        tags: [],
        organizationId,
      });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create customer';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const trigger = children || (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Customer
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild || !!children}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record for your CRM.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                Create Customer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}