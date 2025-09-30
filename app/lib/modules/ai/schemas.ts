import { z } from 'zod';

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  model: z.string().min(1, 'Model is required'),
  provider: z.enum(['openrouter', 'groq']),
});

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  model: z.string().min(1),
  provider: z.enum(['openrouter', 'groq']),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;