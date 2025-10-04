import { motion } from "framer-motion";
import { useDashboardKPIs } from "@/hooks/use-dashboard";
import { useWeather } from "@/hooks/use-weather";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, TrendingUp, Users, CheckCircle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const iconMap = {
  "trending-up": TrendingUp,
  users: Users,
  "check-circle": CheckCircle,
  "dollar-sign": DollarSign,
};

export function HeroSection() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: weather } = useWeather();
  const [currentTime, setCurrentTime] = useState("");

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <section className="p-6" data-testid="hero-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-8 neon-border-cyan mb-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold mb-2"
              data-testid="greeting"
            >
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                {getGreeting()},
              </motion.span>{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Alex
              </span>{" "}
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                👋
              </motion.span>
            </motion.h1>
            <p className="text-muted-foreground">
              Here's what's happening with your business today
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Clock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center glass rounded-xl p-4 neon-border-purple"
              data-testid="clock-widget"
            >
              <div className="text-2xl font-bold text-accent">{currentTime}</div>
              <div className="text-xs text-muted-foreground">PST</div>
            </motion.div>

            {/* Weather */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl p-4 neon-border-green flex items-center gap-3"
              data-testid="weather-widget"
            >
              <Cloud className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {weather?.temperature || "72°F"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {weather?.location || "San Francisco"}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* KPI Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
          data-testid="kpi-carousel"
        >
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass rounded-xl p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </Card>
            ))
          ) : (
            kpis?.map((kpi, index) => {
              const IconComponent = iconMap[kpi.icon as keyof typeof iconMap] || TrendingUp;
              const changeColor = kpi.change && kpi.change > 0 ? "text-secondary" : "text-destructive";
              
              return (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0, 210, 255, 0.2)" }}
                  className="glass rounded-xl p-4 cursor-pointer neon-border-cyan"
                  data-testid={`kpi-${kpi.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{kpi.name}</span>
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <motion.div
                    key={kpi.value}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-primary"
                  >
                    {kpi.value}
                  </motion.div>
                  {kpi.change && (
                    <div className={`text-xs mt-1 ${changeColor}`}>
                      ↑ {Math.abs(kpi.change)}{kpi.changeType === "percentage" ? "%" : ""}{" "}
                      {kpi.changeType === "percentage" ? "vs last month" : "more than yesterday"}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
