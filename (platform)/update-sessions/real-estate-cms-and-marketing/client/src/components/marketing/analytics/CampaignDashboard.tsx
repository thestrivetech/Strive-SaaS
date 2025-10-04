import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "../shared/StatsCard";
import PerformanceChart from "./PerformanceChart";
import { Mail, Users, MousePointer, DollarSign, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays, isWithinInterval } from "date-fns";
import type { Campaign, Page } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function CampaignDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const filteredCampaigns = useMemo(() => {
    const start = dateRange.from <= dateRange.to ? dateRange.from : dateRange.to;
    const end = dateRange.from <= dateRange.to ? dateRange.to : dateRange.from;
    
    return campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt);
      return isWithinInterval(campaignDate, { start, end });
    });
  }, [campaigns, dateRange]);

  const stats = useMemo(() => {
    const emailCampaigns = filteredCampaigns.filter(c => c.type === "email");
    const socialCampaigns = filteredCampaigns.filter(c => c.type === "social");

    const totalOpens = emailCampaigns.reduce((sum, c) => sum + (c.metrics?.opens || 0), 0);
    const totalClicks = emailCampaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0);
    const totalSends = emailCampaigns.reduce((sum, c) => sum + (c.metrics?.sends || 0), 0);
    
    const avgClickRate = totalSends > 0 ? (totalClicks / totalSends) * 100 : 0;
    const totalLeads = totalOpens + socialCampaigns.reduce((sum, c) => sum + (c.metrics?.engagement || 0), 0);
    
    const revenuePerLead = 10;
    const revenue = Math.round(totalLeads * revenuePerLead);

    return {
      totalCampaigns: filteredCampaigns.length,
      totalLeads,
      avgClickRate: avgClickRate.toFixed(1),
      revenue,
    };
  }, [filteredCampaigns]);

  const emailChartData = useMemo(() => {
    const emailCampaigns = filteredCampaigns.filter(c => c.type === "email" && c.metrics?.opens);
    const dataMap = new Map<string, { timestamp: number; value: number }>();

    emailCampaigns.forEach(campaign => {
      const dateObj = new Date(campaign.createdAt);
      const dateKey = format(dateObj, "MMM dd");
      const opens = campaign.metrics?.opens || 0;
      const existing = dataMap.get(dateKey);
      
      if (existing) {
        existing.value += opens;
      } else {
        dataMap.set(dateKey, { timestamp: dateObj.getTime(), value: opens });
      }
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, value: data.value, timestamp: data.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-7)
      .map(({ date, value }) => ({ date, value }));
  }, [filteredCampaigns]);

  const socialChartData = useMemo(() => {
    const socialCampaigns = filteredCampaigns.filter(c => c.type === "social" && c.metrics?.impressions);
    const dataMap = new Map<string, { timestamp: number; value: number }>();

    socialCampaigns.forEach(campaign => {
      const dateObj = new Date(campaign.createdAt);
      const dateKey = format(dateObj, "MMM dd");
      const impressions = campaign.metrics?.impressions || 0;
      const existing = dataMap.get(dateKey);
      
      if (existing) {
        existing.value += impressions;
      } else {
        dataMap.set(dateKey, { timestamp: dateObj.getTime(), value: impressions });
      }
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, value: data.value, timestamp: data.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-7)
      .map(({ date, value }) => ({ date, value }));
  }, [filteredCampaigns]);

  const topEmailCampaigns = useMemo(() => {
    return filteredCampaigns
      .filter(c => c.type === "email" && c.metrics?.clicks && c.metrics?.sends)
      .map(c => ({
        name: c.title,
        ctr: ((c.metrics!.clicks! / c.metrics!.sends!) * 100).toFixed(1) + "%",
        opens: c.metrics!.opens || 0,
      }))
      .sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr))
      .slice(0, 3);
  }, [filteredCampaigns]);

  const platformEngagement = useMemo(() => {
    const platformMap = new Map<string, { total: number; count: number }>();
    
    filteredCampaigns
      .filter(c => c.type === "social" && c.platforms && c.metrics?.engagement && c.metrics?.impressions)
      .forEach(c => {
        c.platforms!.forEach(platform => {
          const rate = (c.metrics!.engagement! / c.metrics!.impressions!) * 100;
          const existing = platformMap.get(platform) || { total: 0, count: 0 };
          platformMap.set(platform, {
            total: existing.total + rate,
            count: existing.count + 1,
          });
        });
      });

    return Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      engagement: (data.total / data.count).toFixed(1) + "%",
      color: platform === "Facebook" ? "bg-[#1877F2]" :
             platform === "Instagram" ? "bg-[#E4405F]" :
             platform === "LinkedIn" ? "bg-[#0A66C2]" :
             "bg-[#1DA1F2]",
    }));
  }, [filteredCampaigns]);

  const topPages = useMemo(() => {
    return [...pages]
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map(p => ({
        page: p.title,
        visits: p.views,
        conversions: Math.round(p.views * 0.05),
        rate: "5.0%",
      }));
  }, [pages]);

  const handleExport = () => {
    const data = {
      dateRange: {
        from: format(dateRange.from, "yyyy-MM-dd"),
        to: format(dateRange.to, "yyyy-MM-dd"),
      },
      stats,
      campaigns: filteredCampaigns.map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        status: c.status,
        metrics: c.metrics,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="section-analytics-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal" data-testid="button-date-range">
              <Calendar className="mr-2 h-4 w-4" />
              {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Quick ranges</p>
                <div className="grid gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })}
                  >
                    Last 90 days
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleExport} variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={Mail}
        />
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title="Avg Click Rate"
          value={`${stats.avgClickRate}%`}
          icon={MousePointer}
        />
        <StatsCard
          title="Revenue Impact"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email Performance</TabsTrigger>
          <TabsTrigger value="social">Social Performance</TabsTrigger>
          <TabsTrigger value="landing">Landing Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceChart
              title="Email Opens"
              description="Total opens in selected period"
              data={emailChartData.length > 0 ? emailChartData : [{ date: "No data", value: 0 }]}
              color="hsl(var(--chart-1))"
            />
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Based on click-through rate</CardDescription>
              </CardHeader>
              <CardContent>
                {topEmailCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {topEmailCampaigns.map((campaign) => (
                      <div key={campaign.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.opens} opens</p>
                        </div>
                        <span className="text-sm font-medium text-chart-3">{campaign.ctr}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No email campaigns in selected period</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceChart
              title="Social Impressions"
              description="Total impressions in selected period"
              data={socialChartData.length > 0 ? socialChartData : [{ date: "No data", value: 0 }]}
              color="hsl(var(--chart-2))"
            />
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Platform</CardTitle>
                <CardDescription>Average engagement rate</CardDescription>
              </CardHeader>
              <CardContent>
                {platformEngagement.length > 0 ? (
                  <div className="space-y-4">
                    {platformEngagement.map((platform) => (
                      <div key={platform.platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${platform.color}`} />
                          <span className="text-sm font-medium">{platform.platform}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{platform.engagement}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No social campaigns in selected period</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="landing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Performance</CardTitle>
              <CardDescription>Visits and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <div className="space-y-4">
                  {topPages.map((page) => (
                    <div key={page.page} className="grid grid-cols-4 gap-4 text-sm">
                      <div className="col-span-2">
                        <p className="font-medium">{page.page}</p>
                      </div>
                      <div className="text-muted-foreground">{page.visits} visits</div>
                      <div className="text-chart-3 font-medium">{page.rate}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No landing pages available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
