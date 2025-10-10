import { prisma } from '@/lib/database/prisma';

// Type definitions
interface MarketReportInput {
  reportType: ReportType;
  areaCodes: string[];
  organizationId: string;
  title?: string;
  description?: string;
  dateRange?: { start: Date; end: Date };
  filters?: any;
  isPublic?: boolean;
  includeInsights?: boolean;
  includeAlerts?: boolean;
  includeForecast?: boolean;
}

enum ReportType {
  NEIGHBORHOOD_ANALYSIS = 'NEIGHBORHOOD_ANALYSIS',
  MARKET_OVERVIEW = 'MARKET_OVERVIEW',
  COMPARATIVE_STUDY = 'COMPARATIVE_STUDY',
  INVESTMENT_ANALYSIS = 'INVESTMENT_ANALYSIS',
  DEMOGRAPHIC_REPORT = 'DEMOGRAPHIC_REPORT',
}

/**
 * Main report generation function
 * Routes to specific template based on report type
 */
export async function generateReport(input: MarketReportInput) {
  // Fetch insights for specified areas
  const insights = await prisma.neighborhood_insights.findMany({
    where: {
      area_code: { in: input.areaCodes },
      organization_id: input.organizationId,
    }
  });

  // Generate content based on report type
  switch (input.reportType) {
    case ReportType.NEIGHBORHOOD_ANALYSIS:
      return generateNeighborhoodAnalysis(insights);
    case ReportType.MARKET_OVERVIEW:
      return generateMarketOverview(insights);
    case ReportType.COMPARATIVE_STUDY:
      return generateComparativeStudy(insights);
    case ReportType.INVESTMENT_ANALYSIS:
      return generateInvestmentAnalysis(insights);
    case ReportType.DEMOGRAPHIC_REPORT:
      return generateDemographicReport(insights);
    default:
      return generateCustomReport(insights);
  }
}

/**
 * Template: Neighborhood Analysis Report
 * Analyzes individual neighborhoods with key metrics
 */
function generateNeighborhoodAnalysis(insights: any[]) {
  const summary = `Analysis of ${insights.length} neighborhoods covering key market metrics, demographics, and amenities.`;

  const avgMedianPrice = insights.reduce((sum, i) => sum + (Number(i.median_price) || 0), 0) / insights.length;
  const avgDaysOnMarket = insights.reduce((sum, i) => sum + (i.days_on_market || 0), 0) / insights.length;

  return {
    summary,
    insights: {
      averageMedianPrice: avgMedianPrice,
      averageDaysOnMarket: avgDaysOnMarket,
      totalNeighborhoods: insights.length,
      topAreas: insights
        .sort((a, b) => (Number(b.median_price) || 0) - (Number(a.median_price) || 0))
        .slice(0, 5)
        .map(i => ({
          name: i.area_name,
          price: i.median_price,
          score: i.walk_score
        }))
    },
    charts: {
      priceDistribution: insights.map(i => ({
        area: i.area_name,
        price: i.median_price
      })),
      daysOnMarketTrend: insights.map(i => ({
        area: i.area_name,
        days: i.days_on_market
      }))
    },
    tables: {
      detailed: insights.map(i => ({
        area: i.area_name,
        medianPrice: i.median_price,
        daysOnMarket: i.days_on_market,
        walkScore: i.walk_score,
        schoolRating: i.school_rating
      }))
    }
  };
}

/**
 * Template: Market Overview Report
 * Provides high-level market analysis
 */
function generateMarketOverview(insights: any[]) {
  const totalInventory = insights.reduce((sum, i) => sum + (i.inventory || 0), 0);
  const avgPriceChange = insights.reduce((sum, i) => sum + (i.price_change || 0), 0) / insights.length;

  return {
    summary: `Market overview covering ${insights.length} areas with total inventory of ${totalInventory} properties.`,
    insights: {
      totalInventory,
      averagePriceChange: avgPriceChange,
      marketTrend: avgPriceChange > 0 ? 'Appreciating' : avgPriceChange < 0 ? 'Declining' : 'Stable',
      areasAnalyzed: insights.length
    },
    charts: {
      inventoryByArea: insights.map(i => ({
        area: i.area_name,
        inventory: i.inventory
      })),
      priceChangeDistribution: insights.map(i => ({
        area: i.area_name,
        change: i.price_change
      }))
    },
    tables: {
      marketMetrics: insights.map(i => ({
        area: i.area_name,
        inventory: i.inventory,
        priceChange: i.price_change,
        medianPrice: i.median_price
      }))
    }
  };
}

/**
 * Template: Comparative Study Report
 * Compares multiple areas side-by-side
 */
