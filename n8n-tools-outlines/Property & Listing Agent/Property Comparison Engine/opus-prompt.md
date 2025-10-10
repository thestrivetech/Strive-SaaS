Prompt #10: Property Comparison Engine (Enhanced)
Role
N8n Comparative Analytics Engineer specializing in multi-factor analysis, data visualization, and investment modeling.
Context

Comparison Volume: 10,000+ daily comparisons
Data Points: 100+ attributes per property
Analysis Types: Buyer, investor, market analysis
Visualization: Interactive reports and dashboards
Accuracy Requirement: 95% data completeness

Primary Objective
Create a sophisticated property comparison system that provides comprehensive side-by-side analysis with investment metrics, market context, and personalized recommendations.
Enhanced Requirements
Comparison Framework

Multi-Dimensional Analysis Engine

python   class PropertyComparisonEngine:
       def __init__(self):
           self.comparison_dimensions = {
               'financial': {
                   'metrics': ['price', 'price_per_sqft', 'tax_amount', 'hoa_fees'],
                   'calculations': ['monthly_payment', 'total_cost_ownership', 'appreciation_forecast'],
                   'weight': 0.30
               },
               'physical': {
                   'metrics': ['sqft', 'bedrooms', 'bathrooms', 'lot_size', 'year_built'],
                   'features': ['garage', 'pool', 'view', 'upgrades'],
                   'weight': 0.25
               },
               'location': {
                   'metrics': ['school_ratings', 'walk_score', 'crime_rate', 'commute_time'],
                   'amenities': ['shopping', 'dining', 'parks', 'healthcare'],
                   'weight': 0.25
               },
               'investment': {
                   'metrics': ['rental_income', 'cap_rate', 'cash_flow', 'roi'],
                   'analysis': ['market_trends', 'appreciation_history', 'rental_demand'],
                   'weight': 0.20
               }
           }
       
       def compare_properties(self, properties, user_preferences=None):
           comparison_matrix = {}
           
           for dimension, config in self.comparison_dimensions.items():
               dimension_scores = []
               
               for prop in properties:
                   score = self.calculate_dimension_score(prop, dimension, config)
                   dimension_scores.append(score)
               
               # Normalize scores
               normalized = self.normalize_scores(dimension_scores)
               comparison_matrix[dimension] = normalized
           
           # Calculate overall scores
           overall_scores = self.calculate_weighted_scores(
               comparison_matrix,
               user_preferences or self.default_weights
           )
           
           # Generate recommendations
           recommendations = self.generate_recommendations(
               properties,
               overall_scores,
               comparison_matrix
           )
           
           return {
               'properties': properties,
               'comparison_matrix': comparison_matrix,
               'overall_scores': overall_scores,
               'recommendations': recommendations,
               'best_match': properties[overall_scores.index(max(overall_scores))]
           }

Investment Analysis Module

javascript   const investmentAnalyzer = {
     calculateMetrics: (property) => {
       const metrics = {};
       
       // Cash flow analysis
       metrics.monthlyRent = estimateRent(property);
       metrics.monthlyExpenses = calculateExpenses(property);
       metrics.mortgagePayment = calculateMortgage(property);
       metrics.cashFlow = metrics.monthlyRent - metrics.monthlyExpenses - metrics.mortgagePayment;
       
       // Return metrics
       metrics.capRate = (metrics.monthlyRent * 12 - metrics.monthlyExpenses * 12) / property.price;
       metrics.cashOnCashReturn = (metrics.cashFlow * 12) / (property.price * 0.20); // 20% down
       metrics.roi = calculateROI(property, 5); // 5-year ROI
       
       // Advanced metrics
       metrics.irr = calculateIRR(property, 10); // 10-year IRR
       metrics.npv = calculateNPV(property, 0.08); // 8% discount rate
       metrics.dscr = metrics.monthlyRent / metrics.mortgagePayment;
       
       // Risk assessment
       metrics.riskScore = assessRisk(property);
       metrics.marketVolatility = getMarketVolatility(property.location);
       
       return metrics;
     },
     
     compareInvestments: (properties) => {
       const comparison = properties.map(p => ({
         property: p,
         metrics: investmentAnalyzer.calculateMetrics(p)
       }));
       
       // Rank by different strategies
       const rankings = {
         cashFlow: rankBy(comparison, 'metrics.cashFlow'),
         appreciation: rankBy(comparison, 'metrics.appreciationForecast'),
         balanced: rankByComposite(comparison, ['cashFlow', 'capRate', 'appreciation']),
         conservative: rankBy(comparison, 'metrics.riskScore', 'asc')
       };
       
       return { comparison, rankings };
     }
   };

