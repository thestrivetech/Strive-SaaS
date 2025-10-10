Prompt #27: Campaign ROI Tracker System (Enhanced)
Role
N8n Marketing Analytics Engineer specializing in multi-touch attribution, predictive analytics, and real estate marketing optimization
Context

Volume: Tracking 50+ campaigns, 10,000+ leads, 500+ conversions monthly
Performance: Real-time attribution < 2s, dashboard refresh < 5s
Integration: Google Analytics, Facebook Ads, Google Ads, email platforms, CRM
Compliance: GDPR/CCPA for tracking, platform-specific privacy policies
Scale: 100+ campaigns with 1M+ touchpoints within 12 months

Primary Objective
Achieve 95% attribution accuracy while optimizing marketing spend for 3x ROI through data-driven budget allocation
Enhanced Requirements
Multi-Touch Attribution System

Advanced Attribution Modeling

python# N8n Code Node - Attribution Algorithm
import numpy as np
from scipy.optimize import minimize

def calculate_multi_touch_attribution(customer_journey):
    """
    Implement multiple attribution models for comprehensive analysis
    """
    touchpoints = customer_journey['touchpoints']
    conversion_value = customer_journey['conversion_value']
    
    # Different attribution models
    attribution_models = {
        'first_touch': first_touch_attribution(touchpoints),
        'last_touch': last_touch_attribution(touchpoints),
        'linear': linear_attribution(touchpoints),
        'time_decay': time_decay_attribution(touchpoints),
        'position_based': position_based_attribution(touchpoints),
        'data_driven': data_driven_attribution(touchpoints, customer_journey)
    }
    
    # Calculate attribution for each model
    results = {}
    for model_name, weights in attribution_models.items():
        channel_attribution = {}
        for i, touchpoint in enumerate(touchpoints):
            channel = touchpoint['channel']
            value = conversion_value * weights[i]
            
            if channel not in channel_attribution:
                channel_attribution[channel] = {
                    'value': 0,
                    'touchpoints': 0,
                    'campaigns': set()
                }
            
            channel_attribution[channel]['value'] += value
            channel_attribution[channel]['touchpoints'] += 1
            channel_attribution[channel]['campaigns'].add(touchpoint['campaign_id'])
        
        results[model_name] = channel_attribution
    
    # Weighted ensemble model
    ensemble_weights = optimize_model_weights(results, historical_data)
    ensemble_attribution = calculate_ensemble(results, ensemble_weights)
    
    return {
        'models': results,
        'recommended_model': 'ensemble',
        'attribution': ensemble_attribution,
        'confidence_score': calculate_confidence(touchpoints),
        'insights': generate_attribution_insights(ensemble_attribution)
    }

def data_driven_attribution(touchpoints, journey_data):
    """
    Machine learning based attribution using Shapley values
    """
    # Extract features
    features = []
    for tp in touchpoints:
        features.append([
            tp['timestamp'],
            channel_to_numeric(tp['channel']),
            tp['engagement_score'],
            tp['content_type'],
            tp['device_type'],
            time_since_last_touch(tp, touchpoints)
        ])
    
    # Load pre-trained model
    model = load_attribution_model()
    
    # Calculate Shapley values for fair attribution
    shapley_values = calculate_shapley_values(model, features)
    
    # Normalize to sum to 1
    weights = shapley_values / np.sum(shapley_values)
    
    return weights

def time_decay_attribution(touchpoints, half_life_days=7):
    """
    Time-decay attribution with configurable half-life
    """
    conversion_time = touchpoints[-1]['timestamp']
    weights = []
    
    for tp in touchpoints:
        days_before_conversion = (conversion_time - tp['timestamp']).days
        weight = 2 ** (-days_before_conversion / half_life_days)
        weights.append(weight)
    
    # Normalize weights
    total_weight = sum(weights)
    return [w / total_weight for w in weights]
Real-Time Campaign Performance Tracking

Live Performance Dashboard

