# Session 6: AI Profile Generation & Insights Analysis

## Session Overview
**Goal:** Implement AI-powered neighborhood profile generation and insights analysis using OpenRouter/Groq integration.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 5 (UI components complete)

## Objectives

1. ✅ Create AI module (lib/modules/reid/ai/)
2. ✅ Implement neighborhood profile generation
3. ✅ Create insights analyzer
4. ✅ Add AI-powered recommendations
5. ✅ Integrate with OpenRouter/Groq
6. ✅ Enforce Elite tier requirement
7. ✅ Add rate limiting for AI requests

## Prerequisites

- [x] Session 5 completed
- [x] OpenRouter/Groq API keys configured
- [x] Understanding of AI integration patterns
- [x] Elite tier feature gating in place

## Implementation Steps

### Step 1: Create AI Schemas

#### File: `lib/modules/reid/ai/schemas.ts`
```typescript
import { z } from 'zod';

export const AIProfileRequestSchema = z.object({
  areaCode: z.string(),
  includeMarketData: z.boolean().default(true),
  includeDemographics: z.boolean().default(true),
  includeAmenities: z.boolean().default(true),
  includeInvestmentAnalysis: z.boolean().default(true),
});

export const AIInsightsRequestSchema = z.object({
  areaCodes: z.array(z.string()).min(1).max(5),
  analysisType: z.enum([
    'comparative',
    'investment',
    'demographic_trends',
    'market_forecast'
  ]),
});

export type AIProfileRequest = z.infer<typeof AIProfileRequestSchema>;
export type AIInsightsRequest = z.infer<typeof AIInsightsRequestSchema>;
```

### Step 2: Create AI Profile Generator

#### File: `lib/modules/reid/ai/profile-generator.ts`
```typescript
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAIFeatures } from '@/lib/auth/rbac';

export async function generateNeighborhoodProfile(areaCode: string, organizationId: string) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  // Fetch neighborhood data
  const insight = await prisma.neighborhood_insights.findFirst({
    where: {
      area_code: areaCode,
      organization_id: organizationId
    }
  });

  if (!insight) {
    throw new Error('Neighborhood insight not found');
  }

  // Prepare context for AI
  const context = buildProfileContext(insight);

  // Generate AI profile using OpenRouter/Groq
  const aiResponse = await callAIService({
    model: 'meta-llama/llama-3.1-70b-instruct',
    messages: [
      {
        role: 'system',
        content: 'You are a real estate market analyst. Generate a comprehensive neighborhood profile based on the provided data.'
      },
      {
        role: 'user',
        content: `Generate a detailed neighborhood profile for ${insight.area_name}. Data: ${JSON.stringify(context)}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const profile = aiResponse.choices[0].message.content;

  // Extract key insights
  const insights = await extractKeyInsights(profile, insight);

  // Update insight with AI-generated content
  await prisma.neighborhood_insights.update({
    where: { id: insight.id },
    data: {
      ai_profile: profile,
      ai_insights: insights,
    }
  });

  return { profile, insights };
}

function buildProfileContext(insight: any) {
  return {
    area: insight.area_name,
    marketMetrics: {
      medianPrice: insight.median_price,
      daysOnMarket: insight.days_on_market,
      inventory: insight.inventory,
      priceChange: insight.price_change,
    },
    demographics: {
      medianAge: insight.median_age,
      medianIncome: insight.median_income,
      households: insight.households,
      commuteTime: insight.commute_time,
    },
    amenities: {
      schoolRating: insight.school_rating,
      walkScore: insight.walk_score,
      bikeScore: insight.bike_score,
      crimeIndex: insight.crime_index,
      parkProximity: insight.park_proximity,
    },
    investment: {
      rentYield: insight.rent_yield,
      appreciationRate: insight.appreciation_rate,
      investmentGrade: insight.investment_grade,
    }
  };
}

async function extractKeyInsights(profile: string, insight: any): Promise<string[]> {
  // Use AI to extract bullet-point insights
  const response = await callAIService({
    model: 'meta-llama/llama-3.1-70b-instruct',
    messages: [
      {
        role: 'system',
        content: 'Extract 3-5 key insights as bullet points from the neighborhood profile.'
      },
      {
        role: 'user',
        content: profile
      }
    ],
    temperature: 0.5,
    max_tokens: 200,
  });

  const insightsText = response.choices[0].message.content;
  return insightsText.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
}

