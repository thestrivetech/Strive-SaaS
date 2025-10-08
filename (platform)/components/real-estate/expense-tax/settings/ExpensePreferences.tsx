'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// TODO: Replace with API call to /api/v1/expenses/preferences
export interface ExpensePreferences {
  defaultCategoryId: string;
  autoCategorizationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  receiptRetentionDays: number;
  currencyFormat: 'USD' | 'EUR' | 'GBP';
  taxYear: number;
  organizationId: string;
}

/**
 * Form Schema
 */
const preferencesFormSchema = z.object({
  defaultCategoryId: z.string().min(1, 'Default category is required'),
  autoCategorizationEnabled: z.boolean(),
  emailNotificationsEnabled: z.boolean(),
  receiptRetentionDays: z.number().min(30).max(3650),
  currencyFormat: z.enum(['USD', 'EUR', 'GBP']),
  taxYear: z.number().min(2020).max(2030),
});

type PreferencesFormData = z.infer<typeof preferencesFormSchema>;

interface ExpensePreferencesProps {
  organizationId: string;
}

/**
 * ExpensePreferences Component
 *
 * Module preferences and defaults with:
 * - Default category selector
 * - Receipt auto-categorization toggle
 * - Email notifications toggle
 * - Receipt retention period (days)
 * - Currency format selector
 * - Tax year selector
 * - Mock preferences data
 * - Save button with loading state
 *
 * @param organizationId - Organization ID for data isolation
 */
export function ExpensePreferences({ organizationId }: ExpensePreferencesProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Mock initial preferences data
  const mockPreferences: ExpensePreferences = {
    defaultCategoryId: 'cat-12', // "Other"
    autoCategorizationEnabled: true,
    emailNotificationsEnabled: false,
    receiptRetentionDays: 2555, // 7 years
    currencyFormat: 'USD',
    taxYear: 2025,
    organizationId,
  };

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: mockPreferences,
  });

  const handleSubmit = async (data: PreferencesFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      console.log('Saving preferences:', { ...data, organizationId });

      toast.success('Preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Preferences save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Mock categories for dropdown
  const mockCategories = [
    { id: 'cat-1', name: 'Repairs' },
    { id: 'cat-2', name: 'Utilities' },
    { id: 'cat-3', name: 'Supplies' },
    { id: 'cat-4', name: 'Marketing' },
    { id: 'cat-5', name: 'Insurance' },
    { id: 'cat-6', name: 'Legal' },
    { id: 'cat-7', name: 'Travel' },
    { id: 'cat-8', name: 'Office' },
    { id: 'cat-9', name: 'Maintenance' },
    { id: 'cat-10', name: 'Property Tax' },
    { id: 'cat-11', name: 'HOA Fees' },
    { id: 'cat-12', name: 'Other' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Default Category */}
        <div className="space-y-2">
          <Label htmlFor="defaultCategoryId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Expense Category
          </Label>
          <Controller
            name="defaultCategoryId"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select default category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.defaultCategoryId && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.defaultCategoryId.message}
            </p>
          )}
        </div>

        {/* Auto-Categorization Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-0.5">
            <Label htmlFor="autoCategorizationEnabled" className="text-sm font-medium cursor-pointer">
              Auto-Categorization
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically categorize expenses based on merchant name
            </p>
          </div>
          <Controller
            name="autoCategorizationEnabled"
            control={form.control}
            render={({ field }) => (
              <Switch
                id="autoCategorizationEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotificationsEnabled" className="text-sm font-medium cursor-pointer">
              Email Notifications
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive email notifications for new expenses
            </p>
          </div>
          <Controller
            name="emailNotificationsEnabled"
            control={form.control}
            render={({ field }) => (
              <Switch
                id="emailNotificationsEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Receipt Retention Period */}
        <div className="space-y-2">
          <Label htmlFor="receiptRetentionDays" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Receipt Retention Period
          </Label>
          <Controller
            name="receiptRetentionDays"
            control={form.control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="1095">3 years</SelectItem>
                  <SelectItem value="1825">5 years</SelectItem>
                  <SelectItem value="2555">7 years (recommended)</SelectItem>
                  <SelectItem value="3650">10 years</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            IRS recommends keeping tax records for at least 7 years
          </p>
          {form.formState.errors.receiptRetentionDays && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.receiptRetentionDays.message}
            </p>
          )}
        </div>

        {/* Currency Format */}
        <div className="space-y-2">
          <Label htmlFor="currencyFormat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency Format
          </Label>
          <Controller
            name="currencyFormat"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.currencyFormat && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.currencyFormat.message}
            </p>
          )}
        </div>

        {/* Tax Year */}
        <div className="space-y-2">
          <Label htmlFor="taxYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Tax Year
          </Label>
          <Controller
            name="taxYear"
            control={form.control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.taxYear && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.taxYear.message}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
