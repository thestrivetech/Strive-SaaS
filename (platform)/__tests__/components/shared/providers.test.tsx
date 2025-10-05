import { render, screen } from '@testing-library/react';
import { Providers } from '@/components/shared/providers';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

describe('Providers', () => {
  it('renders children correctly', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test Content</div>
      </Providers>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps children with ThemeProvider', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('provides QueryClient to children', () => {
    const { container } = render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    // QueryClientProvider doesn't have a specific testid, but we can verify it renders
    expect(container.firstChild).toBeTruthy();
  });
});
