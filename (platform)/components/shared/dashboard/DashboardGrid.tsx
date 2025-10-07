'use client';

import { useState, useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GripVertical, RotateCcw } from 'lucide-react';
import { KPIRingsWidget } from './widgets/KPIRingsWidget';
import { ActivityFeedWidget } from './widgets/ActivityFeedWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: 'kpi-rings', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 2 },
    { i: 'activity-feed', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
  ],
  md: [
    { i: 'kpi-rings', x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 2 },
    { i: 'activity-feed', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 2 },
  ],
  sm: [
    { i: 'kpi-rings', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'activity-feed', x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
  ],
};

const STORAGE_KEY = 'dashboard-grid-layout';

interface DashboardGridProps {
  organizationId: string;
}

export function DashboardGrid({ organizationId }: DashboardGridProps) {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved layouts from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedLayouts = JSON.parse(saved);
        setLayouts(parsedLayouts);
      }
    } catch (error) {
      console.error('Failed to load saved layout:', error);
    }
  }, []);

  // Save layouts to localStorage (debounced)
  const saveLayouts = (newLayouts: Layouts) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayouts));
      } catch (error) {
        console.error('Failed to save layout:', error);
      }
    }, 1000);
  };

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    saveLayouts(allLayouts);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset layout:', error);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <section className="px-6 pb-6" data-testid="dashboard-grid">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GripVertical className="w-4 h-4" />
          <span>Drag widgets to customize your dashboard</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetLayout}
          className="glass hover:bg-muted/30"
          data-testid="reset-layout"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Layout
        </Button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 640 }}
        cols={{ lg: 3, md: 2, sm: 1 }}
        rowHeight={150}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStop={handleDragStop}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".drag-handle"
        margin={[24, 24]}
      >
        <div key="kpi-rings">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="h-full"
          >
            <div className="relative h-full group">
              <div className="drag-handle absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <div className="p-2 rounded-lg glass hover:bg-muted/30">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <KPIRingsWidget />
            </div>
          </motion.div>
        </div>

        <div key="activity-feed">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <div className="relative h-full group">
              <div className="drag-handle absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <div className="p-2 rounded-lg glass hover:bg-muted/30">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <ActivityFeedWidget organizationId={organizationId} />
            </div>
          </motion.div>
        </div>
      </ResponsiveGridLayout>
    </section>
  );
}
