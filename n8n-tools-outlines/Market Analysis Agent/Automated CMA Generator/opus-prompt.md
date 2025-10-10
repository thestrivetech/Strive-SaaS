Prompt #11: Automated CMA Generator (Enhanced)
Role
Senior N8n Real Estate Analytics Engineer with expertise in property valuation algorithms, statistical modeling, geospatial analysis, and automated report generation systems.
Context

Volume: Generate 500-1,000 CMAs per month across 50+ agents
Performance: Complete CMA generation in <30 seconds, P95 latency <45 seconds
Integration: MLS APIs (5+ regional systems), public records databases, Qdrant vector DB, Supabase, Redis cache
Compliance: NAR CMA standards, state-specific disclosure requirements, Fair Housing Act
Scale: Support 10,000 CMAs/month within 6 months, 50,000/month within 1 year

Primary Objective
Build an automated CMA generation system achieving 95% valuation accuracy within ±5% of actual sale price while generating professional reports in under 30 seconds.
Enhanced Requirements
Comparable Selection Algorithm
javascript// Advanced property matching with weighted scoring
const selectComparables = async (subjectProperty, options = {}) => {
  const {
    maxDistance = 1.0, // miles
    maxAge = 180, // days
    minComps = 3,
    maxComps = 10,
    matchThreshold = 0.75
  } = options;

  // Vector embedding for property features
  const subjectVector = await generatePropertyEmbedding(subjectProperty);
  
  // Geospatial + feature similarity search in Qdrant
  const candidates = await qdrantClient.search({
    collection: 'properties',
    vector: subjectVector,
    filter: {
      must: [
        { key: 'status', match: { value: 'sold' } },
        { key: 'sold_date', range: { gte: Date.now() - (maxAge * 86400000) } },
        { key: 'location', geo_radius: {
          center: subjectProperty.coordinates,
          radius: maxDistance * 1609.34 // convert to meters
        }}
      ]
    },
    limit: maxComps * 3, // Get extra for filtering
    with_payload: true
  });

  // Advanced scoring algorithm
  return candidates
    .map(comp => ({
      ...comp,
      score: calculateSimilarityScore(subjectProperty, comp.payload, {
        weights: {
          size: 0.25,
          age: 0.15,
          condition: 0.20,
          features: 0.20,
          location: 0.20
        }
      })
    }))
    .filter(comp => comp.score >= matchThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxComps);
};
Adjustment Calculation Engine
pythondef calculate_adjustments(subject, comparable, market_data):
    """
    Calculate precise adjustments using regression analysis and market data
    """
    adjustments = {}
    
    # Square footage adjustment (non-linear)
    size_diff = comparable['sqft'] - subject['sqft']
    price_per_sqft = market_data['median_price_per_sqft']
    size_adjustment = calculate_nonlinear_size_adjustment(
        size_diff, 
        price_per_sqft,
        diminishing_returns_factor=0.85
    )
    adjustments['size'] = size_adjustment
    
    # Age/condition adjustment with depreciation curves
    age_diff = comparable['year_built'] - subject['year_built']
    condition_factor = get_condition_multiplier(
        comparable['condition'],
        subject['condition']
    )
    adjustments['age_condition'] = calculate_depreciation(
        age_diff,
        condition_factor,
        effective_age_model='marshall_swift'
    )
    
    # Feature adjustments using paired sales analysis
    for feature in ['pool', 'garage', 'renovated_kitchen', 'view']:
        if comparable[feature] != subject[feature]:
            adjustments[feature] = market_data[f'{feature}_value']
    
    # Time adjustment for market appreciation
    days_since_sale = (datetime.now() - comparable['sold_date']).days
    market_appreciation_rate = market_data['monthly_appreciation'] / 30
    adjustments['time'] = comparable['sold_price'] * (market_appreciation_rate * days_since_sale)
    
    return adjustments
Technical Specifications
API Architecture
typescriptinterface CMARequest {
  propertyId: string;
  address: PropertyAddress;
  propertyDetails: {
    sqft: number;
    lotSize: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    features: string[];
    propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  };
  clientInfo?: {
    name: string;
    email: string;
    agentId: string;
  };
  reportOptions?: {
    includeMarketTrends: boolean;
    includePricingStrategy: boolean;
    includeInvestmentAnalysis: boolean;
    brandingId?: string;
  };
}