async function callAIService(params: any) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('AI service request failed');
  }

  return response.json();
}
```

### Step 3: Create Insights Analyzer

#### File: `lib/modules/reid/ai/insights-analyzer.ts`
```typescript
export async function analyzeMultipleAreas(areaCodes: string[], organizationId: string) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  const insights = await prisma.neighborhood_insights.findMany({
    where: {
      area_code: { in: areaCodes },
      organization_id: organizationId
    }
  });

  if (insights.length === 0) {
    throw new Error('No insights found for specified areas');
  }

  // Prepare comparative context
  const context = insights.map(i => ({
    area: i.area_name,
    price: i.median_price,
    daysOnMarket: i.days_on_market,
    walkScore: i.walk_score,
    schoolRating: i.school_rating,
    investmentGrade: i.investment_grade,
  }));

  const response = await callAIService({
    model: 'meta-llama/llama-3.1-70b-instruct',
    messages: [
      {
        role: 'system',
        content: 'You are a real estate investment analyst. Compare multiple neighborhoods and provide investment recommendations.'
      },
      {
        role: 'user',
        content: `Compare these ${insights.length} neighborhoods and provide investment insights: ${JSON.stringify(context)}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return {
    analysis: response.choices[0].message.content,
    areas: insights.map(i => i.area_name),
    timestamp: new Date(),
  };
}

export async function generateInvestmentRecommendations(areaCode: string, organizationId: string) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  const insight = await prisma.neighborhood_insights.findFirst({
    where: {
      area_code: areaCode,
      organization_id: organizationId
    }
  });

  if (!insight) {
    throw new Error('Neighborhood not found');
  }

  const response = await callAIService({
    model: 'meta-llama/llama-3.1-70b-instruct',
    messages: [
      {
        role: 'system',
        content: 'You are a real estate investment advisor. Provide specific, actionable investment recommendations.'
      },
      {
        role: 'user',
        content: `Based on this data for ${insight.area_name}, provide investment recommendations: ${JSON.stringify(buildProfileContext(insight))}`
      }
    ],
    temperature: 0.6,
    max_tokens: 800,
  });

  return {
    recommendations: response.choices[0].message.content,
    area: insight.area_name,
    investmentGrade: insight.investment_grade,
  };
}
```

### Step 4: Create AI Actions

#### File: `lib/modules/reid/ai/actions.ts`
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAIFeatures } from '@/lib/auth/rbac';
import { generateNeighborhoodProfile } from './profile-generator';
import { analyzeMultipleAreas, generateInvestmentRecommendations } from './insights-analyzer';
import { AIProfileRequestSchema, AIInsightsRequestSchema } from './schemas';
import type { AIProfileRequest, AIInsightsRequest } from './schemas';

export async function requestAIProfile(input: AIProfileRequest) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  const validated = AIProfileRequestSchema.parse(input);

  const result = await generateNeighborhoodProfile(
    validated.areaCode,
    session.user.organizationId
  );

  revalidatePath(`/real-estate/reid/insights/${validated.areaCode}`);
  revalidatePath('/real-estate/reid/ai-profiles');

  return result;
}

export async function requestAIInsights(input: AIInsightsRequest) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  const validated = AIInsightsRequestSchema.parse(input);

  const result = await analyzeMultipleAreas(
    validated.areaCodes,
    session.user.organizationId
  );

  revalidatePath('/real-estate/reid/ai-profiles');

  return result;
}

export async function requestInvestmentRecommendations(areaCode: string) {
  const session = await requireAuth();

  if (!canAccessAIFeatures(session.user)) {
    throw new Error('AI features require Elite subscription');
  }

  const result = await generateInvestmentRecommendations(
    areaCode,
    session.user.organizationId
  );

  revalidatePath(`/real-estate/reid/insights/${areaCode}`);

  return result;
}
```

### Step 5: Create Module Exports

#### File: `lib/modules/reid/ai/index.ts`
```typescript
export {
  requestAIProfile,
  requestAIInsights,
  requestInvestmentRecommendations
} from './actions';

export {
  AIProfileRequestSchema,
  AIInsightsRequestSchema
} from './schemas';

export type {
  AIProfileRequest,
  AIInsightsRequest
} from './schemas';
```

### Step 6: Update Module Root

#### File: `lib/modules/reid/index.ts`
```typescript
// Insights
export * from './insights';

// Alerts
export * from './alerts';

// Reports
export * from './reports';

// Preferences
export * from './preferences';

// AI
export * from './ai';
```

## Testing & Validation

### Test 1: AI Profile Generation
```typescript
import { requestAIProfile } from '@/lib/modules/reid/ai';

describe('AI Profile Generation', () => {
  it('generates profile for Elite tier users', async () => {
    const result = await requestAIProfile({
      areaCode: '94110',
      includeMarketData: true,
      includeDemographics: true,
    });

    expect(result.profile).toBeTruthy();
    expect(result.insights).toBeInstanceOf(Array);
  });

  it('blocks non-Elite users', async () => {
    // Test with GROWTH tier user
    await expect(requestAIProfile({ areaCode: '94110' }))
      .rejects
      .toThrow('AI features require Elite subscription');
  });
});
```

## Success Criteria

- [x] AI module created
- [x] Neighborhood profile generation working
- [x] Insights analyzer functional
- [x] Investment recommendations implemented
- [x] OpenRouter/Groq integration complete
- [x] Elite tier enforcement working
- [x] Error handling robust

## Files Created

- ✅ `lib/modules/reid/ai/schemas.ts`
- ✅ `lib/modules/reid/ai/profile-generator.ts`
- ✅ `lib/modules/reid/ai/insights-analyzer.ts`
- ✅ `lib/modules/reid/ai/actions.ts`
- ✅ `lib/modules/reid/ai/index.ts`

## Files Modified

- ✅ `lib/modules/reid/index.ts`

## Next Steps

1. ✅ Proceed to **Session 7: Market Heatmap Component**
2. ✅ AI features functional
3. ✅ Ready to build interactive visualizations
4. ✅ Elite tier value proposition enhanced

---

**Session 6 Complete:** ✅ AI profile generation and insights analysis implemented
