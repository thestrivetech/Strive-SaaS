import { motion } from "framer-motion";
import { useDashboardActivities } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  User, 
  UserPlus, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  CheckCircle
} from "lucide-react";

const iconMap = {
  "deal_closed": User,
  "lead_added": UserPlus, 
  "payment_received": DollarSign,
  "meeting_scheduled": Calendar,
  "campaign_update": TrendingUp,
  "contract_signed": CheckCircle,
  "user": User,
  "user-plus": UserPlus,
  "dollar-sign": DollarSign,
  "calendar": Calendar,
  "trending-up": TrendingUp,
  "check-circle": CheckCircle,
};

export function ActivityFeedWidget() {
  const { data: activities, isLoading } = useDashboardActivities();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 widget-hover"
      data-testid="activity-feed-widget"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="w-2 h-2 rounded-full bg-secondary"
        />
        Activity Feed
      </h3>
      
      <div className="activity-feed space-y-4 max-h-96 overflow-y-auto pr-2" style={{ scrollBehavior: "smooth" }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : (
          activities?.map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || User;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                className="flex gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                data-testid={`activity-${activity.id}`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(45deg, ${activity.color || '#00D2FF'}, ${activity.color || '#00D2FF'}80)`
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span 
                      className="font-medium"
                      style={{ color: activity.color || '#00D2FF' }}
                    >
                      {activity.title}
                    </span>
                    {activity.description && (
                      <>
                        {" - "}
                        <span className="text-muted-foreground">
                          {activity.description}
                        </span>
                      </>
                    )}
                    {activity.amount && (
                      <span 
                        className="font-bold ml-1"
                        style={{ color: activity.color || '#00D2FF' }}
                      >
                        {activity.amount}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(new Date(activity.createdAt!))}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        
        <Button
          variant="ghost"
          className="w-full py-2 text-sm text-primary hover:text-secondary transition-colors"
          data-testid="load-more-activities"
        >
          Load more activities...
        </Button>
      </div>
    </motion.div>
  );
}
