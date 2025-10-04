import { useState, useMemo } from "react";
import { SearchBar } from "@/components/crm/shared/search-bar";
import { FiltersBar } from "@/components/crm/shared/filters-bar";
import { ViewToggle, ViewType } from "@/components/crm/views/view-toggle";
import { LeadsGrid } from "@/components/crm/views/leads-grid";
import { LeadsTable } from "@/components/crm/views/leads-table";
import { RelationshipManager } from "@/components/crm/views/relationship-manager";
import { LeadFormDialog } from "@/components/crm/forms/lead-form-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download } from "lucide-react";
import { useLeads, useClientLeads, useDeleteLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { PhaseStatus } from "@/lib/phase-status";
import type { Lead } from "@shared/schema";

export default function Leads() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const { data: allLeads = [], isLoading } = useLeads();
  const { data: clientLeads = [] } = useClientLeads();
  const deleteLead = useDeleteLead();
  const { toast } = useToast();

  const leads = allLeads.filter(lead => !lead.isClient);
  const clients = clientLeads;

  const updatePhase = () => {};
  const addFollowUp = () => {};
  const addNote = () => {};
  const toggleFollowUp = () => {};

  const filters = [
    {
      name: "phase",
      placeholder: "Status",
      options: [
        { label: "New Lead", value: "new_lead" },
        { label: "In Contact", value: "in_contact" },
        { label: "Active", value: "active" },
        { label: "Negotiation", value: "negotiation" },
        { label: "Closed", value: "closed" },
      ],
    },
    {
      name: "score",
      placeholder: "Lead Score",
      options: [
        { label: "Hot", value: "hot" },
        { label: "Warm", value: "warm" },
        { label: "Cold", value: "cold" },
      ],
    },
    {
      name: "source",
      placeholder: "Source",
      options: [
        { label: "Website", value: "website" },
        { label: "Referral", value: "referral" },
        { label: "Google Ads", value: "google" },
        { label: "Social Media", value: "social" },
      ],
    },
    {
      name: "agent",
      placeholder: "Assigned Agent",
      options: [
        { label: "Sarah Johnson", value: "sarah" },
        { label: "Mike Chen", value: "mike" },
        { label: "Lisa Wang", value: "lisa" },
      ],
    },
  ];

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    // Active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return;
      
      if (key === "phase") {
        filtered = filtered.filter((lead) => lead.phase === value);
      } else if (key === "score") {
        filtered = filtered.filter((lead) => lead.score === value);
      } else if (key === "source") {
        filtered = filtered.filter((lead) =>
          lead.source.toLowerCase().includes(value)
        );
      } else if (key === "agent") {
        filtered = filtered.filter((lead) =>
          lead.agentName?.toLowerCase().includes(value)
        );
      }
    });

    return filtered;
  }, [leads, searchQuery, activeFilters]);

  const handleAction = async (id: string, action: string) => {
    console.log(`Action ${action} on lead ${id}`);
    
    if (action === "edit") {
      const lead = allLeads.find(l => l.id === id);
      if (lead) {
        setSelectedLead(lead);
        setEditDialogOpen(true);
      }
    } else if (action === "delete") {
      if (confirm("Are you sure you want to delete this lead?")) {
        try {
          await deleteLead.mutateAsync(id);
          toast({
            title: "Lead deleted",
            description: "The lead has been successfully deleted.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete lead. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads in one place
          </p>
        </div>
        <div className="flex gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button variant="outline" data-testid="button-export-leads">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            data-testid="button-add-lead"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-leads">
            All Leads ({filteredLeads.length})
          </TabsTrigger>
          <TabsTrigger value="clients" data-testid="tab-clients">
            Clients ({clients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <SearchBar
              placeholder="Search leads by name, email, or phone..."
              onSearch={setSearchQuery}
            />
            <FiltersBar
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={(name, value) =>
                setActiveFilters((prev) => ({ ...prev, [name]: value }))
              }
              onClearAll={() => setActiveFilters({})}
            />
          </div>

          {view === "grid" ? (
            <LeadsGrid
              leads={filteredLeads as any}
              onPhaseChange={updatePhase}
              onAction={handleAction}
            />
          ) : (
            <LeadsTable
              leads={filteredLeads as any}
              onPhaseChange={updatePhase}
              onAction={handleAction}
            />
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <RelationshipManager
            clients={clients as any}
            onAddFollowUp={addFollowUp}
            onAddNote={addNote}
            onToggleFollowUp={toggleFollowUp}
          />
        </TabsContent>
      </Tabs>

      <LeadFormDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />
      
      <LeadFormDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        lead={selectedLead as any}
      />
    </div>
  );
}
