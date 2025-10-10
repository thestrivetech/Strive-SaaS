'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { createLead, updateLead, type CreateLeadInput } from './actions';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { leads } from '@prisma/client';

interface LeadFormDialogProps {
  mode?: 'create' | 'edit';
  lead?: leads;
  organizationId: string;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function LeadFormDialog({
  mode = 'create',
  lead,
  organizationId,
  trigger,
  onOpenChange,
}: LeadFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    defaultValues: lead
      ? {
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company || '',
          source: lead.source,
          status: lead.status,
          score: lead.score,
          score_value: lead.score_value,
          notes: lead.notes || '',
          tags: lead.tags || [],
          organization_id: organizationId,
        }
      : {
          name: '',
          email: '',
          phone: '',
          company: '',
          source: 'WEBSITE',
          status: 'NEW_LEAD',
          score: 'COLD',
          score_value: 0,
          notes: '',
          tags: [],
          organization_id: organizationId,
        },
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createLead(data);
        toast({
          title: 'Lead created',
          description: 'The lead has been created successfully.',
        });
      } else if (lead) {
        await updateLead({ ...data, id: lead.id });
        toast({
          title: 'Lead updated',
          description: 'The lead has been updated successfully.',
        });
      }
      handleClose();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    onOpenChange?.(false);
    if (mode === 'create') {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); onOpenChange?.(newOpen); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Lead' : 'Edit Lead'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new lead to your CRM' : 'Update lead information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input placeholder="Acme Inc" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="555-1234" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                        <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                        <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                        <SelectItem value="EMAIL_CAMPAIGN">Email Campaign</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="PARTNER">Partner</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="NEW_LEAD">New Lead</SelectItem>
                        <SelectItem value="IN_CONTACT">In Contact</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select score" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HOT">🔥 Hot</SelectItem>
                        <SelectItem value="WARM">🌡️ Warm</SelectItem>
                        <SelectItem value="COLD">❄️ Cold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Lead'
                  : 'Update Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
