Prompt #26: Social Media Auto-Posting System (Enhanced)
Role
N8n Social Media Automation Architect specializing in multi-platform content distribution, engagement optimization, and real estate marketing compliance
Context

Volume: 500+ posts/month across 6 platforms for 50 agents
Performance: Post scheduling < 1s, image generation < 5s
Integration: Facebook, Instagram, LinkedIn, Twitter/X, YouTube, TikTok
Compliance: Fair Housing Act, platform-specific ad policies, MLS rules
Scale: 10,000 posts/month within 6 months

Primary Objective
Achieve 3x social media engagement while maintaining 100% Fair Housing compliance and generating 50+ qualified leads monthly
Enhanced Requirements
Intelligent Content Generation & Optimization

AI-Powered Content Creation

python# N8n Code Node - Content Generation Engine
def generate_social_content(listing_data, platform, campaign_type):
    """
    Generate platform-optimized content with compliance checking
    """
    # Platform-specific requirements
    platform_specs = {
        'facebook': {
            'max_chars': 63206,
            'ideal_chars': 40,
            'image_size': (1200, 630),
            'video_length': 240,
            'hashtags': 2
        },
        'instagram': {
            'max_chars': 2200,
            'ideal_chars': 125,
            'image_size': (1080, 1080),
            'video_length': 60,
            'hashtags': 30,
            'stories': True
        },
        'linkedin': {
            'max_chars': 3000,
            'ideal_chars': 150,
            'image_size': (1200, 627),
            'video_length': 600,
            'hashtags': 5
        },
        'twitter': {
            'max_chars': 280,
            'ideal_chars': 100,
            'image_size': (1200, 675),
            'video_length': 140,
            'hashtags': 2
        },
        'tiktok': {
            'max_chars': 2200,
            'ideal_chars': 100,
            'video_size': (1080, 1920),
            'video_length': 60,
            'hashtags': 5,
            'trending_audio': True
        }
    }
    
    specs = platform_specs[platform]
    
    # Generate base content
    base_content = create_listing_description(listing_data, campaign_type)
    
    # Ensure Fair Housing compliance
    compliant_content = ensure_fair_housing_compliance(base_content)
    
    # Optimize for platform
    optimized = optimize_for_platform(compliant_content, specs)
    
    # Add engagement elements
    engagement_hooks = {
        'question': generate_engagement_question(listing_data),
        'cta': generate_call_to_action(campaign_type, platform),
        'urgency': create_urgency_element(listing_data) if appropriate else None
    }
    
    # Generate hashtags
    hashtags = generate_hashtags(
        listing_data,
        platform,
        specs['hashtags'],
        include_trending=True
    )
    
    # Create visual content
    visual_content = None
    if listing_data.get('images'):
        visual_content = create_platform_optimized_visual(
            images=listing_data['images'],
            platform=platform,
            template_style=campaign_type,
            dimensions=specs['image_size']
        )
    
    # Assemble final post
    final_post = {
        'text': optimized['text'],
        'hashtags': hashtags,
        'media': visual_content,
        'engagement_hooks': engagement_hooks,
        'platform': platform,
        'compliance_verified': True,
        'optimal_posting_time': calculate_optimal_time(platform, listing_data['target_audience']),
        'expected_reach': estimate_reach(platform, optimized, visual_content),
        'a_b_variants': generate_ab_variants(optimized['text'], platform) if campaign_type == 'test'
    }
    
    return final_post

def ensure_fair_housing_compliance(content):
    """
    Ensure all content meets Fair Housing requirements
    """
    prohibited_terms = [
        'perfect for families',
        'no children',
        'adults only',
        'senior community',
        'walking distance to church',
        'christian neighborhood'
    ]
    
    # Check for violations
    violations = []
    for term in prohibited_terms:
        if term.lower() in content.lower():
            violations.append(term)
    
    # Auto-correct violations
    if violations:
        content = auto_correct_violations(content, violations)
    
    # Add required disclaimers
    content += '\n\n' + get_fair_housing_disclaimer()
    
    return content
