import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageModal from "@/components/marketing/cms/PageModal";
import PageViewDialog from "@/components/marketing/cms/PageViewDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import type { Page } from "@shared/schema";

export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [viewingPage, setViewingPage] = useState<Page | null>(null);
  const { toast } = useToast();

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const createPage = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/pages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Page created",
        description: "Your page has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/pages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Page updated",
        description: "Your page has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClick = () => {
    setModalMode("create");
    setEditingPage(null);
    setModalOpen(true);
  };

  const handleEditClick = (page: Page) => {
    setModalMode("edit");
    setEditingPage(page);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPage(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPage) {
      await deletePage.mutateAsync(selectedPage);
      setDeleteDialogOpen(false);
      setSelectedPage(null);
    }
  };

  const handlePageSubmit = async (data: any) => {
    if (modalMode === "edit" && editingPage) {
      await updatePage.mutateAsync({ id: editingPage.id, data });
    } else {
      await createPage.mutateAsync(data);
    }
  };

  const handleViewClick = (page: Page) => {
    setViewingPage(page);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      published: { label: "Published", className: "bg-chart-3/20 text-chart-3" },
      draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
      scheduled: { label: "Scheduled", className: "bg-chart-4/20 text-chart-4" },
    };
    const info = config[status] || config.draft;
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pages & CMS</h1>
          <p className="text-muted-foreground mt-1">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pages & CMS</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage your landing pages and content
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>Your published and draft landing pages</CardDescription>
            </div>
            <Button onClick={handleCreateClick} data-testid="button-create-page">
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-pages"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No pages match your search" : "No pages yet"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateClick} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPages.map((page) => (
                <Card key={page.id} className="hover-elevate" data-testid={`card-page-${page.id}`}>
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{page.title}</h3>
                        {getStatusBadge(page.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {page.views.toLocaleString()} views
                        </span>
                        <span>Modified {new Date(page.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-${page.id}`}
                        onClick={() => handleViewClick(page)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        data-testid={`button-edit-${page.id}`}
                        onClick={() => handleEditClick(page)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-more-${page.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(page.id)}
                            className="text-destructive focus:text-destructive"
                            data-testid={`menuitem-delete-${page.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handlePageSubmit}
        mode={modalMode}
        defaultValues={editingPage ? {
          title: editingPage.title,
          slug: editingPage.slug,
          status: editingPage.status as "draft" | "published" | "scheduled",
          metaTitle: editingPage.metaTitle || "",
          metaDescription: editingPage.metaDescription || "",
        } : undefined}
      />

      <PageViewDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setViewingPage(null);
        }}
        page={viewingPage ? {
          ...viewingPage,
          status: viewingPage.status as "draft" | "published" | "scheduled",
          updatedAt: new Date(viewingPage.updatedAt).toISOString(),
        } : null}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Page?"
        description="Are you sure you want to delete this page? This action cannot be undone and the page will be permanently removed."
      />
    </div>
  );
}
