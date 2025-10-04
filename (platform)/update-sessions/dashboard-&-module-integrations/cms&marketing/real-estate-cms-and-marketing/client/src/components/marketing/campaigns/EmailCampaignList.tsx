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
import CampaignViewDialog from "./CampaignViewDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import type { Campaign } from "@shared/schema";

export default function EmailCampaignList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/campaigns", { ...data, type: "email" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your email campaign has been created successfully.",
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

  const updateCampaign = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/campaigns/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setEditingCampaign(null);
      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateCampaign = useMutation({
    mutationFn: async (id: string) => {
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) throw new Error("Campaign not found");
      
      return await apiRequest("POST", "/api/campaigns", {
        ...campaign,
        id: undefined,
        title: `${campaign.title} (Copy)`,
        status: "draft",
        createdAt: undefined,
        updatedAt: undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign duplicated",
        description: "A copy of the campaign has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setEditingCampaign(campaign);
    }
  };

  const handleDelete = (id: string) => {
    setCampaignToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (campaignToDelete) {
      await deleteCampaign.mutateAsync(campaignToDelete);
      setCampaignToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateCampaign.mutateAsync(id);
  };

  const handleView = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setViewingCampaign(campaign);
      setViewDialogOpen(true);
    }
  };

  const emailCampaigns = campaigns
    .filter((c) => c.type === "email")
    .filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Loading campaigns...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="section-email-campaigns">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Create and manage your email marketing campaigns</CardDescription>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              data-testid="button-create-email-campaign"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-campaigns"
            />
          </div>
        </CardHeader>
      </Card>

      {emailCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No email campaigns found</p>
            <Button onClick={() => setModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emailCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={{
                ...campaign,
                status: campaign.status as "draft" | "scheduled" | "active" | "completed" | "paused",
                type: campaign.type as "email" | "social",
                scheduledDate: campaign.scheduledDate ? new Date(campaign.scheduledDate).toISOString() : undefined,
              }}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      <CampaignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        campaignType="email"
        mode="create"
        onSubmit={async (data) => {
          await createCampaign.mutateAsync(data);
        }}
      />

      <CampaignModal
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
        campaignType="email"
        mode="edit"
        initialData={editingCampaign || undefined}
        onSubmit={async (data) => {
          if (editingCampaign) {
            await updateCampaign.mutateAsync({ id: editingCampaign.id, data });
          }
        }}
      />

      <CampaignViewDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setViewingCampaign(null);
        }}
        campaign={viewingCampaign ? {
          ...viewingCampaign,
          status: viewingCampaign.status as "draft" | "scheduled" | "active" | "completed" | "paused",
          type: viewingCampaign.type as "email" | "social",
          scheduledDate: viewingCampaign.scheduledDate ? new Date(viewingCampaign.scheduledDate).toISOString() : undefined,
        } : null}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
      />
    </div>
  );
}
