import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Chart: any;
  }
}

const chartPeriods = [
  { id: "week", label: "Week", active: true },
  { id: "month", label: "Month", active: false },
  { id: "year", label: "Year", active: false },
];

const salesData = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [120, 150, 180, 140, 200, 250, 280]
  },
  month: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [1200, 1500, 1800, 2200]
  },
  year: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [15000, 18000, 22000, 25000]
  }
};

const cashFlowData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  inflow: [450, 520, 380, 620],
  outflow: [280, 310, 250, 340]
};

export function LiveChartsWidget() {
  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const cashFlowChartRef = useRef<HTMLCanvasElement>(null);
  const salesChartInstance = useRef<any>(null);
  const cashFlowChartInstance = useRef<any>(null);
  const [activePeriod, setActivePeriod] = useState("week");

  useEffect(() => {
    // Load Chart.js
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
    script.onload = initCharts;
    document.head.appendChild(script);

    return () => {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (cashFlowChartInstance.current) cashFlowChartInstance.current.destroy();
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (salesChartInstance.current && window.Chart) {
      updateSalesChart();
    }
  }, [activePeriod]);

  const initCharts = () => {
    if (!window.Chart) return;

    // Sales Chart
    if (salesChartRef.current) {
      const ctx = salesChartRef.current.getContext('2d');
      if (ctx) {
        salesChartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: salesData[activePeriod as keyof typeof salesData].labels,
            datasets: [{
              label: 'Sales',
              data: salesData[activePeriod as keyof typeof salesData].data,
              borderColor: '#00D2FF',
              backgroundColor: 'rgba(0, 210, 255, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#00D2FF',
              pointBorderColor: '#00D2FF',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#00D2FF',
                bodyColor: '#fff',
                borderColor: '#00D2FF',
                borderWidth: 1
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.6)' }
              },
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.6)' }
              }
            }
          }
        });
      }
    }

    // Cash Flow Chart
    if (cashFlowChartRef.current) {
      const ctx = cashFlowChartRef.current.getContext('2d');
      if (ctx) {
        cashFlowChartInstance.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: cashFlowData.labels,
            datasets: [{
              label: 'Inflow',
              data: cashFlowData.inflow,
              backgroundColor: 'rgba(57, 255, 20, 0.6)',
              borderColor: '#39FF14',
              borderWidth: 1
            }, {
              label: 'Outflow',
              data: cashFlowData.outflow,
              backgroundColor: 'rgba(139, 92, 246, 0.6)',
              borderColor: '#8B5CF6',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                labels: { color: 'rgba(255, 255, 255, 0.8)' }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#39FF14',
                bodyColor: '#fff',
                borderColor: '#39FF14',
                borderWidth: 1
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.6)' }
              },
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.6)' }
              }
            }
          }
        });
      }
    }
  };

  const updateSalesChart = () => {
    if (salesChartInstance.current) {
      const newData = salesData[activePeriod as keyof typeof salesData];
      salesChartInstance.current.data.labels = newData.labels;
      salesChartInstance.current.data.datasets[0].data = newData.data;
      salesChartInstance.current.update('active');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 widget-hover"
        data-testid="sales-chart-widget"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="w-2 h-2 rounded-full bg-secondary"
            />
            Sales Performance
          </h3>
          <div className="flex gap-2">
            {chartPeriods.map((period) => (
              <Button
                key={period.id}
                variant={activePeriod === period.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActivePeriod(period.id)}
                className={`${
                  activePeriod === period.id
                    ? "bg-primary/10 text-primary neon-border-cyan"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
                data-testid={`chart-period-${period.id}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <canvas ref={salesChartRef} />
        </div>
      </motion.div>

      {/* Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-2xl p-6 widget-hover"
        data-testid="cashflow-chart-widget"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            Cash Flow Analysis
          </h3>
          <select className="px-3 py-1 text-xs rounded-lg glass bg-transparent border-none text-muted-foreground cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
          </select>
        </div>
        <div className="h-48">
          <canvas ref={cashFlowChartRef} />
        </div>
      </motion.div>
    </div>
  );
}
