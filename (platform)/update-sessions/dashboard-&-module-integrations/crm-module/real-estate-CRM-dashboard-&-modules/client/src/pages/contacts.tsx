import { useState, useMemo } from "react";
import { SearchBar } from "@/components/crm/shared/search-bar";
import { ViewToggle, ViewType } from "@/components/crm/views/view-toggle";
import { LeadsGrid } from "@/components/crm/views/leads-grid";
import { LeadsTable } from "@/components/crm/views/leads-table";
import { RelationshipManager } from "@/components/crm/views/relationship-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download } from "lucide-react";
import { useLeadsState } from "@/hooks/use-leads-state";
import { Lead } from "@/types/crm";
import avatar1 from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";
import avatar2 from "@assets/generated_images/Male_agent_professional_headshot_a558128b.png";

//todo: remove mock functionality
const initialMockContacts: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    avatar: avatar1,
    score: "hot",
    source: "Referral",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    agentName: "Mike Chen",
    phase: "closed",
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextReminder: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    value: "$1.2M",
    isClient: true,
    closedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    followUps: [
      {
        id: "f1",
        type: "email",
        title: "Quarterly check-in",
        description: "See how they're settling in",
        scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        recurring: "quarterly",
        completed: false,
      },
      {
        id: "f2",
        type: "card",
        title: "Holiday card",
        scheduledDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        recurring: "annual",
        completed: false,
      },
    ],
    notes: [
      {
        id: "n1",
        content: "VIP client, purchased luxury condo. Looking to invest in more properties.",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdBy: "Mike Chen",
      },
      {
        id: "n2",
        content: "Referred two friends already - excellent referral source",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdBy: "Mike Chen",
      },
    ],
  },
  {
    id: "2",
    name: "David Martinez",
    email: "d.martinez@email.com",
    phone: "(555) 234-5678",
    avatar: avatar2,
    score: "warm",
    source: "Website Form",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    agentName: "Lisa Wang",
    phase: "closed",
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    value: "$475K",
    isClient: true,
    closedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    followUps: [
      {
        id: "f3",
        type: "call",
        title: "6-month follow-up call",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
      },
    ],
    notes: [
      {
        id: "n3",
        content: "First-time homebuyer, very happy with purchase",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        createdBy: "Lisa Wang",
      },
    ],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rod@email.com",
    phone: "(555) 345-6789",
    score: "hot",
    source: "Referral",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    phase: "active",
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextReminder: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    value: "$680K",
  },
  {
    id: "4",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(555) 456-7890",
    avatar: avatar1,
    score: "warm",
    source: "Google Ads",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    agentName: "Sarah Johnson",
    phase: "in_contact",
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    value: "$550K",
  },
  {
    id: "5",
    name: "Anna Thompson",
    email: "anna.t@email.com",
    phone: "(555) 567-8901",
    score: "hot",
    source: "Referral",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    phase: "closed",
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    value: "$890K",
    isClient: true,
    closedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    followUps: [],
    notes: [
      {
        id: "n4",
        content: "Seller - very professional, easy to work with",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        createdBy: "Current User",
      },
    ],
  },
  {
    id: "6",
    name: "Robert Wilson",
    email: "r.wilson@email.com",
    phone: "(555) 678-9012",
    avatar: avatar2,
    score: "hot",
    source: "Website Form",
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    agentName: "Mike Chen",
    phase: "closed",
    lastContact: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    value: "$2.1M",
    isClient: true,
    closedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    followUps: [
      {
        id: "f4",
        type: "meeting",
        title: "Investment portfolio review",
        scheduledDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        recurring: "biannual",
        completed: false,
      },
    ],
    notes: [
      {
        id: "n5",
        content: "Investor client - purchased commercial property, interested in more opportunities",
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        createdBy: "Mike Chen",
      },
    ],
  },
];

export default function Contacts() {
  const [view, setView] = useState<ViewType>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { leads, clients, updatePhase, addFollowUp, addNote, toggleFollowUp } =
    useLeadsState(initialMockContacts);

  const activeContacts = useMemo(() => {
    let filtered = leads.filter((lead) => !lead.isClient);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    return filtered;
  }, [leads, searchQuery]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;

    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query)
    );
  }, [clients, searchQuery]);

  const handleAction = (id: string, action: string) => {
    console.log(`Action ${action} on contact ${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground">
            Manage relationships with clients and prospects
          </p>
        </div>
        <div className="flex gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button variant="outline" data-testid="button-export-contacts">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-add-contact">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-contacts">
            All Contacts ({activeContacts.length})
          </TabsTrigger>
          <TabsTrigger value="clients" data-testid="tab-clients">
            Clients ({filteredClients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <SearchBar
            placeholder="Search contacts by name, email, or phone..."
            onSearch={setSearchQuery}
          />

          {view === "grid" ? (
            <LeadsGrid
              leads={activeContacts}
              onPhaseChange={updatePhase}
              onAction={handleAction}
            />
          ) : (
            <LeadsTable
              leads={activeContacts}
              onPhaseChange={updatePhase}
              onAction={handleAction}
            />
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {searchQuery && (
            <SearchBar
              placeholder="Search clients by name, email, or phone..."
              onSearch={setSearchQuery}
            />
          )}
          
          <RelationshipManager
            clients={filteredClients}
            onAddFollowUp={addFollowUp}
            onAddNote={addNote}
            onToggleFollowUp={toggleFollowUp}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
