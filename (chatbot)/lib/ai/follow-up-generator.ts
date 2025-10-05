// lib/ai/follow-up-generator.ts
import 'server-only';

import Groq from 'groq-sdk';
import { PropertyPreferences } from './data-extraction';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface FollowUpSuggestions {
  suggestions: string[];
  reasoning: string;
  context: 'discovery' | 'qualifying' | 'search_results' | 'post_search' | 'closing';
}

/**
 * Generate context-aware follow-up questions based on conversation stage
 */
export async function generateFollowUps(params: {
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentPreferences: PropertyPreferences;
  hasSearched: boolean;
  propertyCount?: number;
}): Promise<FollowUpSuggestions> {
  const { conversationHistory, currentPreferences, hasSearched, propertyCount = 0 } = params;

  // Determine conversation context
  const context = determineConversationContext(
    conversationHistory,
    currentPreferences,
    hasSearched,
    propertyCount
  );

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7, // More creative for natural questions
      messages: [
        {
          role: 'system',
          content: getSystemPromptForContext(context, currentPreferences, hasSearched, propertyCount),
        },
        ...conversationHistory.slice(-6), // Last 6 messages for context
        {
          role: 'user',
          content: 'Generate 3-4 natural follow-up questions that would help move this conversation forward.',
        },
      ],
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse suggestions from response
    const suggestions = parseFollowUpSuggestions(responseText);

    return {
      suggestions: suggestions.slice(0, 4),
      reasoning: `Generated ${suggestions.length} suggestions for ${context} stage`,
      context,
    };
  } catch (error) {
    console.error('❌ Follow-up generation error:', error);

    // Fallback to static suggestions based on context
    return getFallbackSuggestions(context, currentPreferences, hasSearched, propertyCount);
  }
}

/**
 * Determine current conversation context
 */
function determineConversationContext(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentPreferences: PropertyPreferences,
  hasSearched: boolean,
  propertyCount: number
): 'discovery' | 'qualifying' | 'search_results' | 'post_search' | 'closing' {
  // Discovery: Just started, gathering basic info
  if (conversationHistory.length <= 2) {
    return 'discovery';
  }

  // Qualifying: Have some info, gathering more details
  if (!currentPreferences.location || !currentPreferences.maxPrice) {
    return 'qualifying';
  }

  // Search Results: Just showed properties
  if (hasSearched && propertyCount > 0) {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.content.toLowerCase().includes('match')) {
      return 'search_results';
    }
  }

  // Post Search: After search results, refining or discussing
  if (hasSearched) {
    return 'post_search';
  }

  // Closing: Have all info, ready to schedule showing
  if (currentPreferences.location && currentPreferences.maxPrice && currentPreferences.minBedrooms) {
    return 'closing';
  }

  return 'qualifying';
}

/**
 * Get system prompt based on conversation context
 */
function getSystemPromptForContext(
  context: string,
  currentPreferences: PropertyPreferences,
  hasSearched: boolean,
  propertyCount: number
): string {
  const basePrompt = `You are a real estate AI assistant helping generate natural follow-up questions.

Current context: ${context}
Has searched: ${hasSearched}
Properties shown: ${propertyCount}

Current preferences collected:
${formatPreferencesForPrompt(currentPreferences)}

Generate 3-4 natural, conversational follow-up questions that:
1. Help move the conversation forward
2. Sound like a real estate agent would ask
3. Are relevant to the current stage
4. Don't repeat information already collected
5. Build on the last user message

Format as a numbered list (1. 2. 3. 4.)
`;

  // Add context-specific guidance
  const contextGuidance: Record<string, string> = {
    discovery: `
Focus on:
- Discovering their motivation (why they're looking)
- Understanding their timeline
- Building rapport with warm questions
- Making them feel comfortable sharing more

Examples:
1. What's bringing you to the market right now?
2. Are you currently renting or selling another property?
3. How soon are you hoping to move in?
`,
    qualifying: `
Focus on:
- Getting missing critical info (location, budget)
- Understanding must-have vs nice-to-have features
- Qualifying their seriousness
- Setting realistic expectations

Examples:
1. What neighborhoods are you most interested in?
2. What's your maximum budget?
3. Any must-have features I should know about?
`,
    search_results: `
Focus on:
- Getting feedback on the properties shown
- Understanding which ones they like/dislike
- Identifying what they want to see more/less of
- Encouraging scheduling a showing

Examples:
1. Which of these homes catches your eye the most?
2. Would you like to schedule showings for any of these?
3. Should I search with different criteria?
4. What did you think about the [specific property]?
`,
    post_search: `
Focus on:
- Understanding what they liked/didn't like
- Refining search criteria
- Moving toward scheduling showings
- Building urgency if appropriate

Examples:
1. Were any of these close to what you're looking for?
2. Would you like to see properties in a different price range?
3. Should I look for homes with more/fewer bedrooms?
4. Which property would you like to learn more about?
`,
    closing: `
Focus on:
- Scheduling showings
- Getting contact information
- Connecting with an agent
- Next steps

Examples:
1. Would you like me to schedule a showing?
2. What's the best way to reach you - email or phone?
3. When would be a good time to tour these properties?
4. Would you like to speak with an agent about financing?
`,
  };

  return basePrompt + (contextGuidance[context] || '');
}

