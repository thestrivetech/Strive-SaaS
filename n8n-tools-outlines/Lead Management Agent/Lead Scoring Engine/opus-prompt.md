Prompt #6: Lead Scoring Engine (Enhanced)
Role
N8n Predictive Analytics Engineer specializing in machine learning, behavioral analysis, and sales intelligence.
Context

Lead Volume: 10,000+ active leads
Historical Data: 100,000+ lead outcomes for training
Scoring Frequency: Real-time updates
Model Accuracy Target: >85% precision
Integration: CRM, marketing automation, sales tools

Primary Objective
Build an advanced ML-powered lead scoring system that accurately predicts conversion probability and optimizes sales resource allocation.
Enhanced Requirements
Machine Learning Architecture

Feature Engineering Pipeline

python   class FeatureEngineering:
       def extract_features(self, lead):
           features = {
               # Demographic Features
               'demographic': {
                   'age_group': self.categorize_age(lead.age),
                   'income_bracket': self.estimate_income(lead.zip_code),
                   'family_size': lead.household_size,
                   'employment_type': lead.employment_status
               },
               
               # Behavioral Features
               'behavioral': {
                   'total_sessions': lead.website_sessions,
                   'pages_per_session': lead.avg_pages_viewed,
                   'recency': self.days_since_last_visit(lead),
                   'frequency': lead.visit_frequency,
                   'total_time_on_site': lead.cumulative_duration,
                   'property_views': lead.properties_viewed_count,
                   'saved_searches': len(lead.saved_searches)
               },
               
               # Engagement Features
               'engagement': {
                   'email_opens': lead.email_open_rate,
                   'link_clicks': lead.click_rate,
                   'form_submissions': lead.forms_completed,
                   'chat_interactions': lead.chat_count,
                   'phone_calls': lead.call_count,
                   'showing_requests': lead.showing_requests
               },
               
               # Intent Signals
               'intent': {
                   'mortgage_calculator_use': lead.calc_usage,
                   'school_search': lead.school_searches,
                   'neighborhood_research': lead.area_research,
                   'price_drop_alerts': lead.alert_subscriptions,
                   'virtual_tour_views': lead.virtual_tours
               },
               
               # Temporal Features
               'temporal': {
                   'days_in_pipeline': self.pipeline_age(lead),
                   'weekend_activity': lead.weekend_activity_ratio,
                   'evening_activity': lead.evening_activity_ratio,
                   'activity_trend': self.calculate_trend(lead.activity_history)
               }
           }
           
           return self.vectorize_features(features)

Scoring Model Configuration

yaml   model_architecture:
     primary_model:
       type: 'gradient_boosting'
       algorithm: 'XGBoost'
       hyperparameters:
         max_depth: 6
         learning_rate: 0.1
         n_estimators: 200
         objective: 'binary:logistic'
     
     ensemble_models:
       - random_forest:
           n_estimators: 100
           max_depth: 10
           weight: 0.3
       - neural_network:
           layers: [64, 32, 16]
           activation: 'relu'
           weight: 0.2
       - logistic_regression:
           regularization: 'l2'
           weight: 0.1
     
     final_score:
       method: 'weighted_average'
       calibration: 'isotonic_regression'

Real-Time Scoring Pipeline

javascript   const scoringPipeline = {
     ingestion: {
       sources: ['crm', 'website', 'email', 'phone'],
       batch_size: 100,
       processing: 'stream'
     },
     
     preprocessing: {
       missing_values: 'smart_imputation',
       outliers: 'winsorization',
       scaling: 'standard_scaler'
     },
     
     scoring: {
       model_serving: 'api_endpoint',
       fallback: 'rule_based_scoring',
       cache: 'redis_with_ttl_1hour'
     },
     
     post_processing: {
       score_range: [0, 100],
       grade_mapping: {
         'A': [85, 100],
         'B': [70, 84],
         'C': [50, 69],
         'D': [0, 49]
       },
       confidence_threshold: 0.7
     }
   };
Technical Specifications
Model Training Pipeline
pythondef train_lead_scoring_model():
    # Data preparation
    leads_data = fetch_historical_leads()
    features = engineer_features(leads_data)
    labels = extract_conversion_labels(leads_data)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, stratify=labels
    )
    
    # Model training
    model = XGBClassifier(
        max_depth=6,
        learning_rate=0.1,
        n_estimators=200,
        objective='binary:logistic'
    )
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5)
    
    # Final training
    model.fit(X_train, y_train)
    
    # Evaluation
    predictions = model.predict_proba(X_test)[:, 1]
    metrics = {
        'auc_roc': roc_auc_score(y_test, predictions),
        'precision': precision_score(y_test, predictions > 0.5),
        'recall': recall_score(y_test, predictions > 0.5),
        'f1': f1_score(y_test, predictions > 0.5)
    }
    
    # Model versioning
    save_model(model, version=get_next_version())
    
    return model, metrics
Scoring API
typescriptinterface LeadScoringRequest {
  lead_id: string;
  organization_id: string;
  scoring_type: 'full' | 'quick' | 'update';
  include_factors?: boolean;
}

interface LeadScoringResponse {
  lead_id: string;
  score: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D';
  conversion_probability: number;
  confidence: number;
  factors?: {
    positive: Factor[];
    negative: Factor[];
  };
  recommendations: {
    next_best_action: string;
    optimal_contact_time: Date;
    channel_preference: string;
  };
  updated_at: Date;
}
Success Criteria
Model Performance

AUC-ROC: >0.85
Precision: >80% for A-grade leads
Recall: >75% for converted leads
F1 Score: >0.78

Business Impact

Sales Efficiency: 30% improvement in conversion rate
Resource Optimization: 40% reduction in wasted outreach
Revenue Impact: 25% increase in closed deals
Time-to-Contact: 50% reduction for hot leads

Operational Metrics

Scoring Latency: <100ms per lead
Update Frequency: Real-time for interactions
Model Retraining: Weekly with auto-deployment
System Uptime: 99.9% availability

Testing Requirements
Model Validation Tests
pythondef test_model_performance():
    # Load test data
    test_data = load_test_dataset()
    
    # Score distribution test
    scores = model.predict(test_data.features)
    assert 0 <= scores.min() <= scores.max() <= 100
    assert scores.std() > 15  # Ensure good distribution
    
    # Conversion correlation test
    correlation = pearsonr(scores, test_data.conversions)[0]
    assert correlation > 0.6
    
    # Temporal stability test
    weekly_scores = calculate_weekly_averages(scores)
    assert coefficient_of_variation(weekly_scores) < 0.15
    
    # Bias testing
    for demographic in ['age', 'gender', 'location']:
        bias_score = calculate_demographic_bias(scores, demographic)
        assert bias_score < 0.1
Monitoring & Feedback Loop
yamlmonitoring:
  model_drift:
    - feature_distribution_shift
    - prediction_distribution_shift
    - performance_degradation
    - concept_drift_detection
  
  business_metrics:
    - conversion_rate_by_grade
    - false_positive_rate
    - sales_feedback_accuracy
    - revenue_per_grade
  
  feedback_loop:
    - collect_outcome_data: daily
    - retrain_trigger: 'performance_drop > 5%'
    - a_b_test_new_models: continuous
    - human_review_sample: '5% of predictions'
Implementation Checklist

 Prepare historical data for training
 Build feature engineering pipeline
 Train and validate ML models
 Deploy model serving infrastructure
 Implement real-time scoring API
 Create feedback collection system
 Build monitoring dashboards
 Set up A/B testing framework
 Configure automated retraining
 Document scoring methodology