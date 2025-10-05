// lib/services/conversation-memory.ts
import 'server-only';

import { PropertyPreferences } from '../ai/data-extraction';

/**
 * Conversation memory tracks what has been discussed to prevent repetition
 */
export interface ConversationMemory {
  sessionId: string;
  questionsAsked: string[];
  topicsDiscussed: string[];
  propertiesViewed: string[];
  propertiesFavorited: string[];
  lastPropertySearch: Date | null;
  preferences: PropertyPreferences;
  userMentions: {
    [key: string]: string[]; // e.g., "concerns": ["price", "location"]
  };
  conversationSummary: string;
}

// In-memory cache (in production, use Redis or database)
const memoryCache = new Map<string, ConversationMemory>();

/**
 * Initialize or get conversation memory
 */
export function getConversationMemory(sessionId: string): ConversationMemory {
  if (!memoryCache.has(sessionId)) {
    memoryCache.set(sessionId, {
      sessionId,
      questionsAsked: [],
      topicsDiscussed: [],
      propertiesViewed: [],
      propertiesFavorited: [],
      lastPropertySearch: null,
      preferences: {},
      userMentions: {},
      conversationSummary: '',
    });
  }

  return memoryCache.get(sessionId)!;
}

/**
 * Update conversation memory with new information
 */
export function updateConversationMemory(
  sessionId: string,
  updates: Partial<ConversationMemory>
): ConversationMemory {
  const memory = getConversationMemory(sessionId);

  // Merge updates
  Object.assign(memory, updates);

  // Merge arrays (avoid duplicates)
  if (updates.questionsAsked) {
    memory.questionsAsked = [
      ...new Set([...memory.questionsAsked, ...updates.questionsAsked]),
    ];
  }

  if (updates.topicsDiscussed) {
    memory.topicsDiscussed = [
      ...new Set([...memory.topicsDiscussed, ...updates.topicsDiscussed]),
    ];
  }

  if (updates.propertiesViewed) {
    memory.propertiesViewed = [
      ...new Set([...memory.propertiesViewed, ...updates.propertiesViewed]),
    ];
  }

  if (updates.propertiesFavorited) {
    memory.propertiesFavorited = [
      ...new Set([...memory.propertiesFavorited, ...updates.propertiesFavorited]),
    ];
  }

  // Merge user mentions
  if (updates.userMentions) {
    memory.userMentions = {
      ...memory.userMentions,
      ...updates.userMentions,
    };
  }

  // Merge preferences
  if (updates.preferences) {
    memory.preferences = {
      ...memory.preferences,
      ...updates.preferences,
    };
  }

  memoryCache.set(sessionId, memory);

  return memory;
}

/**
 * Track a question that was asked
 */
export function recordQuestionAsked(
  sessionId: string,
  question: string
): void {
  const memory = getConversationMemory(sessionId);

  // Normalize question for comparison
  const normalized = normalizeQuestion(question);

  if (!memory.questionsAsked.includes(normalized)) {
    memory.questionsAsked.push(normalized);
    memoryCache.set(sessionId, memory);
  }
}

/**
 * Check if a question has already been asked
 */
export function hasQuestionBeenAsked(
  sessionId: string,
  question: string
): boolean {
  const memory = getConversationMemory(sessionId);
  const normalized = normalizeQuestion(question);

  return memory.questionsAsked.some(asked => {
    // Fuzzy matching - similar questions
    return (
      asked === normalized ||
      asked.includes(normalized) ||
      normalized.includes(asked) ||
      calculateSimilarity(asked, normalized) > 0.7
    );
  });
}

/**
 * Track a topic that was discussed
 */
export function recordTopicDiscussed(
  sessionId: string,
  topic: string
): void {
  const memory = getConversationMemory(sessionId);

  if (!memory.topicsDiscussed.includes(topic)) {
    memory.topicsDiscussed.push(topic);
    memoryCache.set(sessionId, memory);
  }
}

/**
 * Check if a topic has been discussed
 */
export function hasTopicBeenDiscussed(
  sessionId: string,
  topic: string
): boolean {
  const memory = getConversationMemory(sessionId);
  return memory.topicsDiscussed.includes(topic);
}

/**
 * Track property views
 */
export function recordPropertyView(
  sessionId: string,
  propertyId: string
): void {
  const memory = getConversationMemory(sessionId);

  if (!memory.propertiesViewed.includes(propertyId)) {
    memory.propertiesViewed.push(propertyId);
    memoryCache.set(sessionId, memory);
  }
}

/**
 * Track property favorites
 */
export function recordPropertyFavorite(
  sessionId: string,
  propertyId: string
): void {
  const memory = getConversationMemory(sessionId);

  if (!memory.propertiesFavorited.includes(propertyId)) {
    memory.propertiesFavorited.push(propertyId);
    memoryCache.set(sessionId, memory);
  }
}

/**
 * Record that a property search was performed
 */
export function recordPropertySearch(sessionId: string): void {
  const memory = getConversationMemory(sessionId);
  memory.lastPropertySearch = new Date();
  memoryCache.set(sessionId, memory);
}

/**
 * Extract and record user mentions from message
 */
