'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseCategory } from './CategoryManager';

interface CategoryListProps {
  categories: ExpenseCategory[];
  onReorder: (categories: ExpenseCategory[]) => void;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (id: string) => void;
}

interface SortableCategoryItemProps {
  category: ExpenseCategory;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (id: string) => void;
}

/**
 * SortableCategoryItem Component
 * Individual category item with drag handle and actions
 */
function SortableCategoryItem({ category, onEdit, onDelete }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Color Indicator */}
      <div
        className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: category.color }}
      />

      {/* Category Name */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {category.name}
          </span>
          {category.isSystem && (
            <Shield className="h-3.5 w-3.5 text-blue-500" aria-label="System category" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!category.isSystem && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </>
        )}
        {category.isSystem && (
          <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            Protected
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CategoryList Component
 *
 * Drag-and-drop sortable list of expense categories with:
 * - @dnd-kit for smooth drag-and-drop
 * - Visual feedback during drag
 * - System category protection
 * - Edit/delete actions for custom categories
 *
 * @param categories - Array of expense categories
 * @param onReorder - Callback when categories are reordered
 * @param onEdit - Callback when edit button clicked
 * @param onDelete - Callback when delete button clicked
 */
export function CategoryList({
  categories,
  onReorder,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const reordered = arrayMove(categories, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
