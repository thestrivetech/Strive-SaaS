Prompt #23: Automated Review Management System (Enhanced)
Role
N8n Online Reputation Management Engineer with expertise in multi-platform API integration, sentiment analysis, and automated response generation
Context

Volume: 50-200 reviews per month across 8+ platforms
Performance: Review detection < 5 minutes, response generation < 30 seconds
Integration: Google, Zillow, Realtor.com, Facebook, Yelp, Better Homes & Gardens
Compliance: Platform-specific terms of service, FTC endorsement guidelines
Scale: Managing reputation for 100 agents, scaling to 1000

Primary Objective
Achieve 100% review response rate within 2 hours while maintaining 4.5+ average rating across all platforms
Enhanced Requirements
Multi-Platform Review Monitoring

Unified Review Aggregation Pipeline

javascript// N8n Function Node - Review Monitoring System
const monitorReviews = async () => {
  const platforms = [
    { 
      name: 'google',
      api: 'https://mybusiness.googleapis.com/v4',
      pollInterval: 300000, // 5 minutes
      credentials: $node["GoogleAuth"].json
    },
    {
      name: 'zillow',
      scraper: true,
      selector: '.review-container',
      pollInterval: 600000, // 10 minutes
    },
    {
      name: 'facebook',
      api: 'https://graph.facebook.com/v12.0',
      webhookEnabled: true,
      credentials: $node["FacebookAuth"].json
    }
  ];
  
  const newReviews = [];
  
  for (const platform of platforms) {
    try {
      let reviews;
      
      if (platform.api && !platform.scraper) {
        // API-based retrieval
        reviews = await fetchViaAPI(platform);
      } else if (platform.webhookEnabled) {
        // Webhook-based (real-time)
        reviews = await getWebhookReviews(platform);
      } else {
        // Scraping fallback
        reviews = await scrapeReviews(platform);
      }
      
      // Filter for new reviews
      const lastCheck = await getLastCheckTime(platform.name);
      const filtered = reviews.filter(r => new Date(r.date) > lastCheck);
      
      // Standardize format
      const standardized = filtered.map(review => ({
        id: generateReviewId(platform.name, review),
        platform: platform.name,
        rating: review.rating,
        text: review.text || review.comment || review.content,
        authorName: review.author || review.reviewer,
        authorId: review.authorId,
        date: new Date(review.date || review.timestamp),
        url: review.url || generateReviewUrl(platform, review),
        agentId: extractAgentId(review),
        propertyId: extractPropertyId(review),
        verified: review.verified || false
      }));
      
      newReviews.push(...standardized);
      await updateLastCheckTime(platform.name);
      
    } catch (error) {
      await logPlatformError(platform.name, error);
      await sendAlertToOps(platform.name, error);
    }
  }
  
  // Process all new reviews
  for (const review of newReviews) {
    await processNewReview(review);
  }
  
  return newReviews;
};
Sentiment Analysis & Response Generation

AI-Powered Response System

python# N8n Code Node - Sentiment Analysis and Response Generation
def analyze_and_respond(review_data):
    """
    Perform deep sentiment analysis and generate contextual response
    """
    # Sentiment analysis with multiple models
    sentiment_scores = {
        'overall': analyze_overall_sentiment(review_data['text']),
        'aspects': analyze_aspect_sentiment(review_data['text']),
        'emotions': detect_emotions(review_data['text']),
        'urgency': calculate_urgency_score(review_data)
    }
    
    # Identify specific issues mentioned
    issues = extract_issues(review_data['text'])
    compliments = extract_compliments(review_data['text'])
    
    # Determine response strategy
    response_strategy = determine_strategy(
        rating=review_data['rating'],
        sentiment=sentiment_scores,
        issues=issues,
        platform=review_data['platform']
    )
    
    # Generate personalized response
    response_template = select_template(response_strategy)
    
    response = generate_response(
        template=response_template,
        reviewer_name=review_data['authorName'],
        issues=issues,
        compliments=compliments,
        agent_name=get_agent_name(review_data['agentId']),
        follow_up_action=determine_follow_up(issues, sentiment_scores)
    )
    
    # Ensure platform compliance
    response = ensure_platform_compliance(response, review_data['platform'])
    
    # Add response metadata
    return {
        'response_text': response,
        'sentiment_analysis': sentiment_scores,
        'response_strategy': response_strategy,
        'priority': calculate_priority(sentiment_scores, review_data['rating']),
        'requires_human_review': needs_human_review(sentiment_scores, issues),
        'internal_action_items': generate_action_items(issues, review_data)
    }
Technical Specifications
API Definition
typescriptinterface Review {
  id: string;
  platform: 'google' | 'zillow' | 'facebook' | 'yelp' | 'realtor';
  rating: number; // 1-5
  text: string;
  authorName: string;
  authorId?: string;
  date: Date;
  url: string;
  agentId?: string;
  propertyId?: string;
  verified: boolean;
  images?: string[];
  response?: ReviewResponse;
}

interface ReviewResponse {
  text: string;
  authorId: string; // responding agent/business
  date: Date;
  status: 'pending' | 'posted' | 'failed' | 'requires_approval';
  approvalRequired: boolean;
  editHistory?: ResponseEdit[];
}

