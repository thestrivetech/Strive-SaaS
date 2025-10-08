import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BarChart3, ChevronRight } from "lucide-react";

interface SmartAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
}

const smartActions: SmartAction[] = [
  {
    id: "follow-up",
    title: "Schedule Follow-up",
    description: "With hottest lead: Marcus Rivera",
    icon: Calendar,
    color: "primary",
    action: "/leads/marcus-rivera/schedule"
  },
  {
    id: "review-pipeline",
    title: "Review Pipeline", 
    description: "3 deals need attention today",
    icon: FileText,
    color: "secondary",
    action: "/deals/pipeline"
  },
  {
    id: "generate-report",
    title: "Generate Report",
    description: "Weekly performance summary",
    icon: BarChart3,
    color: "accent",
    action: "/reports/generate"
  }
];

const colorClassMap = {
  primary: {
    bg: "hover:bg-primary/10",
    border: "neon-border-cyan",
    iconBg: "bg-primary/20",
    iconText: "text-primary",
    text: "text-primary"
  },
  secondary: {
    bg: "hover:bg-secondary/10", 
    border: "neon-border-green",
    iconBg: "bg-secondary/20",
    iconText: "text-secondary",
    text: "text-secondary"
  },
  accent: {
    bg: "hover:bg-accent/10",
    border: "neon-border-purple", 
    iconBg: "bg-accent/20",
    iconText: "text-accent",
    text: "text-accent"
  }
};

export function SmartSuggestionsWidget() {
  const handleActionClick = (action: string) => {
    // In a real app, handle navigation here
    console.log("Navigating to:", action);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 widget-hover"
      data-testid="smart-suggestions-widget"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="w-2 h-2 rounded-full bg-secondary"
        />
        Smart Actions
      </h3>
      
      <div className="space-y-3">
        {smartActions.map((action, index) => {
          const colorClasses = colorClassMap[action.color as keyof typeof colorClassMap];
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                onClick={() => handleActionClick(action.action)}
                className={`w-full p-4 rounded-lg glass ${colorClasses.bg} ${colorClasses.border} transition-all group text-left justify-start h-auto`}
                data-testid={`smart-action-${action.id}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-lg ${colorClasses.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className={`w-5 h-5 ${colorClasses.iconText}`} />
                  </motion.div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${colorClasses.text}`}>
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${colorClasses.iconText} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
