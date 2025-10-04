import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Search, Image as ImageIcon, Video, FileText, Trash2, Eye } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Media } from "@shared/schema";
import { insertMediaSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const uploadMediaSchema = insertMediaSchema.extend({
  tags: z.array(z.string()).optional(),
});

type UploadMediaForm = z.infer<typeof uploadMediaSchema>;

export default function MediaLibrary() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Media | null>(null);
  const [deleteItem, setDeleteItem] = useState<Media | null>(null);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<UploadMediaForm>({
    resolver: zodResolver(uploadMediaSchema),
    defaultValues: {
      name: "",
      type: "image",
      url: "",
      size: 0,
      tags: [],
    },
  });

  useEffect(() => {
    if (!uploadDialogOpen) {
      form.reset();
      setTagInput("");
    }
  }, [uploadDialogOpen, form]);

  const { data: mediaItems = [], isLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: UploadMediaForm) => {
      const payload = {
        ...data,
        tags: data.tags && data.tags.length > 0 ? data.tags : null,
      };
      return apiRequest("POST", "/api/media", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
      setUploadDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
      setDeleteItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mediaItems.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [mediaItems]);

  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || item.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [mediaItems, searchQuery, selectedTag]);

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit = (data: UploadMediaForm) => {
    createMutation.mutate(data);
  };

  const addTag = () => {
    const currentTags = form.getValues("tags") || [];
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(t => t !== tag));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">Loading media...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card data-testid="card-media-library">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Upload and manage your marketing assets</CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-media">
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-media"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                data-testid="button-tag-all"
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  data-testid={`button-tag-${tag}`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery || selectedTag ? "No media found matching your filters" : "No media uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover-elevate overflow-hidden"
                  data-testid={`card-media-${item.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          {getIcon(item.type)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setPreviewItem(item)}
                          data-testid={`button-preview-${item.id}`}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setDeleteItem(item)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate" data-testid={`text-name-${item.id}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent data-testid="dialog-upload-media">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add a new media file to your library
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., property-image.jpg"
                        {...field}
                        data-testid="input-upload-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-upload-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                        data-testid="input-upload-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (bytes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-upload-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="input-upload-tag"
                  />
                  <Button type="button" onClick={addTag} variant="outline" data-testid="button-add-tag">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(form.watch("tags") || []).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                      data-testid={`badge-tag-${tag}`}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-upload"
                >
                  {createMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={previewItem !== null} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl" data-testid="dialog-preview-media">
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
            <DialogDescription>
              {previewItem && (
                <>
                  {previewItem.type} • {formatFileSize(previewItem.size)} • Uploaded {format(new Date(previewItem.uploadedAt), "MMM dd, yyyy")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewItem?.type === "image" && (
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="w-full rounded-md"
                data-testid="img-preview"
              />
            )}
            {previewItem?.type === "video" && (
              <div className="bg-muted rounded-md p-8 text-center">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Video preview not available</p>
              </div>
            )}
            {previewItem?.type === "document" && (
              <div className="bg-muted rounded-md p-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Document preview not available</p>
              </div>
            )}
            <div>
              <Label>URL</Label>
              <Input value={previewItem?.url || ""} readOnly data-testid="input-preview-url" />
            </div>
            {previewItem?.tags && previewItem.tags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {previewItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteItem !== null} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent data-testid="dialog-delete-media">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
