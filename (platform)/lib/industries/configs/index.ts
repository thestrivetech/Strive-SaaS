// lib/industries/configs/index.ts
// Industry configuration loader for AI chat integration
// Provides compatibility layer between platform and shared industry types

import { IndustryType, IndustryConfig } from '@strive/shared/types/industry';

/**
 * Load complete industry configuration for AI chat
 * This is a simplified loader that returns basic configurations
 * In the future, this would integrate with the platform's industry registry
 */
export async function loadIndustryConfig(
  industry: IndustryType
): Promise<IndustryConfig> {
  // Basic configuration structure
  const config: IndustryConfig = {
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
    'strive': `You are Sai, an AI assistant helping businesses with AI solutions and automation.
Be professional, helpful, and focus on understanding their business challenges.
Ask discovery questions to understand their pain points before suggesting solutions.`,

    'real-estate': `You are Sai, a real estate AI assistant.
Help users find properties, understand the market, and guide them through the buying/selling process.
Be conversational and friendly while being informative.
Use the property search tool when users are looking for homes.`,

    'dental': `You are Sai, a dental practice AI assistant.
Help patients with appointments, procedures, and general dental health questions.
Be friendly, empathetic, and professional.`,

    'legal': `You are Sai, a legal services AI assistant.
Help clients understand legal processes and connect them with appropriate legal services.
Be professional and clear in your explanations.`,

    'manufacturing': `You are Sai, a manufacturing AI assistant.
Help with production optimization, supply chain, and operational efficiency.
Focus on practical solutions and measurable improvements.`,

    'financial': `You are Sai, a financial services AI assistant.
Help clients with financial planning, investments, and financial products.
Be trustworthy and provide accurate information.`,

    'retail': `You are Sai, a retail AI assistant.
Help customers find products, answer questions, and provide excellent service.
Be helpful, friendly, and knowledgeable.`,

    'insurance': `You are Sai, an insurance AI assistant.
Help clients understand insurance options and find the right coverage.
Explain complex insurance terms in simple language.`,
  };

  return prompts[industry] || prompts['strive'];
}

/**
 * Get industry display name
 */
export function getIndustryDisplayName(industry: IndustryType): string {
  const names: Record<IndustryType, string> = {
    'strive': 'AI Solutions (STRIVE TECH)',
    'real-estate': 'Real Estate',
    'dental': 'Dental Practice',
    'legal': 'Legal Services',
    'manufacturing': 'Manufacturing',
    'financial': 'Financial Services',
    'retail': 'Retail',
    'insurance': 'Insurance',
  };
  return names[industry];
}

/**
 * Get list of available industries
 */
export function getAvailableIndustries(): IndustryType[] {
  return [
    'strive',
    'real-estate',
    'dental',
    'legal',
    'manufacturing',
    'financial',
    'retail',
    'insurance',
  ];
}

/**
 * Validate industry type
 */
export function isValidIndustry(industry: string): industry is IndustryType {
  const validIndustries: IndustryType[] = getAvailableIndustries();
  return validIndustries.includes(industry as IndustryType);
}
