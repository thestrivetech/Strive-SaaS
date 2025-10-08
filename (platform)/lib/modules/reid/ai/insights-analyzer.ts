import type { neighborhood_insights } from '@prisma/client';
import { AnalysisType } from './schemas';
import type { AIServiceResponse } from './schemas';

/**
 * Analyze multiple neighborhoods and generate comparative insights
 *
 * Compares 2-5 neighborhoods across different dimensions
 *
 * @param insights - Array of neighborhood insights (2-5 areas)
 * @param analysisType - Type of analysis to perform
 * @returns AI-generated comparative analysis
 */
export async function analyzeMultipleAreas(
  insights: neighborhood_insights[],
  analysisType: AnalysisType = AnalysisType.COMPREHENSIVE
): Promise<string> {
  if (insights.length < 2 || insights.length > 5) {
    throw new Error('Analysis requires 2-5 neighborhoods');
  }

  const comparisonData = buildComparisonData(insights, analysisType);
  const prompt = buildAnalysisPrompt(insights, analysisType, comparisonData);

  const response = await callAIService(prompt, {
    temperature: 0.6,
    maxTokens: 1200,
  });

  if (!response.success || !response.content) {
    throw new Error(response.error || 'AI analysis failed');
  }

  return response.content;
}

/**
 * Generate investment recommendations based on neighborhood data
 *
 * Analyzes neighborhoods and suggests best investment opportunities
 *
 * @param insights - Array of neighborhood insights
 * @param criteria - Investment criteria
 * @returns AI-generated recommendations
 */
export async function generateInvestmentRecommendations(
  insights: neighborhood_insights[],
  criteria: {
    budgetMin?: number;
    budgetMax?: number;
    targetROI?: number;
    riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  } = {}
): Promise<string> {
  if (insights.length === 0) {
    throw new Error('At least one neighborhood required for recommendations');
  }

  const investmentData = buildInvestmentData(insights);
  const prompt = buildRecommendationPrompt(insights, criteria, investmentData);

  const response = await callAIService(prompt, {
    temperature: 0.6,
    maxTokens: 1500,
  });

  if (!response.success || !response.content) {
    throw new Error(response.error || 'AI recommendation generation failed');
  }

  return response.content;
}

/**
 * Build comparison data for analysis
 */
function buildComparisonData(
  insights: neighborhood_insights[],
  analysisType: AnalysisType
): string {
  const sections: string[] = [];

  insights.forEach((insight, index) => {
    const areaLabel = `Area ${index + 1}: ${insight.area_name} (${insight.area_code})`;

    switch (analysisType) {
      case AnalysisType.INVESTMENT_COMPARISON:
        sections.push(`${areaLabel}
- Median Price: $${insight.median_price?.toLocaleString() || 'N/A'}
- Rent Yield: ${insight.rent_yield ? `${insight.rent_yield}%` : 'N/A'}
- Appreciation: ${insight.appreciation_rate ? `${insight.appreciation_rate}%` : 'N/A'}
- Investment Grade: ${insight.investment_grade || 'N/A'}
- Price Change: ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'}`);
        break;

      case AnalysisType.MARKET_TRENDS:
        sections.push(`${areaLabel}
- Median Price: $${insight.median_price?.toLocaleString() || 'N/A'}
- Price Change: ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'}
- Days on Market: ${insight.days_on_market || 'N/A'}
- Inventory: ${insight.inventory || 'N/A'}`);
        break;

      case AnalysisType.DEMOGRAPHIC_ANALYSIS:
        sections.push(`${areaLabel}
- Median Age: ${insight.median_age || 'N/A'}
- Median Income: $${insight.median_income?.toLocaleString() || 'N/A'}
- Households: ${insight.households?.toLocaleString() || 'N/A'}
- Commute Time: ${insight.commute_time || 'N/A'} min`);
        break;

      case AnalysisType.AMENITY_COMPARISON:
        sections.push(`${areaLabel}
- School Rating: ${insight.school_rating || 'N/A'}/10
- Walk Score: ${insight.walk_score || 'N/A'}/100
- Bike Score: ${insight.bike_score || 'N/A'}/100
- Crime Index: ${insight.crime_index || 'N/A'}
- Park Proximity: ${insight.park_proximity || 'N/A'} miles`);
        break;

      case AnalysisType.COMPREHENSIVE:
      default:
        sections.push(`${areaLabel}
Market: Median $${insight.median_price?.toLocaleString() || 'N/A'}, ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'} change
Demographics: $${insight.median_income?.toLocaleString() || 'N/A'} income, ${insight.households?.toLocaleString() || 'N/A'} households
Amenities: ${insight.school_rating || 'N/A'}/10 schools, ${insight.walk_score || 'N/A'} walk score
Investment: ${insight.rent_yield ? `${insight.rent_yield}%` : 'N/A'} yield, Grade ${insight.investment_grade || 'N/A'}`);
    }
  });

  return sections.join('\n\n');
}

