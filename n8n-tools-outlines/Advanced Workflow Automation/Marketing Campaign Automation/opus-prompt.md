Prompt #30: Marketing Campaign Automation System (Enhanced)
Role
N8n Marketing Automation Architect specializing in omnichannel orchestration, dynamic personalization, and performance optimization
Context

Volume: 100+ active campaigns, 50,000+ contacts, 1M+ messages monthly
Performance: Campaign creation < 30s, personalization < 100ms per message
Integration: Email, SMS, social media, direct mail, CRM, ad platforms
Compliance: CAN-SPAM, TCPA, GDPR/CCPA, Fair Housing advertising rules
Scale: Supporting 500+ campaigns with 10M+ interactions annually

Primary Objective
Achieve 5x marketing ROI through intelligent automation while maintaining 100% compliance and delivering hyper-personalized experiences
Enhanced Requirements
Intelligent Campaign Orchestration

Dynamic Campaign Creation Engine

python# N8n Code Node - Campaign Orchestration System
class MarketingCampaignOrchestrator:
    def __init__(self):
        self.channels = self.initialize_channels()
        self.segments = []
        self.content_library = ContentLibrary()
        self.compliance_engine = ComplianceEngine()
        
    def create_intelligent_campaign(self, campaign_brief):
        """
        AI-driven campaign creation based on objectives and context
        """
        # Analyze campaign objectives
        objectives = self.analyze_objectives(campaign_brief)
        
        # Market analysis
        market_context = self.analyze_market_conditions(
            campaign_brief['target_area'],
            campaign_brief['property_type']
        )
        
        # Audience segmentation
        segments = self.create_dynamic_segments(
            objectives=objectives,
            market=market_context,
            available_data=self.get_available_audience_data()
        )
        
        # Channel selection optimization
        channel_mix = self.optimize_channel_selection(
            segments=segments,
            objectives=objectives,
            budget=campaign_brief['budget'],
            timeline=campaign_brief['timeline']
        )
        
        # Content generation
        content_matrix = self.generate_content_matrix(
            segments=segments,
            channels=channel_mix,
            tone=campaign_brief['brand_voice']
        )
        
        # Compliance validation
        compliance_check = self.compliance_engine.validate_campaign(
            content_matrix,
            segments,
            channel_mix
        )
        
        if not compliance_check['compliant']:
            content_matrix = self.auto_correct_compliance_issues(
                content_matrix,
                compliance_check['violations']
            )
        
        # Build campaign workflow
        workflow = self.build_campaign_workflow(
            segments=segments,
            channels=channel_mix,
            content=content_matrix,
            timing=self.calculate_optimal_timing(segments, channel_mix)
        )
        
        # Set up testing framework
        testing_config = self.configure_ab_testing(
            workflow,
            test_percentage=campaign_brief.get('test_percentage', 10)
        )
        
        return {
            'campaign_id': self.generate_campaign_id(),
            'workflow': workflow,
            'segments': segments,
            'channels': channel_mix,
            'content': content_matrix,
            'testing': testing_config,
            'projections': self.project_campaign_performance(workflow),
            'compliance_status': 'verified',
            'launch_ready': True
        }
    
    def create_dynamic_segments(self, objectives, market, available_data):
        """
        ML-based audience segmentation
        """
        segments = []
        
        # Base segmentation criteria
        base_criteria = {
            'buyer_journey_stage': ['awareness', 'consideration', 'decision'],
            'property_interest': ['single_family', 'condo', 'investment', 'luxury'],
            'engagement_level': ['cold', 'warm', 'hot'],
            'timeline': ['immediate', '3_months', '6_months', '12_months']
        }
        
        # Advanced behavioral segmentation
        behavioral_segments = self.cluster_by_behavior(available_data)
        
        # Predictive segmentation
        predictive_segments = self.predict_conversion_likelihood(available_data)
        
        # Combine segments with scoring
        for journey_stage in base_criteria['buyer_journey_stage']:
            for property_type in base_criteria['property_interest']:
                for engagement in base_criteria['engagement_level']:
                    
                    # Find matching contacts
                    contacts = self.find_matching_contacts(
                        journey_stage=journey_stage,
                        property_type=property_type,
                        engagement=engagement
                    )
                    
                    if len(contacts) > 50:  # Minimum segment size
                        # Calculate segment value
                        segment_value = self.calculate_segment_value(
                            contacts,
                            objectives,
                            market
                        )
                        
                        # Determine optimal channels for segment
                        optimal_channels = self.determine_segment_channels(
                            contacts,
                            journey_stage,
                            engagement
                        )
                        
                        segments.append({
                            'id': self.generate_segment_id(),
                            'name': f"{journey_stage}_{property_type}_{engagement}",
                            'size': len(contacts),
                            'contacts': contacts,
                            'value_score': segment_value,
                            'optimal_channels': optimal_channels,
                            'personalization_variables': self.extract_personalization_vars(contacts),
                            'messaging_strategy': self.determine_messaging_strategy(
                                journey_stage,
                                engagement,
                                property_type
                            )
                        })
        
        # Rank segments by opportunity
        segments.sort(key=lambda x: x['value_score'], reverse=True)
        
        return segments[:10]  # Top 10 segments
    
    def optimize_channel_selection(self, segments, objectives, budget, timeline):
        """
        Multi-channel optimization using linear programming
        """
        from scipy.optimize import linprog
        
        channels = ['email', 'sms', 'facebook', 'instagram', 'google_ads', 'direct_mail']
        
        # Cost per channel per contact
        costs = {
            'email': 0.01,
            'sms': 0.05,
            'facebook': 0.50,
            'instagram': 0.40,
            'google_ads': 1.00,
            'direct_mail': 0.75
        }
        
        # Expected conversion rate per channel (from historical data)
        conversion_rates = self.get_historical_conversion_rates()
        
        # Build optimization matrix
        # Minimize: -1 * (expected conversions)
        # Subject to: budget constraints, channel limits
        
        c = []  # Coefficients (negative conversion rates)
        A_ub = []  # Inequality constraint matrix
        b_ub = []  # Inequality constraint bounds
        
        for segment in segments:
            for channel in channels:
                # Expected conversions (negative for minimization)
                expected_conv = -1 * conversion_rates[channel] * segment['size']
                c.append(expected_conv)
                
                # Budget constraint
                cost_constraint = [0] * (len(segments) * len(channels))
                idx = segments.index(segment) * len(channels) + channels.index(channel)
                cost_constraint[idx] = costs[channel] * segment['size']
                
        A_ub.append(cost_constraint)
        b_ub.append(budget)
        
        # Solve optimization
        result = linprog(c, A_ub=A_ub, b_ub=b_ub, method='highs')
        
        # Parse results into channel mix
        channel_mix = {}
        for i, segment in enumerate(segments):
            segment_channels = {}
            for j, channel in enumerate(channels):
                idx = i * len(channels) + j
                if result.x[idx] > 0:
                    segment_channels[channel] = {
                        'budget': result.x[idx] * costs[channel],
                        'contacts': int(result.x[idx]),
                        'expected_conversions': result.x[idx] * conversion_rates[channel]
                    }
            channel_mix[segment['id']] = segment_channels
        
        return channel_mix
