import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const pageFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "URL slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens"),
  status: z.enum(["draft", "published", "scheduled"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
});

type PageFormData = z.infer<typeof pageFormSchema>;

interface PageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PageFormData) => Promise<void>;
  defaultValues?: Partial<PageFormData>;
  mode?: "create" | "edit";
}

export default function PageModal({ open, onOpenChange, onSubmit, defaultValues, mode = "create" }: PageModalProps) {
  const form = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      form.reset({
        title: defaultValues.title || "",
        slug: defaultValues.slug || "",
        status: defaultValues.status || "draft",
        metaTitle: defaultValues.metaTitle || "",
        metaDescription: defaultValues.metaDescription || "",
      });
    } else if (mode === "create") {
      form.reset({
        title: "",
        slug: "",
        status: "draft",
        metaTitle: "",
        metaDescription: "",
      });
    }
  }, [mode, defaultValues, form]);

  const handleSubmit = async (data: PageFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit page:", error);
    }
  };

  const generateSlug = () => {
    const title = form.getValues("title");
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    form.setValue("slug", slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Page" : "Edit Page"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new landing page for your real estate marketing" 
              : "Update your page details"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Luxury Downtown Condos" 
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        if (mode === "create" && !form.getValues("slug")) {
                          generateSlug();
                        }
                      }}
                      data-testid="input-page-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="luxury-downtown-condos" 
                        {...field} 
                        data-testid="input-page-slug"
                      />
                    </FormControl>
                    {mode === "create" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSlug}
                      >
                        Generate
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    This will be the URL: /pages/{field.value || "your-slug"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-page-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (SEO)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Luxury Downtown Condos | Elite Realty" 
                      {...field} 
                      data-testid="input-meta-title"
                    />
                  </FormControl>
                  <FormDescription>
                    Displayed in search engine results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (SEO)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description for search engines..."
                      rows={3}
                      {...field}
                      data-testid="textarea-meta-description"
                    />
                  </FormControl>
                  <FormDescription>
                    {(field.value?.length || 0)}/160 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                data-testid="button-submit-page"
              >
                {form.formState.isSubmitting ? "Saving..." : mode === "create" ? "Create Page" : "Update Page"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
