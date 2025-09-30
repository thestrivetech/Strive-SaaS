'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { sendMessage } from '@/lib/modules/ai/actions';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { AIModel } from '@/lib/ai/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  availableModels: AIModel[];
  userTier: string;
}

export function AIChat({ availableModels, userTier }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(availableModels[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessage({
        conversationId,
        message: userMessage.content,
        model: selectedModel.id,
        provider: selectedModel.provider,
      });

      if (result.success && result.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save conversation ID for future messages
        if (!conversationId) {
          setConversationId(result.data.conversationId);
        }
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with model selector */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <Select value={selectedModel.id} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="capitalize">
            {selectedModel.provider}
          </Badge>
        </div>

        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {userTier} Plan
        </Badge>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Start a conversation with Sai</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions, get insights, or automate tasks
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-md">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('Help me analyze customer data')}
              >
                Analyze data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('Create a project summary')}
              >
                Create summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('Draft an email to a client')}
              >
                Draft email
              </Button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sai anything... (Shift + Enter for new line)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Model: {selectedModel.name}</span>
          <span>{input.length} / 4000 characters</span>
        </div>
      </div>
    </div>
  );
}