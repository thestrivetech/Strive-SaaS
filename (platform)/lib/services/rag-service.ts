// lib/services/rag-service.ts
import 'server-only';

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// TODO: Re-enable when @strive/shared is properly configured
// import { CacheService } from '@strive/shared/services/cache-service';
// import {
//   SemanticSearchResult,
//   SimilarConversation,
//   RAGContext,
// } from '@strive/shared/types/rag';

// Temporary type definitions (to be moved to @strive/shared)
export interface SimilarConversation {
  id: string;
  userMessage: string;
  assistantResponse: string;
  problemDetected?: string;
  solutionPresented?: string;
  outcome?: string;
  conversionScore?: number;
  similarity: number;
}

export interface SemanticSearchResult {
  similarConversations: SimilarConversation[];
  detectedProblems: string[];
  recommendedSolutions: string[];
  bestPattern?: {
    approach: string;
    conversionScore: number;
    stage: string;
  };
  confidence: {
    problemDetection: number;
    solutionMatch: number;
    overallConfidence: number;
  };
}

export interface RAGContext {
  userMessage: string;
  searchResults: SemanticSearchResult;
  conversationHistory: {
    stage: string;
    messageCount: number;
    problemsDiscussed: string[];
  };
  guidance: {
    suggestedApproach: string;
    keyPoints: string[];
    avoidTopics: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

// Temporary no-op CacheService replacement (caching disabled for showcase)
// TODO: Re-enable when @strive/shared is properly configured
const CacheService = {
  createKey: (...args: any[]) => args.join(':'),
  get: <T>(_key: string): T | null => null,
  set: (_key: string, _value: any, _ttl?: number) => {},
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class RAGService {
  /**
   * Generate embedding for text using OpenAI (WITH CACHING)
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // ✅ CREATE CACHE KEY
    const cacheKey = CacheService.createKey('embedding', this.hashText(text));

    // ✅ CHECK CACHE FIRST
    const cached = CacheService.get<number[]>(cacheKey);
    if (cached) {
      console.log('✅ Embedding cache HIT - saved $0.0001');
      return cached;
    }

    // ✅ CACHE MISS - Generate new embedding
    console.log('💰 Generating new embedding (costs $0.0001)');
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0].embedding;

    // ✅ STORE IN CACHE (24 hours)
    CacheService.set(cacheKey, embedding, 86400); // 24 hours

    return embedding;
  }

  /**
   * Simple hash function for cache keys
   */
  private static hashText(text: string): string {
    // Normalize text for caching
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');

    // Simple hash (good enough for caching similar queries)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `${hash}_${normalized.substring(0, 50)}`;
  }

  /**
   * Search for similar conversations using vector similarity (WITH CACHING)
   */
  static async searchSimilarConversations(
    userMessage: string,
    industry: string,
    options: {
      threshold?: number;
      limit?: number;
      includeExamples?: boolean;
    } = {}
  ): Promise<SemanticSearchResult> {
    const {
      threshold = 0.75,
      limit = 5,
      includeExamples = true,
    } = options;

    // ✅ CHECK RAG CACHE
    const ragCacheKey = CacheService.createKey('rag', industry, this.hashText(userMessage));
    const cachedResults = CacheService.get<SemanticSearchResult>(ragCacheKey);

    if (cachedResults) {
      console.log('✅ RAG search cache HIT');
      return cachedResults;
    }

    console.log('🔍 RAG search cache MISS - performing search');

    // Generate embedding (this will use embedding cache)
    const embedding = await this.generateEmbedding(userMessage);

    // Search actual conversations
    const { data: conversations, error: convError } = await supabase.rpc(
      'match_conversations',
      {
        query_embedding: embedding,
        match_industry: industry,
        match_threshold: threshold,
        match_count: limit,
      }
    );

    if (convError) {
      console.error('Error searching conversations:', convError);
    }

    // Search example conversations
    let examples: any[] = [];
    if (includeExamples) {
      const { data: exampleData, error: exError } = await supabase.rpc(
        'match_examples',
        {
          query_embedding: embedding,
          match_industry: industry,
          match_threshold: threshold,
          match_count: limit,
        }
      );

      if (exError) {
        console.error('Error searching examples:', exError);
      } else {
        examples = exampleData || [];
      }
    }

    // Combine and analyze results
    const allResults = [
      ...(conversations || []),
      ...examples.map(e => ({
        id: e.id,
        userMessage: e.user_input,
        assistantResponse: e.assistant_response,
        problemDetected: e.problem_type,
        solutionPresented: e.solution_type,
        outcome: e.outcome,
        conversionScore: e.conversion_score,
        similarity: e.similarity,
      })),
    ];

    // Extract detected problems
    const problemCounts = new Map<string, number>();
    allResults.forEach(r => {
      if (r.problemDetected) {
        problemCounts.set(
          r.problemDetected,
          (problemCounts.get(r.problemDetected) || 0) + 1
        );
      }
    });

    const detectedProblems = Array.from(problemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([problem]) => problem);

    // Extract recommended solutions
    const solutionCounts = new Map<string, number>();
    allResults.forEach(r => {
      if (r.solutionPresented) {
        solutionCounts.set(
          r.solutionPresented,
          (solutionCounts.get(r.solutionPresented) || 0) + 1
        );
      }
    });

    const recommendedSolutions = Array.from(solutionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([solution]) => solution);

    // Find best response pattern (highest conversion)
    const bestPattern = allResults
      .filter(r => r.conversionScore && r.conversionScore > 0.7)
      .sort((a, b) => (b.conversionScore || 0) - (a.conversionScore || 0))[0];

    // Calculate confidence scores
    const avgSimilarity =
      allResults.reduce((sum, r) => sum + r.similarity, 0) /
      Math.max(allResults.length, 1);

    const problemConfidence = Math.min(
      problemCounts.size > 0 ? Math.max(...problemCounts.values()) / allResults.length : 0,
      1
    );

    const solutionConfidence = Math.min(
      solutionCounts.size > 0 ? Math.max(...solutionCounts.values()) / allResults.length : 0,
      1
    );

    const results: SemanticSearchResult = {
      similarConversations: allResults as SimilarConversation[],
      detectedProblems,
      recommendedSolutions,
      bestPattern: bestPattern
        ? {
            approach: bestPattern.assistantResponse,
            conversionScore: bestPattern.conversionScore || 0,
            stage: 'solutioning',
          }
        : undefined,
      confidence: {
        problemDetection: problemConfidence,
        solutionMatch: solutionConfidence,
        overallConfidence: (avgSimilarity + problemConfidence + solutionConfidence) / 3,
      },
    };

    // ✅ CACHE RAG RESULTS (1 hour)
    CacheService.set(ragCacheKey, results, 3600);

    return results;
  }

  /**
   * Build enhanced context for AI
   */
  static async buildRAGContext(
    userMessage: string,
    industry: string,
    conversationHistory: {
      stage: string;
      messageCount: number;
      problemsDiscussed: string[];
    }
  ): Promise<RAGContext> {
    const searchResults = await this.searchSimilarConversations(
      userMessage,
      industry
    );

    // Generate guidance based on search results
    const guidance = this.generateGuidance(searchResults, conversationHistory);

    return {
      userMessage,
      searchResults,
      conversationHistory,
      guidance,
    };
  }

  /**
   * Generate guidance for AI based on RAG results
   */
  private static generateGuidance(
    searchResults: SemanticSearchResult,
    conversationHistory: any
  ): RAGContext['guidance'] {
    const { confidence, detectedProblems, bestPattern } = searchResults;

    const keyPoints: string[] = [];
    const avoidTopics: string[] = [];
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';

    // High confidence - use proven approach
    if (confidence.overallConfidence > 0.8 && bestPattern) {
      keyPoints.push(
        `Similar conversations with ${Math.round(bestPattern.conversionScore * 100)}% conversion rate used this approach`
      );
      keyPoints.push('Focus on problem quantification and impact');
    }

    // Medium confidence - suggest exploration
    if (confidence.overallConfidence > 0.5 && confidence.overallConfidence <= 0.8) {
      keyPoints.push('Ask 2-3 discovery questions to clarify the problem');
      keyPoints.push('Avoid premature solution presentation');
    }

    // Low confidence - stay in discovery
    if (confidence.overallConfidence <= 0.5) {
      keyPoints.push('Stay in discovery mode - ask open-ended questions');
      avoidTopics.push('Specific solution recommendations');
    }

    // Detect urgency based on problem patterns
    if (detectedProblems.some(p => p.includes('churn') || p.includes('fraud'))) {
      urgencyLevel = 'high';
      keyPoints.push('Emphasize cost of inaction and urgency');
    }

    const suggestedApproach =
      confidence.overallConfidence > 0.8
        ? 'Present solution with proven talking points'
        : confidence.overallConfidence > 0.5
        ? 'Ask qualifying questions to confirm problem'
        : 'Continue discovery to understand pain points';

    return {
      suggestedApproach,
      keyPoints,
      avoidTopics,
      urgencyLevel,
    };
  }

  /**
   * Store conversation with embedding for future learning
   */
  static async storeConversation(data: {
    industry: string;
    sessionId: string;
    userMessage: string;
    assistantResponse: string;
    conversationStage: string;
    outcome?: string;
    problemDetected?: string;
    solutionPresented?: string;
    organizationId?: string;
    conversionScore?: number;
    bookingCompleted?: boolean;
    responseTimeMs?: number;
    userSatisfaction?: number;
  }): Promise<void> {
    try {
      // Generate embedding for user message (will use cache if available)
      const embedding = await this.generateEmbedding(data.userMessage);

      // Use default org ID if not provided (public chatbot)
      const orgId = data.organizationId || 'public-chatbot-org';

      const { error } = await supabase.from('conversations').insert({
        organization_id: orgId,
        industry: data.industry,
        session_id: data.sessionId,
        user_message: data.userMessage,
        assistant_response: data.assistantResponse,
        embedding: embedding,
        conversation_stage: data.conversationStage,
        outcome: data.outcome,
        problem_detected: data.problemDetected,
        solution_presented: data.solutionPresented,
        conversion_score: data.conversionScore,
        booking_completed: data.bookingCompleted,
        response_time_ms: data.responseTimeMs,
        user_satisfaction: data.userSatisfaction,
      });

      if (error) {
        console.error('Failed to store conversation:', error);
      }
    } catch (error) {
      console.error('Failed to store conversation:', error);
      // Don't throw - logging failure shouldn't break chat
    }
  }

  /**
   * Mark conversation as successful (booking completed)
   */
  static async markConversationSuccess(
    sessionId: string,
    conversionScore: number = 1.0
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          outcome: 'booking_completed',
          booking_completed: true,
          conversion_score: conversionScore,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error marking conversation success:', error);
      }
    } catch (error) {
      console.error('Error marking conversation success:', error);
    }
  }
}
