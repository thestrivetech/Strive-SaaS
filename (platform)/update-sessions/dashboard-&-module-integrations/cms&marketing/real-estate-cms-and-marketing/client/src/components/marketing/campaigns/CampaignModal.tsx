import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const campaignFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  status: z.enum(["draft", "scheduled", "active", "completed", "paused"]),
  scheduledDate: z.date().optional(),
  platforms: z.array(z.string()).optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  campaignType: "email" | "social";
  mode?: "create" | "edit";
  initialData?: {
    title: string;
    content: string | null;
    status: string;
    scheduledDate?: Date | null;
    platforms?: string[] | null;
  };
}

const socialPlatforms = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter" },
];

export default function CampaignModal({ open, onOpenChange, onSubmit, campaignType, mode = "create", initialData }: CampaignModalProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "draft",
      platforms: [],
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        title: initialData.title || "",
        content: initialData.content || "",
        status: initialData.status as "draft" | "scheduled" | "active" | "completed" | "paused",
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate) : undefined,
        platforms: initialData.platforms || [],
      });
    } else if (mode === "create") {
      form.reset({
        title: "",
        content: "",
        status: "draft",
        platforms: [],
      });
    }
  }, [mode, initialData, form]);

  const status = form.watch("status");

  const handleSubmit = async (data: CampaignFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit campaign:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Campaign" : "Edit Campaign"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Fill in the details to create a new marketing campaign" 
              : "Update your campaign details"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {campaignType === "email" ? "Email Campaign Title" : "Social Post Title"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., New Listing Announcement" 
                      {...field} 
                      data-testid="input-campaign-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {campaignType === "social" && (
              <FormField
                control={form.control}
                name="platforms"
                render={() => (
                  <FormItem>
                    <FormLabel>Social Media Platforms</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {socialPlatforms.map((platform) => (
                        <FormField
                          key={platform.id}
                          control={form.control}
                          name="platforms"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    const updated = checked
                                      ? [...current, platform.id]
                                      : current.filter((value) => value !== platform.id);
                                    field.onChange(updated);
                                  }}
                                  data-testid={`checkbox-platform-${platform.id}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {platform.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={campaignType === "email" 
                        ? "Write your email content here..." 
                        : "Write your social media post..."}
                      rows={6}
                      {...field}
                      data-testid="textarea-campaign-content"
                    />
                  </FormControl>
                  <FormDescription>
                    {campaignType === "email" 
                      ? "Craft an engaging email message for your recipients" 
                      : "Create a compelling social media post (max 280 characters for Twitter)"}
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
                      <SelectTrigger data-testid="select-campaign-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      <SelectItem value="active">Active / Send Now</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "scheduled" && (
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Scheduled Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-date"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Choose when you want this campaign to go live
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                data-testid="button-submit-campaign"
              >
                {form.formState.isSubmitting ? "Saving..." : mode === "create" ? "Create Campaign" : "Update Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
