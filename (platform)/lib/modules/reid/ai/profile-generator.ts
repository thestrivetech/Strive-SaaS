import type { neighborhood_insights } from '@prisma/client';

/**
 * Generate AI-powered neighborhood profile
 *
 * Creates a comprehensive narrative profile based on neighborhood data
 * Uses OpenRouter API with Llama 3.1 70B model
 *
 * @param insight - Neighborhood insight data from database
 * @param options - Generation options (which sections to include)
 * @returns AI-generated profile text
 */
export async function generateNeighborhoodProfile(
  insight: neighborhood_insights,
  options: {
    includeMarketAnalysis?: boolean;
    includeDemographics?: boolean;
    includeAmenities?: boolean;
    includeInvestmentPotential?: boolean;
  } = {}
): Promise<string> {
  const {
    includeMarketAnalysis = true,
    includeDemographics = true,
    includeAmenities = true,
    includeInvestmentPotential = true,
  } = options;

  // Build context from neighborhood data
  const context = buildProfileContext(insight, {
    includeMarketAnalysis,
    includeDemographics,
    includeAmenities,
    includeInvestmentPotential,
  });

  // Create AI prompt
  const prompt = `You are a real estate market analyst. Generate a comprehensive neighborhood profile for ${insight.area_name} (${insight.area_code}).

Available Data:
${context}

Generate a professional, narrative profile (300-500 words) covering:
${includeMarketAnalysis ? '- Current market conditions and trends' : ''}
${includeDemographics ? '- Demographics and community characteristics' : ''}
${includeAmenities ? '- Amenities and quality of life factors' : ''}
${includeInvestmentPotential ? '- Investment potential and opportunities' : ''}

Write in a clear, professional tone suitable for real estate investors and agents. Focus on actionable insights.`;

  // Call AI service
  const response = await callAIService(prompt, {
    temperature: 0.7,
    maxTokens: 800,
  });

  if (!response.success || !response.content) {
    throw new Error(response.error || 'AI profile generation failed');
  }

  return response.content;
}

/**
 * Extract key insights from neighborhood data
 *
 * Identifies the most important data points for decision-making
 *
 * @param insight - Neighborhood insight data
 * @returns Array of key insight strings
 */
export async function extractKeyInsights(
  insight: neighborhood_insights
): Promise<string[]> {
  const dataPoints = buildDataPoints(insight);

  const prompt = `Analyze this neighborhood data and extract the 5 most important insights for a real estate investor:

${dataPoints}

Return ONLY a JSON array of exactly 5 insights, each as a single concise sentence (max 20 words).
Example: ["Median home price increased 15% year-over-year", "School ratings above district average"]`;

  const response = await callAIService(prompt, {
    temperature: 0.5,
    maxTokens: 400,
  });

  if (!response.success || !response.content) {
    throw new Error(response.error || 'AI insights extraction failed');
  }

  try {
    const insights = response.content;
    if (!Array.isArray(insights) || insights.length !== 5) {
      throw new Error('Invalid insights format');
    }
    return insights;
  } catch {
    // Fallback: split by newlines if JSON parsing fails
    return response.content
      .split('\n')
      .filter((line: string) => line.trim())
      .slice(0, 5);
  }
}

/**
 * Build context string from neighborhood data
 */
function buildProfileContext(
  insight: neighborhood_insights,
  options: {
    includeMarketAnalysis?: boolean;
    includeDemographics?: boolean;
    includeAmenities?: boolean;
    includeInvestmentPotential?: boolean;
  }
): string {
  const sections: string[] = [];

  if (options.includeMarketAnalysis) {
    sections.push(`Market Data:
- Median Price: $${insight.median_price?.toLocaleString() || 'N/A'}
- Days on Market: ${insight.days_on_market || 'N/A'}
- Inventory: ${insight.inventory || 'N/A'} units
- Price Change: ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'}`);
  }

  if (options.includeDemographics) {
    sections.push(`Demographics:
- Median Age: ${insight.median_age || 'N/A'}
- Median Income: $${insight.median_income?.toLocaleString() || 'N/A'}
- Households: ${insight.households?.toLocaleString() || 'N/A'}
- Avg Commute: ${insight.commute_time || 'N/A'} minutes`);
  }

  if (options.includeAmenities) {
    sections.push(`Amenities & Quality of Life:
- School Rating: ${insight.school_rating || 'N/A'}/10
- Walk Score: ${insight.walk_score || 'N/A'}/100
- Bike Score: ${insight.bike_score || 'N/A'}/100
- Crime Index: ${insight.crime_index || 'N/A'}
- Park Proximity: ${insight.park_proximity || 'N/A'} miles`);
  }

  if (options.includeInvestmentPotential) {
    sections.push(`Investment Metrics:
- Rent Yield: ${insight.rent_yield ? `${insight.rent_yield}%` : 'N/A'}
- Appreciation Rate: ${insight.appreciation_rate ? `${insight.appreciation_rate}%` : 'N/A'}
- Investment Grade: ${insight.investment_grade || 'N/A'}`);
  }

  return sections.join('\n\n');
}

/**
 * Build data points for insight extraction
 */
function buildDataPoints(insight: neighborhood_insights): string {
  return `Neighborhood: ${insight.area_name} (${insight.area_code})
Median Price: $${insight.median_price?.toLocaleString() || 'N/A'}
Price Change: ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'}
Days on Market: ${insight.days_on_market || 'N/A'}
School Rating: ${insight.school_rating || 'N/A'}/10
Walk Score: ${insight.walk_score || 'N/A'}/100
Crime Index: ${insight.crime_index || 'N/A'}
Rent Yield: ${insight.rent_yield ? `${insight.rent_yield}%` : 'N/A'}
Appreciation: ${insight.appreciation_rate ? `${insight.appreciation_rate}%` : 'N/A'}
Investment Grade: ${insight.investment_grade || 'N/A'}`;
}

/**
 * Call OpenRouter AI service
 *
 * Makes API request to OpenRouter with retry logic
 */
async function callAIService(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<AIServiceResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      content: '',
      error: 'OpenRouter API key not configured',
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://app.strivetech.ai',
        'X-Title': 'Strive Tech - REID',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a professional real estate market analyst providing insights for investors and agents.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        content: '',
        error: `OpenRouter API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}