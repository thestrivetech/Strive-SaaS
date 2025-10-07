'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { ArrowRight } from 'lucide-react';

const orgDetailsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
});

type OrgDetailsFormData = z.infer<typeof orgDetailsSchema>;

interface OrgDetailsFormProps {
  onNext: (data: OrgDetailsFormData) => void;
  initialData?: Partial<OrgDetailsFormData>;
}

export function OrgDetailsForm({ onNext, initialData }: OrgDetailsFormProps) {
  const form = useForm<OrgDetailsFormData>({
    resolver: zodResolver(orgDetailsSchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tell us about your organization
        </h2>
        <p className="text-muted-foreground mt-2">
          This information helps us customize your experience.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          {/* Organization Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormDescription>
                  The name of your company or team
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://acme.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your organization..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Maximum 500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="hover-elevate">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
