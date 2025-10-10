// lib/ai/data-extraction.ts
import 'server-only';

import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Property search parameters that can be extracted from user messages
 */
export const PropertyPreferencesSchema = z.object({
  location: z.string().optional().describe('City, state, zip code, or neighborhood'),
  maxPrice: z.number().positive().optional().describe('Maximum budget in dollars'),
  minBedrooms: z.number().int().positive().optional().describe('Minimum number of bedrooms'),
  minBathrooms: z.number().positive().optional().describe('Minimum number of bathrooms'),
  mustHaveFeatures: z.array(z.string()).optional().describe('Must-have features like pool, backyard, garage'),
  niceToHaveFeatures: z.array(z.string()).optional().describe('Nice-to-have features'),
  propertyType: z.enum(['single-family', 'condo', 'townhouse', 'multi-family', 'any']).optional().describe('Type of property'),
  timeline: z.enum(['ASAP', 'WITHIN_1_MONTH', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS', 'FLEXIBLE']).optional().describe('How soon they want to move'),
  isFirstTimeBuyer: z.boolean().optional().describe('Is this their first home purchase'),
  currentSituation: z.enum(['renting', 'selling', 'first-time', 'relocating', 'unknown']).optional().describe('Current living situation'),
});

export type PropertyPreferences = z.infer<typeof PropertyPreferencesSchema>;

/**
 * Contact information that can be extracted
 */
export const ContactInfoSchema = z.object({
  firstName: z.string().optional().describe('First name only'),
  lastName: z.string().optional().describe('Last name only'),
  fullName: z.string().optional().describe('Full name if provided together'),
  email: z.string().email().optional().describe('Email address'),
  phone: z.string().optional().describe('Phone number'),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

/**
 * Combined extraction result
 */
export interface ExtractionResult {
  propertyPreferences: PropertyPreferences;
  contactInfo: ContactInfo;
  extractedFields: string[]; // List of fields that were successfully extracted
  confidence: number; // 0-1 confidence score
}

/**
 * Extract property preferences and contact info from user message using AI function calling
 * This allows natural extraction like:
 *   "Nashville, $700k" → { location: "Nashville", maxPrice: 700000 }
 *   "3 bed 2 bath house with pool" → { minBedrooms: 3, minBathrooms: 2, mustHaveFeatures: ["pool"] }
 */
export async function extractDataFromMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ExtractionResult> {
  try {
    // Use Groq with function calling for fast, structured extraction
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Fast and free
      temperature: 0.1, // Low temperature for consistent extraction
      messages: [
        {
          role: 'system',
          content: `You are a data extraction assistant for a real estate chatbot.
Extract property search preferences and contact information from user messages.

IMPORTANT EXTRACTION RULES:

1. LOCATION:
   - Extract city, state, zip codes
   - Examples: "Nashville, TN", "Austin", "37209", "Denver, Colorado"

2. PRICE/BUDGET:
   - Convert shorthand to full numbers: "$500k" → 500000, "$1.2M" → 1200000
   - Examples: "$700k", "$850,000", "under $1 million"

3. BEDROOMS/BATHROOMS:
   - Extract from phrases like: "3 bed", "4 bedroom", "3BR", "2.5 bath"
   - Examples: "3 bed 2 bath", "4BR/3BA"

4. FEATURES:
   - Extract mentioned amenities: pool, backyard, garage, fireplace, etc.
   - Map variations: "yard" → "backyard", "2 car garage" → "garage"

5. PROPERTY TYPE:
   - Detect: single-family, condo, townhouse, multi-family
   - "house" → single-family, "apartment" → condo

6. TIMELINE:
   - "ASAP" → immediate need
   - "next month" → WITHIN_1_MONTH
   - "6 months" → WITHIN_6_MONTHS
   - "flexible" → FLEXIBLE

7. CONTACT INFO:
   - Extract names, emails, phone numbers when provided
   - Be liberal in extraction but validate formats

Only extract information explicitly mentioned or strongly implied in the current message.
Do NOT make assumptions beyond what's stated.`,
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ],
      tools: [
        {
          type: 'function' as const,
          function: {
            name: 'extract_property_preferences',
            description: 'Extract property search preferences from user message',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'City, state, zip code, or neighborhood (e.g., "Nashville, TN", "37209")',
                },
                maxPrice: {
                  type: 'number',
                  description: 'Maximum budget in dollars (convert "500k" to 500000)',
                },
                minBedrooms: {
                  type: 'integer',
                  description: 'Minimum number of bedrooms',
                },
                minBathrooms: {
                  type: 'number',
                  description: 'Minimum number of bathrooms (can be decimal like 2.5)',
                },
                mustHaveFeatures: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Must-have features (pool, backyard, garage, etc.)',
                },
                niceToHaveFeatures: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Nice-to-have features',
                },
                propertyType: {
                  type: 'string',
                  enum: ['single-family', 'condo', 'townhouse', 'multi-family', 'any'],
                  description: 'Type of property desired',
                },
                timeline: {
                  type: 'string',
                  enum: ['ASAP', 'WITHIN_1_MONTH', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS', 'FLEXIBLE'],
                  description: 'Timeline for moving/purchasing',
                },
                isFirstTimeBuyer: {
                  type: 'boolean',
                  description: 'Is this a first-time home buyer?',
                },
                currentSituation: {
                  type: 'string',
                  enum: ['renting', 'selling', 'first-time', 'relocating', 'unknown'],
                  description: 'Current living situation',
                },
              },
            },
          },
        },
        {
          type: 'function' as const,
          function: {
            name: 'extract_contact_info',
            description: 'Extract contact information from user message',
            parameters: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  description: 'First name only (e.g., "Billy" from "I\'m Billy Bob")',
                },
                lastName: {
                  type: 'string',
                  description: 'Last name only (e.g., "Bob" from "I\'m Billy Bob")',
                },
                fullName: {
                  type: 'string',
                  description: 'Full name if provided as a single unit',
                },
                email: {
                  type: 'string',
                  description: 'Email address',
                },
                phone: {
                  type: 'string',
                  description: 'Phone number',
                },
              },
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    const responseMessage = completion.choices[0]?.message;
    const toolCalls = responseMessage?.tool_calls || [];

    let propertyPreferences: PropertyPreferences = {};
    let contactInfo: ContactInfo = {};
    const extractedFields: string[] = [];
    let confidence = 0.8; // Default confidence

    // Process tool calls
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      if (functionName === 'extract_property_preferences') {
        propertyPreferences = PropertyPreferencesSchema.parse(args);
        extractedFields.push(...Object.keys(args).filter(k => args[k] !== undefined && args[k] !== null));
      } else if (functionName === 'extract_contact_info') {
        contactInfo = ContactInfoSchema.parse(args);
        extractedFields.push(...Object.keys(args).filter(k => args[k] !== undefined && args[k] !== null));
      }
    }

    // Calculate confidence based on number of fields extracted
    if (extractedFields.length > 0) {
      confidence = Math.min(0.9, 0.6 + (extractedFields.length * 0.1));
    }

    return {
      propertyPreferences,
      contactInfo,
      extractedFields: [...new Set(extractedFields)], // Deduplicate
      confidence,
    };
  } catch (error) {
    console.error('❌ Data extraction error:', error);

    // Fallback to regex-based extraction if AI fails
    return fallbackExtraction(userMessage);
  }
}

/**
 * Fallback extraction using regex patterns (when AI extraction fails)
 */
function fallbackExtraction(message: string): ExtractionResult {
  const propertyPreferences: PropertyPreferences = {};
  const contactInfo: ContactInfo = {};
  const extractedFields: string[] = [];

  // Extract price
  const priceMatch = message.match(/\$?([\d,]+)k?(?:,000)?(?:\s*(?:max|budget|price|under|up to))?/i);
  if (priceMatch) {
    let amount = parseInt(priceMatch[1].replace(/,/g, ''));
    if (message.toLowerCase().includes('k') && amount < 10000) {
      amount *= 1000;
    }
    propertyPreferences.maxPrice = amount;
    extractedFields.push('maxPrice');
  }

  // Extract bedrooms
  const bedroomsMatch = message.match(/(\d+)\s*(?:bed|br|bedroom)/i);
  if (bedroomsMatch) {
    propertyPreferences.minBedrooms = parseInt(bedroomsMatch[1]);
    extractedFields.push('minBedrooms');
  }

  // Extract bathrooms
  const bathroomsMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
  if (bathroomsMatch) {
    propertyPreferences.minBathrooms = parseFloat(bathroomsMatch[1]);
    extractedFields.push('minBathrooms');
  }

  // Extract features
  const features: string[] = [];
  if (/\bpool\b/i.test(message)) features.push('pool');
  if (/\b(?:backyard|yard)\b/i.test(message)) features.push('backyard');
  if (/\bgarage\b/i.test(message)) features.push('garage');
  if (/\bfireplace\b/i.test(message)) features.push('fireplace');
  if (features.length > 0) {
    propertyPreferences.mustHaveFeatures = features;
    extractedFields.push('mustHaveFeatures');
  }

  // Extract property type
  if (/\b(?:single-family|house|home)\b/i.test(message)) {
    propertyPreferences.propertyType = 'single-family';
    extractedFields.push('propertyType');
  } else if (/\bcondo\b/i.test(message)) {
    propertyPreferences.propertyType = 'condo';
    extractedFields.push('propertyType');
  } else if (/\btownhouse\b/i.test(message)) {
    propertyPreferences.propertyType = 'townhouse';
    extractedFields.push('propertyType');
  }

  // Extract email
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
    extractedFields.push('email');
  }

  // Extract phone
  const phoneMatch = message.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
    extractedFields.push('phone');
  }

  return {
    propertyPreferences,
    contactInfo,
    extractedFields,
    confidence: extractedFields.length > 0 ? 0.6 : 0.3,
  };
}