export function extractAndRecordMentions(
  sessionId: string,
  userMessage: string
): void {
  const memory = getConversationMemory(sessionId);

  // Extract concerns
  const concernKeywords = ['worried', 'concern', 'afraid', 'nervous', 'unsure'];
  if (concernKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
    const concerns = memory.userMentions.concerns || [];
    // Extract what they're concerned about (simplified)
    concerns.push(userMessage.toLowerCase());
    memory.userMentions.concerns = concerns.slice(-5); // Keep last 5
  }

  // Extract preferences
  const preferenceKeywords = ['like', 'want', 'need', 'prefer', 'love'];
  if (preferenceKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
    const preferences = memory.userMentions.preferences || [];
    preferences.push(userMessage.toLowerCase());
    memory.userMentions.preferences = preferences.slice(-5); // Keep last 5
  }

  // Extract dislikes
  const dislikeKeywords = ["don't like", "hate", "avoid", "not a fan"];
  if (dislikeKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
    const dislikes = memory.userMentions.dislikes || [];
    dislikes.push(userMessage.toLowerCase());
    memory.userMentions.dislikes = dislikes.slice(-5); // Keep last 5
  }

  memoryCache.set(sessionId, memory);
}

/**
 * Generate context summary for AI based on memory
 */
export function generateContextSummary(sessionId: string): string {
  const memory = getConversationMemory(sessionId);

  const parts: string[] = [];

  // Topics discussed
  if (memory.topicsDiscussed.length > 0) {
    parts.push(`Topics discussed: ${memory.topicsDiscussed.join(', ')}`);
  }

  // Properties viewed
  if (memory.propertiesViewed.length > 0) {
    parts.push(`Properties viewed: ${memory.propertiesViewed.length}`);
  }

  // Properties favorited
  if (memory.propertiesFavorited.length > 0) {
    parts.push(`Properties favorited: ${memory.propertiesFavorited.length}`);
  }

  // Last search
  if (memory.lastPropertySearch) {
    const timeSince = Date.now() - memory.lastPropertySearch.getTime();
    const minutesAgo = Math.floor(timeSince / 60000);
    parts.push(`Last search: ${minutesAgo} minutes ago`);
  }

  // User mentions
  if (memory.userMentions.concerns && memory.userMentions.concerns.length > 0) {
    parts.push('User has expressed concerns');
  }

  if (memory.userMentions.preferences && memory.userMentions.preferences.length > 0) {
    parts.push('User has stated preferences');
  }

  return parts.join(' | ');
}

/**
 * Build memory-aware guidance for AI
 */
export function buildMemoryGuidance(sessionId: string): string {
  const memory = getConversationMemory(sessionId);

  const guidance: string[] = [
    '### 🧠 CONVERSATION MEMORY:',
    '',
  ];

  // Questions already asked
  if (memory.questionsAsked.length > 0) {
    guidance.push('**Questions Already Asked (DO NOT REPEAT):**');
    memory.questionsAsked.slice(-5).forEach(q => {
      guidance.push(`- ${q}`);
    });
    guidance.push('');
  }

  // Topics covered
  if (memory.topicsDiscussed.length > 0) {
    guidance.push('**Topics Already Discussed:**');
    guidance.push(memory.topicsDiscussed.join(', '));
    guidance.push('');
  }

  // User concerns
  if (memory.userMentions.concerns && memory.userMentions.concerns.length > 0) {
    guidance.push('**User Has Expressed Concerns About:**');
    memory.userMentions.concerns.slice(-3).forEach(c => {
      guidance.push(`- ${c}`);
    });
    guidance.push('➡️ **Address these concerns in your response!**');
    guidance.push('');
  }

  // Search history
  if (memory.lastPropertySearch) {
    const timeSince = Date.now() - memory.lastPropertySearch.getTime();
    const minutesAgo = Math.floor(timeSince / 60000);

    if (minutesAgo < 5) {
      guidance.push('**⚠️ Property search was JUST performed!**');
      guidance.push("➡️ Ask for feedback on the properties shown, don't search again immediately!");
      guidance.push('');
    }
  }

  // Properties viewed/favorited
  if (memory.propertiesViewed.length > 0) {
    guidance.push(`**Properties Viewed:** ${memory.propertiesViewed.length}`);

    if (memory.propertiesFavorited.length > 0) {
      guidance.push(`**Properties Favorited:** ${memory.propertiesFavorited.length}`);
      guidance.push('➡️ Reference their favorites in conversation!');
    }
    guidance.push('');
  }

  return guidance.join('\n');
}

/**
 * Normalize question for comparison
 */
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[?!.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Clear conversation memory (for testing or reset)
 */
export function clearConversationMemory(sessionId: string): void {
  memoryCache.delete(sessionId);
}

/**
 * Get memory statistics
 */
export function getMemoryStats(sessionId: string): {
  questionsAsked: number;
  topicsDiscussed: number;
  propertiesViewed: number;
  propertiesFavorited: number;
  hasSearched: boolean;
} {
  const memory = getConversationMemory(sessionId);

  return {
    questionsAsked: memory.questionsAsked.length,
    topicsDiscussed: memory.topicsDiscussed.length,
    propertiesViewed: memory.propertiesViewed.length,
    propertiesFavorited: memory.propertiesFavorited.length,
    hasSearched: memory.lastPropertySearch !== null,
  };
}