/**
 * Build analysis prompt based on type
 */
function buildAnalysisPrompt(
  insights: neighborhood_insights[],
  analysisType: AnalysisType,
  comparisonData: string
): string {
  const areaNames = insights.map(i => i.area_name).join(', ');

  const analysisInstructions: Record<AnalysisType, string> = {
    [AnalysisType.INVESTMENT_COMPARISON]: `Compare investment potential across these areas. Identify:
- Best ROI opportunities
- Risk vs. reward profiles
- Market momentum indicators
- Cash flow potential`,

    [AnalysisType.MARKET_TRENDS]: `Analyze current market trends. Focus on:
- Price momentum and direction
- Inventory levels and absorption rates
- Days on market trends
- Market temperature (hot/warm/cool)`,

    [AnalysisType.DEMOGRAPHIC_ANALYSIS]: `Analyze demographic characteristics. Consider:
- Income levels and economic profiles
- Population density and growth
- Commute patterns and employment
- Target buyer/renter demographics`,

    [AnalysisType.AMENITY_COMPARISON]: `Compare quality of life factors. Evaluate:
- School quality and education access
- Walkability and transportation
- Safety and crime levels
- Parks, recreation, and lifestyle amenities`,

    [AnalysisType.COMPREHENSIVE]: `Provide comprehensive comparison covering:
- Market conditions and trends
- Demographics and community profile
- Amenities and quality of life
- Investment potential and recommendations`,
  };

  return `You are a real estate market analyst. Compare these ${insights.length} neighborhoods: ${areaNames}

Data:
${comparisonData}

${analysisInstructions[analysisType]}

Provide a structured analysis (400-600 words) with:
1. Key Findings (3-4 bullet points)
2. Detailed Comparison
3. Winner/Standout Area (if applicable)
4. Actionable Recommendations

Write professionally for real estate investors and agents.`;
}

/**
 * Build investment data for recommendations
 */
function buildInvestmentData(insights: neighborhood_insights[]): string {
  return insights.map((insight, index) => {
    return `${index + 1}. ${insight.area_name} (${insight.area_code})
   Price: $${insight.median_price?.toLocaleString() || 'N/A'}
   Rent Yield: ${insight.rent_yield ? `${insight.rent_yield}%` : 'N/A'}
   Appreciation: ${insight.appreciation_rate ? `${insight.appreciation_rate}%` : 'N/A'}
   Grade: ${insight.investment_grade || 'N/A'}
   Schools: ${insight.school_rating || 'N/A'}/10
   Walk Score: ${insight.walk_score || 'N/A'}/100
   Price Trend: ${insight.price_change ? `${insight.price_change > 0 ? '+' : ''}${insight.price_change}%` : 'N/A'}`;
  }).join('\n\n');
}

/**
 * Build recommendation prompt
 */
function buildRecommendationPrompt(
  insights: neighborhood_insights[],
  criteria: {
    budgetMin?: number;
    budgetMax?: number;
    targetROI?: number;
    riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  },
  investmentData: string
): string {
  const budgetRange = criteria.budgetMin && criteria.budgetMax
    ? `$${criteria.budgetMin.toLocaleString()} - $${criteria.budgetMax.toLocaleString()}`
    : criteria.budgetMin
    ? `$${criteria.budgetMin.toLocaleString()}+`
    : criteria.budgetMax
    ? `Up to $${criteria.budgetMax.toLocaleString()}`
    : 'Not specified';

  return `You are an investment advisor for real estate. Analyze these neighborhoods and provide investment recommendations.

Investment Criteria:
- Budget: ${budgetRange}
- Target ROI: ${criteria.targetROI ? `${criteria.targetROI}%+` : 'Not specified'}
- Risk Tolerance: ${criteria.riskTolerance || 'MEDIUM'}

Neighborhood Data:
${investmentData}

Provide investment recommendations (500-700 words) with:

1. Top Recommendations (rank top 3 areas)
   - For each: why it fits criteria, expected returns, key advantages

2. Investment Strategy
   - Best approach for each recommended area
   - Timing considerations
   - Risk factors to consider

3. Budget Allocation
   - How to distribute investment across areas
   - Diversification suggestions

4. Action Items
   - Next steps for investor
   - Due diligence checklist

Match recommendations to risk tolerance:
- LOW: Focus on stable, established areas with proven track records
- MEDIUM: Balance between growth potential and stability
- HIGH: Emphasize high-growth areas with higher upside potential

Be specific and actionable. Use data to support recommendations.`;
}

/**
 * Call OpenRouter AI service
 *
 * Makes API request to OpenRouter with error handling
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
            content: 'You are a professional real estate market analyst and investment advisor.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 1200,
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
