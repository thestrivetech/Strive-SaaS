'use client';

import { Avatar, AvatarFallback } from '@/components/(shared)/ui/avatar';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-secondary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" />
      </div>
    </div>
  );
}