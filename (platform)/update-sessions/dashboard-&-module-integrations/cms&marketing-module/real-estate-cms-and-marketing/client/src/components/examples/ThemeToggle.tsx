import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
