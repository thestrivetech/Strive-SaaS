/**
 * STUB: Chatbot types
 * This is a stub file - actual types live in (chatbot) project
 * These exports allow (platform) code to compile without cross-project imports
 */

export type ChatbotMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type ChatbotConfig = {
  apiKey: string;
  model: string;
  systemPrompt?: string;
};
