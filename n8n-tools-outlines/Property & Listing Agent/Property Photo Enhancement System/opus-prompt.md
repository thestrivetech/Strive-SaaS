Prompt #8: Property Photo Enhancement System (Enhanced)
Role
N8n Visual Intelligence Engineer specializing in computer vision, image processing, and virtual staging automation.
Context

Photo Volume: 10,000+ images monthly
Processing Requirements: Real-time enhancement
Quality Standards: MLS and professional photography grade
Virtual Staging: 30% of vacant properties
Storage: Cloud-optimized with CDN distribution

Primary Objective
Create an automated photo enhancement pipeline that transforms raw property photos into professional-grade visuals while offering virtual staging capabilities for maximum visual appeal.
Enhanced Requirements
Image Processing Pipeline

Automated Enhancement Workflow

python   class PhotoEnhancementPipeline:
       def process_image(self, image_path):
           # Load and analyze image
           image = load_image(image_path)
           analysis = self.analyze_image_quality(image)
           
           # Enhancement stages
           enhanced = image
           
           # Stage 1: Basic corrections
           if analysis['exposure'] < 0.3 or analysis['exposure'] > 0.8:
               enhanced = self.adjust_exposure(enhanced, target=0.5)
           
           if analysis['white_balance_temp'] < 4500 or > 6500:
               enhanced = self.correct_white_balance(enhanced)
           
           # Stage 2: Geometric corrections
           if analysis['perspective_distortion'] > 0.05:
               enhanced = self.correct_perspective(enhanced)
           
           if analysis['rotation_angle'] != 0:
               enhanced = self.straighten_image(enhanced, analysis['rotation_angle'])
           
           # Stage 3: Enhancement
           enhanced = self.enhance_details(enhanced, method='unsharp_mask')
           enhanced = self.reduce_noise(enhanced, method='bilateral_filter')
           enhanced = self.adjust_vibrance(enhanced, amount=1.1)
           
           # Stage 4: HDR processing
           if analysis['dynamic_range'] < 0.6:
               enhanced = self.apply_hdr_toning(enhanced)
           
           # Stage 5: Object removal
           if self.detect_unwanted_objects(enhanced):
               enhanced = self.remove_objects(enhanced, ['personal_items', 'clutter'])
           
           return {
               'enhanced_image': enhanced,
               'quality_score': self.calculate_quality_score(enhanced),
               'improvements': self.list_improvements_made(image, enhanced)
           }

Virtual Staging Engine

javascript   const virtualStagingConfig = {
     room_detection: {
       model: 'segmentation_cnn',
       categories: ['living_room', 'bedroom', 'dining', 'kitchen', 'bathroom'],
       confidence_threshold: 0.85
     },
     
     furniture_placement: {
       style_options: ['modern', 'traditional', 'contemporary', 'minimalist'],
       density: 'balanced',  // sparse | balanced | full
       rules: {
         traffic_flow: true,
         focal_points: true,
         proportion: true,
         lighting_consideration: true
       }
     },
     
     rendering: {
       quality: 'high',  // draft | standard | high
       lighting_match: true,
       shadow_generation: true,
       perspective_correction: true,
       color_harmony: true
     },
     
     ai_models: {
       room_segmentation: 'mask_rcnn',
       furniture_generation: 'stable_diffusion_furniture',
       lighting_analysis: 'light_estimation_cnn',
       style_transfer: 'neural_style_transfer'
     }
   };

Quality Control System

yaml   quality_metrics:
     technical:
       - resolution: min_2048x1536
       - aspect_ratio: 3:2_or_4:3
       - file_size: optimized_under_1mb
       - format: jpeg_quality_85
     
     aesthetic:
       - composition_score: rule_of_thirds
       - lighting_quality: even_exposure
       - color_balance: natural_tones
       - sharpness: tack_sharp_focus
     
     mls_compliance:
       - no_watermarks: required
       - no_borders: required
       - no_text_overlays: required
       - accurate_representation: required
     
     virtual_staging:
       - realism_score: > 0.85
       - furniture_scale: proportional
       - lighting_consistency: matched
       - style_coherence: maintained
