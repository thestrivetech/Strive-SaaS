// hooks/useChatHelpers.ts
'use client';

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
}

interface ProblemDetection {
  key: string;
  confidence: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  matchedKeywords: string[];
}

// Get current date context for AI awareness
export const getCurrentDateContext = (): string => {
  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const quarter = Math.floor(now.getMonth() / 3) + 1;

  return `Current date: ${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}. Q${quarter} ${now.getFullYear()}.`;
};

// Welcome message generator - REAL ESTATE
export const getWelcomeMessage = (showContinueOption = false): Message => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const baseMessage = `Welcome to STRIVE REAL ESTATE AI! I'm Sai, your real estate AI consultant.\n\nHope you're having a good ${greeting}!`;

  const continueMessage = showContinueOption
    ? '\n\nI see we have a previous conversation. Would you like to continue where we left off?\n\nType "yes" to resume, or just tell me about your current real estate needs.'
    : "\n\nI help real estate professionals attract more qualified leads, match buyers with perfect properties, and stay ahead of market trends. Whether you're a real estate agent, broker, or property developer - what brings you here today? Are you facing a specific challenge, or just curious about what AI can do for your business?";

  return {
    id: 'welcome-message',
    role: 'assistant',
    content: baseMessage + continueMessage,
    timestamp: new Date(),
    isWelcome: true
  };
};

// Basic grammar check
export const performBasicGrammarCheck = (text: string): string => {
  if (!text) return text;

  const fixes = [
    { pattern: / {2,}/g, replacement: ' ' },
    { pattern: /([.!?])([A-Z])/g, replacement: '$1 $2' },
    { pattern: /\.{2,}/g, replacement: '.' },
    { pattern: /\b(a|an|the)\s+\1\b/gi, replacement: '$1' },
  ];

  let correctedText = text.trim();
  fixes.forEach(fix => {
    correctedText = correctedText.replace(fix.pattern, fix.replacement);
  });

  // Fix Calendly links
  if (correctedText.includes('calendly.com/strivetech')) {
    correctedText = correctedText.split(' ').map(word => {
      if (word.includes('calendly.com/strivetech') && !word.includes('https://')) {
        return word.replace('calendly.com/strivetech', 'https://calendly.com/strivetech');
      }
      return word;
    }).join(' ');
  }

  return correctedText;
};

// Client-side problem detection (lightweight version)
export const detectProblemsClientSide = (message: string): ProblemDetection[] => {
  const lowerMessage = message.toLowerCase();
  const detected: ProblemDetection[] = [];

  const problemKeywords: Record<string, { keywords: string[]; urgency: 'low' | 'medium' | 'high' }> = {
    churn: {
      keywords: ['losing customers', 'retention', 'leaving', 'cancel', 'churn', 'unsubscribe'],
      urgency: 'high'
    },
    support: {
      keywords: ['customer support', 'tickets', 'help desk', 'overwhelmed', 'complaints'],
      urgency: 'medium'
    },
    quality: {
      keywords: ['defect', 'quality control', 'inspection', 'faulty', 'qa'],
      urgency: 'high'
    },
    fraud: {
      keywords: ['fraud', 'suspicious', 'risk', 'scam', 'unauthorized'],
      urgency: 'high'
    },
    maintenance: {
      keywords: ['equipment failure', 'breakdown', 'downtime', 'maintenance'],
      urgency: 'high'
    },
  };

  Object.entries(problemKeywords).forEach(([key, { keywords, urgency }]) => {
    const matchedKeywords = keywords.filter(kw => lowerMessage.includes(kw));
    if (matchedKeywords.length > 0) {
      detected.push({
        key,
        confidence: matchedKeywords.length > 1 ? 'high' : 'medium',
        urgency,
        matchedKeywords
      });
    }
  });

  return detected;
};

// Determine conversation stage
export const determineConversationStage = (messageCount: number, problemsDetected: number): string => {
  if (messageCount <= 2) return 'discovery';
  if (messageCount <= 4 && problemsDetected === 0) return 'discovery';
  if (problemsDetected > 0 && messageCount <= 6) return 'qualifying';
  if (problemsDetected > 0 && messageCount > 6) return 'solutioning';
  if (messageCount > 10) return 'closing';
  return 'discovery';
};