/**
 * Merge extracted data with existing conversation state
 * Only updates fields that are newly extracted
 */
export function mergeExtractedData(
  existing: PropertyPreferences,
  extracted: PropertyPreferences
): PropertyPreferences {
  return {
    ...existing,
    ...Object.fromEntries(
      Object.entries(extracted).filter(([_, value]) => value !== undefined && value !== null)
    ),
  };
}

/**
 * Check if we have minimum required data to search properties
 */
export function hasMinimumSearchCriteria(preferences: PropertyPreferences): boolean {
  return !!(preferences.location && preferences.maxPrice);
}

/**
 * Get list of missing critical fields for property search
 */
export function getMissingCriticalFields(preferences: PropertyPreferences): string[] {
  const missing: string[] = [];

  if (!preferences.location) missing.push('location');
  if (!preferences.maxPrice) missing.push('budget');

  return missing;
}

/**
 * Format preferences for display (debugging)
 */
export function formatPreferences(preferences: PropertyPreferences): string {
  const parts: string[] = [];

  if (preferences.location) parts.push(`📍 ${preferences.location}`);
  if (preferences.maxPrice) parts.push(`💰 $${preferences.maxPrice.toLocaleString()}`);
  if (preferences.minBedrooms) parts.push(`🛏️ ${preferences.minBedrooms}+ bed`);
  if (preferences.minBathrooms) parts.push(`🛁 ${preferences.minBathrooms}+ bath`);
  if (preferences.propertyType) parts.push(`🏠 ${preferences.propertyType}`);
  if (preferences.mustHaveFeatures && preferences.mustHaveFeatures.length > 0) {
    parts.push(`✨ ${preferences.mustHaveFeatures.join(', ')}`);
  }

  return parts.join(' | ');
}

/**
 * Split name into first/last components
 * Handles various name formats intelligently
 */
export function splitName(contactInfo: ContactInfo): {
  firstName?: string;
  lastName?: string;
  fullName: string
} {
  // If firstName and lastName provided separately, use them
  if (contactInfo.firstName || contactInfo.lastName) {
    return {
      firstName: contactInfo.firstName,
      lastName: contactInfo.lastName,
      fullName: [contactInfo.firstName, contactInfo.lastName].filter(Boolean).join(' ') || 'Unknown',
    };
  }

  // If fullName provided, try to split it
  if (contactInfo.fullName) {
    const parts = contactInfo.fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      // Only one name provided
      return { firstName: parts[0], lastName: undefined, fullName: parts[0] };
    } else if (parts.length === 2) {
      // First and last name
      return { firstName: parts[0], lastName: parts[1], fullName: contactInfo.fullName };
    } else {
      // More than 2 parts: first is firstName, rest is lastName
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        fullName: contactInfo.fullName,
      };
    }
  }

  // No name provided
  return { firstName: undefined, lastName: undefined, fullName: 'Unknown' };
}
