Prompt #4: 24/7 Lead Capture System (Enhanced)
Role
N8n Lead Conversion Optimization Engineer specializing in real-time engagement, behavioral analytics, and conversion psychology.
Context

Traffic Volume: 10,000+ website visitors daily
Conversion Target: 5-8% visitor-to-lead conversion
Response Time: <30 seconds for initial engagement
Integration Points: Website widget, forms, social media, SMS
Compliance: TCPA, CAN-SPAM, Fair Housing Act

Primary Objective
Build an intelligent lead capture system that engages visitors instantly, qualifies prospects effectively, and maximizes conversion rates while providing exceptional user experience.
Enhanced Requirements
Intelligent Engagement System

Multi-Channel Capture Architecture

javascript   const captureChannels = {
     website: {
       widget: {
         trigger: 'time_on_page|exit_intent|scroll_depth',
         personalization: 'referral_source|behavior|demographics'
       },
       forms: {
         types: ['contact', 'property_inquiry', 'valuation', 'newsletter'],
         progressive_profiling: true,
         field_optimization: 'dynamic'
       }
     },
     social: {
       facebook: ['messenger', 'lead_ads'],
       instagram: ['dm_automation', 'story_replies'],
       linkedin: ['inmails', 'form_fills']
     },
     voice: {
       phone: 'call_tracking|ivr',
       voicemail: 'transcription|callback'
     },
     sms: {
       keywords: ['INFO', 'TOUR', 'PRICE'],
       shortcodes: true,
       compliance: 'opt_in_verification'
     }
   };

Behavioral Qualification Engine

yaml   qualification_factors:
     explicit:
       - budget_range: weight: 0.25
       - timeline: weight: 0.20
       - pre_approval: weight: 0.15
       - property_type: weight: 0.10
     
     implicit:
       - pages_viewed: weight: 0.10
       - time_on_site: weight: 0.05
       - return_visits: weight: 0.05
       - content_engagement: weight: 0.10
     
     scoring_algorithm:
       method: 'weighted_sum'
       normalization: 'min_max'
       thresholds:
         hot: 80-100
         warm: 50-79
         cold: 0-49

Conversation AI Configuration

javascript   const conversationConfig = {
     personality: {
       tone: 'friendly_professional',
       empathy_level: 'high',
       response_speed: 'natural_typing'
     },
     qualification_flow: {
       stages: ['greeting', 'discovery', 'qualification', 'commitment'],
       branching_logic: 'dynamic',
       fallback_to_human: 'complex_queries'
     },
     intelligence: {
       intent_recognition: true,
       sentiment_analysis: true,
       language_detection: true,
       context_memory: '30_days'
     }
   };
Technical Specifications
Lead Capture API
typescriptinterface LeadCaptureRequest {
  source: {
    channel: 'website' | 'social' | 'sms' | 'voice';
    campaign?: string;
    referrer?: string;
    device: 'mobile' | 'desktop';
  };
  visitor: {
    ip_address: string;
    user_agent: string;
    session_id: string;
    returning: boolean;
  };
  interaction: {
    type: 'chat' | 'form' | 'call' | 'sms';
    content: string;
    timestamp: Date;
    page_url?: string;
  };
  context?: {
    property_id?: string;
    search_criteria?: object;
    behavior_scores?: object;
  };
}
Lead Scoring Algorithm
pythondef calculate_lead_score(lead_data):
    score = 0
    confidence = 0
    
    # BANT Scoring
    budget_score = score_budget(lead_data.budget)  # 0-25
    authority_score = score_authority(lead_data.decision_maker)  # 0-25
    need_score = score_need(lead_data.motivation)  # 0-25
    timeline_score = score_timeline(lead_data.timeframe)  # 0-25
    
    # Behavioral Scoring
    engagement_score = calculate_engagement(lead_data.interactions)
    intent_signals = extract_intent_signals(lead_data.behavior)
    
    # Weighted calculation
    score = (
        budget_score * 0.25 +
        authority_score * 0.20 +
        need_score * 0.20 +
        timeline_score * 0.20 +
        engagement_score * 0.10 +
        intent_signals * 0.05
    )
    
    # Confidence calculation
    confidence = calculate_confidence(lead_data.completeness)
    
    return {
        'score': score,
        'grade': get_grade(score),
        'confidence': confidence,
        'factors': {
            'budget': budget_score,
            'authority': authority_score,
            'need': need_score,
            'timeline': timeline_score
        }
    }
Success Criteria
Conversion Metrics

Capture Rate: >5% of website visitors
Qualification Rate: >60% of captures fully qualified
Response Time: 100% within 30 seconds
Engagement Duration: >3 minutes average conversation

Lead Quality Metrics

MQL Rate: >40% of leads marketing qualified
SQL Rate: >20% of leads sales qualified
Contact Rate: >70% valid contact information
BANT Completion: >50% full BANT qualification

Performance Metrics

System Uptime: 99.95% availability
Widget Load Time: <500ms
Chat Response Time: <2s for AI responses
Form Submit Success: >98% successful submissions

ROI Metrics

Cost per Lead: <$15 average across channels
Lead-to-Opportunity: >10% conversion rate
Revenue Attribution: Track $2M+ annual revenue to system
Agent Time Saved: >20 hours/week per team

Testing Requirements
A/B Testing Framework
javascriptconst abTests = {
  'widget_trigger_timing': {
    variants: {
      A: { trigger: 'time_on_page', delay: 30 },
      B: { trigger: 'time_on_page', delay: 60 },
      C: { trigger: 'exit_intent', sensitivity: 'medium' }
    },
    metrics: ['engagement_rate', 'qualification_rate'],
    duration: '2_weeks',
    sample_size: 1000
  },
  'chat_opening_message': {
    variants: {
      A: "👋 Looking for your dream home? I can help!",
      B: "See a property you like? Get details instantly!",
      C: "Hi! I'm here to answer your real estate questions"
    },
    metrics: ['response_rate', 'conversation_duration'],
    success_metric: 'lead_capture_rate'
  }
};
Quality Assurance Tests

Lead data completeness validation
Duplicate lead detection accuracy
Conversation flow testing
Integration point verification
Compliance checking (opt-in, disclosures)

Monitoring & Analytics
Real-Time Dashboard
yamldashboard_metrics:
  current_activity:
    - active_visitors
    - ongoing_conversations
    - queue_depth
    - agent_availability
  
  conversion_funnel:
    - visitors_today
    - engagements_initiated
    - leads_captured
    - qualified_leads
  
  performance:
    - avg_response_time
    - qualification_rate
    - chat_satisfaction
    - technical_errors
  
  alerts:
    - response_time > 30s: "Critical"
    - queue_depth > 10: "Warning"
    - error_rate > 1%: "Investigation needed"
    
Implementation Checklist

 Configure website widget with triggers
 Implement multi-channel capture endpoints
 Build conversation AI with qualification flow
 Create lead scoring algorithm
 Set up CRM integration
 Implement BANT qualification logic
 Add notification system
 Configure A/B testing framework
 Build analytics dashboard
 Complete compliance review