Real-Time Personalization Engine

Dynamic Content Personalization

javascript// N8n Function Node - Personalization Engine
class PersonalizationEngine {
  constructor(campaignData) {
    this.campaign = campaignData;
    this.contentTemplates = this.loadContentTemplates();
    this.personalizationRules = this.loadPersonalizationRules();
  }
  
  async personalizeMessage(contact, channel, template) {
    // Gather contact context
    const context = await this.buildContactContext(contact);
    
    // Apply personalization layers
    let personalizedContent = template;
    
    // Layer 1: Basic merge tags
    personalizedContent = this.applyMergeTags(personalizedContent, context);
    
    // Layer 2: Dynamic content blocks
    personalizedContent = await this.applyDynamicContent(personalizedContent, context);
    
    // Layer 3: Behavioral personalization
    personalizedContent = this.applyBehavioralPersonalization(personalizedContent, context);
    
    // Layer 4: Predictive personalization
    personalizedContent = await this.applyPredictivePersonalization(personalizedContent, context);
    
    // Layer 5: Channel optimization
    personalizedContent = this.optimizeForChannel(personalizedContent, channel);
    
    // Compliance check
    const compliant = await this.checkCompliance(personalizedContent, context);
    if (!compliant.passed) {
      personalizedContent = this.makeCompliant(personalizedContent, compliant.issues);
    }
    
    return {
      content: personalizedContent,
      personalizationScore: this.calculatePersonalizationScore(personalizedContent, template),
      predictedEngagement: await this.predictEngagement(personalizedContent, context),
      variants: this.generateTestVariants(personalizedContent, context)
    };
  }
  
