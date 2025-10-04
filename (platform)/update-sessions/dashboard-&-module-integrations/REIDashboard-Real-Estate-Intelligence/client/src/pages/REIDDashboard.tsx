import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { HeatmapModule } from "@/components/HeatmapModule";
import { DemographicsModule } from "@/components/DemographicsModule";
import { AmenitiesModule } from "@/components/AmenitiesModule";
import { TrendsModule } from "@/components/TrendsModule";
import { ROIModule } from "@/components/ROIModule";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Clock, Package, FileText, Bell, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchNeighborhoodInsights } from "@/lib/api";
import { exportToCSV } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function REIDDashboard() {
  const [activeModule, setActiveModule] = useState("heatmap");
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>();
  const { toast } = useToast();

  const { data: insights = [] } = useQuery({
    queryKey: ["/api/v1/reid/insights", selectedAreaCode],
    queryFn: () => fetchNeighborhoodInsights(selectedAreaCode),
  });

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem('reid-filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSelectedAreaCode(filters.areaCode);
      setActiveModule(filters.activeModule || "heatmap");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reid-filters', JSON.stringify({
      areaCode: selectedAreaCode,
      activeModule,
    }));
  }, [selectedAreaCode, activeModule]);

  const handleSearch = (query: string) => {
    const zipMatch = query.match(/\d{5}/);
    if (zipMatch) {
      setSelectedAreaCode(zipMatch[0]);
    } else if (!query) {
      setSelectedAreaCode(undefined);
    }
  };

  const handleExport = () => {
    if (insights.length === 0) {
      toast({
        title: "No data to export",
        description: "Please select an area first",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(insights, `reid-insights-${selectedAreaCode || 'all'}-${new Date().toISOString().split('T')[0]}`);
    toast({
      title: "Export successful",
      description: "Data has been exported to CSV",
    });
  };

  const avgMetrics = insights.length > 0 ? {
    medianPrice: Math.round(insights.reduce((sum, i) => sum + i.metrics.medianPrice, 0) / insights.length),
    daysOnMarket: Math.round(insights.reduce((sum, i) => sum + i.metrics.daysOnMarket, 0) / insights.length),
    inventory: Math.round(insights.reduce((sum, i) => sum + i.metrics.inventory, 0) / insights.length),
    priceChange: insights[0].metrics.priceChange,
  } : { medianPrice: 0, daysOnMarket: 0, inventory: 0, priceChange: 0 };

  const renderModule = () => {
    switch (activeModule) {
      case "heatmap":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Median Price" 
                value={avgMetrics.medianPrice} 
                change={avgMetrics.priceChange}
                format="currency"
                icon={<Home className="h-8 w-8" />}
              />
              <MetricCard 
                title="Days on Market" 
                value={avgMetrics.daysOnMarket} 
                change={-12}
                format="days"
                icon={<Clock className="h-8 w-8" />}
              />
              <MetricCard 
                title="Inventory" 
                value={avgMetrics.inventory} 
                change={8.5}
                icon={<Package className="h-8 w-8" />}
              />
            </div>
            <HeatmapModule selectedAreaCode={selectedAreaCode} />
          </div>
        );
      case "demographics":
        return <DemographicsModule selectedAreaCode={selectedAreaCode} />;
      case "amenities":
        return <AmenitiesModule selectedAreaCode={selectedAreaCode} />;
      case "trends":
        return <TrendsModule />;
      case "roi":
        return <ROIModule />;
      case "ai-profiles":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI Neighborhood Profile Generator</h3>
            <p className="text-muted-foreground mb-4">Generate comprehensive neighborhood reports with AI-powered insights</p>
            <div className="space-y-4">
              <div>
                <Label>Area Code / Zip</Label>
                <Input placeholder="Enter zip code..." data-testid="input-zip-code" />
              </div>
              <Button className="w-full" data-testid="button-generate-report">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report (Coming Soon)
              </Button>
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                Reports include: Market analysis, demographic trends, investment opportunities, and area highlights
              </p>
            </div>
          </Card>
        );
      case "alerts":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price & Inventory Alerts</h3>
            <div className="space-y-4">
              <div>
                <Label>Price Change Threshold (%)</Label>
                <Input type="number" placeholder="5" data-testid="input-price-threshold" />
              </div>
              <div>
                <Label>Inventory Drop Alert</Label>
                <Input type="number" placeholder="Below 200 units" data-testid="input-inventory-threshold" />
              </div>
              <Button className="w-full" data-testid="button-set-alert">
                <Bell className="h-4 w-4 mr-2" />
                Set Alert (Coming Soon)
              </Button>
            </div>
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Active Alerts</h4>
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <span className="text-sm">Mission District price drop &gt;5%</span>
                <Badge variant="default" className="bg-chart-1">Active</Badge>
              </div>
            </div>
          </Card>
        );
      case "export":
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleExport} data-testid="button-export-csv">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-export-pdf">
                <Download className="h-4 w-4 mr-2" />
                Export as PDF (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-export-widget">
                <Download className="h-4 w-4 mr-2" />
                Generate Embeddable Widget (Coming Soon)
              </Button>
            </div>
          </Card>
        );
      default:
        return <div>Module not found</div>;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <DashboardSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader 
            onSearch={handleSearch}
            onDateRangeChange={(from, to) => console.log('Date range:', from, to)}
            onExport={handleExport}
          />
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="max-w-screen-2xl mx-auto">
              {renderModule()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