Multi-Platform Scheduling & Distribution

Intelligent Post Scheduling System

javascript// N8n Function Node - Optimal Scheduling Algorithm
const schedulePostAcrossPlatforms = async (content, targetAudience) => {
  // Analyze audience activity patterns
  const audienceAnalytics = await analyzeAudienceActivity(targetAudience);
  
  // Platform-specific optimal times
  const optimalTimes = {
    facebook: findOptimalFacebookTime(audienceAnalytics),
    instagram: findOptimalInstagramTime(audienceAnalytics),
    linkedin: findOptimalLinkedInTime(audienceAnalytics),
    twitter: findOptimalTwitterTime(audienceAnalytics),
    tiktok: findOptimalTikTokTime(audienceAnalytics)
  };
  
  // Cross-platform coordination to avoid oversaturation
  const schedule = coordinateCrossPlatformSchedule(optimalTimes);
  
  // Consider time zones
  const timeZoneAdjusted = adjustForTimeZones(schedule, targetAudience.locations);
  
  // Queue posts for publishing
  const publishQueue = [];
  
  for (const [platform, timing] of Object.entries(timeZoneAdjusted)) {
    const platformContent = adaptContentForPlatform(content, platform);
    
    publishQueue.push({
      platform,
      content: platformContent,
      scheduledTime: timing.primaryTime,
      backupTime: timing.backupTime,
      priority: calculatePriority(platform, content.type),
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2
      },
      analytics: {
        trackingId: generateTrackingId(),
        utmParams: generateUTMParams(platform, content.campaign),
        conversionGoals: defineConversionGoals(content.type)
      }
    });
  }
  
  // Add to publishing calendar
  await addToPublishingCalendar(publishQueue);
  
  return {
    schedule: publishQueue,
    expectedReach: calculateTotalReach(publishQueue),
    expectedEngagement: estimateEngagement(publishQueue),
    complianceStatus: 'verified',
    analyticsSetup: true
  };
};

const findOptimalFacebookTime = (analytics) => {
  // Facebook engagement peaks
  const peakWindows = [
    { day: 'wednesday', hours: [11, 13] },
    { day: 'thursday', hours: [13, 16] },
    { day: 'friday', hours: [13, 15] }
  ];
  
  // Combine with actual audience data
  const audiencePeaks = analytics.facebook.peakEngagementTimes;
  
  return mergeOptimalTimes(peakWindows, audiencePeaks);
};
Technical Specifications
API Definition
typescriptinterface SocialMediaPost {
  id: string;
  platforms: Platform[];
  content: {
    text: string;
    hashtags: string[];
    mentions?: string[];
    media?: MediaContent[];
  };
  scheduling: {
    publishTime: Date;
    timezone: string;
    crossPostDelay?: number; // minutes between platforms
  };
  targeting?: {
    demographics?: Demographics;
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
  };
  compliance: {
    fairHousingVerified: boolean;
    mlsCompliant: boolean;
    platformPolicyCompliant: boolean;
  };
  performance?: {
    reach: number;
    engagement: number;
    clicks: number;
    leads: number;
    conversions: number;
  };
}