Technical Specifications
Photo Processing API
typescriptinterface PhotoEnhancementRequest {
  images: {
    url: string;
    room_type?: string;
    priority?: 'hero' | 'standard';
  }[];
  property_id: string;
  enhancement_options: {
    auto_enhance: boolean;
    remove_objects?: boolean;
    virtual_staging?: {
      enabled: boolean;
      style?: 'modern' | 'traditional' | 'contemporary';
      rooms?: string[];
    };
    output_formats: {
      mls?: boolean;      // 1024x768
      website?: boolean;   // 1920x1080
      social?: boolean;    // 1200x630
      print?: boolean;     // 300dpi
    };
  };
}

interface PhotoEnhancementResponse {
  processed_images: {
    original_url: string;
    enhanced_url: string;
    thumbnail_url: string;
    virtual_staged_url?: string;
    quality_score: number;
    improvements: string[];
    processing_time: number;
  }[];
  gallery: {
    hero_image: string;
    gallery_order: string[];
    total_images: number;
  };
  cdn_urls: {
    [key: string]: string;
  };
}
Optimization Algorithms
pythondef optimize_image_sequence(images):
    """Determine optimal image order for listing presentation"""
    
    scores = []
    for img in images:
        score = 0
        
        # Exterior shots first
        if img.type == 'exterior_front':
            score += 100
        elif img.type == 'exterior':
            score += 90
            
        # Key rooms next
        if img.room_type in ['living_room', 'kitchen']:
            score += 80
        elif img.room_type in ['master_bedroom', 'master_bath']:
            score += 70
            
        # Quality factors
        score += img.quality_score * 10
        score += img.lighting_score * 5
        score += img.composition_score * 5
        
        scores.append((img, score))
    
    # Sort by score descending
    sorted_images = sorted(scores, key=lambda x: x[1], reverse=True)
    
    return [img for img, score in sorted_images]
Success Criteria
Processing Quality

Enhancement Success Rate: >95% improved quality score
Processing Speed: <3 seconds per image
Batch Processing: 100 images in <5 minutes
Virtual Staging Quality: >85% realism score

Visual Impact

Click-Through Rate: 40% improvement with enhanced photos
Engagement Time: 60% longer viewing time
Social Shares: 2x increase with staged photos
Showing Requests: 30% increase

Technical Performance

API Response Time: <500ms for single image
CDN Delivery: <100ms global latency
Storage Optimization: 70% size reduction without quality loss
Processing Success Rate: >99.5%

Testing Requirements
Image Quality Tests
pythondef test_enhancement_quality():
    # Load test images
    test_images = load_test_dataset()
    
    for image in test_images:
        enhanced = enhance_image(image)
        
        # Technical quality
        assert enhanced.resolution >= (1024, 768)
        assert enhanced.quality_score > image.quality_score
        assert enhanced.file_size < 1024 * 1024  # 1MB
        
        # Visual quality
        assert calculate_sharpness(enhanced) > 0.7
        assert calculate_exposure(enhanced) in range(0.4, 0.6)
        assert detect_artifacts(enhanced) == False
        
        # MLS compliance
        assert has_watermark(enhanced) == False
        assert has_border(enhanced) == False
Virtual Staging Validation
javascriptconst validateVirtualStaging = (original, staged) => {
  // Realism check
  const realismScore = aiModel.evaluate_realism(staged);
  expect(realismScore).toBeGreaterThan(0.85);
  
  // Consistency check
  const lightingConsistency = compareLighting(original, staged);
  expect(lightingConsistency).toBeGreaterThan(0.9);
  
  // Scale accuracy
  const furnitureScale = checkFurnitureProportions(staged);
  expect(furnitureScale).toBe('accurate');
  
  // Style coherence
  const styleConsistency = evaluateStyleCoherence(staged);
  expect(styleConsistency).toBeGreaterThan(0.8);
};
Implementation Checklist

 Set up image processing pipeline
 Integrate computer vision models
 Build enhancement algorithms
 Implement virtual staging system
 Create quality control checks
 Set up CDN distribution
 Build batch processing queue
 Implement A/B testing
 Create performance monitoring
 Document API endpoints