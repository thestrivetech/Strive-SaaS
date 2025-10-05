import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  timestamp: z.string().optional(),
  id: z.string().optional()
});

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  industry: z.string().default('strive'),
  sessionId: z.string().min(1),
  organizationId: z.string().optional(), // For CRM integration
  conversationStage: z.string().optional(),
  detectedProblems: z.array(z.string()).optional(),
  clientId: z.string().optional()
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