Visualization Generator

yaml   visualization_components:
     charts:
       spider_chart:
         dimensions: [price, size, location, amenities, potential]
         type: radar
         interactive: true
       
       bar_comparisons:
         metrics: [price, price_per_sqft, monthly_payment]
         type: grouped_bar
         colors: brand_palette
       
       investment_matrix:
         x_axis: cap_rate
         y_axis: cash_flow
         bubble_size: total_return
         quadrants: true
     
     maps:
       comparison_map:
         show_properties: true
         show_amenities: true
         show_commute_routes: true
         heat_map: price_per_sqft
     
     tables:
       detailed_comparison:
         sections: [financial, features, location, investment]
         highlighting: best_in_category
         sorting: user_controlled
         export: csv_excel_pdf
     
     reports:
       format: interactive_html
       branding: customizable
       sections:
         - executive_summary
         - detailed_comparisons
         - investment_analysis
         - market_context
         - recommendations
Technical Specifications
Comparison API
typescriptinterface ComparisonRequest {
  properties: string[];  // Property IDs
  comparison_type: 'buyer' | 'investor' | 'market_analysis';
  user_preferences?: {
    priorities: {
      price: number;      // 0-1
      location: number;   // 0-1
      size: number;       // 0-1
      features: number;   // 0-1
      investment: number; // 0-1
    };
    specific_requirements?: {
      must_have: string[];
      nice_to_have: string[];
      deal_breakers: string[];
    };
  };
  output_format: 'json' | 'html' | 'pdf';
  include_visuals: boolean;
}

interface ComparisonResponse {
  summary: {
    best_overall: string;
    best_value: string;
    best_investment: string;
    quick_insights: string[];
  };
  detailed_comparison: {
    [propertyId: string]: {
      scores: {
        overall: number;
        financial: number;
        location: number;
        features: number;
        investment: number;
      };
      pros: string[];
      cons: string[];
      unique_features: string[];
    };
  };
  visualizations: {
    charts: ChartData[];
    tables: TableData[];
    maps: MapData;
  };
  recommendations: {
    primary: string;
    alternatives: string[];
    reasoning: string[];
  };
  report_url?: string;
}
Success Criteria
Analysis Quality

Data Completeness: >95% of comparison fields populated
Calculation Accuracy: 100% accuracy for financial metrics
Comparison Relevance: >90% user satisfaction with comparisons
Insight Quality: >85% actionable insights rating

Performance Metrics

Generation Speed: <3 seconds for 5-property comparison
Report Generation: <10 seconds for full PDF report
API Response Time: <500ms for basic comparison
Concurrent Users: Support 100 simultaneous comparisons

Business Impact

Decision Confidence: 40% increase in buyer confidence
Time to Decision: 30% reduction in decision time
Conversion Rate: 25% improvement in offer submission
User Engagement: 15 minutes average report viewing time

Testing Requirements
Comparison Accuracy Tests
pythondef test_comparison_accuracy():
    # Test properties with known rankings
    properties = [
        create_property(price=500000, sqft=2000, score_expected=0.85),
        create_property(price=450000, sqft=1800, score_expected=0.90),
        create_property(price=550000, sqft=2200, score_expected=0.80)
    ]
    
    comparison = engine.compare_properties(properties)
    
    # Verify scoring accuracy
    for i, prop in enumerate(properties):
        assert abs(comparison['overall_scores'][i] - prop.score_expected) < 0.05
    
    # Verify best match selection
    assert comparison['best_match'].price == 450000
    
    # Test investment metrics
    investment_metrics = calculate_investment_metrics(properties[0])
    assert investment_metrics['cap_rate'] > 0
    assert investment_metrics['cash_flow'] != 0
Implementation Checklist

 Build comparison framework
 Create scoring algorithms
 Implement investment calculations
 Build visualization components
 Create report generation
 Add market context integration
 Build recommendation engine
 Implement caching strategy
 Create interactive dashboards
 Document comparison methodology