export interface MarketplaceItem {
  id: string;
  category: string;
  tier: number;
  title: string;
  description: string;
  price: number;
  icon: string;
  tags: string[];
}

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    category: "Starter",
    tier: 1,
    title: "24/7 Lead Capture & Response",
    description: "Instantly engages web leads via chat and email.",
    price: 10000,
    icon: "MessageSquare",
    tags: ["Foundation", "AI-Powered"]
  },
  {
    id: "2",
    category: "Starter",
    tier: 1,
    title: "Booking Agent",
    description: "Automated appointment scheduling and calendar sync.",
    price: 10000,
    icon: "Calendar",
    tags: ["Foundation"]
  },
  {
    id: "3",
    category: "Starter",
    tier: 1,
    title: "Client Communication Preference Tracking",
    description: "Logs buyer/seller preferred contact channels.",
    price: 10000,
    icon: "Phone",
    tags: ["Foundation"]
  },
  {
    id: "4",
    category: "Starter",
    tier: 1,
    title: "Virtual Tour Coordination",
    description: "Schedules and delivers virtual tour links.",
    price: 10000,
    icon: "Video",
    tags: ["Foundation"]
  },
  {
    id: "5",
    category: "Starter",
    tier: 1,
    title: "Voice Assistant",
    description: "Basic real-estate Q&A via voice commands.",
    price: 10000,
    icon: "Mic",
    tags: ["Foundation", "Beta"]
  },
  {
    id: "6",
    category: "Starter",
    tier: 1,
    title: "Intelligent Assistant",
    description: "Automates common FAQs and workflows.",
    price: 10000,
    icon: "Bot",
    tags: ["Foundation", "AI-Powered"]
  },
  {
    id: "7",
    category: "Growth",
    tier: 2,
    title: "Client Pre-Qualification",
    description: "Automates BANT checks via chatbot/forms.",
    price: 20000,
    icon: "CheckCircle",
    tags: ["Growth", "AI-Powered"]
  },
  {
    id: "8",
    category: "Growth",
    tier: 2,
    title: "Document Processing Automation",
    description: "Auto-extracts key data from contracts.",
    price: 20000,
    icon: "FileText",
    tags: ["Growth"]
  },
  {
    id: "9",
    category: "Growth",
    tier: 2,
    title: "Rate Pricing Engine",
    description: "Dynamic interest rate calculators.",
    price: 20000,
    icon: "Percent",
    tags: ["Growth"]
  },
  {
    id: "10",
    category: "Growth",
    tier: 2,
    title: "Marketing Automation for Listings",
    description: "Drip & broadcast campaigns for properties.",
    price: 20000,
    icon: "TrendingUp",
    tags: ["Growth"]
  },
  {
    id: "11",
    category: "Growth",
    tier: 2,
    title: "Budget Range Prediction",
    description: "Affordability estimates based on DTI.",
    price: 20000,
    icon: "DollarSign",
    tags: ["Growth", "AI-Powered"]
  },
  {
    id: "12",
    category: "Growth",
    tier: 2,
    title: "Transaction Milestone Tracking",
    description: "Stage alerts & reminders for deals.",
    price: 20000,
    icon: "Flag",
    tags: ["Growth"]
  },
  {
    id: "13",
    category: "Growth",
    tier: 2,
    title: "Referral Network Management",
    description: "Tracks partner referrals and rewards.",
    price: 20000,
    icon: "Share2",
    tags: ["Growth"]
  },
  {
    id: "14",
    category: "Growth",
    tier: 2,
    title: "Lead Generation Tool",
    description: "AI-powered prospect enrichment.",
    price: 20000,
    icon: "Users",
    tags: ["Growth", "AI-Powered"]
  },
  {
    id: "15",
    category: "Growth",
    tier: 2,
    title: "Listing Description Generator",
    description: "SEO-optimized property copywriting.",
    price: 20000,
    icon: "Edit",
    tags: ["Growth", "AI-Powered"]
  },
  {
    id: "16",
    category: "Elite",
    tier: 3,
    title: "Mortgage Lender Integration",
    description: "Real-time rate shopping via lender APIs.",
    price: 30000,
    icon: "Repeat",
    tags: ["Elite", "Integration"]
  },
  {
    id: "17",
    category: "Elite",
    tier: 3,
    title: "Automated Comparative Market Analysis",
    description: "Generates CMAs from MLS and public data.",
    price: 30000,
    icon: "BarChart2",
    tags: ["Elite", "AI-Powered"]
  },
  {
    id: "18",
    category: "Elite",
    tier: 3,
    title: "Portfolio Performance Tracking",
    description: "Investor dashboards for multiple properties.",
    price: 30000,
    icon: "PieChart",
    tags: ["Elite"]
  },
  {
    id: "19",
    category: "Elite",
    tier: 3,
    title: "Predictive Analytics Engine",
    description: "Forecasts market shifts & pricing trends.",
    price: 30000,
    icon: "Activity",
    tags: ["Elite", "AI-Powered"]
  },
  {
    id: "20",
    category: "Custom",
    tier: 0,
    title: "Custom Pack Builder",
    description: "Select any combination of tools to build your own package.",
    price: 0,
    icon: "Sliders",
    tags: ["Custom"]
  },
  {
    id: "21",
    category: "Standalone",
    tier: 1,
    title: "Blockchain Transaction Security",
    description: "Immutable audit trails via blockchain.",
    price: 30000,
    icon: "Shield",
    tags: ["Advanced"]
  },
  {
    id: "22",
    category: "Standalone",
    tier: 3,
    title: "Investment Property Analyzer",
    description: "ROI, cap rate, and cash flow projections.",
    price: 30000,
    icon: "LineChart",
    tags: ["Advanced"]
  }
];
