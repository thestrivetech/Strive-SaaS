import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoopCard from "@/components/transaction/loop-card";
import { Plus, Filter } from "lucide-react";
import { useLoops, useUpdateLoop } from "@/lib/hooks/useLoops";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoopSchema, type Loop } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createLoopFormSchema = z.object({
  propertyAddress: z.string().min(5, "Property address must be at least 5 characters"),
  transactionType: z.string().min(1, "Transaction type is required"),
  status: z.string().default("draft"),
  listingPrice: z.string()
    .optional()
    .transform(val => val && val.trim() !== '' ? val : undefined)
    .refine(val => val === undefined || !isNaN(Number(val)), {
      message: "Listing price must be a valid number",
    }),
  closingDate: z.string()
    .optional()
    .transform(val => val && val.trim() !== '' ? val : undefined)
    .refine(val => val === undefined || !isNaN(Date.parse(val)), {
      message: "Closing date must be a valid date",
    }),
  progress: z.number().default(0),
});

type CreateLoopForm = z.infer<typeof createLoopFormSchema>;

export default function Transactions() {
  const { data: loops, isLoading } = useLoops();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);
  const { toast } = useToast();
  const updateLoopMutation = useUpdateLoop();

  const form = useForm<CreateLoopForm>({
    resolver: zodResolver(createLoopFormSchema),
    defaultValues: {
      propertyAddress: "",
      transactionType: "",
      status: "draft",
      listingPrice: "",
      closingDate: "",
      progress: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLoopForm) => apiRequest('POST', '/api/loops', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Loop created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loop",
        variant: "destructive",
      });
    },
  });

  const editForm = useForm<{ status: string }>({
    defaultValues: {
      status: "draft",
    },
  });

  const onSubmit = (data: CreateLoopForm) => {
    createMutation.mutate(data);
  };

  const handleEdit = (loop: Loop) => {
    setSelectedLoop(loop);
    editForm.reset({ status: loop.status });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (data: { status: string }) => {
    if (selectedLoop) {
      updateLoopMutation.mutate(
        { id: selectedLoop.id, data: { status: data.status } },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedLoop(null);
            toast({
              title: "Success",
              description: "Loop status updated successfully",
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update loop status",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">All Transactions</h1>
          <p className="text-muted-foreground">Manage all transaction loops</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create">
            <Plus className="w-4 h-4 mr-2" />
            Create Loop
          </Button>
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-loop">
          <DialogHeader>
            <DialogTitle>Create New Transaction Loop</DialogTitle>
            <DialogDescription>
              Enter the details for the new real estate transaction loop
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main St, City, State ZIP" 
                        data-testid="input-property-address"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-transaction-type">
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Purchase Agreement">Purchase Agreement</SelectItem>
                        <SelectItem value="Listing Agreement">Listing Agreement</SelectItem>
                        <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                        <SelectItem value="Refinance">Refinance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="listingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="450000" 
                          data-testid="input-listing-price"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          data-testid="input-closing-date"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Loop"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-loop">
          <DialogHeader>
            <DialogTitle>Update Loop Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedLoop?.propertyAddress}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="underContract">Under Contract</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateLoopMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateLoopMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" data-testid={`skeleton-loop-${i}`} />
          ))
        ) : (
          loops?.map((loop) => (
            <LoopCard
              key={loop.id}
              id={loop.id}
              propertyAddress={loop.propertyAddress}
              status={loop.status as any}
              transactionType={loop.transactionType}
              listingPrice={loop.listingPrice ? parseFloat(loop.listingPrice) : 0}
              closingDate={loop.closingDate ? new Date(loop.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}
              progress={loop.progress}
              parties={loop.parties || []}
              documentCount={loop.documentCount || 0}
              onView={() => console.log('View loop:', loop.id)}
              onEdit={() => handleEdit(loop)}
              onDelete={() => console.log('Delete loop:', loop.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