/**
 * Format preferences for prompt
 */
function formatPreferencesForPrompt(preferences: PropertyPreferences): string {
  const parts: string[] = [];

  if (preferences.location) parts.push(`- Location: ${preferences.location}`);
  if (preferences.maxPrice) parts.push(`- Budget: $${preferences.maxPrice.toLocaleString()}`);
  if (preferences.minBedrooms) parts.push(`- Bedrooms: ${preferences.minBedrooms}+`);
  if (preferences.minBathrooms) parts.push(`- Bathrooms: ${preferences.minBathrooms}+`);
  if (preferences.propertyType) parts.push(`- Type: ${preferences.propertyType}`);
  if (preferences.mustHaveFeatures && preferences.mustHaveFeatures.length > 0) {
    parts.push(`- Must-haves: ${preferences.mustHaveFeatures.join(', ')}`);
  }
  if (preferences.timeline) parts.push(`- Timeline: ${preferences.timeline}`);

  return parts.length > 0 ? parts.join('\n') : '(No preferences collected yet)';
}

/**
 * Parse follow-up suggestions from AI response
 */
function parseFollowUpSuggestions(responseText: string): string[] {
  const suggestions: string[] = [];

  // Try numbered list format (1. 2. 3.)
  const numberedMatches = responseText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/gs);
  if (numberedMatches) {
    for (const match of numberedMatches) {
      const cleaned = match.replace(/^\d+\.\s*/, '').trim();
      if (cleaned) suggestions.push(cleaned);
    }
  }

  // Try bullet point format (- or *)
  if (suggestions.length === 0) {
    const bulletMatches = responseText.match(/^[\-\*]\s*(.+?)$/gm);
    if (bulletMatches) {
      for (const match of bulletMatches) {
        const cleaned = match.replace(/^[\-\*]\s*/, '').trim();
        if (cleaned) suggestions.push(cleaned);
      }
    }
  }

  // Try line-by-line (fallback)
  if (suggestions.length === 0) {
    const lines = responseText.split('\n').filter(line => line.trim().length > 10);
    suggestions.push(...lines.slice(0, 4));
  }

  return suggestions
    .map(s => s.replace(/^["']|["']$/g, '').trim()) // Remove quotes
    .filter(s => s.length > 0 && s.length < 200) // Reasonable length
    .slice(0, 4); // Max 4 suggestions
}

/**
 * Fallback suggestions when AI fails
 */
function getFallbackSuggestions(
  context: string,
  currentPreferences: PropertyPreferences,
  hasSearched: boolean,
  propertyCount: number
): FollowUpSuggestions {
  const suggestionsByContext: Record<string, string[]> = {
    discovery: [
      "What's bringing you to the market right now?",
      "Are you currently renting or looking to sell another property?",
      "How soon are you hoping to move in?",
      "Are you familiar with the areas you're interested in?",
    ],
    qualifying: [
      !currentPreferences.location ? "What area are you looking in?" : "",
      !currentPreferences.maxPrice ? "What's your maximum budget?" : "",
      !currentPreferences.minBedrooms ? "How many bedrooms do you need?" : "",
      "Any must-have features like a pool or garage?",
    ].filter(Boolean),
    search_results: [
      "Which of these homes catches your eye?",
      "Would you like to schedule showings for any of these?",
      "Should I search with different criteria?",
      "What do you think about the pricing on these?",
    ],
    post_search: [
      "Were any of those close to what you're looking for?",
      "Would you like to see more properties in a different price range?",
      "Should I look for homes with different features?",
      "Which property would you like to learn more about?",
    ],
    closing: [
      "Would you like to schedule a showing?",
      "What's the best way to reach you?",
      "When would be a good time to tour these properties?",
      "Would you like to connect with a financing specialist?",
    ],
  };

  const suggestions = suggestionsByContext[context] || suggestionsByContext.qualifying;

  return {
    suggestions: suggestions.slice(0, 4),
    reasoning: `Fallback suggestions for ${context}`,
    context: context as any,
  };
}

/**
 * Generate a single smart follow-up based on the last user message
 */
export async function generateSingleFollowUp(
  lastUserMessage: string,
  currentPreferences: PropertyPreferences,
  context: string
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: `You are a real estate AI assistant. Generate ONE natural follow-up question based on the user's last message.

Current preferences: ${formatPreferencesForPrompt(currentPreferences)}
Context: ${context}

The question should:
1. Be conversational and friendly
2. Help gather more information or move the conversation forward
3. Not repeat information already collected
4. Be relevant to what they just said

Return ONLY the question, nothing else.`,
        },
        {
          role: 'user',
          content: lastUserMessage,
        },
      ],
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('❌ Single follow-up generation error:', error);
    return '';
  }
}
