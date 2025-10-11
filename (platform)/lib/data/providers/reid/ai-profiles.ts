import { prisma } from '@/lib/database/prisma';
import { setTenantContext } from '@/lib/database/prisma-middleware';

/**
 * REID AI Profiles Seed Data
 *
 * Creates 20 realistic AI profile records for REI Analytics module
 *
 * Usage:
 * ```bash
 * cd (platform)
 * npx tsx prisma/seeds/reid-ai-profiles-seed.ts
 * ```
 */

async function seedREIDAIProfiles() {
  console.log('🌱 Starting reid_ai_profiles seeding...');
  console.log('');

  // Test organization and user IDs (replace with actual IDs from your database)
  const TEST_ORG_ID = 'system-default'; // From existing seed.ts
  const TEST_USER_ID = 'test-user-id'; // Replace with actual user ID

  const profiles = [
    // Austin, TX - Tech Hub Neighborhoods
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'residential',
      address: 'Domain Area, Austin, TX 78758',
      zip_code: '78758',
      city: 'Austin',
      state: 'TX',
      county: 'Travis',
      neighborhood: 'Domain',
      latitude: 30.3966,
      longitude: -97.7219,
      summary: 'Vibrant tech-hub neighborhood with excellent walkability, premium shopping, and strong job growth. High rental demand from tech professionals.',
      detailed_analysis: 'The Domain area represents one of Austin\'s premier mixed-use developments, featuring Class A office space, luxury apartments, and high-end retail. Strong fundamentals driven by tech company expansion (Apple, Google, Oracle campuses nearby). Area shows consistent 8-12% annual appreciation with vacancy rates under 5%. Excellent demographics: median household income $95k+, young professionals (25-40 age bracket dominates). Infrastructure improvements underway with new transit connections planned for 2025-2026.',
      strengths: [
        'Top-tier employers within 3-mile radius',
        'Premium retail and dining options',
        'New construction maintaining high standards',
        'Excellent transit connectivity (Q2 Station)',
        'Low crime rates (30% below city average)'
      ],
      weaknesses: [
        'High property prices ($450k+ median)',
        'Limited parking in core area',
        'Traffic congestion during peak hours',
        'Property taxes above city average'
      ],
      opportunities: [
        'New light rail extension (2025)',
        'Major mixed-use development projects announced',
        'Tech company expansion continuing',
        'Co-working spaces attracting remote workers'
      ],
      overall_score: 87.5,
      investment_score: 82.0,
      lifestyle_score: 91.0,
      growth_potential: 8.5,
      risk_score: 3.2,
      metrics: {
        median_price: 475000,
        price_per_sqft: 285,
        rent_yield: 4.2,
        vacancy_rate: 4.8,
        days_on_market: 28,
        price_growth_1yr: 9.2,
        price_growth_3yr: 28.5,
        rental_growth_1yr: 6.8,
        walk_score: 88,
        transit_score: 72,
        bike_score: 75,
        school_rating: 8.5,
        crime_index: 'Low'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Strong buy for long-term appreciation. Target 2-3 bedroom units near Q2 Station for maximum rental demand.'
        },
        {
          type: 'strategy',
          priority: 'medium',
          text: 'Consider new construction over older units - premium amenities justify higher price point.'
        },
        {
          type: 'timing',
          priority: 'high',
          text: 'Act before Q2 rail extension completion drives prices up 10-15%.'
        }
      ],
      data_sources: ['Zillow', 'Census Bureau', 'GreatSchools', 'WalkScore', 'MLS'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.89,
      is_verified: true,
      tags: ['tech-hub', 'high-growth', 'premium', 'walkable', 'transit-oriented']
    },

    // Austin, TX - East Austin
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'residential',
      address: 'East Austin, Austin, TX 78702',
      zip_code: '78702',
      city: 'Austin',
      state: 'TX',
      county: 'Travis',
      neighborhood: 'East Austin',
      latitude: 30.2640,
      longitude: -97.7167,
      summary: 'Rapidly gentrifying neighborhood with strong appreciation potential. Arts district with emerging restaurant scene and new developments.',
      detailed_analysis: 'East Austin has transformed from an overlooked area to one of the city\'s hottest markets. Historic designation protects character while allowing thoughtful development. Art galleries, craft breweries, and farm-to-table restaurants attract creative class. Recent tech worker influx drives demand. Property values up 45% over 3 years but still 30% below West Austin equivalents. Area benefits from downtown proximity (2 miles) without downtown pricing. New infrastructure investments include streetscape improvements and park developments.',
      strengths: [
        'Strong appreciation trajectory (12-15% annually)',
        'Cultural amenities and nightlife',
        'Relative affordability vs. West Austin',
        'Downtown accessibility',
        'Historic character with modern updates'
      ],
      weaknesses: [
        'Gentrification concerns affecting community',
        'Some areas lack updated infrastructure',
        'School ratings below Austin average',
        'Property condition varies widely'
      ],
      opportunities: [
        'Continued gentrification driving values',
        'New mixed-use developments planned',
        'Growing food/entertainment district',
        'Infrastructure improvement projects'
      ],
      overall_score: 78.5,
      investment_score: 84.0,
      lifestyle_score: 82.0,
      growth_potential: 9.2,
      risk_score: 4.5,
      metrics: {
        median_price: 385000,
        price_per_sqft: 245,
        rent_yield: 5.1,
        vacancy_rate: 6.2,
        days_on_market: 22,
        price_growth_1yr: 13.8,
        price_growth_3yr: 45.2,
        rental_growth_1yr: 8.5,
        walk_score: 75,
        transit_score: 58,
        bike_score: 82,
        school_rating: 6.5,
        crime_index: 'Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Target properties near new developments - significant upside potential as area continues to gentrify.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Value-add opportunities abundant. Consider fixer-uppers for renovation and flip or hold.'
        },
        {
          type: 'caution',
          priority: 'medium',
          text: 'Verify property condition and infrastructure - some areas still need significant updates.'
        }
      ],
      data_sources: ['Zillow', 'Redfin', 'Austin MLS', 'Census Bureau'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.85,
      is_verified: true,
      tags: ['gentrifying', 'high-growth', 'arts-district', 'value-add', 'appreciation']
    },

    // Denver, CO - LoDo (Lower Downtown)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'LoDo, Denver, CO 80202',
      zip_code: '80202',
      city: 'Denver',
      state: 'CO',
      county: 'Denver',
      neighborhood: 'LoDo',
      latitude: 39.7547,
      longitude: -104.9970,
      summary: 'Historic downtown district with luxury lofts, walkable urban lifestyle, and strong rental market. Sports and entertainment hub with Coors Field.',
      detailed_analysis: 'LoDo represents Denver\'s premier urban living experience. Historic warehouse conversions meet modern luxury high-rises. Area anchored by Coors Field (MLB), Union Station transit hub, and thriving restaurant/nightlife scene. Demographics skew young professional (25-35) with high incomes ($85k+ median). Rental demand exceptionally strong - vacancy consistently under 4%. While appreciation has moderated from 2015-2020 peak, area maintains stability with 5-7% annual growth. New development limited by historic preservation, supporting pricing. Light rail access to DIA airport and tech corridor major selling point.',
      strengths: [
        'Premier urban location with historic charm',
        'Excellent walkability (score 98)',
        'Transit hub connectivity (Union Station)',
        'Strong rental fundamentals',
        'Entertainment and dining density'
      ],
      weaknesses: [
        'Very high entry prices ($550k+ median)',
        'Limited inventory due to preservation rules',
        'Noise from nightlife and events',
        'Parking extremely expensive',
        'HOA fees can be substantial ($400-600/mo)'
      ],
      opportunities: [
        'New development along river waterfront',
        'Convention center expansion project',
        'Light rail extensions improving connectivity',
        'Corporate relocations continuing (tech sector)'
      ],
      overall_score: 85.0,
      investment_score: 79.5,
      lifestyle_score: 93.0,
      growth_potential: 6.8,
      risk_score: 3.8,
      metrics: {
        median_price: 565000,
        price_per_sqft: 425,
        rent_yield: 3.8,
        vacancy_rate: 3.5,
        days_on_market: 18,
        price_growth_1yr: 6.2,
        price_growth_3yr: 18.5,
        rental_growth_1yr: 5.5,
        walk_score: 98,
        transit_score: 88,
        bike_score: 85,
        school_rating: 7.0,
        crime_index: 'Low-Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium',
          text: 'Best for lifestyle buyers or corporate housing. Rental yields moderate but appreciation steady.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target 1-2 bedroom units near Union Station for short-term rental potential (Airbnb strong here).'
        },
        {
          type: 'timing',
          priority: 'low',
          text: 'Market stable - no urgency to buy but values unlikely to drop significantly.'
        }
      ],
      data_sources: ['Zillow', 'Denver MLS', 'Census Bureau', 'WalkScore'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.91,
      is_verified: true,
      tags: ['urban', 'luxury', 'walkable', 'transit-oriented', 'nightlife']
    },

    // Denver, CO - RiNo (River North)
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'RiNo Art District, Denver, CO 80216',
      zip_code: '80216',
      city: 'Denver',
      state: 'CO',
      county: 'Denver',
      neighborhood: 'RiNo',
      latitude: 39.7640,
      longitude: -104.9823,
      summary: 'Denver\'s hottest emerging neighborhood. Industrial-chic arts district with breweries, galleries, and new luxury developments. Strong appreciation potential.',
      detailed_analysis: 'RiNo has emerged as Denver\'s answer to Brooklyn\'s Williamsburg - industrial warehouses transformed into creative spaces, breweries, and luxury residential. Area experienced explosive growth 2018-2022 (30%+ appreciation) before moderating. Continues to attract young professionals and creatives. New developments bring luxury amenities while preserving artistic character. Major investment in infrastructure including street improvements and parks. Location between downtown and airport, near light rail, enhances appeal. Some concerns about overbuilding but demand remains strong. Best opportunities in emerging sub-areas before full gentrification.',
      strengths: [
        'Strong cultural identity and arts scene',
        'New luxury developments with modern amenities',
        'Brewery and restaurant density',
        'Light rail accessibility',
        'Continued gentrification driving values'
      ],
      weaknesses: [
        'Some areas industrial/underdeveloped',
        'Overbuilding concerns (2023-2024)',
        'Limited traditional retail/services',
        'School ratings below city average',
        'Some blocks have homeless issues'
      ],
      opportunities: [
        'Continued development filling gaps',
        'New parks and public spaces planned',
        'Light rail stop upgrades',
        'Corporate office relocations to area'
      ],
      overall_score: 82.0,
      investment_score: 88.0,
      lifestyle_score: 85.0,
      growth_potential: 8.8,
      risk_score: 5.2,
      metrics: {
        median_price: 425000,
        price_per_sqft: 365,
        rent_yield: 4.5,
        vacancy_rate: 5.8,
        days_on_market: 25,
        price_growth_1yr: 8.5,
        price_growth_3yr: 32.8,
        rental_growth_1yr: 7.2,
        walk_score: 82,
        transit_score: 68,
        bike_score: 88,
        school_rating: 6.0,
        crime_index: 'Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'High risk/high reward. Target properties on edges of development zone for maximum upside.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'New construction offers best amenities. Consider pre-sales for upcoming projects to lock in pricing.'
        },
        {
          type: 'caution',
          priority: 'medium',
          text: 'Monitor inventory levels - overbuilding could impact appreciation in short term.'
        }
      ],
      data_sources: ['Zillow', 'Redfin', 'Denver MLS', 'RiNo Art District'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.82,
      is_verified: false,
      tags: ['emerging', 'arts-district', 'high-growth', 'gentrifying', 'brewery-scene']
    },

    // Miami, FL - Brickell
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'condo',
      address: 'Brickell, Miami, FL 33131',
      zip_code: '33131',
      city: 'Miami',
      state: 'FL',
      county: 'Miami-Dade',
      neighborhood: 'Brickell',
      latitude: 25.7617,
      longitude: -80.1918,
      summary: 'Miami\'s financial district transformed into luxury condo hub. International buyers, waterfront living, and strong rental demand from finance professionals.',
      detailed_analysis: 'Brickell represents Miami\'s vertical downtown - dozens of luxury condo towers with world-class amenities. Area serves as financial hub (banks, hedge funds, trading firms) creating strong professional renter base. International buyers (especially Latin America) drive 40%+ of sales. Post-COVID remote work boom brought tech workers. New developments continue but at selective pace. Waterfront units command premium (30-50% above inland). Area benefits from walkability rare in Miami, with Brickell City Centre mall and restaurant row. Risks include hurricane exposure, condo association issues (Surfside effect), and inventory cycles.',
      strengths: [
        'Luxury high-rise living with world-class amenities',
        'International appeal and buyer diversity',
        'Strong professional renter base',
        'Walkable urban environment (Miami rarity)',
        'Waterfront access and bay views'
      ],
      weaknesses: [
        'Very high HOA fees ($800-1500/mo common)',
        'Hurricane exposure and insurance costs',
        'Condo association quality varies',
        'Oversupply concerns in certain years',
        'Traffic congestion on limited bridges'
      ],
      opportunities: [
        'Continued Latin American investment',
        'Remote work attracting new residents',
        'Major infrastructure projects (Brightline rail)',
        'New corporate relocations (finance/tech)'
      ],
      overall_score: 83.5,
      investment_score: 81.0,
      lifestyle_score: 89.0,
      growth_potential: 7.5,
      risk_score: 4.8,
      metrics: {
        median_price: 525000,
        price_per_sqft: 485,
        rent_yield: 4.0,
        vacancy_rate: 7.2,
        days_on_market: 45,
        price_growth_1yr: 7.8,
        price_growth_3yr: 22.5,
        rental_growth_1yr: 6.2,
        walk_score: 91,
        transit_score: 75,
        bike_score: 70,
        school_rating: 7.5,
        crime_index: 'Low-Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium',
          text: 'Best for international diversification or lifestyle purchase. Rental yields moderate, appreciation cyclical.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target buildings completed 2015+ for modern amenities and lower special assessment risk.'
        },
        {
          type: 'caution',
          priority: 'high',
          text: 'Carefully review condo association finances and reserve funds before purchase.'
        }
      ],
      data_sources: ['Zillow', 'Miami MLS', 'CondoBlackBook', 'Census Bureau'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.87,
      is_verified: true,
      tags: ['luxury', 'high-rise', 'waterfront', 'international', 'urban']
    },

    // Portland, OR - Pearl District
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'Pearl District, Portland, OR 97209',
      zip_code: '97209',
      city: 'Portland',
      state: 'OR',
      county: 'Multnomah',
      neighborhood: 'Pearl District',
      latitude: 45.5267,
      longitude: -122.6828,
      summary: 'Portland\'s premier urban neighborhood with converted warehouses, art galleries, and sustainable living focus. Strong walkability and eco-conscious amenities.',
      detailed_analysis: 'The Pearl District exemplifies Portland\'s urban renewal success - former industrial area transformed into mixed-use neighborhood with emphasis on sustainability and walkability. LEED-certified buildings common, with bike infrastructure and transit access prioritized. Demographics lean educated professionals (65% college degrees) drawn to environmental focus and cultural amenities. Portland Art Museum, Powell\'s City of Books nearby. Market cooled 2020-2022 due to local politics and economic factors but stabilizing. Strong rental market from young professionals. New development limited by existing density, supporting values.',
      strengths: [
        'Sustainable/green building emphasis',
        'Excellent walkability and bike infrastructure',
        'Cultural amenities (galleries, museums)',
        'Strong transit connectivity (MAX light rail)',
        'Educated, environmentally-conscious community'
      ],
      weaknesses: [
        'Portland economic/political challenges',
        'Limited appreciation 2020-2022',
        'Homeless issues in some areas',
        'High state income tax',
        'Weather (rain) affects lifestyle appeal'
      ],
      opportunities: [
        'Market stabilization after correction',
        'New developments focused on affordability',
        'Tech sector growth continuing',
        'Infrastructure improvements planned'
      ],
      overall_score: 76.5,
      investment_score: 72.0,
      lifestyle_score: 86.0,
      growth_potential: 5.8,
      risk_score: 5.5,
      metrics: {
        median_price: 445000,
        price_per_sqft: 395,
        rent_yield: 3.9,
        vacancy_rate: 6.5,
        days_on_market: 38,
        price_growth_1yr: 3.2,
        price_growth_3yr: 8.5,
        rental_growth_1yr: 4.5,
        walk_score: 95,
        transit_score: 82,
        bike_score: 92,
        school_rating: 7.0,
        crime_index: 'Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'low-medium',
          text: 'Buy for lifestyle/long-term hold. Short-term appreciation limited but area fundamentals solid.'
        },
        {
          type: 'strategy',
          priority: 'medium',
          text: 'Target LEED-certified buildings - eco-conscious buyers willing to pay premium.'
        },
        {
          type: 'timing',
          priority: 'medium',
          text: 'Market at inflection point - opportunities for patient buyers as area stabilizes.'
        }
      ],
      data_sources: ['Zillow', 'Portland MLS', 'Census Bureau', 'WalkScore'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.78,
      is_verified: false,
      tags: ['sustainable', 'walkable', 'eco-conscious', 'arts-district', 'urban']
    },

    // Phoenix, AZ - Arcadia
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'residential',
      address: 'Arcadia, Phoenix, AZ 85018',
      zip_code: '85018',
      city: 'Phoenix',
      state: 'AZ',
      county: 'Maricopa',
      neighborhood: 'Arcadia',
      latitude: 33.5026,
      longitude: -111.9879,
      summary: 'Phoenix\'s most desirable neighborhood with mid-century modern homes, Camelback Mountain views, and strong appreciation. Affluent family-oriented community.',
      detailed_analysis: 'Arcadia represents Phoenix luxury living - ranch-style homes on larger lots (8000+ sq ft common) with mountain views and mature landscaping. Area appeals to affluent families seeking proximity to top schools and urban amenities. Median household income $120k+. Significant teardown/rebuild activity as older homes replaced with modern luxury (often 3000+ sq ft). Strong appreciation driven by limited land, school quality, and location (15 min to downtown/Scottsdale). Arcadia Lite areas offer entry point at lower prices. Market benefited enormously from California migration 2020-2023. Some concern about water issues long-term but near-term fundamentals excellent.',
      strengths: [
        'Top-rated schools (Madison School District)',
        'Large lots with mountain views',
        'Mature trees and established neighborhood feel',
        'Central location (Scottsdale, downtown access)',
        'Strong appreciation history (10%+ annually)'
      ],
      weaknesses: [
        'Very high prices ($800k+ median)',
        'Limited inventory (low turnover)',
        'Older infrastructure in some areas',
        'Summer heat intensity',
        'Long-term water concerns'
      ],
      opportunities: [
        'Teardown/rebuild opportunities for contractors',
        'Continued California migration',
        'Limited supply supporting pricing',
        'New luxury developments on periphery'
      ],
      overall_score: 88.0,
      investment_score: 85.5,
      lifestyle_score: 92.0,
      growth_potential: 7.8,
      risk_score: 3.5,
      metrics: {
        median_price: 825000,
        price_per_sqft: 325,
        rent_yield: 3.2,
        vacancy_rate: 3.8,
        days_on_market: 22,
        price_growth_1yr: 9.5,
        price_growth_3yr: 35.2,
        rental_growth_1yr: 8.8,
        walk_score: 58,
        transit_score: 42,
        bike_score: 65,
        school_rating: 9.5,
        crime_index: 'Very Low'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Premier Phoenix location - strong buy for appreciation. Best family-oriented investment in metro.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target original mid-century homes for renovation/teardown. New builds selling at 30-40% premium.'
        },
        {
          type: 'timing',
          priority: 'medium',
          text: 'Inventory extremely tight - act quickly when good listings appear.'
        }
      ],
      data_sources: ['Zillow', 'Phoenix MLS', 'GreatSchools', 'Census Bureau'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.92,
      is_verified: true,
      tags: ['luxury', 'family-friendly', 'schools', 'appreciation', 'mid-century']
    },

    // Phoenix, AZ - Downtown Phoenix
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'Downtown Phoenix, Phoenix, AZ 85004',
      zip_code: '85004',
      city: 'Phoenix',
      state: 'AZ',
      county: 'Maricopa',
      neighborhood: 'Downtown Phoenix',
      latitude: 33.4484,
      longitude: -112.0740,
      summary: 'Rapidly developing urban core with new construction, sports venues, and ASU campus. Strong rental demand from students and young professionals.',
      detailed_analysis: 'Downtown Phoenix undergoing dramatic transformation from neglected urban core to vibrant city center. ASU Downtown Campus (12k students) provides rental base. Sports/entertainment venues (Footprint Center, Chase Field) drive activity. Light rail connectivity to Tempe, Mesa. New luxury apartments and condos proliferating - over 5,000 units added 2020-2023. Area appeals to young professionals tired of suburban sprawl. Significant investment in public spaces, restaurants, arts scene. Challenges include summer heat limiting outdoor activity and remaining gaps in urban fabric. Best opportunities in emerging sub-districts before full development.',
      strengths: [
        'Major urban transformation underway',
        'ASU campus providing rental demand',
        'Sports/entertainment venues',
        'Light rail connectivity',
        'Relative affordability vs. other metros'
      ],
      weaknesses: [
        'Still developing - some dead zones remain',
        'Summer heat limits outdoor appeal',
        'Homeless population in some areas',
        'Limited traditional urban amenities',
        'Overbuilding risk with apartment surge'
      ],
      opportunities: [
        'Continued development filling gaps',
        'ASU expansion plans',
        'Corporate relocations (State Farm, etc.)',
        'Light rail extensions planned',
        'Arts district emerging'
      ],
      overall_score: 74.0,
      investment_score: 78.5,
      lifestyle_score: 72.0,
      growth_potential: 8.2,
      risk_score: 6.0,
      metrics: {
        median_price: 315000,
        price_per_sqft: 285,
        rent_yield: 5.2,
        vacancy_rate: 8.5,
        days_on_market: 32,
        price_growth_1yr: 10.5,
        price_growth_3yr: 28.8,
        rental_growth_1yr: 9.2,
        walk_score: 78,
        transit_score: 65,
        bike_score: 68,
        school_rating: 5.5,
        crime_index: 'Medium-High'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium-high',
          text: 'High growth potential but higher risk. Best for investors comfortable with emerging markets.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target properties near ASU campus for student/young professional rentals. Strong cash flow.'
        },
        {
          type: 'caution',
          priority: 'high',
          text: 'Monitor apartment inventory levels - overbuilding could pressure rents in short term.'
        }
      ],
      data_sources: ['Zillow', 'Phoenix MLS', 'ASU', 'Census Bureau'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.75,
      is_verified: false,
      tags: ['emerging', 'urban', 'student-housing', 'high-growth', 'development']
    },

    // Nashville, TN - The Gulch
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'The Gulch, Nashville, TN 37203',
      zip_code: '37203',
      city: 'Nashville',
      state: 'TN',
      county: 'Davidson',
      neighborhood: 'The Gulch',
      latitude: 36.1549,
      longitude: -86.7803,
      summary: 'Nashville\'s premier urban district with luxury condos, acclaimed restaurants, and walkable lifestyle. Strong music industry and healthcare sector employment.',
      detailed_analysis: 'The Gulch transformed from rail yards to Nashville\'s most exclusive address over past 15 years. Mixed-use development with luxury condos, Class A office, upscale retail/dining. Area benefits from Nashville\'s explosive growth - population up 30%+ since 2010. Strong job market (healthcare, music industry, tech) supports demand. No state income tax attractive to high earners. Market saw dramatic appreciation 2015-2022 (40%+) before moderating. Current development at near-saturation but existing inventory maintaining value. Walkability exceptional for Nashville. Risks include overbuilding concerns and tourism impacts on livability.',
      strengths: [
        'Premier Nashville location',
        'Exceptional dining and nightlife',
        'Walkability (rare for Nashville)',
        'No state income tax',
        'Strong job market (healthcare, music, tech)'
      ],
      weaknesses: [
        'Very high prices ($600k+ median)',
        'Tourism crowds/noise',
        'Limited inventory availability',
        'High HOA fees ($500-800/mo)',
        'Appreciation moderating from peak'
      ],
      opportunities: [
        'Nashville growth continuing',
        'Corporate relocations ongoing',
        'Major convention center nearby',
        'Music industry expansion'
      ],
      overall_score: 84.5,
      investment_score: 80.0,
      lifestyle_score: 90.0,
      growth_potential: 6.5,
      risk_score: 4.2,
      metrics: {
        median_price: 625000,
        price_per_sqft: 465,
        rent_yield: 3.7,
        vacancy_rate: 4.2,
        days_on_market: 28,
        price_growth_1yr: 5.8,
        price_growth_3yr: 18.5,
        rental_growth_1yr: 6.5,
        walk_score: 93,
        transit_score: 48,
        bike_score: 72,
        school_rating: 7.5,
        crime_index: 'Low-Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium',
          text: 'Strong lifestyle buy. Investment returns moderate but stable - best for owner-occupants.'
        },
        {
          type: 'strategy',
          priority: 'medium',
          text: 'Consider short-term rental (Airbnb) given tourism demand - can boost yields 2-3%.'
        },
        {
          type: 'timing',
          priority: 'low',
          text: 'Market fairly valued - no urgency but solid long-term hold.'
        }
      ],
      data_sources: ['Zillow', 'Nashville MLS', 'Census Bureau', 'WalkScore'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.88,
      is_verified: true,
      tags: ['luxury', 'urban', 'walkable', 'music-city', 'dining']
    },

    // Charlotte, NC - South End
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'South End, Charlotte, NC 28203',
      zip_code: '28203',
      city: 'Charlotte',
      state: 'NC',
      county: 'Mecklenburg',
      neighborhood: 'South End',
      latitude: 35.2089,
      longitude: -80.8565,
      summary: 'Charlotte\'s hottest neighborhood with new luxury apartments, light rail access, and strong job growth from banking sector. Millennial-focused urban living.',
      detailed_analysis: 'South End epitomizes Charlotte\'s new urban development - former industrial area transformed into mixed-use neighborhood. Light rail (LYNX Blue Line) backbone of development, enabling car-free living rare in Charlotte. Area exploded 2010-2020 with 100+ new apartment buildings. Strong rental demand from Bank of America, Wells Fargo employees (Uptown within light rail distance). Brewery scene, restaurants, retail all pedestrian-oriented. Challenges include saturation concerns after building boom and lack of homeownership options (primarily rental apartments). Best opportunities now in adjacent areas before light rail extensions complete.',
      strengths: [
        'Light rail connectivity to Uptown',
        'Walkable, millennial-focused design',
        'Strong employment (banking sector)',
        'Brewery and restaurant scene',
        'Continued development interest'
      ],
      weaknesses: [
        'Primarily rental market (few condos)',
        'Overbuilding concerns 2022-2023',
        'Limited school options for families',
        'Noise from light rail and nightlife',
        'Parking can be expensive/limited'
      ],
      opportunities: [
        'Light rail extensions expanding market',
        'Adjacent neighborhoods gentrifying',
        'Financial sector growth continuing',
        'New mixed-use developments planned'
      ],
      overall_score: 79.5,
      investment_score: 82.0,
      lifestyle_score: 83.0,
      growth_potential: 7.2,
      risk_score: 5.0,
      metrics: {
        median_price: 365000,
        price_per_sqft: 295,
        rent_yield: 4.8,
        vacancy_rate: 7.8,
        days_on_market: 35,
        price_growth_1yr: 7.5,
        price_growth_3yr: 22.5,
        rental_growth_1yr: 6.8,
        walk_score: 85,
        transit_score: 72,
        bike_score: 78,
        school_rating: 6.5,
        crime_index: 'Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium-high',
          text: 'Strong rental market fundamentals but monitor inventory levels. Best for buy-and-hold investors.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target adjacent neighborhoods before light rail expansion drives prices up.'
        },
        {
          type: 'caution',
          priority: 'medium',
          text: 'Verify building quality - rapid construction led to some quality issues in older buildings.'
        }
      ],
      data_sources: ['Zillow', 'Charlotte MLS', 'Census Bureau', 'CATS'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.83,
      is_verified: true,
      tags: ['urban', 'transit-oriented', 'millennial', 'rental-market', 'banking']
    },

    // Seattle, WA - Capitol Hill
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'Capitol Hill, Seattle, WA 98102',
      zip_code: '98102',
      city: 'Seattle',
      state: 'WA',
      county: 'King',
      neighborhood: 'Capitol Hill',
      latitude: 47.6260,
      longitude: -122.3208,
      summary: 'Seattle\'s vibrant cultural hub with diverse community, light rail access, and strong tech sector demand. LGBTQ+ friendly with excellent nightlife.',
      detailed_analysis: 'Capitol Hill represents Seattle\'s cultural heart - diverse, progressive neighborhood with strong sense of community. Light rail stop (2016) transformed accessibility and drove development boom. Area maintains character despite gentrification through historic preservation and community advocacy. Strong rental market from Amazon, Microsoft employees seeking urban alternative to suburbs. Excellent restaurants, bars, independent shops. Challenges include Seattle\'s housing affordability crisis driving prices and homeless population impacts. Market cooled 2022-2023 after tech layoffs but fundamentals remain strong long-term.',
      strengths: [
        'Strong cultural identity and community',
        'Light rail to downtown and UW',
        'Tech sector employment nearby',
        'Excellent walkability and transit',
        'Diverse, progressive atmosphere'
      ],
      weaknesses: [
        'Very high prices ($700k+ median)',
        'Homeless and drug issues in some areas',
        'Tech layoffs impacting demand 2022-2023',
        'Weather (rain) affects appeal',
        'Limited parking, high costs'
      ],
      opportunities: [
        'Market correction creating opportunities',
        'Light rail expansion improving connectivity',
        'Tech sector stabilizing after layoffs',
        'New development more selective/quality'
      ],
      overall_score: 81.0,
      investment_score: 76.5,
      lifestyle_score: 88.0,
      growth_potential: 6.2,
      risk_score: 5.8,
      metrics: {
        median_price: 725000,
        price_per_sqft: 525,
        rent_yield: 3.5,
        vacancy_rate: 5.8,
        days_on_market: 42,
        price_growth_1yr: 2.5,
        price_growth_3yr: 12.8,
        rental_growth_1yr: 3.8,
        walk_score: 96,
        transit_score: 88,
        bike_score: 85,
        school_rating: 7.0,
        crime_index: 'Medium'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'low-medium',
          text: 'Market at inflection point - best for patient buyers seeking lifestyle purchase.'
        },
        {
          type: 'strategy',
          priority: 'medium',
          text: 'Target buildings near light rail station for maximum rental appeal.'
        },
        {
          type: 'timing',
          priority: 'medium',
          text: 'Market correction may offer opportunities - monitor tech sector employment trends.'
        }
      ],
      data_sources: ['Zillow', 'Seattle MLS', 'King County', 'Sound Transit'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.80,
      is_verified: false,
      tags: ['urban', 'diverse', 'transit-oriented', 'tech', 'cultural']
    },

    // Raleigh, NC - North Hills
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'mixed-use',
      address: 'North Hills, Raleigh, NC 27609',
      zip_code: '27609',
      city: 'Raleigh',
      state: 'NC',
      county: 'Wake',
      neighborhood: 'North Hills',
      latitude: 35.8382,
      longitude: -78.6423,
      summary: 'Upscale mixed-use development with luxury apartments, shopping, and dining. Strong Research Triangle job market and excellent schools drive demand.',
      detailed_analysis: 'North Hills exemplifies successful mixed-use redevelopment - former shopping mall transformed into vibrant urban neighborhood. High-end retail, restaurants, and Class A office mixed with luxury apartments and condos. Area benefits from Raleigh\'s explosive growth as Research Triangle tech hub. Strong demographics: high household incomes, educated professionals, quality schools nearby. Development continues expanding with new phases adding residential and commercial. Walkable core rare for Raleigh. Challenges include premium pricing and dependency on retail anchor tenants. Overall one of Raleigh\'s best investments given continued Triangle growth.',
      strengths: [
        'Premier mixed-use development',
        'Strong Research Triangle employment',
        'Excellent schools (Wake County system)',
        'High-end retail and dining',
        'Continued development and expansion'
      ],
      weaknesses: [
        'Premium pricing ($450k+ median)',
        'Limited public transit options',
        'Reliance on retail/commercial anchors',
        'HOA fees for condos ($400-600/mo)',
        'Traffic congestion during peak hours'
      ],
      opportunities: [
        'Research Triangle continued growth',
        'New office developments attracting employers',
        'Residential expansion phases planned',
        'Limited comparable developments in market'
      ],
      overall_score: 86.0,
      investment_score: 84.5,
      lifestyle_score: 89.0,
      growth_potential: 7.8,
      risk_score: 3.8,
      metrics: {
        median_price: 475000,
        price_per_sqft: 315,
        rent_yield: 4.2,
        vacancy_rate: 4.5,
        days_on_market: 25,
        price_growth_1yr: 8.5,
        price_growth_3yr: 26.8,
        rental_growth_1yr: 7.2,
        walk_score: 72,
        transit_score: 38,
        bike_score: 58,
        school_rating: 9.0,
        crime_index: 'Low'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Strong buy for appreciation and rental income. Research Triangle growth supports long-term demand.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target 2-3 bedroom units for professionals/families - strongest demand segment.'
        },
        {
          type: 'timing',
          priority: 'medium',
          text: 'Market remains strong - buy on good listings but avoid overpaying in competitive situations.'
        }
      ],
      data_sources: ['Zillow', 'Raleigh MLS', 'Wake County', 'GreatSchools'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.90,
      is_verified: true,
      tags: ['mixed-use', 'schools', 'research-triangle', 'luxury', 'family-friendly']
    },

    // Tampa, FL - Hyde Park
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'residential',
      address: 'Hyde Park, Tampa, FL 33606',
      zip_code: '33606',
      city: 'Tampa',
      state: 'FL',
      county: 'Hillsborough',
      neighborhood: 'Hyde Park',
      latitude: 27.9378,
      longitude: -82.4787,
      summary: 'Tampa\'s most prestigious neighborhood with historic homes, walkable village, and waterfront access. Strong appreciation driven by limited inventory.',
      detailed_analysis: 'Hyde Park represents Tampa\'s old-money elegance - historic neighborhood (1886) with tree-lined streets, bungalows, and Mediterranean Revival architecture. Hyde Park Village shopping/dining district provides walkable amenities. Bayshore Boulevard waterfront trail highly desirable. Strong demographics: affluent families, professionals, retirees. Limited inventory due to historic preservation and desirable location drives consistent appreciation. Tampa\'s growth (migration from expensive markets) benefits area. Challenges include hurricane exposure, older infrastructure, and very competitive market with limited turnover. Best opportunities in updating older homes before full renovation.',
      strengths: [
        'Historic character and architectural charm',
        'Walkable village with upscale retail/dining',
        'Bayshore Boulevard waterfront access',
        'Top-rated schools (Gorrie Elementary)',
        'Limited inventory supporting values'
      ],
      weaknesses: [
        'Very high prices ($850k+ median)',
        'Hurricane exposure and insurance costs',
        'Older infrastructure and homes',
        'Extremely limited inventory',
        'Property taxes rising with values'
      ],
      opportunities: [
        'Continued migration to Tampa from expensive markets',
        'Renovation opportunities in older homes',
        'New luxury developments on periphery',
        'Bayshore Boulevard improvements planned'
      ],
      overall_score: 89.0,
      investment_score: 86.0,
      lifestyle_score: 93.0,
      growth_potential: 7.5,
      risk_score: 3.2,
      metrics: {
        median_price: 875000,
        price_per_sqft: 385,
        rent_yield: 3.2,
        vacancy_rate: 3.2,
        days_on_market: 18,
        price_growth_1yr: 9.8,
        price_growth_3yr: 32.5,
        rental_growth_1yr: 8.5,
        walk_score: 82,
        transit_score: 52,
        bike_score: 75,
        school_rating: 9.0,
        crime_index: 'Very Low'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Premier Tampa location - strong buy for appreciation. Limited inventory will continue supporting pricing.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target unrenovated homes for value-add potential. Fully updated homes command significant premium.'
        },
        {
          type: 'caution',
          priority: 'medium',
          text: 'Verify hurricane insurance costs and home condition given age of housing stock.'
        }
      ],
      data_sources: ['Zillow', 'Tampa MLS', 'GreatSchools', 'Hillsborough County'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.91,
      is_verified: true,
      tags: ['historic', 'luxury', 'walkable', 'waterfront', 'prestigious']
    },

    // Property-specific profile: Austin luxury condo
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'property',
      target_type: 'condo',
      address: '360 Nueces St Unit 3102, Austin, TX 78701',
      zip_code: '78701',
      city: 'Austin',
      state: 'TX',
      county: 'Travis',
      neighborhood: 'Downtown',
      latitude: 30.2675,
      longitude: -97.7466,
      summary: 'Luxury high-rise condo with panoramic city/lake views. 2BR/2BA, 1,450 sqft, premium finishes. Strong short-term rental potential in downtown core.',
      detailed_analysis: 'The Independent tower represents Austin\'s luxury condo market peak - 58-story mixed-use with 5-star hotel, Michelin-starred restaurant (Anthem), and exclusive residences. Unit 3102 offers prime southeast exposure with unobstructed views of Town Lake and hill country. Building amenities exceptional: rooftop pool, concierge, valet, fitness center with spa. Location enables walkability to entertainment district, convention center, and tech offices. Strong STR (short-term rental) potential given hotel component and events. Market saw correction 2022-2023 (-8%) creating opportunity. Current pricing $750/sqft below 2021 peak.',
      strengths: [
        '5-star hotel amenities and services',
        'Unobstructed views of lake and city',
        'Prime downtown location',
        'STR-friendly building with hotel license',
        'Premium finishes and design (Bjarke Ingels)'
      ],
      weaknesses: [
        'Very high HOA ($1,250/mo includes utilities)',
        'High property taxes ($15k/year)',
        'Limited parking (1 space included)',
        'Market correction ongoing',
        'Competition from new luxury inventory'
      ],
      opportunities: [
        'STR income potential ($6-8k/month)',
        'Market correction creating entry point',
        'Formula 1 and major events drive demand',
        'Limited comparable luxury product downtown'
      ],
      overall_score: 82.5,
      investment_score: 79.0,
      lifestyle_score: 92.0,
      growth_potential: 6.5,
      risk_score: 5.2,
      metrics: {
        list_price: 1095000,
        price_per_sqft: 755,
        estimated_rent: 4800,
        rent_yield: 5.3,
        hoa_fees: 1250,
        property_tax: 15000,
        days_on_market: 62,
        price_change: -8.5,
        comparable_sales_avg: 785,
        replacement_cost: 950
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'medium-high',
          text: 'Strong STR opportunity if allowed. Long-term rental yields moderate but appreciation potential solid post-correction.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Negotiate aggressively - market correction and days-on-market favor buyers. Target 5-8% below ask.'
        },
        {
          type: 'caution',
          priority: 'high',
          text: 'Verify STR regulations and HOA rules before purchase if planning short-term rental strategy.'
        }
      ],
      data_sources: ['MLS Listing', 'Zillow', 'AirDNA', 'Travis County'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.86,
      is_verified: true,
      tags: ['luxury', 'high-rise', 'str-potential', 'downtown', 'views']
    },

    // Market analysis: Austin overall
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'market',
      target_type: 'metro',
      city: 'Austin',
      state: 'TX',
      county: 'Travis',
      summary: 'Austin metro market analysis: Strong long-term fundamentals with short-term correction. Tech sector stabilizing, population growth moderating from peak.',
      detailed_analysis: 'Austin MSA represents one of America\'s most dynamic markets - population grew 30%+ 2010-2020, driven by tech sector expansion and quality of life. Market peaked 2021-2022 before correcting 8-12% in 2023 as rates rose and tech layoffs hit. Current environment shows stabilization with select neighborhoods performing strongly. Fundamentals remain solid: diverse economy (tech, government, education, healthcare), no state income tax, major employers committed (Tesla, Oracle, Apple). Challenges include affordability crisis, infrastructure strain, and competition from cheaper Texas metros. Best opportunities in neighborhoods ahead of infrastructure improvements or established areas with correction-driven pricing.',
      strengths: [
        'Diverse, growing economy (tech, government, healthcare)',
        'No state income tax',
        'Strong quality of life and cultural amenities',
        'Major corporate commitments (Tesla, Oracle, Apple)',
        'Top-tier university (UT Austin) talent pipeline'
      ],
      weaknesses: [
        'Affordability crisis vs. local wages',
        'Infrastructure lagging population growth',
        'Property taxes high (offset by no income tax)',
        'Competition from San Antonio, Dallas',
        'Traffic congestion worsening'
      ],
      opportunities: [
        'Market correction creating entry points',
        'Continued corporate relocations',
        'Major infrastructure projects (Project Connect)',
        'Affordable housing initiatives',
        'Adjacent markets (San Marcos, Georgetown) offering value'
      ],
      overall_score: 84.0,
      investment_score: 81.5,
      lifestyle_score: 88.0,
      growth_potential: 7.8,
      risk_score: 4.5,
      metrics: {
        metro_population: 2350000,
        population_growth_1yr: 2.8,
        population_growth_5yr: 18.5,
        median_income: 78000,
        unemployment_rate: 3.2,
        job_growth_1yr: 4.5,
        median_home_price: 465000,
        price_growth_1yr: -5.2,
        price_growth_3yr: 22.8,
        months_of_inventory: 3.8,
        absorption_rate: 68,
        new_construction_permits: 42000
      },
      recommendations: [
        {
          type: 'market-timing',
          priority: 'high',
          text: 'Market at inflection point - correction creating opportunities for patient buyers with long-term horizon.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Focus on established neighborhoods with transit access. Avoid overbuilt submarkets (downtown luxury).'
        },
        {
          type: 'diversification',
          priority: 'medium',
          text: 'Consider adjacent markets (Round Rock, Cedar Park) offering better value and strong growth.'
        }
      ],
      data_sources: ['Austin Board of Realtors', 'Census Bureau', 'BLS', 'CoStar'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.88,
      is_verified: true,
      tags: ['metro-analysis', 'tech-hub', 'correction', 'long-term-growth', 'quality-of-life']
    },

    // Market analysis: Denver overall
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'market',
      target_type: 'metro',
      city: 'Denver',
      state: 'CO',
      county: 'Denver',
      summary: 'Denver metro market analysis: Mature growth market with strong fundamentals. Lifestyle appeal driving continued demand despite affordability challenges.',
      detailed_analysis: 'Denver MSA exemplifies successful Western metro evolution - transformed from regional economy to national hub. Population growth steady (2-3% annually) with high-wage employment (tech, finance, energy, aerospace). Quality of life (outdoor recreation, culture, climate) commands premium. Market matured from rapid appreciation (2012-2020) to moderate growth (5-7%). Challenges include affordability vs. median income, competition from Salt Lake/Boise for similar lifestyle at lower cost, and limited buildable land constraining supply. Best opportunities in emerging suburbs ahead of light rail extensions or established neighborhoods with correction-driven opportunities.',
      strengths: [
        'Diversified economy (tech, energy, aerospace, tourism)',
        'Exceptional quality of life and outdoor recreation',
        'Extensive light rail system (RTD)',
        'Strong education and healthcare sectors',
        'Limited supply due to geography'
      ],
      weaknesses: [
        'High cost of living vs. income levels',
        'Competition from cheaper mountain metros',
        'Limited buildable land constraining growth',
        'Some oversupply in downtown apartments',
        'State politics affecting business climate'
      ],
      opportunities: [
        'Light rail extensions to Boulder, Longmont',
        'Continued remote work attracting migrants',
        'Suburban markets offering value',
        'Major airport expansion (DIA)',
        'Green building/sustainability focus'
      ],
      overall_score: 82.5,
      investment_score: 78.0,
      lifestyle_score: 90.0,
      growth_potential: 6.2,
      risk_score: 4.0,
      metrics: {
        metro_population: 2985000,
        population_growth_1yr: 2.2,
        population_growth_5yr: 12.5,
        median_income: 82000,
        unemployment_rate: 3.5,
        job_growth_1yr: 3.2,
        median_home_price: 585000,
        price_growth_1yr: 5.8,
        price_growth_3yr: 18.2,
        months_of_inventory: 2.8,
        absorption_rate: 72,
        new_construction_permits: 28000
      },
      recommendations: [
        {
          type: 'market-timing',
          priority: 'medium',
          text: 'Mature market with steady growth - best for lifestyle buyers and long-term holds.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Target suburbs near light rail extensions for best value and growth potential.'
        },
        {
          type: 'diversification',
          priority: 'medium',
          text: 'Consider northern suburbs (Thornton, Northglenn) offering affordability and growth.'
        }
      ],
      data_sources: ['Denver Metro Association of Realtors', 'Census Bureau', 'BLS', 'RTD'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.85,
      is_verified: true,
      tags: ['metro-analysis', 'lifestyle-market', 'mature-growth', 'quality-of-life', 'outdoor-recreation']
    },

    // Property-specific: Phoenix investment property
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'property',
      target_type: 'single-family',
      address: '4225 E Camelback Rd, Phoenix, AZ 85018',
      zip_code: '85018',
      city: 'Phoenix',
      state: 'AZ',
      county: 'Maricopa',
      neighborhood: 'Arcadia Lite',
      latitude: 33.5094,
      longitude: -111.9856,
      summary: 'Mid-century ranch on large lot. 3BR/2BA, 2,100 sqft, original condition. Strong teardown/rebuild or value-add renovation opportunity.',
      detailed_analysis: 'This property represents classic Arcadia opportunity - original 1962 ranch on 10,000+ sqft lot with mountain views. Home in original condition (dated kitchen, bathrooms, single-pane windows) creating value-add potential. Lot is real asset - neighbors have built 4,000+ sqft modern homes selling for $1.5M+. Two strategies: (1) Renovate existing structure for ~$150k, rent for $3,500-4,000/mo and hold for appreciation, or (2) Teardown/rebuild modern luxury home, sell for $1.3-1.5M (total cost ~$1.1M including land). Market favors new construction in Arcadia - buyers willing to pay 40%+ premium vs. renovated originals.',
      strengths: [
        'Large lot (10,000+ sqft) in premium location',
        'Unobstructed Camelback Mountain views',
        'Madison School District (top-rated)',
        'Teardown/rebuild or renovation flexibility',
        'Strong neighborhood comps supporting value'
      ],
      weaknesses: [
        'Home in original condition (dated throughout)',
        'Single-pane windows (energy inefficient)',
        'Aging HVAC, roof, plumbing systems',
        'Pool needs resurfacing',
        'Layout dated (small kitchen, separated living)'
      ],
      opportunities: [
        'Teardown/rebuild for $400k+ profit potential',
        'Value-add renovation for strong rental income',
        'Market timing favorable (off-peak listing)',
        'Seller motivated (estate sale)'
      ],
      overall_score: 80.0,
      investment_score: 86.5,
      lifestyle_score: 65.0,
      growth_potential: 9.2,
      risk_score: 4.8,
      metrics: {
        list_price: 725000,
        land_value: 650000,
        structure_value: 75000,
        renovation_cost: 150000,
        arv_renovated: 950000,
        rebuild_cost: 400000,
        arv_new_construction: 1450000,
        rental_income_current: 2800,
        rental_income_renovated: 3800,
        cap_rate_current: 3.1,
        cap_rate_renovated: 4.4
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Strong value-add opportunity. Best for experienced investors/builders comfortable with major renovation or teardown.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Teardown/rebuild offers highest return but requires 12-18 month timeline and construction expertise.'
        },
        {
          type: 'negotiation',
          priority: 'high',
          text: 'Estate sale creates opportunity - offer $675-700k based on land value and renovation needs.'
        }
      ],
      data_sources: ['MLS Listing', 'Phoenix MLS Comps', 'Construction Cost Estimator', 'Zillow'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.83,
      is_verified: false,
      tags: ['value-add', 'teardown', 'arcadia', 'investment-property', 'land-value']
    },

    // Neighborhood: Miami Beach
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'neighborhood',
      target_type: 'condo',
      address: 'South Beach, Miami Beach, FL 33139',
      zip_code: '33139',
      city: 'Miami Beach',
      state: 'FL',
      county: 'Miami-Dade',
      neighborhood: 'South Beach',
      latitude: 25.7907,
      longitude: -80.1300,
      summary: 'Iconic beach destination with Art Deco architecture. Strong international appeal but highly cyclical market. Best for lifestyle buyers or experienced investors.',
      detailed_analysis: 'South Beach represents Miami\'s most famous neighborhood - Art Deco Historic District, world-class beaches, and legendary nightlife. Market highly cyclical and international (50%+ foreign buyers). Strong luxury condo market with pre-war conversions and new construction. Tourism drives economy but creates noise/crowding issues for residents. Post-COVID saw surge from remote workers but many have left. Market challenges include hurricane exposure, sea level rise concerns, insurance costs, and traffic/parking nightmares. Best opportunities in historic buildings with character or newer construction with resort amenities. Avoid older condos with deferred maintenance (Surfside collapse hangover).',
      strengths: [
        'World-class beach and ocean access',
        'Art Deco Historic District character',
        'International brand recognition',
        'Strong luxury market',
        'Walkable with excellent dining/nightlife'
      ],
      weaknesses: [
        'Hurricane and flood exposure',
        'Extremely high insurance costs',
        'Traffic and parking nightmares',
        'Tourism crowds and noise',
        'Sea level rise concerns long-term',
        'Highly cyclical market'
      ],
      opportunities: [
        'Market correction creating opportunities',
        'Historic building conversions continuing',
        'International buyers returning post-COVID',
        'Limited new construction (land constraints)'
      ],
      overall_score: 77.0,
      investment_score: 72.5,
      lifestyle_score: 86.0,
      growth_potential: 6.8,
      risk_score: 7.2,
      metrics: {
        median_price: 685000,
        price_per_sqft: 625,
        rent_yield: 3.8,
        vacancy_rate: 12.5,
        days_on_market: 75,
        price_growth_1yr: -3.5,
        price_growth_3yr: 15.2,
        rental_growth_1yr: 2.8,
        walk_score: 94,
        transit_score: 68,
        bike_score: 88,
        school_rating: 6.0,
        crime_index: 'Medium-High'
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'low-medium',
          text: 'High-risk market - best for experienced investors or lifestyle buyers who understand cyclical nature.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'If buying, target newer buildings (2010+) or fully renovated Art Deco units. Avoid older condos with maintenance issues.'
        },
        {
          type: 'caution',
          priority: 'high',
          text: 'Thoroughly vet condo association finances, insurance costs, and flood risk before purchase.'
        }
      ],
      data_sources: ['Zillow', 'Miami MLS', 'FEMA Flood Maps', 'CondoBlackBook'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.76,
      is_verified: false,
      tags: ['beach', 'luxury', 'cyclical', 'international', 'tourism', 'high-risk']
    },

    // Property: Nashville investment condo
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'property',
      target_type: 'condo',
      address: '505 Church St Unit 1807, Nashville, TN 37219',
      zip_code: '37219',
      city: 'Nashville',
      state: 'TN',
      county: 'Davidson',
      neighborhood: 'Downtown',
      latitude: 25.5155,
      longitude: -80.1917,
      summary: 'Downtown Nashville condo with strong Airbnb potential. 1BR/1BA, 750 sqft, floor-to-ceiling windows. Music City location drives tourism demand.',
      detailed_analysis: 'Fifth + Broadway development represents Nashville\'s urban transformation - mixed-use project with condos, offices, retail, and National Museum of African American Music. Unit 1807 offers efficient 1-bedroom layout with premium finishes and amenities (rooftop pool, concierge, gym). Location is key - within walking distance to Broadway honky-tonks, convention center, Nissan Stadium, and Bridgestone Arena. Strong Airbnb potential given tourism (14M+ visitors annually) and event schedule (CMA Awards, NFL Draft, etc.). Building allows STRs with restrictions. Current market shows 65-75% occupancy rates, $150-200/night pricing, generating $3,500-4,500/month gross.',
      strengths: [
        'Prime downtown location (walking to everything)',
        'STR-friendly building with concierge',
        'Strong Nashville tourism fundamentals',
        'Premium finishes and amenities',
        'New construction (2021) - no deferred maintenance'
      ],
      weaknesses: [
        'HOA fees high ($550/mo)',
        'STR regulations could change',
        'Small unit size (750 sqft) limits long-term rental appeal',
        'Competition from hotel inventory',
        'Property taxes increasing (reassessment cycle)'
      ],
      opportunities: [
        'Nashville tourism continuing growth',
        'Major events driving premium pricing',
        'Limited new condo inventory downtown',
        'Long-term appreciation strong (Music City growth)'
      ],
      overall_score: 81.5,
      investment_score: 84.0,
      lifestyle_score: 75.0,
      growth_potential: 7.2,
      risk_score: 5.0,
      metrics: {
        list_price: 385000,
        price_per_sqft: 513,
        str_revenue_monthly: 4200,
        str_occupancy_rate: 70,
        operating_expenses_monthly: 1450,
        noi_monthly: 2750,
        cash_on_cash_return: 8.5,
        cap_rate: 8.6,
        long_term_rent: 2200,
        days_on_market: 52
      },
      recommendations: [
        {
          type: 'investment',
          priority: 'high',
          text: 'Strong cash-flowing STR opportunity if regulations remain favorable. Monitor local ordinance changes.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Negotiate below ask given days on market - target $365-375k with professional property management.'
        },
        {
          type: 'management',
          priority: 'high',
          text: 'Budget 20-25% of revenue for professional STR management - essential for maximizing occupancy and reviews.'
        }
      ],
      data_sources: ['MLS Listing', 'AirDNA', 'Nashville STR Regulations', 'Zillow'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.85,
      is_verified: true,
      tags: ['airbnb', 'str', 'cash-flow', 'tourism', 'downtown', 'investment']
    },

    // Market: Phoenix overall
    {
      organization_id: TEST_ORG_ID,
      user_id: TEST_USER_ID,
      profile_type: 'market',
      target_type: 'metro',
      city: 'Phoenix',
      state: 'AZ',
      county: 'Maricopa',
      summary: 'Phoenix metro: Explosive growth market with affordability advantage. Strong migration from California driving demand. Long-term water concerns.',
      detailed_analysis: 'Phoenix MSA represents America\'s fastest-growing large metro - population up 25%+ since 2010, driven by affordability vs. coastal markets and business-friendly climate. California exodus accelerated post-COVID with remote work enabling relocations. Diverse economy (healthcare, tech, manufacturing, tourism) supports growth. Major corporate expansions (TSMC, Intel) adding high-wage jobs. Housing market saw 40%+ appreciation 2020-2022 before moderating in 2023. Inventory increasing from unsustainable lows but still favors sellers. Challenges include summer heat, infrastructure strain, school quality concerns, and long-term water availability questions. Best opportunities in emerging submarkets ahead of infrastructure and in value-add single-family homes.',
      strengths: [
        'Strong population and job growth',
        'Affordability advantage vs. coastal markets',
        'Business-friendly climate (low taxes, regulations)',
        'Major corporate commitments (TSMC $40B+)',
        'Diverse, growing economy'
      ],
      weaknesses: [
        'Water availability long-term concerns',
        'School quality below national average',
        'Infrastructure lagging growth',
        'Summer heat intensity (115°F+ common)',
        'Sprawling development patterns'
      ],
      opportunities: [
        'Continued California migration',
        'Major infrastructure projects (freeways, light rail)',
        'Corporate relocations continuing',
        'Emerging submarkets (Surprise, Queen Creek, Casa Grande)',
        'Value-add single-family opportunities'
      ],
      overall_score: 82.0,
      investment_score: 85.5,
      lifestyle_score: 76.0,
      growth_potential: 8.5,
      risk_score: 4.2,
      metrics: {
        metro_population: 4950000,
        population_growth_1yr: 3.2,
        population_growth_5yr: 16.8,
        median_income: 68000,
        unemployment_rate: 3.8,
        job_growth_1yr: 4.8,
        median_home_price: 425000,
        price_growth_1yr: 4.5,
        price_growth_3yr: 38.5,
        months_of_inventory: 3.2,
        absorption_rate: 75,
        new_construction_permits: 58000
      },
      recommendations: [
        {
          type: 'market-timing',
          priority: 'high',
          text: 'Market stabilizing after rapid appreciation - good entry point for long-term growth investors.'
        },
        {
          type: 'strategy',
          priority: 'high',
          text: 'Focus on emerging submarkets (West Valley, Southeast Valley) for best value and growth potential.'
        },
        {
          type: 'caution',
          priority: 'medium',
          text: 'Monitor water policy developments - long-term supply concerns could impact certain submarkets.'
        }
      ],
      data_sources: ['Arizona Regional MLS', 'Census Bureau', 'BLS', 'Greater Phoenix Economic Council'],
      ai_model: 'KIMIK2',
      model_version: '2.1',
      confidence_score: 0.89,
      is_verified: true,
      tags: ['metro-analysis', 'high-growth', 'migration', 'affordability', 'sunbelt']
    }
  ];

  // Create all profiles
  let successCount = 0;
  let errorCount = 0;

  for (const profile of profiles) {
    try {
      await prisma.reid_ai_profiles.create({
        data: {
          ...profile,
          created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date within last 6 months
        },
      });
      successCount++;
      console.log(`  ✅ Created: ${profile.profile_type} - ${profile.city}, ${profile.state} ${profile.neighborhood ? `(${profile.neighborhood})` : ''}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Failed: ${profile.profile_type} - ${profile.city}, ${profile.state}`);
      console.error(`     Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('');
  console.log('✅ REID AI Profiles seeding completed!');
  console.log('');
  console.log('Summary:');
  console.log(`  • Total profiles: ${profiles.length}`);
  console.log(`  • Successfully created: ${successCount}`);
  console.log(`  • Failed: ${errorCount}`);
  console.log('');
  console.log('Profile breakdown:');
  console.log(`  • Neighborhoods: ${profiles.filter(p => p.profile_type === 'neighborhood').length}`);
  console.log(`  • Properties: ${profiles.filter(p => p.profile_type === 'property').length}`);
  console.log(`  • Market Analysis: ${profiles.filter(p => p.profile_type === 'market').length}`);
  console.log('');
  console.log('Cities covered:');
  const cities = [...new Set(profiles.map(p => p.city))];
  cities.forEach(city => {
    const count = profiles.filter(p => p.city === city).length;
    console.log(`  • ${city}: ${count} profile${count > 1 ? 's' : ''}`);
  });
  console.log('');
}

seedREIDAIProfiles()
  .catch((error) => {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
