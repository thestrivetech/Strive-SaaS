Prompt #7: Listing Description Generator (Enhanced)
Role
N8n Real Estate Content Intelligence Engineer specializing in SEO optimization, conversion copywriting, and multi-channel content distribution.
Context

Listing Volume: 500+ new listings monthly
Distribution Channels: MLS, website, social media, print
SEO Requirements: Top 3 Google ranking for local searches
Compliance: Fair Housing Act, MLS rules, truth in advertising
Languages: English, Spanish, Mandarin (market dependent)

Primary Objective
Create an AI-powered listing description system that generates compelling, SEO-optimized, and legally compliant property descriptions that maximize buyer interest and showing requests.
Enhanced Requirements
Content Generation Architecture

Multi-Style Generation Engine

javascript   const descriptionStyles = {
     luxury: {
       tone: 'sophisticated_exclusive',
       vocabulary: 'elevated_descriptive',
       length: '400-500_words',
       highlights: ['architectural_details', 'premium_finishes', 'lifestyle'],
       power_words: ['exquisite', 'prestigious', 'unparalleled', 'bespoke']
     },
     first_time_buyer: {
       tone: 'warm_approachable',
       vocabulary: 'simple_clear',
       length: '250-300_words',
       highlights: ['affordability', 'move_in_ready', 'neighborhood'],
       power_words: ['cozy', 'perfect_starter', 'affordable', 'convenient']
     },
     investor: {
       tone: 'analytical_factual',
       vocabulary: 'financial_focused',
       length: '300-350_words',
       highlights: ['roi_potential', 'rental_income', 'appreciation', 'cash_flow'],
       power_words: ['income-producing', 'high-yield', 'value-add', 'cash-flowing']
     }
   };

SEO Optimization Engine

python   class SEOOptimizer:
       def optimize_description(self, property_data, target_market):
           # Keyword research
           keywords = self.get_local_keywords(property_data.location)
           lsi_keywords = self.get_lsi_terms(property_data.type)
           
           # Keyword density optimization
           primary_keyword_density = 0.015  # 1.5%
           secondary_keyword_density = 0.008  # 0.8%
           
           # Structure optimization
           structure = {
               'headline': self.generate_headline(keywords[0], property_data),
               'opening_hook': self.create_emotional_hook(target_market),
               'features_section': self.highlight_features(property_data.amenities),
               'neighborhood_section': self.describe_area(property_data.location),
               'call_to_action': self.create_urgency_cta()
           }
           
           # Meta descriptions
           meta = {
               'title_tag': f"{property_data.type} for sale in {property_data.city}",
               'meta_description': self.generate_meta_desc(155),
               'schema_markup': self.create_property_schema(property_data)
           }
           
           return {
               'description': self.assemble_description(structure),
               'meta': meta,
               'keywords': keywords,
               'readability_score': self.calculate_readability()
           }

Competitive Analysis System

yaml   competitive_analysis:
     market_research:
       - similar_properties_analysis
       - pricing_positioning
       - unique_selling_points
       - market_saturation_level
     
     differentiation_strategy:
       features_comparison:
         - identify_unique_features
         - highlight_competitive_advantages
         - address_potential_objections
       
       narrative_approach:
         - emotional_storytelling
         - lifestyle_positioning
         - investment_angle
         - community_focus
     
     performance_tracking:
       - view_to_showing_ratio
       - description_engagement_time
       - social_share_rate
       - seo_ranking_position
Technical Specifications
Content Generation API
typescriptinterface ListingDescriptionRequest {
  property: {
    mls_number: string;
    address: string;
    type: 'single_family' | 'condo' | 'multi_family' | 'commercial';
    price: number;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    lot_size?: number;
    year_built: number;
    features: string[];
    upgrades: string[];
    photos: string[];  // URLs for visual analysis
  };
  target_audience: 'luxury' | 'first_time' | 'investor' | 'general';
  channels: ('mls' | 'website' | 'social' | 'print')[];
  languages?: string[];
  seo_focus?: string[];  // Target keywords
}

