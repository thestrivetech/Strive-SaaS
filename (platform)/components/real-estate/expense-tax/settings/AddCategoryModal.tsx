'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Form Schema
 */
const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: { name: string; color: string };
  mode: 'add' | 'edit';
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
];

/**
 * AddCategoryModal Component
 *
 * Modal form for adding/editing expense categories with:
 * - React Hook Form + Zod validation
 * - Color picker with preset colors
 * - Loading states during save
 * - Toast notifications for success/errors
 *
 * @param open - Modal open state
 * @param onClose - Close modal callback
 * @param onSubmit - Submit form callback
 * @param initialData - Initial data for edit mode
 * @param mode - Add or edit mode
 */
export function AddCategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: AddCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PRESET_COLORS[0]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || PRESET_COLORS[0],
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        color: initialData.color,
      });
      setSelectedColor(initialData.color);
    } else {
      form.reset({
        name: '',
        color: PRESET_COLORS[0],
      });
      setSelectedColor(PRESET_COLORS[0]);
    }
  }, [initialData, form]);

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    form.setValue('color', color);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add Category' : 'Edit Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Category Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Photography, Staging"
              {...form.register('name')}
              className="dark:bg-gray-800 dark:text-white"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">Category Color</Label>

            {/* Selected Color Preview */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {selectedColor}
              </span>
            </div>

            {/* Preset Colors Grid */}
            <div className="grid grid-cols-7 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-cyan-500 scale-110'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2">
              <Label htmlFor="color" className="text-sm text-gray-600 dark:text-gray-400">
                Custom:
              </Label>
              <Input
                id="color"
                type="text"
                placeholder="#000000"
                {...form.register('color')}
                onChange={(e) => {
                  form.register('color').onChange(e);
                  setSelectedColor(e.target.value);
                }}
                className="w-32 font-mono text-sm dark:bg-gray-800 dark:text-white"
              />
            </div>
            {form.formState.errors.color && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.color.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSubmitting
                ? mode === 'add'
                  ? 'Adding...'
                  : 'Updating...'
                : mode === 'add'
                ? 'Add Category'
                : 'Update Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
