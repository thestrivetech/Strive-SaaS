import StatsCard from "../shared/StatsCard";
import PerformanceChart from "./PerformanceChart";
import { Mail, Users, MousePointer, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CampaignDashboard() {
  const emailData = [
    { date: "Jan 1", value: 220 },
    { date: "Jan 5", value: 280 },
    { date: "Jan 10", value: 320 },
    { date: "Jan 15", value: 380 },
    { date: "Jan 20", value: 420 },
    { date: "Jan 25", value: 450 },
    { date: "Jan 30", value: 520 },
  ];

  const socialData = [
    { date: "Jan 1", value: 1200 },
    { date: "Jan 5", value: 1800 },
    { date: "Jan 10", value: 2100 },
    { date: "Jan 15", value: 2400 },
    { date: "Jan 20", value: 2800 },
    { date: "Jan 25", value: 3200 },
    { date: "Jan 30", value: 3600 },
  ];

  return (
    <div className="space-y-6" data-testid="section-analytics-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Campaigns"
          value="24"
          icon={Mail}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Leads"
          value="1,284"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg Click Rate"
          value="4.2%"
          icon={MousePointer}
          trend={{ value: 2.1, isPositive: false }}
        />
        <StatsCard
          title="Revenue Impact"
          value="$12,840"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
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
              description="Total opens over the last 30 days"
              data={emailData}
              color="hsl(var(--chart-1))"
            />
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Based on click-through rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Luxury Downtown Condo", ctr: "6.8%", opens: 425 },
                    { name: "Market Update Q1", ctr: "5.2%", opens: 312 },
                    { name: "Holiday Open House", ctr: "4.9%", opens: 728 },
                  ].map((campaign) => (
                    <div key={campaign.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.opens} opens</p>
                      </div>
                      <div className="flex items-center gap-1 text-chart-3">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-sm font-medium">{campaign.ctr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceChart
              title="Social Impressions"
              description="Total impressions over the last 30 days"
              data={socialData}
              color="hsl(var(--chart-2))"
            />
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Platform</CardTitle>
                <CardDescription>Average engagement rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: "Facebook", engagement: "5.8%", color: "bg-[#1877F2]" },
                    { platform: "Instagram", engagement: "7.2%", color: "bg-[#E4405F]" },
                    { platform: "LinkedIn", engagement: "4.1%", color: "bg-[#0A66C2]" },
                    { platform: "Twitter", engagement: "3.4%", color: "bg-[#1DA1F2]" },
                  ].map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${platform.color}`} />
                        <span className="text-sm font-medium">{platform.platform}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{platform.engagement}</span>
                    </div>
                  ))}
                </div>
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
              <div className="space-y-4">
                {[
                  { page: "Luxury Condos", visits: 2845, conversions: 142, rate: "5.0%" },
                  { page: "New Listings", visits: 1924, conversions: 98, rate: "5.1%" },
                  { page: "Agent Profile", visits: 1456, conversions: 65, rate: "4.5%" },
                ].map((page) => (
                  <div key={page.page} className="grid grid-cols-4 gap-4 text-sm">
                    <div className="col-span-2">
                      <p className="font-medium">{page.page}</p>
                    </div>
                    <div className="text-muted-foreground">{page.visits} visits</div>
                    <div className="text-chart-3 font-medium">{page.rate}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