interface ListingDescriptionResponse {
  descriptions: {
    mls: {
      headline: string;
      body: string;
      features: string[];
    };
    website: {
      headline: string;
      body: string;
      meta_title: string;
      meta_description: string;
      schema_markup: object;
    };
    social: {
      facebook: string;
      instagram: string;
      twitter: string;
      hashtags: string[];
    };
  };
  seo_analysis: {
    keyword_density: object;
    readability_score: number;
    competitive_score: number;
  };
  translations?: object;
}
Multi-Channel Content Variants
javascriptconst generateChannelVariants = (baseDescription) => {
  return {
    mls: {
      format: 'plain_text',
      max_length: 500,
      requirements: ['no_contact_info', 'no_branded_terms'],
      optimize_for: 'search_visibility'
    },
    website: {
      format: 'html',
      max_length: 'unlimited',
      features: ['rich_media', 'interactive_elements', 'cta_buttons'],
      optimize_for: 'conversion'
    },
    social_media: {
      facebook: {
        max_length: 500,
        features: ['emojis', 'hashtags', 'call_to_action'],
        tone: 'conversational'
      },
      instagram: {
        max_length: 2200,
        features: ['story_telling', 'lifestyle_focus', 'hashtags_30'],
        visual_pairing: 'carousel_suggestions'
      },
      twitter: {
        max_length: 280,
        features: ['urgency', 'key_highlight', 'link'],
        thread_option: true
      }
    },
    email: {
      subject_line: generateSubjectLine(baseDescription),
      preview_text: generatePreviewText(baseDescription),
      body: generateEmailBody(baseDescription)
    }
  };
};
Success Criteria
Content Quality Metrics

Readability Score: Flesch-Kincaid 60-70 (8th-grade level)
SEO Score: >85 on Yoast/similar metrics
Uniqueness: >95% original content (no plagiarism)
Compliance: 100% Fair Housing Act compliant

Performance Metrics

Generation Speed: <5 seconds per listing
SEO Rankings: Top 3 for "[property type] [city]" searches
Click-Through Rate: >3% from search results
Engagement Time: >45 seconds on listing page

Business Impact Metrics

Showing Requests: 25% increase vs manual descriptions
Days on Market: 15% reduction
Social Shares: 50% increase
Agent Time Saved: 2 hours per listing

Testing Requirements
Quality Assurance Tests
pythondef test_description_quality():
    # Fair Housing compliance
    description = generate_description(sample_property)
    assert not contains_discriminatory_language(description)
    assert not contains_prohibited_terms(description)
    
    # SEO optimization
    seo_score = calculate_seo_score(description)
    assert seo_score >= 85
    assert keyword_density(description, target_keyword) <= 0.02
    
    # Readability
    readability = flesch_kincaid_score(description)
    assert 60 <= readability <= 70
    
    # Uniqueness
    plagiarism_score = check_plagiarism(description)
    assert plagiarism_score < 0.05
A/B Testing Framework
javascriptconst descriptionTests = {
  headline_style: {
    A: "Stunning 4BR Home in Desirable Neighborhood",
    B: "Your Dream Home Awaits - 4BR with Modern Updates",
    C: "Exceptional Value: Updated 4BR in Prime Location",
    metric: 'click_through_rate'
  },
  opening_sentence: {
    A: "Welcome home to this beautiful...",
    B: "Imagine living in this stunning...",
    C: "Don't miss this exceptional opportunity...",
    metric: 'engagement_time'
  },
  cta_placement: {
    A: 'top_of_description',
    B: 'middle_of_description',
    C: 'end_of_description',
    metric: 'showing_request_rate'
  }
};
Implementation Checklist

 Build property data extraction pipeline
 Create multi-style generation templates
 Implement SEO optimization engine
 Build competitive analysis system
 Create multi-channel formatting
 Add language translation support
 Implement Fair Housing compliance checks
 Build A/B testing framework
 Create performance tracking
 Generate sample descriptions for review