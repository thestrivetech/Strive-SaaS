Prompt #9: Property Alert System (Enhanced)
Role
N8n Real-Time Data Streaming Engineer specializing in event-driven architectures, intelligent filtering, and multi-channel notifications.
Context

Data Sources: 15+ MLS systems, public records, proprietary data
Alert Volume: 100,000+ daily potential matches
User Base: 50,000+ active alert subscriptions
Delivery Channels: Email, SMS, push, in-app
Performance Requirement: <1 minute from listing to alert

Primary Objective
Build a sophisticated property alert system that intelligently monitors market changes and delivers highly relevant, timely notifications to maximize client engagement and conversion.
Enhanced Requirements
Real-Time Monitoring Architecture

Event Stream Processing

yaml   stream_architecture:
     ingestion:
       sources:
         - mls_feeds:
             protocol: RETS/WebAPI
             polling_interval: 30_seconds
             change_detection: incremental
         - public_records:
             protocol: API/FTP
             update_frequency: hourly
             change_types: [sales, price_changes, status_changes]
         - proprietary:
             protocol: websocket
             real_time: true
     
     processing:
       framework: Apache_Kafka/Kinesis
       partitioning: by_location
       ordering_guarantee: per_partition
       deduplication: exactly_once_delivery
     
     matching_engine:
       algorithm: inverted_index_with_scoring
       cache: Redis_with_bloom_filters
       parallelization: thread_pool_executor
       batch_size: 1000_alerts

Intelligent Matching Algorithm

python   class PropertyMatcher:
       def match_property_to_users(self, property_data):
           # Build search query from property
           property_vector = self.vectorize_property(property_data)
           
           # Initial candidate selection using inverted index
           candidates = self.get_candidate_users(property_data)
           
           # Detailed matching with scoring
           matches = []
           for user in candidates:
               # Hard filters (must match)
               if not self.passes_hard_filters(property_data, user.criteria):
                   continue
               
               # Soft scoring (preference matching)
               score = self.calculate_match_score(property_data, user)
               
               # Behavioral scoring
               interest_score = self.predict_user_interest(user, property_data)
               
               # Combined score
               final_score = (score * 0.7) + (interest_score * 0.3)
               
               if final_score > user.alert_threshold:
                   matches.append({
                       'user': user,
                       'score': final_score,
                       'reasons': self.generate_match_reasons(property_data, user),
                       'priority': self.determine_priority(final_score, user.engagement)
                   })
           
           return self.rank_and_filter_matches(matches)
       
       def calculate_match_score(self, property, user):
           scores = {
               'location': self.location_score(property.location, user.areas),
               'price': self.price_score(property.price, user.budget),
               'features': self.feature_score(property.features, user.must_haves),
               'size': self.size_score(property.sqft, user.size_range),
               'type': self.type_score(property.type, user.property_types)
           }
           
           # Weighted scoring based on user preferences
           weights = user.preference_weights or self.default_weights
           
           return sum(scores[k] * weights[k] for k in scores)

Multi-Channel Delivery System

javascript   const deliveryOrchestrator = {
     channelSelection: (user, alert) => {
       const channels = [];
       
       // Time-based channel selection
       const hour = new Date().getHours();
       const isBusinessHours = hour >= 9 && hour <= 18;
       
       // Priority-based delivery
       if (alert.priority === 'high') {
         channels.push('push', 'sms', 'email');
       } else if (alert.priority === 'medium') {
         if (isBusinessHours) {
           channels.push('push', 'email');
         } else {
           channels.push('email');
         }
       } else {
         channels.push('email');  // Low priority
       }
       
       // User preference override
       return channels.filter(ch => user.enabled_channels.includes(ch));
     },
     
     messageFormatting: {
       email: {
         template: 'property_alert_email',
         personalization: ['name', 'search_name', 'match_reasons'],
         images: true,
         map: true,
         similar_properties: 3
       },
       sms: {
         max_length: 160,
         template: '🏠 New match: {address} ${price}. {key_feature}. View: {link}',
         link_shortener: true
       },
       push: {
         title: 'New Property Match!',
         body: '{address} matches your search "{search_name}"',
         image: 'property_thumbnail',
         deep_link: 'app://property/{id}'
       }
     },
     
     batching: {
       enabled: true,
       window: '15_minutes',
       max_properties: 10,
       digest_threshold: 3  // Send digest if >3 properties
     }
   };