  async buildContactContext(contact) {
    // Aggregate all available data
    const context = {
      // Basic info
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      
      // Behavioral data
      lastEngagement: await this.getLastEngagement(contact.id),
      engagementHistory: await this.getEngagementHistory(contact.id),
      propertyViews: await this.getPropertyViews(contact.id),
      savedSearches: await this.getSavedSearches(contact.id),
      
      // Preferences
      communicationPreferences: contact.preferences,
      propertyPreferences: await this.analyzePropertyPreferences(contact.id),
      
      // Journey stage
      buyerJourneyStage: await this.determineBuyerStage(contact.id),
      daysInStage: await this.calculateDaysInStage(contact.id),
      
      // Predictive scores
      conversionProbability: await this.predictConversionProbability(contact.id),
      lifetimeValue: await this.calculateLTV(contact.id),
      churnRisk: await this.calculateChurnRisk(contact.id),
      
      // Market context
      marketConditions: await this.getLocalMarketConditions(contact.location),
      
      // Recent activity
      recentProperties: await this.getRecentPropertyActivity(contact.id),
      recentInteractions: await this.getRecentInteractions(contact.id)
    };
    
    return context;
  }
  
  applyDynamicContent(content, context) {
    // Property recommendations
    if (content.includes('{{property_recommendations}}')) {
      const recommendations = this.generatePropertyRecommendations(context);
      content = content.replace(
        '{{property_recommendations}}',
        this.formatPropertyGrid(recommendations)
      );
    }
    
    // Market insights
    if (content.includes('{{market_insights}}')) {
      const insights = this.generateMarketInsights(context.marketConditions);
      content = content.replace(
        '{{market_insights}}',
        this.formatMarketInsights(insights)
      );
    }
    
    // Urgency messaging
    if (content.includes('{{urgency_message}}')) {
      const urgency = this.generateUrgencyMessage(context);
      content = content.replace('{{urgency_message}}', urgency);
    }
    
    // Social proof
    if (content.includes('{{social_proof}}')) {
      const socialProof = this.generateSocialProof(context.location);
      content = content.replace('{{social_proof}}', socialProof);
    }
    
    return content;
  }
  
  generatePropertyRecommendations(context) {
    // AI-driven property matching
    const preferences = context.propertyPreferences;
    const viewHistory = context.propertyViews;
    
    // Score all available properties
    const scoredProperties = this.scoreProperties(preferences, viewHistory);
    
    // Diversify recommendations
    const diverse = this.diversifyRecommendations(scoredProperties);
    
    // Add reasons for recommendation
    return diverse.slice(0, 6).map(property => ({
      ...property,
      recommendationReason: this.generateRecommendationReason(property, context)
    }));
  }
}
Technical Specifications
API Definition
typescriptinterface Campaign {
  id: string;
  name: string;
  objectives: CampaignObjective[];
  budget: Budget;
  timeline: Timeline;
  segments: AudienceSegment[];
  channels: ChannelConfig[];
  content: ContentMatrix;
  automation: AutomationRules[];
  testing: ABTestConfig;
  performance: PerformanceMetrics;
}

interface AudienceSegment {
  id: string;
  name: string;
  size: number;
  criteria: SegmentCriteria[];
  value: number;
  channels: string[];
  personalizationVars: Variable[];
}

interface ChannelConfig {
  channel: 'email' | 'sms' | 'facebook' | 'instagram' | 'google' | 'directmail';
  budget: number;
  schedule: Schedule;
  content: Content[];
  targeting: TargetingRules;
  optimization: OptimizationSettings;
}