interface SentimentAnalysis {
  overall: number; // -1 to 1
  aspects: {
    communication: number;
    professionalism: number;
    knowledge: number;
    responsiveness: number;
    results: number;
  };
  emotions: {
    joy: number;
    anger: number;
    sadness: number;
    fear: number;
    surprise: number;
  };
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  topics: string[];
  issues: Issue[];
}
Review Fraud Detection
javascript// N8n Function Node - Fraud Detection System
const detectReviewFraud = async (review) => {
  const fraudIndicators = {
    suspiciousPatterns: 0,
    maxScore: 100
  };
  
  // Check 1: Review bombing (multiple reviews in short time)
  const recentReviews = await getRecentReviews(review.authorId, 24); // 24 hours
  if (recentReviews.length > 3) {
    fraudIndicators.suspiciousPatterns += 25;
  }
  
  // Check 2: Generic language patterns
  const genericPhrases = [
    'best agent ever', 'worst experience', 'highly recommend',
    'would not recommend', 'five stars', 'one star'
  ];
  const genericCount = genericPhrases.filter(phrase => 
    review.text.toLowerCase().includes(phrase)
  ).length;
  fraudIndicators.suspiciousPatterns += genericCount * 10;
  
  // Check 3: Reviewer history
  const reviewerProfile = await analyzeReviewerProfile(review.authorId);
  if (reviewerProfile.totalReviews === 1) {
    fraudIndicators.suspiciousPatterns += 15;
  }
  if (reviewerProfile.allSameRating) {
    fraudIndicators.suspiciousPatterns += 20;
  }
  
  // Check 4: Language analysis
  const languageAnalysis = await analyzeLanguageAuthenticity(review.text);
  if (languageAnalysis.aiGenerated > 0.7) {
    fraudIndicators.suspiciousPatterns += 30;
  }
  
  // Check 5: Timing patterns
  const postTime = new Date(review.date);
  if (postTime.getHours() >= 2 && postTime.getHours() <= 5) {
    fraudIndicators.suspiciousPatterns += 10; // Unusual posting hours
  }
  
  // Calculate fraud probability
  const fraudProbability = fraudIndicators.suspiciousPatterns / fraudIndicators.maxScore;
  
  return {
    fraudProbability,
    suspicious: fraudProbability > 0.6,
    indicators: fraudIndicators,
    recommendation: fraudProbability > 0.8 ? 'report' : 
                   fraudProbability > 0.6 ? 'monitor' : 'legitimate',
    evidenceLog: generateEvidenceLog(fraudIndicators, review)
  };
};
Success Criteria
Performance Metrics

Detection Latency: <5 minutes from review posting
Response Time: <30 seconds for generation, <2 hours for posting
API Success Rate: >99% for supported platforms
System Uptime: 99.9% availability

Quality Metrics

Response Rate: 100% of reviews responded to
Response Quality: >4.5/5 helpfulness rating
Fraud Detection: >90% accuracy in identifying fake reviews
Sentiment Accuracy: >85% agreement with human analysis

Business Impact Metrics

Rating Improvement: +0.3 stars average within 6 months
Review Volume: +40% increase in positive reviews
Response Efficiency: 90% reduction in manual response time
Reputation Score: Top 10% in local market

Testing Requirements
Unit Tests
javascriptdescribe('Review Management Tests', () => {
  describe('Sentiment Analysis', () => {
    test('should accurately detect negative sentiment', () => {
      const review = {
        text: "Terrible experience. Agent was late and unprepared.",
        rating: 2
      };
      
      const analysis = analyzeSentiment(review);
      
      expect(analysis.overall).toBeLessThan(-0.5);
      expect(analysis.aspects.professionalism).toBeLessThan(0);
      expect(analysis.urgency).toBe('high');
    });
    
    test('should identify specific issues in reviews', () => {
      const review = {
        text: "Agent didn't return calls and missed two appointments",
        rating: 1
      };
      
      const issues = extractIssues(review.text);
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          category: 'communication',
          severity: 'high'
        })
      );
      expect(issues).toContainEqual(
        expect.objectContaining({
          category: 'reliability',
          severity: 'high'
        })
      );
    });
  });
  
  describe('Fraud Detection', () => {
    test('should detect review bombing patterns', async () => {
      const suspiciousReview = createSuspiciousReview();
      const result = await detectReviewFraud(suspiciousReview);
      
      expect(result.fraudProbability).toBeGreaterThan(0.6);
      expect(result.recommendation).toBe('monitor');
    });
  });
});
Monitoring & Observability
yamldashboard:
  review_metrics:
    - metric: new_reviews_detected
      measurement: count per hour
      threshold: > 0
    
    - metric: response_time
      measurement: p95 latency
      threshold: < 2 hours
      alert: critical if > 4 hours
    
    - metric: average_rating
      measurement: 30-day rolling average
      target: > 4.5
      alert: warning if < 4.2
  
  platform_health:
    - metric: api_success_rate
      per_platform: true
      threshold: > 98%
      alert: critical if < 95%
    
    - metric: scraper_reliability
      platforms: [zillow, yelp]
      threshold: > 90%
      alert: warning if < 85%
  
  fraud_detection:
    - metric: suspicious_reviews
      measurement: percentage of total
      threshold: < 5%
      action: manual_review if > 10%
    
    - metric: fraud_detection_accuracy
      measurement: confirmed vs predicted
      target: > 90%

alerts:
  - name: negative_review_urgent
    condition: rating <= 2 AND urgency == 'immediate'
    actions:
      - notify: [manager, agent]
      - escalate: if no response in 30 minutes
  
  - name: platform_api_failure
    condition: api_errors > 3 in 10 minutes
    actions:
      - switch: to_scraper_backup
      - notify: tech_team