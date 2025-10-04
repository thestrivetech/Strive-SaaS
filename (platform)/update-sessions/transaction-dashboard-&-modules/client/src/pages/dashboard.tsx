import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoopCard from "@/components/transaction/loop-card";
import ActivityFeed from "@/components/transaction/activity-feed";
import { Plus, TrendingUp, FileText, Users, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useLoops, useCreateLoop } from "@/lib/hooks/useLoops";
import { useActivities } from "@/lib/hooks/useActivities";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLoopSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = insertLoopSchema.extend({
  closingDate: z.string().min(1, "Closing date is required"),
  listingPrice: z.string().min(1, "Listing price is required"),
});

export default function Dashboard() {
  const [createLoopOpen, setCreateLoopOpen] = useState(false);
  const { data: loops, isLoading: loopsLoading } = useLoops();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const createLoopMutation = useCreateLoop();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyAddress: "",
      transactionType: "",
      status: "draft",
      listingPrice: "",
      closingDate: "",
      progress: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createLoopMutation.mutateAsync(values);
      setCreateLoopOpen(false);
      form.reset();
      toast({
        title: "Loop created",
        description: "New transaction loop has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create loop. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    {
      title: "Active Loops",
      value: analytics?.activeLoops?.toString() || "0",
      change: "+2 this week",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Pending Signatures",
      value: analytics?.pendingSignatures?.toString() || "0",
      change: "3 urgent",
      icon: CheckCircle,
      color: "text-amber-600",
    },
    {
      title: "Total Parties",
      value: analytics?.totalParties?.toString() || "0",
      change: "+5 this month",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Closing This Month",
      value: analytics?.closingThisMonth?.toString() || "0",
      change: `$${analytics?.totalVolume ? (analytics.totalVolume / 1000000).toFixed(1) : "0"}M value`,
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 0;
    return parseFloat(price);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground">Manage your real estate transactions</p>
        </div>
        <Dialog open={createLoopOpen} onOpenChange={setCreateLoopOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-loop">
              <Plus className="w-4 h-4 mr-2" />
              Create Loop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Transaction Loop</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="propertyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} data-testid="input-property-address" />
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
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Purchase Agreement">Purchase Agreement</SelectItem>
                          <SelectItem value="Listing Agreement">Listing Agreement</SelectItem>
                          <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="listingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="450000" {...field} data-testid="input-listing-price" />
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
                      <FormLabel>Expected Closing Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-closing-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateLoopOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoopMutation.isPending} data-testid="button-submit">
                    {createLoopMutation.isPending ? "Creating..." : "Create Loop"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-value-${idx}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active">
            Active
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All Loops
          </TabsTrigger>
          <TabsTrigger value="closing" data-testid="tab-closing">
            Closing Soon
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {loopsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loops
                ?.filter(
                  (l) => l.status === "active" || l.status === "underContract" || l.status === "closing"
                )
                .map((loop) => (
                  <LoopCard
                    key={loop.id}
                    id={loop.id}
                    propertyAddress={loop.propertyAddress}
                    status={loop.status as any}
                    transactionType={loop.transactionType}
                    listingPrice={formatPrice(loop.listingPrice)}
                    closingDate={formatDate(loop.closingDate)}
                    progress={loop.progress}
                    parties={loop.parties || []}
                    documentCount={loop.documentCount || 0}
                    onView={() => (window.location.href = `/loop/${loop.id}`)}
                    onEdit={() => console.log("Edit loop:", loop.id)}
                    onDelete={() => console.log("Delete loop:", loop.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          {loopsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loops?.map((loop) => (
                <LoopCard
                  key={loop.id}
                  id={loop.id}
                  propertyAddress={loop.propertyAddress}
                  status={loop.status as any}
                  transactionType={loop.transactionType}
                  listingPrice={formatPrice(loop.listingPrice)}
                  closingDate={formatDate(loop.closingDate)}
                  progress={loop.progress}
                  parties={loop.parties || []}
                  documentCount={loop.documentCount || 0}
                  onView={() => (window.location.href = `/loop/${loop.id}`)}
                  onEdit={() => console.log("Edit loop:", loop.id)}
                  onDelete={() => console.log("Delete loop:", loop.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="closing" className="space-y-4">
          {loopsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loops
                ?.filter((l) => l.status === "closing")
                .map((loop) => (
                  <LoopCard
                    key={loop.id}
                    id={loop.id}
                    propertyAddress={loop.propertyAddress}
                    status={loop.status as any}
                    transactionType={loop.transactionType}
                    listingPrice={formatPrice(loop.listingPrice)}
                    closingDate={formatDate(loop.closingDate)}
                    progress={loop.progress}
                    parties={loop.parties || []}
                    documentCount={loop.documentCount || 0}
                    onView={() => (window.location.href = `/loop/${loop.id}`)}
                    onEdit={() => console.log("Edit loop:", loop.id)}
                    onDelete={() => console.log("Delete loop:", loop.id)}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityFeed activities={activities || []} maxHeight="h-80" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-quick-upload">
              <FileText className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-quick-signature">
              <CheckCircle className="w-4 h-4 mr-2" />
              Request Signature
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-quick-party">
              <Users className="w-4 h-4 mr-2" />
              Add Party
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
