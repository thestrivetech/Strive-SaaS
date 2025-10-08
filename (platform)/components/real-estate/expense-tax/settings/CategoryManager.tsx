'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryList } from './CategoryList';
import { AddCategoryModal } from './AddCategoryModal';
import { toast } from 'sonner';

// TODO: Replace with API call to /api/v1/expenses/categories
export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  sortOrder: number;
  organizationId: string;
}

interface CategoryManagerProps {
  organizationId: string;
}

/**
 * CategoryManager Component
 *
 * Complete category management with:
 * - Display list of expense categories (12 system + 6 custom)
 * - Add new custom category button
 * - Edit/delete custom categories (protect system categories)
 * - Drag-and-drop reordering
 * - Mock data with realistic categories
 *
 * @param organizationId - Organization ID for data isolation
 */
export function CategoryManager({ organizationId }: CategoryManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  // Mock data: 12 system + 6 custom categories
  const [categories, setCategories] = useState<ExpenseCategory[]>([
    // System categories (12)
    { id: 'cat-1', name: 'Repairs', color: '#ef4444', isSystem: true, sortOrder: 1, organizationId },
    { id: 'cat-2', name: 'Utilities', color: '#f59e0b', isSystem: true, sortOrder: 2, organizationId },
    { id: 'cat-3', name: 'Supplies', color: '#eab308', isSystem: true, sortOrder: 3, organizationId },
    { id: 'cat-4', name: 'Marketing', color: '#84cc16', isSystem: true, sortOrder: 4, organizationId },
    { id: 'cat-5', name: 'Insurance', color: '#22c55e', isSystem: true, sortOrder: 5, organizationId },
    { id: 'cat-6', name: 'Legal', color: '#14b8a6', isSystem: true, sortOrder: 6, organizationId },
    { id: 'cat-7', name: 'Travel', color: '#06b6d4', isSystem: true, sortOrder: 7, organizationId },
    { id: 'cat-8', name: 'Office', color: '#0ea5e9', isSystem: true, sortOrder: 8, organizationId },
    { id: 'cat-9', name: 'Maintenance', color: '#3b82f6', isSystem: true, sortOrder: 9, organizationId },
    { id: 'cat-10', name: 'Property Tax', color: '#6366f1', isSystem: true, sortOrder: 10, organizationId },
    { id: 'cat-11', name: 'HOA Fees', color: '#8b5cf6', isSystem: true, sortOrder: 11, organizationId },
    { id: 'cat-12', name: 'Other', color: '#a855f7', isSystem: true, sortOrder: 12, organizationId },

    // Custom categories (6)
    { id: 'cat-13', name: 'Photography', color: '#ec4899', isSystem: false, sortOrder: 13, organizationId },
    { id: 'cat-14', name: 'Staging', color: '#f43f5e', isSystem: false, sortOrder: 14, organizationId },
    { id: 'cat-15', name: 'Home Inspection', color: '#d946ef', isSystem: false, sortOrder: 15, organizationId },
    { id: 'cat-16', name: 'Closing Costs', color: '#c026d3', isSystem: false, sortOrder: 16, organizationId },
    { id: 'cat-17', name: 'Software Subscriptions', color: '#9333ea', isSystem: false, sortOrder: 17, organizationId },
    { id: 'cat-18', name: 'Training & Education', color: '#7c3aed', isSystem: false, sortOrder: 18, organizationId },
  ]);

  const handleAddCategory = async (data: { name: string; color: string }) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newCategory: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      color: data.color,
      isSystem: false,
      sortOrder: categories.length + 1,
      organizationId,
    };

    setCategories([...categories, newCategory]);
    setIsAddModalOpen(false);
    toast.success('Category added successfully');
  };

  const handleEditCategory = async (data: { name: string; color: string }) => {
    if (!editingCategory) return;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCategories(
      categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, name: data.name, color: data.color }
          : cat
      )
    );
    setEditingCategory(null);
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = async (id: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setCategories(categories.filter((cat) => cat.id !== id));
    toast.success('Category deleted successfully');
  };

  const handleReorder = async (reorderedCategories: ExpenseCategory[]) => {
    // Update sort order
    const updated = reorderedCategories.map((cat, index) => ({
      ...cat,
      sortOrder: index + 1,
    }));

    setCategories(updated);

    // Simulate API call to save new order
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('Category order updated');
  };

  const handleOpenEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categories.filter((c) => c.isSystem).length} system categories,{' '}
            {categories.filter((c) => !c.isSystem).length} custom
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category List with Drag & Drop */}
      <CategoryList
        categories={categories}
        onReorder={handleReorder}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCategory}
      />

      {/* Add/Edit Modal */}
      <AddCategoryModal
        open={isAddModalOpen || !!editingCategory}
        onClose={handleCloseModal}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        initialData={
          editingCategory
            ? { name: editingCategory.name, color: editingCategory.color }
            : undefined
        }
        mode={editingCategory ? 'edit' : 'add'}
      />
    </motion.div>
  );
}