function generateComparativeStudy(insights: any[]) {
  const comparison = insights.map(i => ({
    area: i.area_name,
    price: i.median_price,
    walkScore: i.walk_score,
    schoolRating: i.school_rating,
    daysOnMarket: i.days_on_market,
    crimeIndex: i.crime_index
  }));

  return {
    summary: `Comparative analysis of ${insights.length} areas across key livability and investment metrics.`,
    insights: {
      comparison,
      bestValue: comparison.sort((a, b) =>
        (b.walkScore + b.schoolRating * 10) / (Number(b.price) || 1) -
        (a.walkScore + a.schoolRating * 10) / (Number(a.price) || 1)
      )[0]?.area || 'N/A',
      mostAffordable: comparison.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))[0]?.area || 'N/A',
      highestRated: comparison.sort((a, b) => (b.schoolRating || 0) - (a.schoolRating || 0))[0]?.area || 'N/A'
    },
    charts: {
      radarComparison: comparison,
      priceVsQuality: comparison.map(c => ({
        area: c.area,
        price: c.price,
        quality: (c.walkScore + c.schoolRating * 10) / 2
      }))
    },
    tables: {
      fullComparison: comparison
    }
  };
}

/**
 * Template: Investment Analysis Report
 * Focuses on ROI and investment potential
 */
function generateInvestmentAnalysis(insights: any[]) {
  const investmentGrades = insights.map(i => ({
    area: i.area_name,
    rentYield: i.rent_yield,
    appreciationRate: i.appreciation_rate,
    investmentGrade: i.investment_grade,
    roiScore: (i.rent_yield || 0) + (i.appreciation_rate || 0) * 2
  }));

  const topInvestments = investmentGrades
    .sort((a, b) => b.roiScore - a.roiScore)
    .slice(0, 5);

  return {
    summary: `Investment analysis identifying top opportunities across ${insights.length} areas.`,
    insights: {
      topInvestments,
      averageRentYield: investmentGrades.reduce((sum, i) => sum + (i.rentYield || 0), 0) / investmentGrades.length,
      averageAppreciation: investmentGrades.reduce((sum, i) => sum + (i.appreciationRate || 0), 0) / investmentGrades.length,
      bestInvestment: topInvestments[0]?.area || 'N/A'
    },
    charts: {
      yieldVsAppreciation: investmentGrades.map(i => ({
        area: i.area,
        yield: i.rentYield,
        appreciation: i.appreciationRate
      })),
      investmentGrading: investmentGrades.reduce((acc, i) => {
        acc[i.investmentGrade || 'N/A'] = (acc[i.investmentGrade || 'N/A'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    tables: {
      investmentMetrics: investmentGrades
    }
  };
}

/**
 * Template: Demographic Report
 * Analyzes population and demographic trends
 */
function generateDemographicReport(insights: any[]) {
  const demographics = insights.map(i => {
    const demo = i.demographics || {};
    return {
      area: i.area_name,
      medianAge: demo.medianAge,
      medianIncome: demo.medianIncome,
      households: demo.households,
      commuteTime: demo.commuteTime
    };
  });

  return {
    summary: `Demographic analysis of ${insights.length} areas covering age, income, and lifestyle patterns.`,
    insights: {
      averageMedianAge: demographics.reduce((sum, d) => sum + (d.medianAge || 0), 0) / demographics.length,
      averageMedianIncome: demographics.reduce((sum, d) => sum + (d.medianIncome || 0), 0) / demographics.length,
      totalHouseholds: demographics.reduce((sum, d) => sum + (d.households || 0), 0),
      averageCommuteTime: demographics.reduce((sum, d) => sum + (d.commuteTime || 0), 0) / demographics.length
    },
    charts: {
      ageDistribution: demographics.map(d => ({
        area: d.area,
        medianAge: d.medianAge
      })),
      incomeDistribution: demographics.map(d => ({
        area: d.area,
        medianIncome: d.medianIncome
      }))
    },
    tables: {
      demographicBreakdown: demographics
    }
  };
}

/**
 * Template: Custom Report
 * Generic template for custom report types
 */
function generateCustomReport(insights: any[]) {
  return {
    summary: `Custom report analyzing ${insights.length} areas with user-defined criteria.`,
    insights: {
      areasAnalyzed: insights.length,
      dataPoints: insights.map(i => ({
        area: i.area_name,
        code: i.area_code
      }))
    },
    charts: {
      overview: insights.map(i => ({
        area: i.area_name,
        value: i.median_price || 0
      }))
    },
    tables: {
      rawData: insights
    }
  };
}
