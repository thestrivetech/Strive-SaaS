// lib/modules/chatbot/config/industries/real-estate/solutions.ts

import { Solution } from '@/app/(chatbot)/types/industry';

export const realEstateSolutions: Record<string, Solution> = {
  property_search: {
    title: "AI-Powered Property Search",
    description: "Find your perfect home before it hits major sites like Zillow",
    benefits: [
      "Search across all MLS listings in real-time",
      "Get matched with properties before they go viral",
      "AI learns your preferences and improves suggestions",
      "Instant alerts when new matches hit the market",
      "Schedule showings directly from search results"
    ],
    cta: "Start Searching",
    ctaAction: "property_search",
    timeline: "Find properties immediately",
    roi: "Save weeks of searching and never miss your dream home"
  },

  prequalification: {
    title: "Instant Prequalification",
    description: "Know your budget and get preapproved in minutes",
    benefits: [
      "Calculate your exact buying power in under 5 minutes",
      "Real-time integration with top lenders",
      "Understand your debt-to-income ratio",
      "Get preapproval letter same day",
      "Strengthen your offers with proof of financing"
    ],
    cta: "Get Prequalified",
    ctaAction: "prequalification",
    timeline: "Prequalified in 5-10 minutes",
    roi: "Preapproved buyers are 3x more likely to have offers accepted"
  },

  market_analysis: {
    title: "Market Intelligence Dashboard",
    description: "Data-driven insights on pricing, trends, and investment opportunities",
    benefits: [
      "See real-time price trends by neighborhood",
      "Identify up-and-coming investment areas",
      "Compare multiple neighborhoods side-by-side",
      "Forecast appreciation rates with AI",
      "Access days-on-market analytics"
    ],
    cta: "Explore Market Data",
    ctaAction: "market_analysis",
    timeline: "Instant access to market insights",
    roi: "Make informed decisions backed by data, not guesswork"
  },

  lead_generation: {
    title: "AI Lead Generation System",
    description: "Capture and qualify leads 24/7 automatically",
    benefits: [
      "Never miss a lead - capture 24/7",
      "AI qualifies leads before they reach you",
      "Automated follow-up sequences",
      "Seamless CRM integration",
      "Track lead source and conversion rates"
    ],
    cta: "Book Demo",
    ctaAction: "booking",
    timeline: "Start capturing leads within 48 hours",
    roi: "Increase qualified leads by 200-300%"
  },

  transaction_management: {
    title: "Transaction Automation Platform",
    description: "Streamline closings and never miss a deadline",
    benefits: [
      "Track every milestone automatically",
      "Automated document processing with AI",
      "Real-time status updates for clients",
      "Compliance checklist and reminders",
      "Digital signature integration"
    ],
    cta: "See Demo",
    ctaAction: "booking",
    timeline: "Operational in 1-2 weeks",
    roi: "Close 30% more deals with same team"
  },

  communication_automation: {
    title: "24/7 Client Communication AI",
    description: "Respond instantly to every lead, any time of day",
    benefits: [
      "Instant responses to inquiries 24/7",
      "Personalized follow-up sequences",
      "Automatic showing confirmations and reminders",
      "Client communication preference tracking",
      "SMS, email, and chat integration"
    ],
    cta: "Learn More",
    ctaAction: "booking",
    timeline: "Live within 1 week",
    roi: "Reduce lead response time from hours to seconds, increase conversion by 40%"
  },

  cma_automation: {
    title: "Automated CMA Generator",
    description: "Create professional CMAs in under 5 minutes",
    benefits: [
      "Generate CMAs in under 5 minutes vs 30-60 minutes",
      "Pull real-time MLS and market data",
      "Professional, branded PDF reports",
      "Share instantly via email or link",
      "Track client engagement with reports"
    ],
    cta: "Try CMA Tool",
    ctaAction: "booking",
    timeline: "Start creating CMAs today",
    roi: "Save 20+ hours per month on CMA creation"
  },

  showing_coordination: {
    title: "Smart Showing Coordinator",
    description: "Let clients book showings automatically",
    benefits: [
      "Clients schedule showings 24/7",
      "Automatic calendar sync (Google, Outlook)",
      "Virtual tour coordination for remote buyers",
      "SMS and email confirmations",
      "Feedback collection after showings"
    ],
    cta: "Schedule Demo",
    ctaAction: "booking",
    timeline: "Set up in under 1 hour",
    roi: "Save 10+ hours per week on scheduling coordination"
  },

  property_alerts: {
    title: "Intelligent Property Alert System",
    description: "Auto-notify clients when properties match their criteria",
    benefits: [
      "Instant alerts when new properties match criteria",
      "Clients see properties before Zillow",
      "Customizable alert preferences per client",
      "Email and SMS notifications",
      "Track which alerts drive showings"
    ],
    cta: "Enable Alerts",
    ctaAction: "booking",
    timeline: "Active within 24 hours",
    roi: "Keep clients engaged and close deals faster"
  },

  crm_platform: {
    title: "Real Estate CRM & Platform",
    description: "All your tools in one intelligent platform",
    benefits: [
      "Complete client management system",
      "Lead tracking and conversion analytics",
      "Property search integrated with CRM",
      "Transaction milestone tracking",
      "Agent performance dashboard",
      "Referral network management"
    ],
    cta: "Book Platform Demo",
    ctaAction: "booking",
    timeline: "Onboarding in 1-2 weeks",
    roi: "Centralize operations, increase productivity by 50%"
  },

  mortgage_integration: {
    title: "Mortgage Lender Integration",
    description: "Real-time preapproval status instead of estimates",
    benefits: [
      "Connect with top mortgage lenders",
      "Real-time preapproval status updates",
      "Automated rate comparisons",
      "Digital application process",
      "Strengthen buyer offers with verified financing"
    ],
    cta: "Connect Lenders",
    ctaAction: "booking",
    timeline: "Integration in 1 week",
    roi: "Faster closings with verified financing"
  },

  voice_assistant: {
    title: "AI Voice Assistant",
    description: "Answer client calls 24/7 with natural conversation AI",
    benefits: [
      "Never miss a call - AI answers 24/7",
      "Natural conversation, not robotic menus",
      "Schedule showings via voice",
      "Answer property questions instantly",
      "Seamless handoff to you when needed"
    ],
    cta: "Try Voice Demo",
    ctaAction: "booking",
    timeline: "Active in 2-3 weeks",
    roi: "Capture after-hours leads, increase availability 3x"
  }
};