interface ContentMatrix {
  templates: Template[];
  variants: Variant[];
  personalizationRules: PersonalizationRule[];
  complianceStatus: ComplianceCheck;
}
Success Criteria
Performance Metrics

Campaign Creation: <30s for complete campaign setup
Personalization: <100ms per message
Send Rate: 10,000 messages/minute
API Response: P95 <200ms

Quality Metrics

Personalization Depth: >5 dynamic elements per message
Segmentation Precision: >85% segment accuracy
Content Relevance: >4.5/5 user rating
Compliance Rate: 100% for all campaigns

Business Impact Metrics

ROI: 5x return on marketing spend
Conversion Rate: 3x improvement over manual campaigns
Engagement Rate: >30% open rate, >10% click rate
Lead Quality: 40% increase in qualified leads

Testing Requirements
javascriptdescribe('Marketing Automation Tests', () => {
  describe('Campaign Creation', () => {
    test('should create optimized channel mix within budget', () => {
      const brief = {
        budget: 10000,
        objectives: ['lead_generation'],
        target_area: 'san_francisco'
      };
      
      const campaign = orchestrator.create_intelligent_campaign(brief);
      
      const totalSpend = Object.values(campaign.channels)
        .reduce((sum, ch) => sum + ch.budget, 0);
      
      expect(totalSpend).toBeLessThanOrEqual(brief.budget);
      expect(campaign.channels).toHaveProperty('email');
      expect(campaign.compliance_status).toBe('verified');
    });
  });
  
  describe('Personalization', () => {
    test('should generate unique content for each segment', () => {
      const segments = createTestSegments(3);
      const template = loadTemplate('new_listing');
      
      const personalized = segments.map(seg =>
        personalizer.personalizeMessage(seg.contacts[0], 'email', template)
      );
      
      // Check all messages are different
      const unique = new Set(personalized.map(p => p.content));
      expect(unique.size).toBe(3);
    });
  });
});
Monitoring & Observability
yamldashboard:
  campaign_metrics:
    - metric: active_campaigns
      visualization: count
      breakdown: by_status
    
    - metric: messages_sent
      measurement: per_minute
      threshold: > 5000
    
    - metric: personalization_depth
      calculation: avg_dynamic_elements
      target: > 5
  
  performance:
    - metric: open_rate
      per_channel: true
      target: email > 30%, sms > 98%
    
    - metric: click_through_rate
      target: > 10%
      alert: warning if < 5%
    
    - metric: conversion_rate
      calculation: conversions / sent
      target: > 2%
  
  roi_tracking:
    - metric: campaign_roi
      calculation: (revenue - cost) / cost
      target: > 5.0
    
    - metric: cost_per_acquisition
      per_campaign: true
      threshold: < $500

alerts:
  - name: compliance_violation
    condition: compliance_check == false
    action:
      - pause: campaign
      - review: manual_compliance_check
      - notify: compliance_team
  
  - name: budget_exceeded
    condition: spend > budget * 1.1
    action:
      - throttle: reduce_send_rate
      - optimize: reallocate_budget
      - notify: marketing_manager

Implementation Priority Matrix
Phase 1: Foundation (Months 1-2)

Prompt #28: Lead-to-Close Workflow - Core orchestration
Prompt #21: Booking Agent - Essential scheduling
Prompt #24: CRM Activity Feed - Data foundation

Phase 2: Intelligence (Months 2-4)

Prompt #29: Property Analysis - Market intelligence
Prompt #25: Expense Tracker - Financial management
Prompt #22: Script Generator - Sales enablement

Phase 3: Growth (Months 4-6)

Prompt #30: Marketing Automation - Lead generation
Prompt #26: Social Media - Brand presence
Prompt #23: Review Management - Reputation
Prompt #27: ROI Tracker - Performance optimization

Success Validation Checkpoints
30-Day Checkpoint

 Core workflows deployed and tested
 50% automation rate achieved
 Zero compliance violations
 Agent adoption > 80%

60-Day Checkpoint

 All intelligence systems operational
 70% end-to-end automation
 ROI tracking implemented
 Performance metrics meeting targets

90-Day Checkpoint

 Full system integration complete
 85% automation rate
 3x ROI demonstrated
 Scaling plan activated
