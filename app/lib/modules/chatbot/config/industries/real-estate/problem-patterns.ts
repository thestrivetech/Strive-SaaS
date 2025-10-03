// lib/industries/real-estate/problem-patterns.ts

import { ProblemPattern } from '@/lib/modules/chatbot/types/industry';

export const realEstateProblemPatterns: Record<string, ProblemPattern> = {
  property_search: {
    keywords: ['looking for', 'want to buy', 'searching for', 'need a house', 'find a home', 'bedrooms', 'budget'],
    urgencyLevel: 'high',
    response: 'property_search',
    questions: [
      'What location are you interested in?',
      "What's your maximum budget?",
      'How many bedrooms do you need?',
      'Do you have any must-have features like a pool or backyard?',
    ],
    solution: 'AI Property Search',
    benefits: [
      'See properties before they hit major sites like Zillow',
      'Get matches based on your exact preferences',
      'Instant alerts when new properties match your criteria',
      'Schedule showings directly from search results',
    ],
  },

  prequalification: {
    keywords: ['afford', 'budget', 'prequalified', 'how much', 'income', 'debt', 'mortgage', 'loan'],
    urgencyLevel: 'high',
    response: 'prequalification',
    questions: [
      "What's your annual household income?",
      'Do you have any monthly debts (car loans, credit cards, student loans)?',
      'How much do you have saved for a down payment?',
      'Have you been preapproved by a lender yet?',
    ],
    solution: 'Instant Prequalification',
    benefits: [
      'Know your budget in minutes',
      'Real-time lender integration',
      'Understand your debt-to-income ratio',
      'Get preapproval letter same day',
    ],
  },

  market_analysis: {
    keywords: ['market trends', 'neighborhood', 'investment', 'appreciation', 'value', 'roi', 'market data'],
    urgencyLevel: 'medium',
    response: 'market_analysis',
    questions: [
      'Which area are you interested in analyzing?',
      'Are you looking to invest or find a primary residence?',
      'What timeframe are you considering (immediate, 6 months, 1 year)?',
    ],
    solution: 'Market Intelligence Dashboard',
    benefits: [
      'See appreciation rates by neighborhood',
      'Identify up-and-coming areas',
      'Compare neighborhoods side-by-side',
      'Get data-driven investment recommendations',
    ],
  },

  lead_generation: {
    keywords: ['get more leads', 'find clients', 'grow my business', 'more buyers', 'seller leads'],
    urgencyLevel: 'high',
    response: 'lead_generation',
    questions: [
      'Are you looking for buyer leads or seller leads?',
      'What geographic area do you serve?',
      "What's your current monthly lead volume?",
      'What types of properties do you specialize in?',
    ],
    solution: 'AI Lead Generation System',
    benefits: [
      'Capture leads 24/7 automatically',
      'Qualify leads before they reach you',
      'Automated follow-up sequences',
      'Integration with your CRM',
    ],
  },

  transaction_management: {
    keywords: ['closing', 'paperwork', 'documents', 'transaction', 'contract', 'escrow', 'manage deals'],
    urgencyLevel: 'medium',
    response: 'transaction_management',
    questions: [
      'How many active transactions do you typically manage?',
      'What slows down your closing process the most?',
      'Do you currently use any transaction management software?',
    ],
    solution: 'Transaction Automation Platform',
    benefits: [
      'Track every milestone automatically',
      'Automated document processing',
      'Real-time status updates for clients',
      'Never miss a deadline',
    ],
  },

  client_communication: {
    keywords: ['follow up', 'client communication', 'response time', 'staying in touch', 'nurture'],
    urgencyLevel: 'medium',
    response: 'communication_automation',
    questions: [
      'How many active clients are you working with?',
      'What takes up most of your communication time?',
      'How often do leads fall through due to slow response?',
    ],
    solution: 'Automated Client Communication',
    benefits: [
      'Instant responses 24/7',
      'Personalized follow-up sequences',
      'Automatic showing confirmations',
      'Client preference tracking',
    ],
  },

  cma_automation: {
    keywords: ['cma', 'comparative market analysis', 'pricing', 'home value', 'appraisal', 'listing price'],
    urgencyLevel: 'medium',
    response: 'cma_automation',
    questions: [
      'How long does it take you to create a CMA?',
      'How often do you need to create CMAs?',
      'What data sources do you currently use?',
    ],
    solution: 'Automated CMA Generator',
    benefits: [
      'Generate CMAs in under 5 minutes',
      'Pull real-time market data',
      'Professional, branded reports',
      'Share instantly with clients',
    ],
  },

  showing_coordination: {
    keywords: ['schedule showing', 'appointments', 'tours', 'calendar', 'booking', 'virtual tour'],
    urgencyLevel: 'low',
    response: 'showing_coordination',
    questions: [
      'How many showings do you typically do per week?',
      'Do you work with out-of-state buyers?',
      'What challenges do you face with showing coordination?',
    ],
    solution: 'Smart Showing Coordinator',
    benefits: [
      'Clients book showings directly',
      'Automatic calendar management',
      'Virtual tour coordination',
      'SMS/email confirmations',
    ],
  },
};