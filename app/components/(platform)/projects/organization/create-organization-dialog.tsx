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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createOrganization } from '@/lib/modules/organization/actions';
import { createOrganizationSchema, type CreateOrganizationInput } from '@/lib/modules/organization/schemas';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateOrganizationDialogProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

export function CreateOrganizationDialog({ children, asChild = false }: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      billingEmail: '',
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!form.formState.dirtyFields.slug) {
      form.setValue('slug', generateSlug(value));
    }
  };

  async function onSubmit(data: CreateOrganizationInput) {
    setIsSubmitting(true);
    try {
      const org = await createOrganization(data);
      toast.success('Organization created successfully!');
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create organization';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const trigger = children || (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create Organization
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild || !!children}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your organization or company.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="acme-inc"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used in your organization's URL. Must be unique.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your organization..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="billing@acme.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Where should we send invoices and receipts?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Create Organization
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}