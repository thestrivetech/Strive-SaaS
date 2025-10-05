// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk/index.mjs';
import { z } from 'zod';
import { loadIndustryConfig } from '@/app/industries';
import { RAGService } from '@/app/services/rag-service';
import { RentCastService, PropertySearchParams } from '@/app/services/rentcast-service';
import { IndustryType } from '@/types/industry';
import { ChatRequestSchema } from '@/app/schemas/chat-request';
import { Message } from '@/types/conversation';
import { RAGContext } from '@/types/rag';
import {
  extractDataFromMessage,
  mergeExtractedData,
  hasMinimumSearchCriteria,
  formatPreferences,
  PropertyPreferences,
} from '@/lib/ai/data-extraction';
import {
  syncLeadToCRM,
  logActivity,
  trackPropertyView,
} from '@/lib/services/crm-integration';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Session state cache (in production, use Redis or database)
const sessionStateCache = new Map<string, PropertyPreferences>();

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = ChatRequestSchema.parse(body);

    const {
      messages,
      industry = 'strive',
      sessionId,
      organizationId = 'default_org', // TODO: Get from auth context
    } = validated;

    // Load industry configuration
    const config = await loadIndustryConfig(industry as IndustryType);

    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];

    // 🎯 PHASE 1: INTELLIGENT DATA EXTRACTION
    console.log('🧠 Extracting data from user message...');
    const extraction = await extractDataFromMessage(
      latestUserMessage.content,
      messages.slice(-5).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    );

    console.log('✅ Extracted:', {
      fields: extraction.extractedFields,
      confidence: extraction.confidence,
      preferences: formatPreferences(extraction.propertyPreferences),
    });

    // Get or initialize session state
    let sessionPreferences = sessionStateCache.get(sessionId) || {};

    // Merge extracted data with existing session state
    sessionPreferences = mergeExtractedData(sessionPreferences, extraction.propertyPreferences);
    sessionStateCache.set(sessionId, sessionPreferences);

    console.log('💾 Current session state:', formatPreferences(sessionPreferences));

    // Check if we can search now
    const canSearchNow = hasMinimumSearchCriteria(sessionPreferences);
    console.log('🔍 Can search:', canSearchNow);

    // Build conversation history context
    const conversationHistory = {
      stage: determineConversationStage(messages as unknown as Message[]),
      messageCount: messages.length,
      problemsDiscussed: extractProblemsDiscussed(messages as unknown as Message[]),
      currentPreferences: sessionPreferences,
      extractedThisMessage: extraction.extractedFields,
      canSearch: canSearchNow,
    };

    // 🔥 RAG ENHANCEMENT: Get semantic context
    console.log('🔍 Searching for similar conversations...');
    const ragContext = await RAGService.buildRAGContext(
      latestUserMessage.content,
      industry,
      conversationHistory
    );

    console.log('✅ RAG Context:', {
      detectedProblems: ragContext.searchResults.detectedProblems,
      confidence: ragContext.searchResults.confidence.overallConfidence,
      suggestedApproach: ragContext.guidance.suggestedApproach,
    });

    // Build enhanced system prompt with RAG context AND extracted data
    const enhancedSystemPrompt = buildEnhancedSystemPrompt(
      config.systemPrompt,
      ragContext,
      sessionPreferences,
      extraction.extractedFields,
      canSearchNow
    );

    // Prepare messages for Groq
    const groqMessages = [
      {
        role: 'system' as const,
        content: enhancedSystemPrompt,
      },
      ...messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ];

    // Stream response from Groq
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 2000, // Increased for property results
      stream: true,
    });

    // Create readable stream
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Stream LLM response
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }

          // 🏠 PROPERTY SEARCH: Check if response contains property search request OR if we can auto-search
          console.log('🔍 Property search check:', {
            industry,
            hasSearchTag: fullResponse.includes('<property_search>'),
            canSearchNow,
            sessionPreferences,
            fullResponsePreview: fullResponse.substring(0, 200)
          });

          const shouldSearch = industry === 'real-estate' && (
            fullResponse.includes('<property_search>') || canSearchNow
          );

          console.log('🎯 Should search?', shouldSearch);

          if (shouldSearch) {
            try {
              console.log('🏠 Property search triggered');
              console.log('📋 Session preferences:', sessionPreferences);

              let searchParams: PropertySearchParams;

              // Check if AI provided explicit search parameters
              const searchMatch = fullResponse.match(/<property_search>([\s\S]*?)<\/property_search>/);

              if (searchMatch) {
                // AI provided explicit search params
                searchParams = JSON.parse(searchMatch[1]);
                console.log('🔍 Using AI-provided search params:', searchParams);
              } else if (canSearchNow) {
                // Auto-search using extracted session state
                searchParams = {
                  location: sessionPreferences.location!,
                  maxPrice: sessionPreferences.maxPrice!,
                  minBedrooms: sessionPreferences.minBedrooms || 2, // Default: 2+ beds
                  minBathrooms: sessionPreferences.minBathrooms || 1, // Default: 1+ baths
                  mustHaveFeatures: sessionPreferences.mustHaveFeatures || [],
                  niceToHaveFeatures: sessionPreferences.niceToHaveFeatures,
                  propertyType: sessionPreferences.propertyType === 'any' ? undefined : sessionPreferences.propertyType,
                };
                console.log('🔍 Auto-searching with extracted params:', searchParams);
              } else {
                // Skip search
                throw new Error('Cannot search: minimum criteria not met');
              }

              // Fetch properties from RentCast
              console.log('🔍 Calling RentCast API with params:', searchParams);
              const properties = await RentCastService.searchProperties(searchParams);
              console.log(`✅ RentCast returned ${properties.length} properties`);

              // Match and score properties
              const matches = RentCastService.matchProperties(properties, searchParams);
              console.log(`🎯 Top ${matches.length} matches selected after scoring`);
              console.log('🏘️ Property addresses:', matches.map(m => m.property.address));

              // Send property results to client
              const propertyData = JSON.stringify({
                type: 'property_results',
                properties: matches,
              });
              console.log('📤 Sending property_results to client:', {
                type: 'property_results',
                count: matches.length,
                firstAddress: matches[0]?.property.address,
                dataSize: propertyData.length
              });
              controller.enqueue(encoder.encode(`data: ${propertyData}\n\n`));
              console.log('✅ Property results sent successfully');
            } catch (propertyError) {
              console.error('❌ Property search error:', propertyError);
              const errorData = JSON.stringify({
                type: 'property_search_error',
                error: 'Failed to search properties. Please try again.',
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            }
          }

          // 🔥 STORE CONVERSATION: Save for future learning
          console.log('💾 Storing conversation for learning...');
          await RAGService.storeConversation({
            industry,
            sessionId,
            userMessage: latestUserMessage.content,
            assistantResponse: fullResponse,
            conversationStage: conversationHistory.stage,
            outcome: 'in_progress',
            bookingCompleted: false,
            problemDetected: ragContext.searchResults.detectedProblems[0],
            solutionPresented: ragContext.searchResults.recommendedSolutions[0],
          });

          // 💼 CRM INTEGRATION: Sync lead to platform CRM
          if (industry === 'real-estate') {
            try {
              console.log('💼 Syncing lead to CRM...');

              const { leadId, isNew } = await syncLeadToCRM({
                sessionId,
                organizationId,
                contactInfo: extraction.contactInfo,
                propertyPreferences: sessionPreferences,
                messageCount: messages.length,
                hasSearched: shouldSearch,
                viewedProperties: [], // Updated via separate tracking
                lastMessage: latestUserMessage.content,
              });

              console.log(`✅ ${isNew ? 'Created' : 'Updated'} lead ${leadId} in CRM`);

              // Log conversation activity
              await logActivity({
                organizationId,
                leadId,
                activityType: 'message',
                description: `Chatbot conversation: "${latestUserMessage.content.slice(0, 100)}..."`,
                metadata: {
                  extracted_fields: extraction.extractedFields,
                  can_search: canSearchNow,
                  preferences: sessionPreferences,
                },
              });

              // Log property search activity if triggered
              if (shouldSearch) {
                await logActivity({
                  organizationId,
                  leadId,
                  activityType: 'property_search',
                  description: `Searched properties in ${sessionPreferences.location} under $${sessionPreferences.maxPrice?.toLocaleString()}`,
                  metadata: {
                    search_params: sessionPreferences,
                  },
                });
              }
            } catch (crmError) {
              console.error('❌ CRM sync error (non-critical):', crmError);
              // Don't fail the request if CRM sync fails
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('❌ Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: error.issues.map((e: z.ZodIssue) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build enhanced system prompt with RAG context AND conversation state
 */
function buildEnhancedSystemPrompt(
  basePrompt: string,
  ragContext: RAGContext,
  sessionPreferences: PropertyPreferences,
  extractedFields: string[],
  canSearch: boolean
): string {
  const { searchResults, guidance } = ragContext;

  let enhancement = '\n\n## 🎯 CONTEXTUAL INTELLIGENCE\n\n';

  // Add conversation state awareness
  enhancement += `### 📊 Current Conversation State:\n\n`;

  if (Object.keys(sessionPreferences).length > 0) {
    enhancement += `**Information Already Collected:**\n`;
    if (sessionPreferences.location) enhancement += `- 📍 Location: ${sessionPreferences.location}\n`;
    if (sessionPreferences.maxPrice) enhancement += `- 💰 Budget: $${sessionPreferences.maxPrice.toLocaleString()}\n`;
    if (sessionPreferences.minBedrooms) enhancement += `- 🛏️ Bedrooms: ${sessionPreferences.minBedrooms}+\n`;
    if (sessionPreferences.minBathrooms) enhancement += `- 🛁 Bathrooms: ${sessionPreferences.minBathrooms}+\n`;
    if (sessionPreferences.propertyType) enhancement += `- 🏠 Type: ${sessionPreferences.propertyType}\n`;
    if (sessionPreferences.mustHaveFeatures && sessionPreferences.mustHaveFeatures.length > 0) {
      enhancement += `- ✨ Must-have features: ${sessionPreferences.mustHaveFeatures.join(', ')}\n`;
    }
    enhancement += '\n';
  }

  if (extractedFields.length > 0) {
    enhancement += `**Just Extracted from Last Message:** ${extractedFields.join(', ')}\n\n`;
  }

  // Search readiness
  if (canSearch) {
    enhancement += `🚀 **READY TO SEARCH!** You have location + budget. You can trigger a property search NOW by outputting the <property_search> format!\n\n`;
  } else {
    const missing: string[] = [];
    if (!sessionPreferences.location) missing.push('location');
    if (!sessionPreferences.maxPrice) missing.push('budget');
    if (missing.length > 0) {
      enhancement += `❌ **Cannot search yet.** Missing: ${missing.join(', ')}\n`;
      enhancement += `Ask for these naturally in your next response!\n\n`;
    }
  }

  // RAG-Enhanced Guidance
  if (searchResults.detectedProblems.length > 0) {
    enhancement += `### 💡 Similar Conversations:\n`;
    searchResults.detectedProblems.forEach((problem: string) => {
      enhancement += `- ${problem}\n`;
    });
    enhancement += '\n';
  }

  if (guidance.suggestedApproach) {
    enhancement += `### 🎯 Recommended Approach:\n${guidance.suggestedApproach}\n\n`;
  }

  enhancement += `**REMEMBER:** Don't ask for information you already have! Reference it naturally instead.\n`;
  enhancement += `**REMEMBER:** If you can search now, do it! Don't keep asking unnecessary questions.\n`;

  return basePrompt + enhancement;
}

/**
 * Determine current conversation stage
 */
function determineConversationStage(messages: Message[]): string {
  const userMessages = messages.filter(m => m.role === 'user');
  
  if (userMessages.length <= 2) return 'discovery';
  if (userMessages.length <= 4) return 'qualifying';
  if (userMessages.length <= 6) return 'solutioning';
  
  return 'closing';
}

/**
 * Extract problems discussed so far
 */
function extractProblemsDiscussed(messages: Message[]): string[] {
  const problems: string[] = [];
  const problemKeywords = [
    'losing customers',
    'churn',
    'defects',
    'quality',
    'support tickets',
    'fraud',
    'maintenance',
    'inventory',
    // Real estate specific
    'looking for',
    'buy',
    'sell',
    'property',
    'home',
    'budget',
    'prequalified',
    'market',
  ];

  messages.forEach(message => {
    const content = message.content.toLowerCase();
    problemKeywords.forEach(keyword => {
      if (content.includes(keyword) && !problems.includes(keyword)) {
        problems.push(keyword);
      }
    });
  });

  return problems;
}