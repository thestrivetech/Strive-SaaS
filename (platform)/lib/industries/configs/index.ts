// lib/industries/configs/index.ts
// Industry configuration loader for AI chat integration
// Provides compatibility layer between platform and shared industry types

import { Industry as IndustryType } from '@/lib/industries/_core/industry-config';

/**
 * AI Chat Industry Configuration
 * Separate from platform IndustryConfig - this is for chatbot integration
 */
export interface ChatbotIndustryConfig {
  industry: IndustryType;
  displayName: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
  assistant: {
    name: string;
    title: string;
  };
  businessInfo: {
    calendlyLink: string;
    website: string;
  };
  welcomeMessage: {
    greeting: string;
    intro: string;
    firstQuestion: string;
  };
  systemPrompt: string;
}

/**
 * Load complete industry configuration for AI chat
 * This is a simplified loader that returns basic configurations
 * In the future, this would integrate with the platform's industry registry
 */
export async function loadIndustryConfig(
  industry: IndustryType
): Promise<ChatbotIndustryConfig> {
  // Basic configuration structure
  const config: ChatbotIndustryConfig = {
    industry,
    displayName: getIndustryDisplayName(industry),
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8',
    },
    assistant: {
      name: 'Sai',
      title: 'AI Assistant',
    },
    businessInfo: {
      calendlyLink: '',
      website: 'https://strivetech.ai',
    },
    welcomeMessage: {
      greeting: 'Hello! I\'m Sai, your AI assistant.',
      intro: 'I\'m here to help you with your business needs.',
      firstQuestion: 'What can I help you with today?',
    },
    systemPrompt: getDefaultSystemPrompt(industry),
  };

  return config;
}

/**
 * Get default system prompt for an industry
 */
function getDefaultSystemPrompt(industry: IndustryType): string {
  const prompts: Record<IndustryType, string> = {
    'shared': `You are Sai, an AI assistant helping businesses with AI solutions and automation.
Be professional, helpful, and focus on understanding their business challenges.
Ask discovery questions to understand their pain points before suggesting solutions.`,

    'real-estate': `You are Sai, a real estate AI assistant.
Help users find properties, understand the market, and guide them through the buying/selling process.
Be conversational and friendly while being informative.
Use the property search tool when users are looking for homes.`,

    'healthcare': `You are Sai, a healthcare AI assistant.
Help patients with appointments, procedures, and general health questions.
Be friendly, empathetic, and professional.`,

    'legal': `You are Sai, a legal services AI assistant.
Help clients understand legal processes and connect them with appropriate legal services.
Be professional and clear in your explanations.`,

    'manufacturing': `You are Sai, a manufacturing AI assistant.
Help with production optimization, supply chain, and operational efficiency.
Focus on practical solutions and measurable improvements.`,

    'fintech': `You are Sai, a fintech AI assistant.
Help clients with financial planning, investments, and financial products.
Be trustworthy and provide accurate information.`,

    'retail': `You are Sai, a retail AI assistant.
Help customers find products, answer questions, and provide excellent service.
Be helpful, friendly, and knowledgeable.`,

    'education': `You are Sai, an education AI assistant.
Help students and educators with learning resources and educational planning.
Be supportive, encouraging, and knowledgeable.`,

    'hospitality': `You are Sai, a hospitality AI assistant.
Help guests with reservations, services, and hospitality needs.
Be welcoming, attentive, and service-oriented.`,

    'logistics': `You are Sai, a logistics AI assistant.
Help with supply chain management, shipping, and logistics operations.
Focus on efficiency and timely delivery.`,

    'construction': `You are Sai, a construction AI assistant.
Help with project management, materials, and construction planning.
Be practical and detail-oriented.`,
  };

  return prompts[industry] || prompts['shared'];
}

/**
 * Get industry display name
 */
export function getIndustryDisplayName(industry: IndustryType): string {
  const names: Record<IndustryType, string> = {
    'shared': 'AI Solutions (STRIVE TECH)',
    'real-estate': 'Real Estate',
    'healthcare': 'Healthcare',
    'legal': 'Legal Services',
    'manufacturing': 'Manufacturing',
    'fintech': 'Financial Technology',
    'retail': 'Retail',
    'education': 'Education',
    'hospitality': 'Hospitality',
    'logistics': 'Logistics',
    'construction': 'Construction',
  };
  return names[industry];
}

/**
 * Get list of available industries
 */
export function getAvailableIndustries(): IndustryType[] {
  return [
    'shared',
    'real-estate',
    'healthcare',
    'legal',
    'manufacturing',
    'fintech',
    'retail',
    'education',
    'hospitality',
    'logistics',
    'construction',
  ];
}

/**
 * Validate industry type
 */
export function isValidIndustry(industry: string): industry is IndustryType {
  const validIndustries: IndustryType[] = getAvailableIndustries();
  return validIndustries.includes(industry as IndustryType);
}
