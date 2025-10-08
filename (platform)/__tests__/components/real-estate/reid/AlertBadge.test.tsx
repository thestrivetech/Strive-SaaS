/**
 * AlertBadge Component Test Suite
 * Tests for REID alert severity badge component
 */

import { render, screen } from '@testing-library/react';
import { AlertBadge } from '@/components/real-estate/reid/shared/AlertBadge';

describe('AlertBadge', () => {
  it('renders children text', () => {
    render(
      <AlertBadge severity="CRITICAL">
        Critical Alert
      </AlertBadge>
    );

    expect(screen.getByText('Critical Alert')).toBeInTheDocument();
  });

  it('applies correct styling for CRITICAL severity', () => {
    const { container } = render(
      <AlertBadge severity="CRITICAL">
        Critical Alert
      </AlertBadge>
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('reid-alert-critical');
  });

  it('applies correct styling for HIGH severity', () => {
    const { container } = render(
      <AlertBadge severity="HIGH">
        High Priority
      </AlertBadge>
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('reid-alert-high');
  });

  it('applies correct styling for MEDIUM severity', () => {
    const { container } = render(
      <AlertBadge severity="MEDIUM">
        Medium Priority
      </AlertBadge>
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('reid-alert-medium');
  });

  it('applies correct styling for LOW severity', () => {
    const { container } = render(
      <AlertBadge severity="LOW">
        Low Priority
      </AlertBadge>
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('reid-alert-low');
  });

  it('renders all severity levels correctly', () => {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

    severities.forEach(severity => {
      const { container } = render(
        <AlertBadge severity={severity}>Test</AlertBadge>
      );

      const expectedClass = `reid-alert-${severity.toLowerCase()}`;
      expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
    });
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <AlertBadge severity="CRITICAL" className="custom-badge-class">
        Test
      </AlertBadge>
    );

    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-badge-class');
    expect(badge).toHaveClass('reid-alert-critical');
  });

  it('renders with dark theme styling', () => {
    const { container } = render(
      <div className="reid-theme">
        <AlertBadge severity="CRITICAL">
          Dark Theme Alert
        </AlertBadge>
      </div>
    );

    expect(container.querySelector('.reid-theme')).toBeInTheDocument();
    expect(screen.getByText('Dark Theme Alert')).toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longText = 'This is a very long alert message that might need to wrap or truncate';

    render(
      <AlertBadge severity="HIGH">
        {longText}
      </AlertBadge>
    );

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('renders multiple badges with different severities', () => {
    const { container: container1 } = render(
      <AlertBadge severity="CRITICAL">Alert 1</AlertBadge>
    );
    const { container: container2 } = render(
      <AlertBadge severity="LOW">Alert 2</AlertBadge>
    );

    expect(container1.querySelector('.reid-alert-critical')).toBeInTheDocument();
    expect(container2.querySelector('.reid-alert-low')).toBeInTheDocument();
  });

  it('renders with icon content', () => {
    render(
      <AlertBadge severity="HIGH">
        <span className="icon">⚠️</span> Warning
      </AlertBadge>
    );

    expect(screen.getByText(/Warning/)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
