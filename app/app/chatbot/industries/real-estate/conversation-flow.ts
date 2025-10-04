// lib/modules/chatbot/config/industries/real-estate/conversation-flow.ts

import { ConversationFlow } from '@/app/chatbot/types/industry';

export const realEstateConversationFlow: ConversationFlow = {
  stages: {
    discovery: {
      goal: 'Understand if they are a buyer or agent, and their immediate needs',
      maxMessages: 2,
      nextStage: 'qualifying'
    },
    qualifying: {
      goal: 'Gather search criteria (location, budget, bedrooms, features) or business needs if agent',
      maxMessages: 3,
      nextStage: 'property_search'
    },
    property_search: {
      goal: 'Show properties or demonstrate platform capabilities',
      maxMessages: 4,
      nextStage: 'showing_coordination'
    },
    showing_coordination: {
      goal: 'Schedule showings or book demo/consultation',
      maxMessages: 2,
      nextStage: 'closing'
    },
    closing: {
      goal: 'Confirm booking, collect contact info, set expectations',
      maxMessages: 2,
      nextStage: 'complete'
    },
    complete: {
      goal: 'Showing scheduled or consultation booked',
      maxMessages: 1,
      nextStage: 'complete'
    }
  },

  transitions: {
    immediate_search: {
      from: ['discovery'],
      to: 'property_search',
      action: 'trigger_property_search'
    },
    prequalification_needed: {
      from: ['discovery', 'qualifying'],
      to: 'prequalification',
      action: 'calculate_budget'
    },
    ready_to_view: {
      from: ['property_search'],
      to: 'showing_coordination',
      action: 'schedule_showing'
    },
    agent_inquiry: {
      from: ['discovery'],
      to: 'platform_demo',
      action: 'show_platform_features'
    },
    high_intent: {
      from: ['qualifying', 'property_search'],
      to: 'showing_coordination',
      action: 'expedite_booking'
    }
  }
};