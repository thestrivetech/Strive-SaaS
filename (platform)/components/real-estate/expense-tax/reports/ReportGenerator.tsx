'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, FileDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * Report Generator Form Component
 *
 * Form for creating expense reports with:
 * - Date range selection (start/end dates)
 * - Category multi-select dropdown
 * - Format selector (CSV, PDF - placeholder)
 * - Form validation with Zod
 * - React Hook Form integration
 *
 * @client-component - Uses form state and validation
 */

// Zod schema for report generation
const reportSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  categories: z.string({
    required_error: 'Please select at least one category',
  }),
  format: z.enum(['CSV', 'PDF'], {
    required_error: 'Please select a format',
  }),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ReportFormValues = z.infer<typeof reportSchema>;

const EXPENSE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'commission', label: 'Commissions' },
  { value: 'travel', label: 'Travel' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'office', label: 'Office' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'legal', label: 'Legal' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'software', label: 'Software' },
];

export function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      categories: 'all',
      format: 'CSV',
    },
  });

  const onSubmit = async (data: ReportFormValues) => {
    setIsGenerating(true);

    // Placeholder for report generation
    // In future: Call API endpoint /api/v1/expenses/reports/generate
    console.log('Generating report:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsGenerating(false);

    // Show success message
    alert(`Report generated successfully!\n\nDate Range: ${format(data.startDate, 'MMM dd, yyyy')} - ${format(data.endDate, 'MMM dd, yyyy')}\nCategories: ${data.categories}\nFormat: ${data.format}`);

    // Reset form
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories to include" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which expense categories to include in the report
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Format Selection */}
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Export Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CSV">CSV (Comma Separated Values)</SelectItem>
                  <SelectItem value="PDF">PDF (Portable Document Format)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the file format for your report
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
