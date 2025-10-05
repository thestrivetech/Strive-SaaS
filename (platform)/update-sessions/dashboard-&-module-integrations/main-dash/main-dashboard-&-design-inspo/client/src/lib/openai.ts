// This file provides AI functionality for the dashboard
// Using OpenAI's API for generating insights and answering user queries

interface AIInsightRequest {
  query: string;
  context?: Record<string, any>;
}

interface AIInsightResponse {
  insight: string;
  timestamp: string;
}

export async function generateAIInsight(request: AIInsightRequest): Promise<AIInsightResponse> {
  const response = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI insight');
  }

  return response.json();
}

export async function searchDashboard(query: string) {
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}