interface CMAResponse {
  reportId: string;
  status: 'success' | 'partial' | 'failed';
  generatedAt: string;
  executionTime: number;
  report: {
    pdfUrl: string;
    interactiveUrl: string;
    data: {
      estimatedValue: number;
      valueRange: { low: number; high: number; };
      confidence: number;
      comparables: ComparableProperty[];
      adjustments: AdjustmentDetails[];
      marketTrends: MarketAnalysis;
    };
  };
  metrics: {
    comparablesFound: number;
    dataCompleteness: number;
    confidenceFactors: ConfidenceBreakdown;
  };
}
N8n Workflow Implementation
javascript// Main CMA Generation Workflow
const cmaWorkflow = {
  name: 'CMA_Generator_v2',
  nodes: [
    {
      name: 'Webhook_CMA_Request',
      type: 'n8n-nodes-base.webhook',
      parameters: {
        path: 'cma/generate',
        responseMode: 'responseNode',
        options: {
          responseCode: 200,
          responseHeaders: {
            'X-Execution-Time': '={{$node["Calculate_Metrics"].json["executionTime"]}}'
          }
        }
      }
    },
    {
      name: 'Validate_Property_Data',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          // Data validation with error handling
          const required = ['propertyId', 'address', 'propertyDetails'];
          const missing = required.filter(field => !$input.item.json[field]);
          
          if (missing.length > 0) {
            throw new Error(\`Missing required fields: \${missing.join(', ')}\`);
          }
          
          // Validate property details
          const details = $input.item.json.propertyDetails;
          if (details.sqft < 100 || details.sqft > 100000) {
            throw new Error('Invalid square footage');
          }
          
          return {
            validated: true,
            propertyData: $input.item.json
          };
        `
      }
    },
    {
      name: 'Fetch_Market_Data',
      type: 'n8n-nodes-base.httpRequest',
      parameters: {
        url: '={{$env["MLS_API_URL"]}}/market/stats',
        method: 'POST',
        body: {
          zipCode: '={{$json["propertyData"]["address"]["zipCode"]}}',
          propertyType: '={{$json["propertyData"]["propertyDetails"]["propertyType"]}}',
          radius: 1.0
        },
        authentication: 'genericCredentialType',
        genericAuthType: 'oAuth2'
      }
    },
    {
      name: 'Generate_Property_Embedding',
      type: 'n8n-nodes-base.qdrant',
      parameters: {
        operation: 'embed',
        model: 'property-similarity-v2',
        input: '={{JSON.stringify($json["propertyData"]["propertyDetails"])}}'
      }
    },
    {
      name: 'Search_Comparables',
      type: 'n8n-nodes-base.qdrant',
      parameters: {
        operation: 'search',
        collection: 'sold_properties',
        vector: '={{$json["embedding"]}}',
        filter: '={{JSON.stringify($json["searchFilter"])}}',
        limit: 30,
        scoreThreshold: 0.75
      }
    },
    {
      name: 'Calculate_Adjustments',
      type: 'n8n-nodes-base.python',
      parameters: {
        pythonCode: `
import json
from datetime import datetime
import numpy as np

# Import adjustment calculation functions
subject = json.loads(input_data['propertyData'])
comparables = json.loads(input_data['comparables'])
market_data = json.loads(input_data['marketData'])

adjusted_comps = []
for comp in comparables[:10]:  # Process top 10
    adjustments = calculate_adjustments(subject, comp, market_data)
    adjusted_price = comp['sold_price'] + sum(adjustments.values())
    
    adjusted_comps.append({
        'property': comp,
        'adjustments': adjustments,
        'adjusted_price': adjusted_price,
        'confidence': calculate_confidence(comp, subject)
    })

# Calculate final value estimate
values = [c['adjusted_price'] for c in adjusted_comps]
estimated_value = np.median(values)
value_range = {
    'low': np.percentile(values, 25),
    'high': np.percentile(values, 75)
}

return {
    'estimated_value': estimated_value,
    'value_range': value_range,
    'adjusted_comparables': adjusted_comps,
    'confidence': calculate_overall_confidence(adjusted_comps)
}
        `
      }
    },
    {
      name: 'Generate_PDF_Report',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          // Generate professional PDF report
          const reportData = {
            subject: $json["propertyData"],
            valuation: $json["valuation"],
            comparables: $json["adjusted_comparables"],
            marketTrends: $json["marketData"]["trends"],
            generatedAt: new Date().toISOString(),
            agentBranding: $json["brandingId"]
          };
          
          // Call PDF generation service
          const pdfResponse = await $http.post(
            process.env.PDF_SERVICE_URL + '/generate',
            {
              template: 'cma_professional_v3',
              data: reportData,
              options: {
                format: 'A4',
                margin: '0.5in',
                headerTemplate: '<div>{{agentBranding}}</div>',
                footerTemplate: '<div>Page {{page}} of {{pages}}</div>'
              }
            }
          );
          
          return {
            pdfUrl: pdfResponse.data.url,
            reportId: pdfResponse.data.id,
            generationTime: pdfResponse.data.processingTime
          };
        `
      }
    }
  ]
};
Success Criteria
Performance Metrics

Response Time: P50 < 25s, P95 < 30s, P99 < 45s
Throughput: 50 concurrent CMA generations
Availability: 99.9% uptime (43 minutes downtime/month max)
Resource Usage: CPU < 70%, Memory < 4GB per instance

Quality Metrics

Valuation Accuracy: Within ±5% of sale price for 80% of properties
Comparable Quality: Average similarity score > 0.85
Data Completeness: >95% of required fields populated
Report Satisfaction: >4.5/5 agent rating

Business Impact Metrics

Time Saved: 45 minutes per CMA × 1000 CMAs = 750 hours/month
Agent Productivity: 3x increase in CMAs delivered
Client Conversion: 25% increase in listing appointments
Revenue Impact: $50k additional commission per month

Testing Requirements
Unit Tests
javascriptdescribe('CMA Generator Tests', () => {
  describe('Comparable Selection', () => {
    test('should select appropriate comparables within distance', async () => {
      const subject = createTestProperty({ sqft: 2000, bedrooms: 3 });
      const comparables = await selectComparables(subject, { maxDistance: 1.0 });
      
      expect(comparables.length).toBeGreaterThanOrEqual(3);
      expect(comparables.length).toBeLessThanOrEqual(10);
      comparables.forEach(comp => {
        expect(calculateDistance(subject, comp)).toBeLessThan(1.0);
      });
    });
    
    test('should handle properties with limited comparables', async () => {
      const uniqueProperty = createTestProperty({ sqft: 10000, features: ['rare'] });
      const comparables = await selectComparables(uniqueProperty);
      
      expect(comparables.length).toBeGreaterThan(0);
      expect(comparables[0].score).toBeGreaterThan(0.5);
    });
  });
  
  describe('Adjustment Calculations', () => {
    test('should calculate accurate size adjustments', () => {
      const adjustment = calculateSizeAdjustment(2000, 2200, 150);
      expect(adjustment).toBeCloseTo(-30000, 2);
    });
    
    test('should apply depreciation correctly', () => {
      const adjustment = calculateAgeAdjustment(2020, 2015, 'good', 'excellent');
      expect(adjustment).toBeCloseTo(12500, 2);
    });
  });
});
Integration Tests

MLS API data retrieval with fallback handling
Qdrant vector search performance under load
PDF generation service reliability
End-to-end workflow execution with monitoring

Load Tests
yamlscenarios:
  baseline:
    executor: constant-arrival-rate
    rate: 10
    timeUnit: '1m'
    duration: '10m'
    preAllocatedVUs: 50
    maxVUs: 100

  stress:
    executor: ramping-arrival-rate
    stages:
      - duration: '5m', target: 50
      - duration: '10m', target: 100
      - duration: '5m', target: 200
      - duration: '5m', target: 0

thresholds:
  http_req_duration: ['p(95)<30000', 'p(99)<45000']
  http_req_failed: ['rate<0.01']
  iterations: ['rate>0.8']
Monitoring & Observability
yamldashboard:
  real_time_metrics:
    - metric: cma_generation_duration
      threshold: < 30s
      alert: critical if > 45s
    
    - metric: comparable_quality_score
      threshold: > 0.85
      alert: warning if < 0.75
    
    - metric: valuation_accuracy
      measurement: abs(estimated - actual) / actual
      threshold: < 0.05
      alert: warning if > 0.10

  business_metrics:
    - metric: daily_cma_count
      baseline: 30
      target: 50
    
    - metric: agent_satisfaction_score
      measurement: post_generation_survey
      target: > 4.5
Implementation Checklist

 Set up N8n environment with required nodes
 Configure MLS API integrations (5+ systems)
 Deploy Qdrant vector database with property embeddings
 Implement comparable selection algorithm
 Build adjustment calculation engine
 Create PDF report templates (3 versions)
 Set up monitoring dashboards
 Implement caching strategy with Redis
 Add error handling and retry logic
 Create unit and integration tests
 Conduct load testing
 Deploy to staging environment
 Run accuracy validation (100 test properties)
 Train agents on system usage
 Production deployment with canary rollout

Risk Mitigation

Data Quality Issues

Implement validation layers
Create data completeness scoring
Build fallback data sources


MLS API Failures

Implement circuit breakers
Cache recent data in Redis
Queue for retry processing


Inaccurate Valuations

Continuous model improvement
Human review for outliers
Confidence scoring display