interface MediaContent {
  type: 'image' | 'video' | 'carousel' | 'story';
  url: string;
  thumbnail?: string;
  duration?: number; // for videos
  dimensions: {
    width: number;
    height: number;
  };
  alternativeText: string; // accessibility
  brandingApplied: boolean;
}
Visual Content Generation
javascript// N8n Function Node - Automated Visual Creation
const createPropertyVisuals = async (propertyData) => {
  const templates = {
    newListing: {
      layout: 'hero_with_details',
      brandPosition: 'bottom_right',
      infoOverlay: ['price', 'beds', 'baths', 'sqft'],
      colorScheme: 'brand_primary'
    },
    openHouse: {
      layout: 'event_announcement',
      brandPosition: 'top_center',
      infoOverlay: ['date', 'time', 'address'],
      colorScheme: 'urgent_attention'
    },
    justSold: {
      layout: 'celebration',
      brandPosition: 'center',
      infoOverlay: ['sold_price', 'days_on_market'],
      colorScheme: 'success'
    },
    marketUpdate: {
      layout: 'infographic',
      dataVisualization: true,
      brandPosition: 'bottom_center',
      colorScheme: 'professional'
    }
  };
  
  // Select appropriate template
  const template = templates[propertyData.campaignType];
  
  // Generate branded visuals for each platform
  const visuals = {};
  
  // Facebook/Instagram feed post
  visuals.feedPost = await generateImage({
    template: template,
    images: propertyData.images.slice(0, 3),
    dimensions: { width: 1080, height: 1080 },
    branding: getBrandingAssets(propertyData.agentId),
    text: generateImageText(propertyData),
    quality: 'high'
  });
  
  // Instagram Story
  visuals.story = await generateImage({
    template: { ...template, layout: 'vertical_story' },
    images: propertyData.images[0],
    dimensions: { width: 1080, height: 1920 },
    branding: getBrandingAssets(propertyData.agentId),
    interactive: addInteractiveElements('story'),
    duration: 15
  });
  
  // Video generation for TikTok/Reels
  if (propertyData.images.length > 5) {
    visuals.video = await generatePropertyVideo({
      images: propertyData.images,
      duration: 30,
      transitions: 'smooth_zoom',
      music: selectTrendingAudio(propertyData.targetAudience),
      captions: generateVideoCaptions(propertyData),
      branding: getBrandingAssets(propertyData.agentId)
    });
  }
  
  return visuals;
};
Success Criteria
Performance Metrics

Post Scheduling: <1s per post across all platforms
Image Generation: <5s for branded property visuals
API Success Rate: >99% for all platforms
Concurrent Posts: Handle 100 simultaneous scheduling requests

Quality Metrics

Engagement Rate: >5% average across platforms
Compliance Rate: 100% Fair Housing compliant
Visual Quality: >90% agent approval on auto-generated content
Hashtag Performance: >30% increase in reach with optimized tags

Business Impact Metrics

Lead Generation: 50+ qualified leads/month
Time Saved: 20 hours/month per agent on social media
Reach Growth: 3x increase in 6 months
Conversion Rate: 2% social to client conversion

Testing Requirements
javascriptdescribe('Social Media Automation Tests', () => {
  describe('Content Generation', () => {
    test('should generate Fair Housing compliant content', () => {
      const listing = createTestListing();
      const content = generateSocialContent(listing, 'facebook', 'new_listing');
      
      expect(content.compliance_verified).toBe(true);
      expect(content.text).not.toMatch(/perfect for families/i);
      expect(content.text).toContain('Equal Housing Opportunity');
    });
    
    test('should optimize content for each platform', () => {
      const content = generateSocialContent(listing, 'twitter', 'new_listing');
      
      expect(content.text.length).toBeLessThanOrEqual(280);
      expect(content.hashtags.length).toBeLessThanOrEqual(2);
    });
  });
});
Monitoring & Observability
yamldashboard:
  posting_metrics:
    - metric: posts_scheduled
      measurement: per_hour
      threshold: > 50
    
    - metric: posting_success_rate
      threshold: > 99%
      alert: critical if < 95%
  
  engagement_metrics:
    - metric: average_engagement_rate
      calculation: (likes + comments + shares) / reach
      target: > 5%
    
    - metric: click_through_rate
      target: > 2%
      per_platform: true
  
  compliance:
    - metric: fair_housing_violations
      threshold: 0
      alert: critical if > 0
    
    - metric: platform_policy_violations
      threshold: < 1 per month

alerts:
  - name: posting_failure
    condition: failed_posts > 3 in 10 minutes
    action: 
      - retry: with exponential backoff
      - notify: social_media_team