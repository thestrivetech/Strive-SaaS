import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import StatsCard from "@/components/marketing/shared/StatsCard";
import CampaignCard from "@/components/marketing/campaigns/CampaignCard";
import CampaignModal from "@/components/marketing/campaigns/CampaignModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Users, MousePointer, DollarSign, Plus, ArrowRight } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { Campaign } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const recentCampaigns = campaigns.slice(0, 3);

  const totalCampaigns = campaigns.length;
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.metrics?.opens || 0), 0);
  const avgClickRate = campaigns.length > 0
    ? (campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0) / 
       campaigns.reduce((sum, c) => sum + (c.metrics?.sends || 0), 1) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your marketing performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Campaigns"
          value={totalCampaigns}
          icon={Mail}
          description="Active campaigns"
        />
        <StatsCard
          title="Total Engagement"
          value={totalLeads.toLocaleString()}
          icon={Users}
          description="Opens and interactions"
        />
        <StatsCard
          title="Avg Click Rate"
          value={`${avgClickRate}%`}
          icon={MousePointer}
          description="Across all campaigns"
        />
        <StatsCard
          title="Revenue Impact"
          value="$12,840"
          icon={DollarSign}
          description="Attributed revenue"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest marketing activities</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/campaigns/email")}
              data-testid="link-view-all-campaigns"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No campaigns yet</p>
              <Button onClick={() => setEmailModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={{
                    ...campaign,
                    scheduledDate: campaign.scheduledDate ? new Date(campaign.scheduledDate).toISOString() : undefined,
                  }}
                  onEdit={(id) => console.log("Edit campaign", id)}
                  onView={(id) => console.log("View campaign", id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-email">
          <CardHeader>
            <CardTitle className="text-base">Create Email Campaign</CardTitle>
            <CardDescription>Design and send targeted emails</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setEmailModalOpen(true)}
              data-testid="button-create-email"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Email
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-social">
          <CardHeader>
            <CardTitle className="text-base">Schedule Social Post</CardTitle>
            <CardDescription>Share on social media</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setSocialModalOpen(true)}
              data-testid="button-create-social"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" data-testid="card-quick-action-page">
          <CardHeader>
            <CardTitle className="text-base">Build Landing Page</CardTitle>
            <CardDescription>Create custom pages</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/pages")}
              data-testid="button-create-page"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </CardContent>
        </Card>
      </div>

      <CampaignModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        campaignType="email"
        onSubmit={async (data) => {
          await createCampaign.mutateAsync({ ...data, type: "email" });
        }}
      />

      <CampaignModal
        open={socialModalOpen}
        onOpenChange={setSocialModalOpen}
        campaignType="social"
        onSubmit={async (data) => {
          await createCampaign.mutateAsync({ ...data, type: "social" });
        }}
      />
    </div>
  );
}