Technical Specifications
Alert Configuration API
typescriptinterface AlertSubscription {
  user_id: string;
  search_criteria: {
    locations: {
      areas: string[];
      radius?: number;
      polygons?: GeoPolygon[];
    };
    price: {
      min?: number;
      max?: number;
      include_price_drops?: boolean;
      drop_threshold?: number;
    };
    property: {
      types: PropertyType[];
      bedrooms: { min?: number; max?: number };
      bathrooms: { min?: number; max?: number };
      sqft: { min?: number; max?: number };
      lot_size?: { min?: number; max?: number };
      year_built?: { min?: number; max?: number };
    };
    features: {
      must_have: string[];
      nice_to_have: string[];
      exclude: string[];
    };
    market: {
      new_listings_only?: boolean;
      include_coming_soon?: boolean;
      days_on_market?: number;
      status: ListingStatus[];
    };
  };
  delivery: {
    channels: ('email' | 'sms' | 'push' | 'in_app')[];
    frequency: 'instant' | 'daily' | 'weekly';
    schedule?: {
      days: number[];
      time: string;
      timezone: string;
    };
    max_per_day?: number;
  };
}
Performance Optimization
pythonclass AlertPerformanceOptimizer:
    def __init__(self):
        self.cache = RedisCache()
        self.bloom_filter = BloomFilter(capacity=1000000, error_rate=0.01)
        
    def optimize_matching(self, property):
        # Quick rejection using bloom filters
        property_hash = self.hash_property(property)
        
        # Check if we've already processed this property
        if self.bloom_filter.contains(property_hash):
            return []  # Already processed
        
        # Add to bloom filter
        self.bloom_filter.add(property_hash)
        
        # Use spatial indexing for location-based matching
        nearby_users = self.spatial_index.query(
            property.latitude,
            property.longitude,
            radius=50  # miles
        )
        
        # Use inverted index for feature matching
        feature_matches = self.feature_index.query(property.features)
        
        # Intersection of spatial and feature matches
        candidates = set(nearby_users) & set(feature_matches)
        
        return list(candidates)
Success Criteria
Performance Metrics

Alert Latency: <60 seconds from listing to notification
Matching Accuracy: >90% relevant alerts (user feedback)
Delivery Success: >99% successful delivery rate
System Throughput: 10,000 alerts/minute capacity

Engagement Metrics

Open Rate: >40% for email alerts
Click-Through Rate: >15% on alerted properties
Unsubscribe Rate: <2% monthly
Alert-to-Showing: >10% conversion rate

Quality Metrics

False Positive Rate: <5% irrelevant alerts
Duplicate Rate: <0.1% duplicate notifications
Personalization Score: >85% user satisfaction
Timing Optimization: 30% improvement in engagement

Testing Requirements
Matching Algorithm Tests
pythondef test_alert_matching():
    # Setup test data
    property = create_test_property(
        price=500000,
        location="Downtown",
        features=["pool", "garage"]
    )
    
    user = create_test_user(
        budget_max=550000,
        areas=["Downtown", "Midtown"],
        must_have=["pool"]
    )
    
    # Test matching
    matches = matcher.match_property_to_users(property)
    assert user in [m['user'] for m in matches]
    
    # Test scoring
    score = matcher.calculate_match_score(property, user)
    assert score > 0.8  # High match score
    
    # Test filtering
    user.criteria.price.max = 400000  # Below property price
    matches = matcher.match_property_to_users(property)
    assert user not in [m['user'] for m in matches]
Implementation Checklist

 Set up real-time data streaming
 Build property matching engine
 Implement intelligent filtering
 Create multi-channel delivery
 Add batching and digest logic
 Build preference learning system
 Set up monitoring and analytics
 Implement A/B testing
 Create unsubscribe management
 Document alert configuration API