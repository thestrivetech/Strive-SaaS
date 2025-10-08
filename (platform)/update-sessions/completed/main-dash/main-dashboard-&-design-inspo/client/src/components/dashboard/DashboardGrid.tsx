import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardSettings } from "@shared/schema";
import { KPIRingsWidget } from "./widgets/KPIRingsWidget";
import { LiveChartsWidget } from "./widgets/LiveChartsWidget";
import { WorldMapWidget } from "./widgets/WorldMapWidget";
import { ActivityFeedWidget } from "./widgets/ActivityFeedWidget";
import { AIInsightsWidget } from "./widgets/AIInsightsWidget";
import { SmartSuggestionsWidget } from "./widgets/SmartSuggestionsWidget";
import { Button } from "@/components/ui/button";
import { GripVertical, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: "kpi-rings", x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "live-charts", x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "world-map", x: 0, y: 4, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "activity-feed", x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "ai-insights", x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "smart-suggestions", x: 2, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
  ],
  md: [
    { i: "kpi-rings", x: 0, y: 0, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "live-charts", x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "activity-feed", x: 0, y: 4, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "world-map", x: 0, y: 6, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "ai-insights", x: 0, y: 8, w: 2, h: 2, minW: 1, minH: 2 },
    { i: "smart-suggestions", x: 0, y: 10, w: 2, h: 2, minW: 1, minH: 2 },
  ],
  sm: [
    { i: "kpi-rings", x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "live-charts", x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "activity-feed", x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "world-map", x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "ai-insights", x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "smart-suggestions", x: 0, y: 10, w: 1, h: 2, minW: 1, minH: 2 },
  ],
};

const widgets = {
  "kpi-rings": KPIRingsWidget,
  "live-charts": LiveChartsWidget,
  "world-map": WorldMapWidget,
  "activity-feed": ActivityFeedWidget,
  "ai-insights": AIInsightsWidget,
  "smart-suggestions": SmartSuggestionsWidget,
};

export function DashboardGrid() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dashboard settings
  const { data: settings } = useQuery<DashboardSettings>({
    queryKey: ["/api/dashboard/settings"],
  });

  // Save layout mutation
  const saveLayoutMutation = useMutation({
    mutationFn: async (newLayouts: Layouts) => {
      return await apiRequest("POST", "/api/dashboard/settings", {
        layout: newLayouts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/settings"] });
      toast({
        title: "Layout saved",
        description: "Your dashboard layout has been saved successfully.",
      });
    },
  });

  // Load saved layouts
  useEffect(() => {
    if (settings?.layout) {
      if (typeof settings.layout === 'object' && !Array.isArray(settings.layout)) {
        setLayouts(settings.layout as Layouts);
      }
    }
  }, [settings]);

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout to save (only saves after user stops moving widgets)
    saveTimeoutRef.current = setTimeout(() => {
      saveLayoutMutation.mutate(allLayouts);
    }, 1000);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveLayoutMutation.mutate(defaultLayouts);
  };

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
        breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
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
        {Object.keys(widgets).map((widgetKey, index) => {
          const Widget = widgets[widgetKey as keyof typeof widgets];
          return (
            <div key={widgetKey}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <div className="relative h-full group">
                  <div className="drag-handle absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                    <div className="p-2 rounded-lg glass hover:bg-muted/30">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <Widget />
                </div>
              </motion.div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </section>
  );
}
