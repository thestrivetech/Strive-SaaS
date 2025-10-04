import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentCard from "@/components/transaction/document-card";
import { Upload, FolderOpen } from "lucide-react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useLoops } from "@/lib/hooks/useLoops";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const uploadDocumentSchema = z.object({
  loopId: z.string().min(1, "Transaction is required"),
  name: z.string().min(1, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  size: z.string().default("1.0 MB"),
  version: z.number().default(1),
  uploadedBy: z.string().min(1, "Uploader name is required"),
  status: z.string().default("pending"),
});

type UploadDocumentForm = z.infer<typeof uploadDocumentSchema>;

export default function Documents() {
  const { data: documents, isLoading } = useDocuments();
  const { data: loops } = useLoops();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<UploadDocumentForm>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      loopId: "",
      name: "",
      type: "",
      size: "1.0 MB",
      version: 1,
      uploadedBy: "",
      status: "pending",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (data: UploadDocumentForm) => apiRequest('POST', '/api/documents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setUploadDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadDocumentForm) => {
    uploadMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete);
    }
  };

  const handleDownload = (name: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${name}...`,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Document Library</h1>
          <p className="text-muted-foreground">Manage all transaction documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-folders">
            <FolderOpen className="w-4 h-4 mr-2" />
            Folders
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent data-testid="dialog-upload-document">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to a transaction loop
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="loopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Loop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-loop">
                          <SelectValue placeholder="Select transaction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loops?.map(loop => (
                          <SelectItem key={loop.id} value={loop.id}>
                            {loop.propertyAddress}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Purchase_Agreement.pdf" 
                        data-testid="input-document-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-document-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">DOC</SelectItem>
                          <SelectItem value="docx">DOCX</SelectItem>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1.5 MB" 
                          data-testid="input-document-size"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="uploadedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uploaded By</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        data-testid="input-uploader-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setUploadDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending}
                  data-testid="button-submit"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-document">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" data-testid={`skeleton-document-${i}`} />
          ))
        ) : documents && documents.length > 0 ? (
          documents.map((doc) => {
            const now = Date.now();
            const updated = new Date(doc.updatedAt).getTime();
            const diffMinutes = Math.floor((now - updated) / 60000);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let lastModified = "";
            if (diffMinutes < 1) lastModified = "just now";
            else if (diffMinutes < 60) lastModified = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            else if (diffHours < 24) lastModified = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            else lastModified = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

            return (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                name={doc.name}
                type={doc.type as any}
                size={doc.size}
                version={doc.version}
                lastModified={lastModified}
                uploadedBy={doc.uploadedBy}
                status={doc.status as any}
                onView={() => handleDownload(doc.name)}
                onDownload={() => handleDownload(doc.name)}
                onDelete={() => handleDelete(doc.id)}
              />
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No documents found
          </div>
        )}
      </div>
    </div>
  );
}
