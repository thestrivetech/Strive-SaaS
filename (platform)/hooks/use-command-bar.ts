'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  action: string;
  icon?: string;
  shortcut?: string;
}

interface UseCommandBarReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
}

/**
 * useCommandBar Hook
 *
 * Manages command bar state and keyboard shortcuts
 * Provides search functionality with debounced queries
 *
 * @returns Command bar state and controls
 */
export function useCommandBar(): UseCommandBarReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Open/close controls
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle, isOpen, close]);

  // Debounced search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const searchTimeout = setTimeout(() => {
      // Simulate search - in production this would be an API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Go to CRM Dashboard',
          description: 'View contacts, leads, and deals',
          action: '/real-estate/crm/dashboard',
          icon: 'Users',
          shortcut: '⌘1',
        },
        {
          id: '2',
          title: 'Go to Workspace',
          description: 'Manage transactions and listings',
          action: '/real-estate/workspace/dashboard',
          icon: 'FileText',
          shortcut: '⌘2',
        },
        {
          id: '3',
          title: 'Go to Analytics',
          description: 'View business insights',
          action: '/real-estate/reid/dashboard',
          icon: 'TrendingUp',
          shortcut: '⌘3',
        },
        {
          id: '4',
          title: 'Create New Lead',
          description: 'Add a lead to CRM',
          action: 'create-lead',
          icon: 'UserPlus',
        },
        {
          id: '5',
          title: 'Create New Transaction',
          description: 'Start a transaction loop',
          action: 'create-transaction',
          icon: 'Plus',
        },
      ].filter((result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
      setLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    results,
    loading,
  };
}
