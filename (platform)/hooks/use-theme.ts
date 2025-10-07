'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'strive-dashboard-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    setMounted(true);

    // Load saved theme preference
    const savedTheme = (typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null) as Theme | null;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document when theme changes
  useEffect(() => {
    if (!mounted) return;

    const applyTheme = (themeToApply: Theme) => {
      let effectiveTheme: ResolvedTheme = 'dark';

      if (themeToApply === 'system') {
        // Detect system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
      } else {
        effectiveTheme = themeToApply;
      }

      // Apply to document
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveTheme);
        root.style.colorScheme = effectiveTheme;
      }

      setResolvedTheme(effectiveTheme);
    };

    applyTheme(theme);

    // Listen for system theme changes
    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme('system');
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [theme, mounted]);

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
  };
}
