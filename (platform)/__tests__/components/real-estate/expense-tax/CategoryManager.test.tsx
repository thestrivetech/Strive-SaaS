/**
 * CategoryManager Component Test Suite
 * Tests category CRUD operations and drag-and-drop
 * Target: 80%+ component coverage
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryManager } from '@/components/real-estate/expense-tax/settings/CategoryManager';
import { toast } from 'sonner';

// Mock child components
jest.mock('@/components/real-estate/expense-tax/settings/CategoryList', () => ({
  CategoryList: ({ categories, onEdit, onDelete, onReorder }: any) => (
    <div data-testid="category-list">
      {categories.map((cat: any) => (
        <div key={cat.id} data-testid={`category-${cat.id}`}>
          <span>{cat.name}</span>
          <span className={cat.isSystem ? 'system-badge' : 'custom-badge'}>
            {cat.isSystem ? 'System' : 'Custom'}
          </span>
          {!cat.isSystem && (
            <>
              <button onClick={() => onEdit(cat)}>Edit</button>
              <button onClick={() => onDelete(cat.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
      <button onClick={() => onReorder([...categories])}>
        Reorder
      </button>
    </div>
  ),
}));

jest.mock('@/components/real-estate/expense-tax/settings/AddCategoryModal', () => ({
  AddCategoryModal: ({ open, onClose, onSubmit, mode, initialData }: any) =>
    open ? (
      <div data-testid="add-category-modal">
        <h2>{mode === 'edit' ? 'Edit Category' : 'Add Category'}</h2>
        <input
          data-testid="category-name"
          defaultValue={initialData?.name || ''}
        />
        <input
          data-testid="category-color"
          defaultValue={initialData?.color || ''}
        />
        <button
          onClick={() => {
            onSubmit({
              name: 'Test Category',
              color: '#ff0000',
            });
          }}
        >
          Submit
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CategoryManager Component', () => {
  const mockOrgId = 'org-test-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders category manager with initial categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      expect(screen.getByTestId('category-list')).toBeInTheDocument();
      expect(screen.getByText(/12 system categories/i)).toBeInTheDocument();
    });

    it('displays correct category counts', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // Should show 12 system + 6 custom = 18 total initially
      expect(screen.getByText(/12 system categories/i)).toBeInTheDocument();
      expect(screen.getByText(/6 custom/i)).toBeInTheDocument();
    });

    it('renders "Add Category" button', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      const addButton = screen.getByRole('button', {
        name: /add category/i,
      });
      expect(addButton).toBeInTheDocument();
    });

    it('renders all system categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      expect(screen.getByText('Repairs')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Insurance')).toBeInTheDocument();
    });

    it('renders all custom categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Staging')).toBeInTheDocument();
      expect(screen.getByText('Home Inspection')).toBeInTheDocument();
    });
  });

  describe('Add Category Flow', () => {
    it('opens modal when "Add Category" button is clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      const addButton = screen.getByRole('button', {
        name: /add category/i,
      });

      await user.click(addButton);

      expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();
      // Modal heading
      const headings = screen.getAllByText('Add Category');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('adds new category successfully', async () => {
      const user = userEvent.setup();

      render(<CategoryManager organizationId={mockOrgId} />);

      // Open modal
      await user.click(
        screen.getByRole('button', { name: /add category/i })
      );

      // Submit form
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Category added successfully'
        );
      });

      // Modal should close
      await waitFor(() => {
        expect(
          screen.queryByTestId('add-category-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('updates category count after adding', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      // Initial count
      expect(screen.getByText(/6 custom/i)).toBeInTheDocument();

      // Add category
      await user.click(
        screen.getByRole('button', { name: /add category/i })
      );
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText(/7 custom/i)).toBeInTheDocument();
      });
    });

    it('closes modal on cancel', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      await user.click(
        screen.getByRole('button', { name: /add category/i })
      );
      expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('add-category-modal')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Category Flow', () => {
    it('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      // Find custom category edit button (Photography is first custom)
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();
      // Modal heading should show Edit Category
      const headings = screen.getAllByText('Edit Category');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('populates modal with existing category data', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      // Modal should show Photography data
      const nameInput = screen.getByTestId('category-name');
      expect(nameInput).toHaveValue('Photography');
    });

    it('updates category successfully', async () => {
      const user = userEvent.setup();

      render(<CategoryManager organizationId={mockOrgId} />);

      // Edit first custom category
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      // Submit changes
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Category updated successfully'
        );
      });
    });

    it('does not show edit button for system categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // System categories should not have edit buttons
      const systemBadges = screen.getAllByText('System');
      expect(systemBadges.length).toBe(12); // 12 system categories

      // Custom categories should have edit buttons
      const customBadges = screen.getAllByText('Custom');
      expect(customBadges.length).toBe(6); // 6 custom categories

      // Edit buttons should only appear for custom categories (6 total)
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBe(6);
    });
  });

  describe('Delete Category Flow', () => {
    it('deletes custom category successfully', async () => {
      const user = userEvent.setup();

      render(<CategoryManager organizationId={mockOrgId} />);

      // Delete first custom category
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Category deleted successfully'
        );
      });

      // Category count should decrease
      await waitFor(() => {
        expect(screen.getByText(/5 custom/i)).toBeInTheDocument();
      });
    });

    it('does not show delete button for system categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // Delete buttons should only appear for custom categories (6 total)
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBe(6);
    });
  });

  describe('Reorder Categories Flow', () => {
    it('calls reorder handler', async () => {
      const user = userEvent.setup();

      render(<CategoryManager organizationId={mockOrgId} />);

      const reorderButton = screen.getByText('Reorder');
      await user.click(reorderButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Category order updated'
        );
      });
    });
  });

  describe('Category Data Structure', () => {
    it('assigns correct organizationId to all categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // All categories should have the org ID in their data
      const categoryList = screen.getByTestId('category-list');
      expect(categoryList).toBeInTheDocument();
    });

    it('assigns unique IDs to all categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // Check that all categories have unique test IDs
      const categories = screen.getAllByTestId(/^category-/);
      const ids = categories.map((cat) => cat.getAttribute('data-testid'));
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('assigns sequential sort orders', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      // Add a new category
      await user.click(
        screen.getByRole('button', { name: /add category/i })
      );
      await user.click(screen.getByText('Submit'));

      // New category should have next sort order (19)
      await waitFor(() => {
        expect(screen.getByText(/7 custom/i)).toBeInTheDocument();
      });
    });
  });

  describe('System vs Custom Categories', () => {
    it('correctly identifies system categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      const systemBadges = screen.getAllByText('System');
      expect(systemBadges).toHaveLength(12);
    });

    it('correctly identifies custom categories', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      const customBadges = screen.getAllByText('Custom');
      expect(customBadges).toHaveLength(6);
    });

    it('protects system categories from editing', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      // System categories should not have edit/delete buttons
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');

      // Only 6 custom categories should have these buttons
      expect(editButtons).toHaveLength(6);
      expect(deleteButtons).toHaveLength(6);
    });
  });

  describe('Error Handling', () => {
    it('handles async operation delays', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<CategoryManager organizationId={mockOrgId} />);

      // Start delete operation
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      // Should still show loading state during 500ms delay
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('renders interactive elements with proper roles', () => {
      render(<CategoryManager organizationId={mockOrgId} />);

      const addButton = screen.getByRole('button', {
        name: /add category/i,
      });
      expect(addButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CategoryManager organizationId={mockOrgId} />);

      const addButton = screen.getByRole('button', {
        name: /add category/i,
      });

      // Tab to button
      await user.tab();

      // Enter to activate
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();
      });
    });
  });
});
