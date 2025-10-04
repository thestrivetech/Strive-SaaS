import { useState } from "react";
import PartyCard from "@/components/transaction/party-card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useParties } from "@/lib/hooks/useParties";
import { useLoops } from "@/lib/hooks/useLoops";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartySchema, type Party } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const createPartyFormSchema = insertPartySchema.extend({
  loopId: z.string().min(1, "Transaction is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type CreatePartyForm = z.infer<typeof createPartyFormSchema>;

const availablePermissions = [
  { id: "view_documents", label: "View Documents" },
  { id: "upload_documents", label: "Upload Documents" },
  { id: "edit_documents", label: "Edit Documents" },
  { id: "sign_documents", label: "Sign Documents" },
  { id: "manage_tasks", label: "Manage Tasks" },
  { id: "view_financials", label: "View Financials" },
];

const roleOptions = [
  "Buyer",
  "Seller",
  "Listing Agent",
  "Buyer's Agent",
  "Lender",
  "Title Company",
  "Inspector",
  "Attorney",
  "Escrow Officer",
];

export default function Parties() {
  const { data: parties, isLoading } = useParties();
  const { data: loops } = useLoops();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const { toast } = useToast();

  const createForm = useForm<CreatePartyForm>({
    resolver: zodResolver(createPartyFormSchema),
    defaultValues: {
      loopId: "",
      name: "",
      role: "",
      email: "",
      phone: "",
      permissions: [],
    },
  });

  const permissionsForm = useForm<{ permissions: string[] }>({
    defaultValues: {
      permissions: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePartyForm) => apiRequest('POST', '/api/parties', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Party added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add party",
        variant: "destructive",
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      apiRequest('PATCH', `/api/parties/${id}`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      setPermissionsDialogOpen(false);
      setSelectedParty(null);
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/parties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parties'] });
      setDeleteDialogOpen(false);
      setSelectedParty(null);
      toast({
        title: "Success",
        description: "Party removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove party",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (data: CreatePartyForm) => {
    createMutation.mutate(data);
  };

  const handleEditPermissions = (party: Party) => {
    setSelectedParty(party);
    permissionsForm.reset({ permissions: party.permissions });
    setPermissionsDialogOpen(true);
  };

  const handlePermissionsSubmit = (data: { permissions: string[] }) => {
    if (selectedParty) {
      updatePermissionsMutation.mutate({ id: selectedParty.id, permissions: data.permissions });
    }
  };

  const handleRemove = (party: Party) => {
    setSelectedParty(party);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedParty) {
      deleteMutation.mutate(selectedParty.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Transaction Parties</h1>
          <p className="text-muted-foreground">Manage all parties involved in transactions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-add-party">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Party
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" data-testid={`skeleton-party-${i}`} />
          ))
        ) : parties && parties.length > 0 ? (
          parties.map((party) => (
            <PartyCard
              key={party.id}
              name={party.name}
              role={party.role}
              email={party.email}
              phone={party.phone || undefined}
              permissions={party.permissions}
              onRemove={() => handleRemove(party)}
              onEditPermissions={() => handleEditPermissions(party)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No parties found
          </div>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-add-party">
          <DialogHeader>
            <DialogTitle>Add Party to Transaction</DialogTitle>
            <DialogDescription>
              Invite a new party to participate in a transaction
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="loopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-loop">
                          <SelectValue placeholder="Select transaction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loops?.map((loop) => (
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
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" data-testid="input-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" data-testid="input-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" data-testid="input-phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-2">
                      {availablePermissions.map((perm) => (
                        <FormField
                          key={perm.id}
                          control={createForm.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(perm.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...current, perm.id]
                                        : current.filter((val) => val !== perm.id)
                                    );
                                  }}
                                  data-testid={`checkbox-${perm.id}`}
                                />
                              </FormControl>
                              <label className="text-sm">{perm.label}</label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-party">
                  {createMutation.isPending ? "Adding..." : "Add Party"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent data-testid="dialog-edit-permissions">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {selectedParty?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...permissionsForm}>
            <form onSubmit={permissionsForm.handleSubmit(handlePermissionsSubmit)} className="space-y-4">
              <FormField
                control={permissionsForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="space-y-2">
                      {availablePermissions.map((perm) => (
                        <FormField
                          key={perm.id}
                          control={permissionsForm.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(perm.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...current, perm.id]
                                        : current.filter((val) => val !== perm.id)
                                    );
                                  }}
                                  data-testid={`checkbox-edit-${perm.id}`}
                                />
                              </FormControl>
                              <label className="text-sm">{perm.label}</label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePermissionsMutation.isPending} data-testid="button-save-permissions">
                  {updatePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-party">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Party</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedParty?.name} from this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
