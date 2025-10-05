// hooks/use-chat.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getWelcomeMessage,
  performBasicGrammarCheck,
  detectProblemsClientSide,
  determineConversationStage,
  getCurrentDateContext
} from './use-chat-helpers';

// ✨ NEW: Property Match interface for real estate
interface PropertyMatch {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    propertyType: string;
    images: string[];
    daysOnMarket: number;
    schoolRatings?: {
      elementary?: number;
      middle?: number;
      high?: number;
    };
  };
  matchScore: number;
  matchReasons: string[];
  missingFeatures: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  conversationId?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  isPartial?: boolean;
  isError?: boolean;
  isWelcome?: boolean;
  showCalendlyButton?: boolean;
  propertyResults?: PropertyMatch[]; // ✨ NEW: For real estate property results
}

interface ProblemDetection {
  key: string;
  confidence: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  matchedKeywords: string[];
}

interface ChatStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  conversationId: string;
  hasApiKey: boolean;
  isStreaming: boolean;
  identifiedProblems: string[];
  conversationStage: string;
  needsConsultation: boolean;
}

export const useChat = (industry: string = 'strive') => {
  const [messages, setMessages] = useState<Message[]>(() => [getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [identifiedProblems, setIdentifiedProblems] = useState<ProblemDetection[]>([]);
  const [conversationStage, setConversationStage] = useState('discovery');
  const [hasShownCalendlyButton, setHasShownCalendlyButton] = useState(false);
  const [hasSavedChat, setHasSavedChat] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef(`conv-${Date.now()}`);
  const streamingIdRef = useRef<string | null>(null);

  // Generate session ID once - invoke function immediately
  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('strive-session-id');
      if (stored) return stored;
      const newId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('strive-session-id', newId);
      return newId;
    }
    return `session-${Date.now()}`;
  };
  const sessionIdRef = useRef<string>(getSessionId());

  // Load saved chat on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('strive-chat-history');
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        if (parsedHistory.messages?.length > 1) {
          setHasSavedChat(true);
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
    }
  }, []);

  // Load previous conversation
  const loadPreviousChat = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('strive-chat-history');
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        if (parsedHistory.messages?.length > 1) {
          setMessages(parsedHistory.messages);
          if (parsedHistory.identifiedProblems) {
            setIdentifiedProblems(parsedHistory.identifiedProblems);
          }
          if (parsedHistory.stage) {
            setConversationStage(parsedHistory.stage);
          }
          setHasSavedChat(false);
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Send message with RAG integration
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Check if user wants to continue previous chat
    if (userMessage.toLowerCase().trim() === 'yes' && hasSavedChat) {
      loadPreviousChat();
      return;
    }

    clearError();

    // Client-side problem detection (basic)
    const detectedProblems = detectProblemsClientSide(userMessage);
    if (detectedProblems.length > 0) {
      setIdentifiedProblems(prev => {
        const newProblems = [...prev];
        detectedProblems.forEach(problem => {
          if (!newProblems.find(p => p.key === problem.key)) {
            newProblems.push(problem);
          }
        });
        return newProblems;
      });
    }

    // Update conversation stage
    const messageCount = messages.filter(m => m.role === 'user').length + 1;
    const newStage = determineConversationStage(messageCount, identifiedProblems.length + detectedProblems.length);
    setConversationStage(newStage);

    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
      conversationId: conversationIdRef.current
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    // Create assistant placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    streamingIdRef.current = assistantMessageId;
    
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      conversationId: conversationIdRef.current,
      isStreaming: true,
      isThinking: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Prepare messages for API (exclude welcome and system messages)
      const apiMessages = [...messages, newUserMessage]
        .filter(m => !m.isWelcome && m.role !== 'system')
        .slice(-10) // Last 10 messages for context
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      // ✅ ADD DATE CONTEXT - Prepend current date as system message
      const messagesWithContext = [
        {
          role: 'system' as const,
          content: getCurrentDateContext()
        },
        ...apiMessages
      ];

      // 🔥 CRITICAL: Call Next.js API route with RAG integration
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesWithContext,
          industry,
          sessionId: sessionIdRef.current,
          conversationStage: newStage,
          detectedProblems: [...identifiedProblems, ...detectedProblems].map(p => p.key),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Handle Server-Sent Events (SSE) streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      let propertyResults: PropertyMatch[] | undefined; // ✨ NEW: Store property results

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            // Stream complete
            const checkedResponse = performBasicGrammarCheck(accumulatedResponse);
            
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { 
                    ...msg, 
                    content: checkedResponse,
                    propertyResults, // ✨ NEW: Attach property results
                    isStreaming: false, 
                    isThinking: false
                  }
                : msg
            ));
            setStreamingMessage('');
            setIsLoading(false);
            return;
          }
          
          if (data) {
            try {
              const parsed = JSON.parse(data);
              
              // ✨ NEW: Handle regular content
              if (parsed.content) {
                accumulatedResponse += parsed.content;
                
                // Update streaming message in real-time
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedResponse, isThinking: false }
                    : msg
                ));
              }

              // ✨ NEW: Handle property results
              if (parsed.type === 'property_results') {
                propertyResults = parsed.properties;
                console.log('🏠 Received property results:', propertyResults);
                console.log('🏘️ Property count:', propertyResults?.length);
                console.log('🏡 First property:', propertyResults?.[0]?.property?.address);

                // Update message with property results immediately
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, propertyResults }
                    : msg
                ));
              }

              // ✨ NEW: Handle property search errors
              if (parsed.type === 'property_search_error') {
                toast.error(parsed.error || 'Failed to search properties');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      handleStreamError(error, '', streamingIdRef.current);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      streamingIdRef.current = null;
    }
  }, [messages, isLoading, clearError, identifiedProblems, conversationStage, industry, hasSavedChat, loadPreviousChat]);

  // Handle streaming errors
  const handleStreamError = useCallback((error: any, partialResponse: string, messageId: string | null) => {
    console.error('Chat error:', error);
    setStreamingMessage('');
    
    const errorMessage = 'I apologize for the technical issue. Let\'s continue - what were you telling me about your business?';
    
    if (partialResponse?.trim() && messageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: partialResponse + '\n\n*[Connection interrupted - please continue]*',
              isPartial: true,
              isStreaming: false,
              isThinking: false
            }
          : msg
      ));
    } else if (messageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: errorMessage, isError: true, isStreaming: false, isThinking: false }
          : msg
      ));
    }

    setError(error.message);
    toast.error('Connection issue - please retry', { duration: 3000 });
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([getWelcomeMessage()]);
    setStreamingMessage('');
    setError(null);
    setIdentifiedProblems([]);
    setConversationStage('discovery');
    setHasShownCalendlyButton(false);
    conversationIdRef.current = `conv-${Date.now()}`;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('strive-chat-history');
    }
  }, []);

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      
      if (streamingIdRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.id === streamingIdRef.current 
            ? { ...msg, isStreaming: false, isThinking: false }
            : msg
        ));
      }
      
      setIsLoading(false);
      setStreamingMessage('');
      streamingIdRef.current = null;
    }
  }, []);

  // Retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter(msg => !(msg.role === 'assistant' && (msg.isError || msg.isPartial))));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Get stats
  const getStats = useCallback((): ChatStats => {
    const userMessages = messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = messages.filter(msg => msg.role === 'assistant' && !msg.isWelcome).length;
    
    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      conversationId: conversationIdRef.current,
      hasApiKey: true, // In Next.js, API key is always on server
      isStreaming: isLoading && !!streamingIdRef.current,
      identifiedProblems: identifiedProblems.map(p => p.key),
      conversationStage,
      needsConsultation: conversationStage === 'closing' || userMessages >= 8
    };
  }, [messages, isLoading, identifiedProblems, conversationStage]);

  // Auto-save conversation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length <= 1) return;

    try {
      const chatHistory = {
        messages: messages.filter(msg => !msg.isStreaming),
        timestamp: new Date(),
        conversationId: conversationIdRef.current,
        identifiedProblems: identifiedProblems,
        stage: conversationStage
      };
      localStorage.setItem('strive-chat-history', JSON.stringify(chatHistory));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, [messages, identifiedProblems, conversationStage]);

  return {
    messages,
    isLoading,
    streamingMessage,
    error,
    sendMessage,
    clearMessages,
    stopGeneration,
    retryLastMessage,
    clearError,
    getStats,
    identifiedProblems,
    conversationStage,
    hasShownCalendlyButton,
    hasSavedChat
  };
};