import { storage } from "./storage";

const agentAvatar1 = "/attached_assets/generated_images/Female_agent_professional_headshot_0351dc22.png";
const agentAvatar2 = "/attached_assets/generated_images/Male_agent_professional_headshot_a558128b.png";

async function seed() {
  console.log("Seeding database...");

  const agent1 = await storage.createAgent({
    name: "Sarah Johnson",
    email: "sarah.johnson@realtyco.com",
    avatar: agentAvatar1,
    deals: 18,
    revenue: "1200000",
    conversion: "42",
  });

  const agent2 = await storage.createAgent({
    name: "Mike Chen",
    email: "mike.chen@realtyco.com",
    avatar: agentAvatar2,
    deals: 15,
    revenue: "980000",
    conversion: "38",
  });

  const leads = await Promise.all([
    storage.createLead({
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      score: "hot",
      source: "Website Form",
      agentName: "Mike Chen",
      agentAvatar: agentAvatar2,
      phase: "new-lead",
      lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000),
      value: "$500K",
    }),
    storage.createLead({
      name: "David Martinez",
      email: "d.martinez@email.com",
      phone: "(555) 234-5678",
      score: "warm",
      source: "Referral",
      agentName: "Sarah Johnson",
      agentAvatar: agentAvatar1,
      phase: "in-contact",
      lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000),
      value: "$750K",
    }),
    storage.createLead({
      name: "Emily Rodriguez",
      email: "emily.rod@email.com",
      phone: "(555) 345-6789",
      score: "hot",
      source: "Google Ads",
      agentName: "Mike Chen",
      agentAvatar: agentAvatar2,
      phase: "active",
      lastContact: new Date(Date.now() - 5 * 60 * 60 * 1000),
      value: "$625K",
    }),
    storage.createLead({
      name: "Michael Chen",
      email: "michael.c@email.com",
      phone: "(555) 456-7890",
      score: "warm",
      source: "Open House",
      agentName: "Sarah Johnson",
      agentAvatar: agentAvatar1,
      phase: "closed",
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      value: "$850K",
      isClient: true,
      closedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }),
  ]);

  await Promise.all([
    storage.createDeal({
      title: "456 Oak Street Purchase",
      value: "850000",
      stage: "under-contract",
      contactName: "Michael Chen",
      agentName: "Sarah Johnson",
      agentAvatar: agentAvatar1,
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      probability: 85,
      notes: "Closing scheduled for next month",
    }),
    storage.createDeal({
      title: "789 Downtown Condo",
      value: "625000",
      stage: "qualification",
      contactName: "Emily Rodriguez",
      agentName: "Mike Chen",
      agentAvatar: agentAvatar2,
      closingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      probability: 45,
      notes: "Buyer pre-approved for mortgage",
    }),
  ]);

  await Promise.all([
    storage.createListing({
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      price: "1250000",
      bedrooms: 3,
      bathrooms: "2.5",
      sqft: 2100,
      status: "Active",
      type: "Single Family",
      agentName: "Sarah Johnson",
      agentAvatar: agentAvatar1,
    }),
    storage.createListing({
      address: "456 Oak Avenue",
      city: "San Jose",
      state: "CA",
      price: "850000",
      bedrooms: 2,
      bathrooms: "2",
      sqft: 1500,
      status: "Pending",
      type: "Condo",
      agentName: "Mike Chen",
      agentAvatar: agentAvatar2,
    }),
    storage.createListing({
      address: "789 Downtown Plaza",
      city: "San Francisco",
      state: "CA",
      price: "625000",
      bedrooms: 2,
      bathrooms: "1.5",
      sqft: 1200,
      status: "Active",
      type: "Condo",
      agentName: "Sarah Johnson",
      agentAvatar: agentAvatar1,
    }),
  ]);

  await Promise.all([
    storage.createActivity({
      type: "call",
      title: "Call with Sarah Johnson",
      description: "Discussed property requirements for Beverly Hills area",
      agentName: "Mike Chen",
      agentAvatar: agentAvatar2,
      relatedEntityType: "lead",
      relatedEntityId: leads[0].id,
    }),
    storage.createActivity({
      type: "email",
      title: "Sent listing to David Martinez",
      description: "567 Downtown Plaza - $625K condo in San Francisco",
      agentName: "Sarah Johnson",
      relatedEntityType: "lead",
      relatedEntityId: leads[1].id,
    }),
    storage.createActivity({
      type: "meeting",
      title: "Property showing scheduled",
      description: "890 Suburban Drive with Emily Rodriguez",
      agentName: "Mike Chen",
      relatedEntityType: "lead",
      relatedEntityId: leads[2].id,
    }),
    storage.createActivity({
      type: "deal",
      title: "Deal moved to Under Contract",
      description: "456 Oak Street - Michael Chen's purchase",
      agentName: "Sarah Johnson",
      relatedEntityType: "deal",
    }),
  ]);

  await storage.createOrUpdateAnalytics({
    date: new Date(),
    newLeads: 24,
    pipelineValue: "2400000",
    conversionRate: "32",
    dealsClosed: 12,
    revenueBySource: {
      "Website Form": 850000,
      "Referral": 625000,
      "Google Ads": 500000,
      "Open House": 425000,
    },
  });

  await Promise.all([
    storage.createFollowUp({
      leadId: leads[3].id,
      type: "email",
      title: "Quarterly Check-in",
      description: "Send market update and new listings",
      scheduledDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      recurring: "quarterly",
      completed: false,
    }),
    storage.createFollowUp({
      leadId: leads[3].id,
      type: "call",
      title: "Annual Review Call",
      description: "Discuss portfolio and potential upgrades",
      scheduledDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      recurring: "annual",
      completed: false,
    }),
  ]);

  await storage.createNote({
    leadId: leads[3].id,
    content: "Client very satisfied with purchase process. Mentioned potential interest in investment properties in the future.",
    createdBy: "Sarah Johnson",
  });

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
