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
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const flagSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean(),
  rolloutPercent: z.number().min(0).max(100),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
  category: z.string().max(50).optional(),
});

type FlagFormData = z.infer<typeof flagSchema>;

interface FeatureFlagFormProps {
  initialData?: Partial<FlagFormData>;
  onSuccess: () => void;
}

export function FeatureFlagForm({ initialData, onSuccess }: FeatureFlagFormProps) {
  const form = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isEnabled: initialData?.isEnabled || false,
      rolloutPercent: initialData?.rolloutPercent || 0,
      environment: initialData?.environment || 'PRODUCTION',
      category: initialData?.category || '',
    },
  });

  const onSubmit = async (data: FlagFormData) => {
    const endpoint = initialData
      ? '/api/v1/admin/feature-flags'
      : '/api/v1/admin/feature-flags';

    const response = await fetch(endpoint, {
      method: initialData ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Flag Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flag Name *</FormLabel>
              <FormControl>
                <Input placeholder="new-feature-rollout" {...field} />
              </FormControl>
              <FormDescription>
                Lowercase with hyphens or underscores only
              </FormDescription>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this flag controls..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Environment */}
        <FormField
          control={form.control}
          name="environment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DEVELOPMENT">Development</SelectItem>
                  <SelectItem value="STAGING">Staging</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rollout Percentage */}
        <FormField
          control={form.control}
          name="rolloutPercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rollout Percentage: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
              </FormControl>
              <FormDescription>
                Percentage of users who will see this feature
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button type="submit">
            {initialData ? 'Update Flag' : 'Create Flag'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
