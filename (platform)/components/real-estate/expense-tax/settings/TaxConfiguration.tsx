'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// TODO: Replace with API call to /api/v1/expenses/tax-config
export interface TaxConfiguration {
  taxRate: number;
  taxYear: number;
  jurisdiction: string;
  deductionCategories: string[];
  organizationId: string;
}

/**
 * Form Schema
 */
const taxConfigFormSchema = z.object({
  taxRate: z.number().min(0).max(100),
  taxYear: z.number().min(2020).max(2030),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  deductionCategories: z.array(z.string()).min(1, 'Select at least one deduction category'),
});

type TaxConfigFormData = z.infer<typeof taxConfigFormSchema>;

interface TaxConfigurationProps {
  organizationId: string;
}

/**
 * TaxConfiguration Component
 *
 * Tax rate and code configuration with:
 * - Tax rate input (percentage)
 * - Tax year selector
 * - Tax jurisdiction dropdown
 * - Deduction categories checklist
 * - Mock tax config data
 * - Save button with loading state
 *
 * @param organizationId - Organization ID for data isolation
 */
export function TaxConfiguration({ organizationId }: TaxConfigurationProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Mock initial tax configuration
  const mockTaxConfig: TaxConfiguration = {
    taxRate: 25.5,
    taxYear: 2025,
    jurisdiction: 'US-CA',
    deductionCategories: ['cat-1', 'cat-2', 'cat-5', 'cat-6', 'cat-10'],
    organizationId,
  };

  const form = useForm<TaxConfigFormData>({
    resolver: zodResolver(taxConfigFormSchema),
    defaultValues: mockTaxConfig,
  });

  const handleSubmit = async (data: TaxConfigFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      console.log('Saving tax configuration:', { ...data, organizationId });

      toast.success('Tax configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save tax configuration');
      console.error('Tax config save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Mock deductible categories
  const deductibleCategories = [
    { id: 'cat-1', name: 'Repairs', description: 'Property repairs and maintenance' },
    { id: 'cat-2', name: 'Utilities', description: 'Water, electric, gas, internet' },
    { id: 'cat-3', name: 'Supplies', description: 'Office and operational supplies' },
    { id: 'cat-4', name: 'Marketing', description: 'Advertising and marketing expenses' },
    { id: 'cat-5', name: 'Insurance', description: 'Business and property insurance' },
    { id: 'cat-6', name: 'Legal', description: 'Legal and professional fees' },
    { id: 'cat-7', name: 'Travel', description: 'Business-related travel' },
    { id: 'cat-8', name: 'Office', description: 'Office rent and expenses' },
    { id: 'cat-9', name: 'Maintenance', description: 'Regular property maintenance' },
    { id: 'cat-10', name: 'Property Tax', description: 'Property tax payments' },
    { id: 'cat-11', name: 'HOA Fees', description: 'Homeowners association fees' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Tax Rate */}
        <div className="space-y-2">
          <Label htmlFor="taxRate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Rate (%)
          </Label>
          <Controller
            name="taxRate"
            control={form.control}
            render={({ field }) => (
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="25.5"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="dark:bg-gray-800 dark:text-white"
              />
            )}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Your estimated effective tax rate for business income
          </p>
          {form.formState.errors.taxRate && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.taxRate.message}
            </p>
          )}
        </div>

        {/* Tax Year */}
        <div className="space-y-2">
          <Label htmlFor="taxYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Year
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

        {/* Jurisdiction */}
        <div className="space-y-2">
          <Label htmlFor="jurisdiction" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Jurisdiction
          </Label>
          <Controller
            name="jurisdiction"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US-AL">Alabama</SelectItem>
                  <SelectItem value="US-CA">California</SelectItem>
                  <SelectItem value="US-FL">Florida</SelectItem>
                  <SelectItem value="US-NY">New York</SelectItem>
                  <SelectItem value="US-TX">Texas</SelectItem>
                  <SelectItem value="US-WA">Washington</SelectItem>
                  <SelectItem value="US-OTHER">Other US State</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Your primary business location for tax purposes
          </p>
          {form.formState.errors.jurisdiction && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.jurisdiction.message}
            </p>
          )}
        </div>

        {/* Deduction Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Deductible Categories
          </Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select which expense categories are tax deductible for your business
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Controller
              name="deductionCategories"
              control={form.control}
              render={({ field }) => (
                <>
                  {deductibleCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start space-x-3 p-3 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Checkbox
                        id={category.id}
                        checked={field.value.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...field.value, category.id]
                            : field.value.filter((id) => id !== category.id);
                          field.onChange(updated);
                        }}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={category.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {category.name}
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </div>

          {form.formState.errors.deductionCategories && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.deductionCategories.message}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Disclaimer:</strong> This tool provides estimates only. Consult with a qualified tax
            professional for accurate tax advice and filing requirements.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Tax Configuration'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
