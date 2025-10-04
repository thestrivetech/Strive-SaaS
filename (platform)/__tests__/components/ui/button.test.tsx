/**
 * Button Component Tests
 * Tests for shadcn/ui Button component
 *
 * Target: 80%+ coverage
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render as button element by default', () => {
      render(<Button>Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByText('Custom');
      expect(button).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(<Button ref={ref}>With Ref</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByText('Default');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByText('Delete');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('text-destructive-foreground');
    });

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByText('Outline');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-input');
      expect(button).toHaveClass('bg-background');
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
    });

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText('Ghost');
      expect(button).toHaveClass('hover:bg-accent');
      expect(button).toHaveClass('hover:text-accent-foreground');
    });

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByText('Link');
      expect(button).toHaveClass('text-primary');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByText('Default Size');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('should apply sm size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText('Small');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-3');
    });

    it('should apply lg size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText('Large');
      expect(button).toHaveClass('h-11');
      expect(button).toHaveClass('px-8');
    });

    it('should apply icon size styles', () => {
      render(<Button size="icon" aria-label="Icon button">×</Button>);
      const button = screen.getByLabelText('Icon button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-10');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('should not trigger onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByText('Disabled');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should show focus-visible styles on focus', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByText('Focusable');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-ring');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByText('Click Me');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked multiple times', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Multiple</Button>);

      const button = screen.getByText('Click Multiple');
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events (Enter)', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByText('Keyboard');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });

    it('should handle keyboard events (Space)', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByText('Keyboard');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('HTML Attributes', () => {
    it('should apply type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should apply aria-label attribute', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByLabelText('Close dialog');
      expect(button).toBeInTheDocument();
    });

    it('should apply data attributes', () => {
      render(<Button data-testid="custom-button">Test</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('should apply name attribute', () => {
      render(<Button name="submit-btn">Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });

    it('should apply form attribute', () => {
      render(<Button form="my-form">Submit Form</Button>);
      const button = screen.getByText('Submit Form');
      expect(button).toHaveAttribute('form', 'my-form');
    });
  });

  describe('Variant and Size Combinations', () => {
    it('should combine variant and size correctly', () => {
      render(
        <Button variant="destructive" size="lg">
          Large Destructive
        </Button>
      );

      const button = screen.getByText('Large Destructive');
      expect(button).toHaveClass('bg-destructive'); // variant
      expect(button).toHaveClass('h-11'); // size
      expect(button).toHaveClass('px-8'); // size
    });

    it('should handle outline + sm combination', () => {
      render(
        <Button variant="outline" size="sm">
          Small Outline
        </Button>
      );

      const button = screen.getByText('Small Outline');
      expect(button).toHaveClass('border'); // variant
      expect(button).toHaveClass('h-9'); // size
    });
  });

  describe('Loading State', () => {
    it('should render loading spinner when provided', () => {
      render(
        <Button disabled>
          <span className="spinner" aria-label="Loading" />
          Loading...
        </Button>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const Icon = () => <svg data-testid="icon">Icon</svg>;
      render(
        <Button>
          <Icon />
          With Icon
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should apply icon-specific classes', () => {
      render(<Button size="icon" aria-label="Icon only">+</Button>);
      const button = screen.getByLabelText('Icon only');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-10');
    });
  });

  describe('asChild Prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByText('Link Button');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });
  });
});
