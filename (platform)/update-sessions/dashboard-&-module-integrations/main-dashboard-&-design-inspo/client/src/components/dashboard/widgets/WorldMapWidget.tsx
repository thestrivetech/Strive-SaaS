import { motion } from "framer-motion";

const marketData = [
  {
    id: "north-america",
    region: "North America",
    value: "$2.4M", 
    color: "#00D2FF",
    position: "top-1/4 left-1/4"
  },
  {
    id: "europe",
    region: "Europe",
    value: "$1.8M",
    color: "#39FF14", 
    position: "top-1/3 right-1/3"
  },
  {
    id: "asia-pacific",
    region: "Asia Pacific",
    value: "$1.2M",
    color: "#8B5CF6",
    position: "bottom-1/3 left-1/2"
  }
];

export function WorldMapWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 widget-hover"
      data-testid="world-map-widget"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="w-2 h-2 rounded-full bg-primary"
        />
        Market Heatmap
      </h3>
      
      <div className="relative h-64 bg-muted/10 rounded-lg overflow-hidden">
        {/* Stylized world map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-card/80" />
        
        {/* Animated hotspots */}
        {marketData.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ 
              delay: index * 0.5,
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 2
            }}
            className={`absolute ${market.position} w-16 h-16 rounded-full blur-2xl animate-pulse-slow`}
            style={{ 
              backgroundColor: market.color,
              animationDelay: `${index * 0.5}s`
            }}
          />
        ))}
        
        {/* Market data overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
          {marketData.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="glass rounded-lg px-3 py-2"
              data-testid={`market-data-${market.id}`}
            >
              <div 
                className="font-bold"
                style={{ color: market.color }}
              >
                {market.value}
              </div>
              <div className="text-muted-foreground">{market.region}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