javascript// N8n Function Node - Real-Time Metrics Aggregation
const aggregateCampaignMetrics = async (campaignId, timeRange) => {
  // Define metrics to track
  const metrics = {
    // Acquisition metrics
    impressions: 0,
    clicks: 0,
    leads: 0,
    qualifiedLeads: 0,
    
    // Engagement metrics
    emailOpens: 0,
    emailClicks: 0,
    websiteVisits: 0,
    propertyViews: 0,
    
    // Conversion metrics
    appointments: 0,
    offers: 0,
    closings: 0,
    
    // Cost metrics
    spend: 0,
    costPerLead: 0,
    costPerQualifiedLead: 0,
    costPerAppointment: 0,
    costPerClosing: 0,
    
    // Revenue metrics
    revenue: 0,
    roi: 0,
    ltv: 0
  };
  
  // Fetch data from all sources
  const dataSources = [
    fetchGoogleAdsMetrics(campaignId, timeRange),
    fetchFacebookAdsMetrics(campaignId, timeRange),
    fetchEmailMetrics(campaignId, timeRange),
    fetchWebsiteAnalytics(campaignId, timeRange),
    fetchCRMData(campaignId, timeRange)
  ];
  
  const allData = await Promise.all(dataSources);
  
  // Aggregate metrics
  allData.forEach(source => {
    Object.keys(source).forEach(key => {
      if (metrics.hasOwnProperty(key)) {
        metrics[key] += source[key];
      }
    });
  });
  
  // Calculate derived metrics
  metrics.ctr = metrics.clicks / metrics.impressions;
  metrics.conversionRate = metrics.leads / metrics.clicks;
  metrics.qualificationRate = metrics.qualifiedLeads / metrics.leads;
  metrics.appointmentRate = metrics.appointments / metrics.qualifiedLeads;
  metrics.closingRate = metrics.closings / metrics.appointments;
  
  // Calculate costs
  metrics.costPerLead = metrics.spend / metrics.leads;
  metrics.costPerQualifiedLead = metrics.spend / metrics.qualifiedLeads;
  metrics.costPerAppointment = metrics.spend / metrics.appointments;
  metrics.costPerClosing = metrics.spend / metrics.closings;
  
  // Calculate ROI
  metrics.roi = ((metrics.revenue - metrics.spend) / metrics.spend) * 100;
  metrics.roas = metrics.revenue / metrics.spend;
  
  // Predictive metrics
  const predictions = await generatePredictions(metrics, timeRange);
  
  return {
    current: metrics,
    predictions: predictions,
    trending: calculateTrends(metrics, historicalData),
    recommendations: generateOptimizationRecommendations(metrics),
    alerts: checkPerformanceAlerts(metrics),
    attribution: await calculateAttribution(campaignId, timeRange)
  };
};
Technical Specifications
API Definition
typescriptinterface CampaignMetrics {
  campaignId: string;
  timeRange: DateRange;
  channels: ChannelMetrics[];
  attribution: AttributionResults;
  spend: SpendMetrics;
  revenue: RevenueMetrics;
  funnel: FunnelMetrics;
  predictions: PredictiveMetrics;
  recommendations: Recommendation[];
}

interface AttributionResults {
  model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'data_driven' | 'ensemble';
  channelContribution: {
    [channel: string]: {
      value: number;
      percentage: number;
      touchpoints: number;
      averagePosition: number;
    };
  };
  pathAnalysis: CustomerPath[];
  confidenceScore: number;
}

interface OptimizationRecommendation {
  type: 'budget_reallocation' | 'bid_adjustment' | 'audience_refinement' | 'creative_refresh';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: {
    metric: string;
    current: number;
    projected: number;
    confidence: number;
  };
  implementation: string[];
}
Success Criteria
Performance Metrics

Attribution Processing: <2s for journey analysis
Dashboard Load: <5s for full metrics refresh
API Response: P95 <500ms for metric queries
Data Freshness: <5 minute lag for real-time metrics

Quality Metrics

Attribution Accuracy: >95% match with actual conversions
Prediction Accuracy: >85% for 7-day forecasts
Data Completeness: >98% tracking coverage
Cross-platform Match Rate: >90% user identification

Business Impact Metrics

ROI Improvement: 3x within 6 months
Budget Efficiency: 25% reduction in wasted spend
Conversion Rate: +40% through optimization
LTV:CAC Ratio: Achieve 3:1 minimum

Testing Requirements
javascriptdescribe('ROI Tracking Tests', () => {
  describe('Attribution Modeling', () => {
    test('should correctly attribute multi-touch journey', () => {
      const journey = createTestJourney([
        { channel: 'google_ads', value: 100 },
        { channel: 'email', value: 50 },
        { channel: 'facebook', value: 150 }
      ]);
      
      const attribution = calculateMultiTouchAttribution(journey);
      
      expect(attribution.attribution).toBeDefined();
      expect(Object.values(attribution.attribution).reduce((sum, ch) => sum + ch.value, 0))
        .toBeCloseTo(journey.conversion_value, 2);
    });
  });
});
Monitoring & Observability
yamldashboard:
  tracking_health:
    - metric: tracking_coverage
      threshold: > 98%
      alert: warning if < 95%
    
    - metric: attribution_confidence
      threshold: > 0.85
      measurement: average confidence score
  
  campaign_performance:
    - metric: overall_roi
      target: > 3.0
      calculation: revenue / spend
    
    - metric: channel_efficiency
      per_channel: true
      measurement: conversions / spend
  
  optimization_impact:
    - metric: recommendation_success_rate
      measurement: implemented recommendations with positive impact
      target: > 75%

alerts:
  - name: roi_declining
    condition: roi < 2.0 OR trend < -10% weekly
    action:
      - analyze: identify underperforming channels
      - recommend: budget reallocation
      - notify: marketing_manager