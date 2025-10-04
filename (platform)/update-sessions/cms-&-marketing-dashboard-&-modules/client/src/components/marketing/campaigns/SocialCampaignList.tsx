import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CampaignCard from "./CampaignCard";
import CampaignModal from "./CampaignModal";
import type { Campaign } from "@shared/schema";

export default function SocialCampaignList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/campaigns", { ...data, type: "social" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your social media post has been created successfully.",
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

  const socialCampaigns = campaigns
    .filter((c) => c.type === "social")
    .filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Campaigns</CardTitle>
            <CardDescription>Loading campaigns...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="section-social-campaigns">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Social Media Campaigns</CardTitle>
              <CardDescription>Schedule and manage social media posts</CardDescription>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              data-testid="button-create-social-campaign"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-posts"
            />
          </div>
        </CardHeader>
      </Card>

      {socialCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No social media posts found</p>
            <Button onClick={() => setModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialCampaigns.map((campaign) => (
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

      <CampaignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        campaignType="social"
        onSubmit={async (data) => {
          await createCampaign.mutateAsync(data);
        }}
      />
    </div>
  );
}
