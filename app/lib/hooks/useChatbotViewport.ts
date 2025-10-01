import { useState, useEffect, useCallback } from "react";

// Responsive viewport detection hook
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Dynamic chat height calculation hook
export const useDynamicChatHeight = () => {
  const [chatHeight, setChatHeight] = useState('70vh');
  const viewport = useViewport();

  const calculateHeight = useCallback(() => {
    const vh = viewport.height;
    const vw = viewport.width;

    // Calculate space taken by fixed elements
    const navbarHeight = 64; // pt-16 = 4rem = 64px
    const headerHeight = vw < 768 ? 120 : 150; // Responsive header
    const debugHeight = 0; // Only in dev, ignore for calculation
    const paddingAndMargins = 32; // Container padding
    const infoCardsHeight = viewport.isMobile ? 0 : 200; // Hide on mobile

    let availableHeight = vh - navbarHeight - headerHeight - paddingAndMargins;

    if (viewport.isMobile) {
      // Mobile: Use most of viewport, prioritize chat
      availableHeight = Math.max(vh - navbarHeight - 100, 400);
    } else if (viewport.isTablet) {
      // Tablet: Balanced layout
      availableHeight = vh - navbarHeight - headerHeight - 100;
    } else {
      // Desktop: Maximize iframe height for full-page chat experience
      availableHeight = vh - navbarHeight; // Use full available height
    }

    setChatHeight(`${Math.max(availableHeight, 350)}px`);
  }, [viewport]);

  useEffect(() => {
    calculateHeight();
  }, [calculateHeight]);

  return { chatHeight, viewport };
};
