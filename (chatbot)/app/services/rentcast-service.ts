// app/services/rentcast-service.ts
import 'server-only';

import { CacheService } from './cache-service';

// Environment variable for RentCast API key
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const RENTCAST_BASE_URL = 'https://api.rentcast.io/v1';

export interface PropertySearchParams {
  location: string; // "Nashville, TN" or "37209"
  maxPrice: number;
  minBedrooms: number;
  minBathrooms?: number;
  mustHaveFeatures: string[];
  niceToHaveFeatures?: string[];
  propertyType?: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  radius?: number; // miles from location
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  propertyType: string;
  yearBuilt?: number;
  features: string[];
  images: string[];
  daysOnMarket: number;
  listingDate: string;
  description?: string;
  schoolRatings?: {
    elementary?: number;
    middle?: number;
    high?: number;
  };
  mlsId?: string;
  agentInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface PropertyMatch {
  property: Property;
  matchScore: number;
  matchReasons: string[];
  missingFeatures: string[];
}

export class RentCastService {
  /**
   * Search properties using RentCast API
   */
  static async searchProperties(params: PropertySearchParams): Promise<Property[]> {
    // Create cache key based on search params
    const cacheKey = CacheService.createKey(
      'rentcast',
      params.location,
      params.maxPrice.toString(),
      params.minBedrooms.toString(),
      params.propertyType || 'any'
    );

    // Check cache first (15 minute TTL for property searches)
    const cached = CacheService.get<Property[]>(cacheKey);
    if (cached) {
      console.log('✅ RentCast cache HIT');
      return cached;
    }

    console.log('🔍 RentCast cache MISS - fetching from API');
    console.log('🔑 RentCast API Key present:', !!RENTCAST_API_KEY);

    try {
      // Parse location to get city and state
      const { city, state, zipCode } = this.parseLocation(params.location);

      // 🔍 DEBUG: Log what we're sending to RentCast
      console.log('📍 Parsed location:', { city, state, zipCode });
      console.log('🔍 Search criteria:', { maxPrice: params.maxPrice, minBedrooms: params.minBedrooms });

      // Build RentCast API request
      const url = new URL(`${RENTCAST_BASE_URL}/listings/sale`);
      url.searchParams.append('city', city);
      url.searchParams.append('state', state);
      if (zipCode) url.searchParams.append('zipCode', zipCode);
      url.searchParams.append('maxPrice', params.maxPrice.toString());
      url.searchParams.append('bedrooms', params.minBedrooms.toString());
      if (params.minBathrooms) {
        url.searchParams.append('bathrooms', params.minBathrooms.toString());
      }
      if (params.propertyType) {
        url.searchParams.append('propertyType', params.propertyType);
      }
      url.searchParams.append('status', 'Active');
      url.searchParams.append('limit', '50'); // Get more than 5 for better matching

      const response = await fetch(url.toString(), {
        headers: {
          'X-Api-Key': RENTCAST_API_KEY!,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // 🔍 DEBUG: Log raw RentCast response
      console.log('🏠 RentCast API Response:', {
        totalResults: Array.isArray(data) ? data.length : 'Not an array',
        firstListing: data[0] ? {
          address: data[0].addressLine1 || data[0].address,
          price: data[0].price,
          city: data[0].city,
          mlsId: data[0].mlsId,
          hasPhotos: !!data[0].photos,
          photoCount: data[0].photos?.length || 0,
          photoStructure: data[0].photos?.[0] ? Object.keys(data[0].photos[0]) : 'No photos',
          isSynthetic: data[0].isSample || data[0].isTest || false
        } : 'No results'
      });

      // Transform RentCast response to our Property format
      const properties: Property[] = Array.isArray(data)
        ? data.map((listing: any) => this.transformListing(listing))
        : [];

      // If no results, throw helpful error
      if (properties.length === 0) {
        throw new Error(`No properties found in ${city}, ${state} matching your criteria. Try:\n• Adjusting your budget or bedrooms\n• Searching nearby cities\n• Checking the spelling of the city name`);
      }

      // Cache results for 15 minutes
      CacheService.set(cacheKey, properties, 900);

      return properties;
    } catch (error) {
      console.error('RentCast API error:', error);
      // Re-throw our custom error messages
      if (error instanceof Error && error.message.includes('No properties found')) {
        throw error;
      }
      throw new Error('Failed to fetch property listings. Please try again.');
    }
  }

  /**
   * Enhanced property matching algorithm with intelligent scoring
   */
  static matchProperties(
    properties: Property[],
    params: PropertySearchParams
  ): PropertyMatch[] {
    const matches: PropertyMatch[] = [];

    for (const property of properties) {
      let score = 0;
      const matchReasons: string[] = [];
      const missingFeatures: string[] = [];

      // ========================================
      // 1. PRICE MATCHING (Max 35 points)
      // ========================================
      if (property.price > params.maxPrice) continue; // Hard filter - over budget

      // Filter out properties that are WAY under budget (likely wrong data or missing features)
      const minPrice = params.maxPrice * 0.4; // At least 40% of budget
      if (property.price < minPrice) continue; // Too cheap - suspicious

      const priceDiff = params.maxPrice - property.price;
      const pricePercentUnderBudget = (priceDiff / params.maxPrice) * 100;

      // Sweet spot: 5-15% under budget gets maximum points
      if (pricePercentUnderBudget >= 5 && pricePercentUnderBudget <= 15) {
        score += 35; // Perfect price range
      } else if (pricePercentUnderBudget > 15 && pricePercentUnderBudget <= 40) {
        score += 25; // Good value but not suspiciously cheap
      } else if (pricePercentUnderBudget >= 0) {
        score += 20; // At or slightly under budget
      }

      // ========================================
      // 2. BEDROOM MATCHING (Max 25 points)
      // ========================================
      if (property.bedrooms < params.minBedrooms) continue; // Hard filter

      if (property.bedrooms === params.minBedrooms) {
        score += 25; // Exact match
      } else if (property.bedrooms === params.minBedrooms + 1) {
        score += 30; // One extra bedroom (bonus!)
        matchReasons.push(`Extra bedroom - perfect for office or guest room`);
      } else if (property.bedrooms > params.minBedrooms + 1) {
        score += 20; // Too many bedrooms might mean higher maintenance
        matchReasons.push(`Spacious ${property.bedrooms}-bedroom layout with room to grow`);
      }

      // ========================================
      // 3. BATHROOM MATCHING (Max 20 points)
      // ========================================
      if (params.minBathrooms) {
        if (property.bathrooms >= params.minBathrooms) {
          score += 15;
          if (property.bathrooms > params.minBathrooms) {
            score += 5;
            const bathCount = property.bathrooms % 1 === 0 ? property.bathrooms : property.bathrooms.toFixed(1);
            matchReasons.push(`${bathCount} bathrooms - no morning rush`);
          }
        }
      } else {
        // No bathroom preference - still reward more bathrooms
        if (property.bathrooms >= 2) {
          score += 10;
        }
      }

      // ========================================
      // 4. MUST-HAVE FEATURES (Max 40 points)
      // ========================================
      const mustHaveFeatures = params.mustHaveFeatures || [];
      let mustHaveMatches = 0;
      let mustHaveMisses = 0;

      for (const feature of mustHaveFeatures) {
        const hasFeature = this.propertyHasFeature(property, feature);
        if (hasFeature) {
          mustHaveMatches++;
          score += 15; // High value for must-haves
          matchReasons.push(`✓ ${this.formatFeature(feature)}`);
        } else {
          mustHaveMisses++;
          missingFeatures.push(this.formatFeature(feature));
          score -= 10; // Heavy penalty for missing must-haves
        }
      }

      // Bonus for having ALL must-haves
      if (mustHaveFeatures.length > 0 && mustHaveMisses === 0) {
        score += 10;
        matchReasons.push('Has all must-have features!');
      }

      // ========================================
      // 5. NICE-TO-HAVE FEATURES (Max 15 points)
      // ========================================
      const niceToHaves = params.niceToHaveFeatures || [];
      let niceToHaveCount = 0;

      for (const feature of niceToHaves) {
        if (this.propertyHasFeature(property, feature)) {
          niceToHaveCount++;
          score += 5; // Smaller bonus for nice-to-haves
          matchReasons.push(`+ ${this.formatFeature(feature)}`);
        }
      }

      // ========================================
      // 6. PROPERTY TYPE MATCHING (Max 15 points)
      // ========================================
      if (params.propertyType && params.propertyType !== 'any') {
        const propertyTypeNormalized = property.propertyType?.toLowerCase().replace(/[-\s]/g, '');
        const targetTypeNormalized = params.propertyType.toLowerCase().replace(/[-\s]/g, '');

        if (propertyTypeNormalized?.includes(targetTypeNormalized) ||
            targetTypeNormalized?.includes(propertyTypeNormalized || '')) {
          score += 15;
        } else {
          score -= 5; // Small penalty for wrong type
        }
      }

      // ========================================
      // 7. DAYS ON MARKET (Max 15 points)
      // ========================================
      if (property.daysOnMarket <= 3) {
        score += 15;
        matchReasons.push('Fresh on the market - be the first to see it');
      } else if (property.daysOnMarket <= 7) {
        score += 10;
        matchReasons.push('New listing - schedule a showing soon');
      } else if (property.daysOnMarket <= 30) {
        score += 5;
      } else if (property.daysOnMarket > 90) {
        score -= 5; // Been on market a while - might be overpriced
      }

      // ========================================
      // 8. PROPERTY CONDITION (Max 10 points)
      // ========================================
      if (property.yearBuilt) {
        const age = new Date().getFullYear() - property.yearBuilt;

        if (age <= 5) {
          score += 10;
          matchReasons.push('Brand new construction with modern finishes');
        } else if (age <= 15) {
          score += 7;
          matchReasons.push(`Modern ${property.yearBuilt} build - move-in ready`);
        } else if (age <= 30) {
          score += 3;
        } else if (age >= 50) {
          score -= 3; // Older homes might need work
          matchReasons.push(`Classic ${property.yearBuilt} home with character & charm`);
        }
      }

      // ========================================
      // 9. SCHOOL RATINGS (Max 15 points)
      // ========================================
      if (property.schoolRatings) {
        const avgRating = (
          (property.schoolRatings.elementary || 0) +
          (property.schoolRatings.middle || 0) +
          (property.schoolRatings.high || 0)
        ) / 3;

        if (avgRating >= 9) {
          score += 15;
          matchReasons.push(`Award-winning schools (${avgRating.toFixed(1)}/10) in district`);
        } else if (avgRating >= 8) {
          score += 12;
          matchReasons.push(`Highly-rated schools nearby (${avgRating.toFixed(1)}/10)`);
        } else if (avgRating >= 7) {
          score += 8;
          matchReasons.push(`Quality schools in the area (${avgRating.toFixed(1)}/10)`);
        } else if (avgRating >= 6) {
          score += 4;
        }
      }

      // ========================================
      // 10. PRICE PER SQFT EFFICIENCY (Max 10 points)
      // ========================================
      if (property.sqft > 0) {
        const pricePerSqft = property.price / property.sqft;

        // Market average varies by location - using $200 as baseline
        const marketAvg = 200;

        if (pricePerSqft < marketAvg * 0.75) {
          score += 10;
          matchReasons.push(`Exceptional value - ${property.sqft.toLocaleString()} sq ft of space`);
        } else if (pricePerSqft < marketAvg * 0.9) {
          score += 7;
          matchReasons.push(`Great price for ${property.sqft.toLocaleString()} sq ft`);
        } else if (pricePerSqft > marketAvg * 1.2) {
          score -= 5; // Overpriced per sqft
        }
      }

      // ========================================
      // 11. LOT SIZE (Max 5 points)
      // ========================================
      if (property.lotSize && property.lotSize > 10000) {
        score += 5;
        const acres = (property.lotSize / 43560).toFixed(2);
        matchReasons.push(`Spacious ${acres}-acre lot - room for everything`);
      }

      // ========================================
      // 12. ENSURE MINIMUM DESCRIPTIVE REASONS
      // ========================================
      // Always show at least 2-3 compelling reasons about the home
      if (matchReasons.length < 2) {
        // Add property type highlight
        const typeDesc = property.propertyType?.replace(/-/g, ' ') || 'home';
        matchReasons.push(`Well-maintained ${typeDesc} in ${property.city}`);

        // Add square footage if available
        if (property.sqft && matchReasons.length < 3) {
          matchReasons.push(`${property.sqft.toLocaleString()} sq ft of comfortable living space`);
        }

        // Only mention lot size if it's actually impressive (1+ acres)
        if (property.lotSize && matchReasons.length < 3) {
          const acres = property.lotSize / 43560;
          if (acres >= 1.0) {
            matchReasons.push(`Generous ${acres.toFixed(2)}-acre lot`);
          }
        }

        // Add year built if modern and not already mentioned
        if (property.yearBuilt && matchReasons.length < 3) {
          const age = new Date().getFullYear() - property.yearBuilt;
          if (age <= 30) {
            matchReasons.push(`Built in ${property.yearBuilt}`);
          }
        }

        // Add location highlight if still need more
        if (matchReasons.length < 2) {
          matchReasons.push(`Prime ${property.city} location`);
        }
      }

      // Calculate match percentage (0-100%)
      const maxPossibleScore = 200; // Approximate max from all categories
      const matchPercentage = Math.min(Math.round((score / maxPossibleScore) * 100), 100);

      matches.push({
        property,
        matchScore: score,
        matchReasons: matchReasons.slice(0, 5), // Limit to top 5 reasons
        missingFeatures,
      });
    }

    // Sort by match score (highest first) and return top 5
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map(match => ({
        ...match,
        // Add match percentage for display
        matchScore: Math.max(match.matchScore, 0), // Ensure non-negative
      }));
  }

  /**
   * Check if property has a specific feature
   */
  private static propertyHasFeature(property: Property, feature: string): boolean {
    const normalizedFeature = feature.toLowerCase().trim();
    const searchTerms = property.features.concat(property.description || '').join(' ').toLowerCase();

    // Map common feature requests to property attributes
    const featureMap: Record<string, string[]> = {
      'backyard': ['backyard', 'yard', 'outdoor space', 'patio'],
      'pool': ['pool', 'swimming pool', 'swim'],
      'garage': ['garage', 'parking', 'carport'],
      'updated kitchen': ['updated kitchen', 'renovated kitchen', 'modern kitchen', 'new kitchen'],
      'fireplace': ['fireplace', 'wood burning'],
      'hardwood floors': ['hardwood', 'wood floor'],
      'stainless appliances': ['stainless', 'stainless steel appliances'],
      'master suite': ['master suite', 'primary suite'],
      'walk-in closet': ['walk-in closet', 'walkin closet'],
      'fenced yard': ['fenced', 'fence'],
    };

    const searchKeys = featureMap[normalizedFeature] || [normalizedFeature];
    return searchKeys.some(key => searchTerms.includes(key));
  }

  /**
   * Format feature name for display
   */
  private static formatFeature(feature: string): string {
    return feature.charAt(0).toUpperCase() + feature.slice(1);
  }

  /**
   * Parse location string into components
   */
  private static parseLocation(location: string): {
    city: string;
    state: string;
    zipCode?: string;
  } {
    // Handle formats: "Nashville, TN", "Greers Ferry, AR", "37209", "Nashville TN 37209"

    // First, check if it's just a zip code
    if (/^\d{5}$/.test(location.trim())) {
      return { city: '', state: '', zipCode: location.trim() };
    }

    // Split by comma first (most common format: "City Name, ST")
    if (location.includes(',')) {
      const [cityPart, ...rest] = location.split(',').map(s => s.trim());
      const remaining = rest.join(',').trim().split(/\s+/);

      return {
        city: cityPart,
        state: remaining[0] || '',
        zipCode: remaining[1] && /^\d{5}$/.test(remaining[1]) ? remaining[1] : undefined,
      };
    }

    // No comma - split by spaces
    const parts = location.trim().split(/\s+/);

    if (parts.length === 1) {
      // Just a city name
      return { city: parts[0], state: '' };
    }

    if (parts.length === 2) {
      // "Nashville TN" or "City ST"
      return { city: parts[0], state: parts[1] };
    }

    // 3+ parts - last part might be zip, second-to-last is state, rest is city
    const lastPart = parts[parts.length - 1];
    const isZip = /^\d{5}$/.test(lastPart);

    if (isZip) {
      // "Nashville TN 37209"
      return {
        city: parts.slice(0, -2).join(' '),
        state: parts[parts.length - 2],
        zipCode: lastPart,
      };
    } else {
      // "Greers Ferry AR" (no zip)
      return {
        city: parts.slice(0, -1).join(' '),
        state: parts[parts.length - 1],
      };
    }
  }

  /**
   * Get placeholder images for properties (until we have real photos)
   */
  private static getPlaceholderImages(propertyType: string): string[] {
    // High-quality Unsplash real estate images (royalty-free)
    const imagesByType: Record<string, string[]> = {
      'single-family': [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', // Modern house exterior
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80', // Beautiful home exterior
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', // House with garden
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', // Contemporary house
      ],
      'condo': [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', // Modern condo building
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80', // Luxury condo
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', // Upscale apartment
      ],
      'townhouse': [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80', // Townhouse row
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80', // Modern townhome
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', // Townhouse exterior
      ],
      'multi-family': [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', // Apartment building
        'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=1200&q=80', // Multi-unit building
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1200&q=80', // Residential complex
      ],
      'default': [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      ]
    };

    // Normalize property type
    const typeKey = propertyType?.toLowerCase().replace(/[_\s]/g, '-') || 'default';
    const images = imagesByType[typeKey] || imagesByType['default'];

    // Return 3-4 random images from the set
    const count = 3 + Math.floor(Math.random() * 2); // 3 or 4 images
    return images.slice(0, count);
  }

  /**
   * Transform RentCast listing to our Property format
   */
  private static transformListing(listing: any): Property {
    // Use RentCast photos if available, otherwise use high-quality placeholders
    const images = listing.photos && listing.photos.length > 0
      ? listing.photos.map((p: any) => p.href || p.url)
      : this.getPlaceholderImages(listing.propertyType);

    return {
      id: listing.id || listing.listingId,
      address: listing.addressLine1 || listing.address,
      city: listing.city,
      state: listing.state,
      zipCode: listing.zipCode,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      sqft: listing.squareFootage || listing.livingArea,
      lotSize: listing.lotSize,
      propertyType: listing.propertyType,
      yearBuilt: listing.yearBuilt,
      features: listing.features || this.extractFeatures(listing.description),
      images,
      daysOnMarket: this.calculateDaysOnMarket(listing.listedDate || listing.listDate),
      listingDate: listing.listedDate || listing.listDate,
      description: listing.description,
      schoolRatings: listing.schools ? {
        elementary: listing.schools.elementary?.rating,
        middle: listing.schools.middle?.rating,
        high: listing.schools.high?.rating,
      } : undefined,
      mlsId: listing.mlsId,
      agentInfo: listing.listingAgent ? {
        name: listing.listingAgent.name,
        phone: listing.listingAgent.phone,
        email: listing.listingAgent.email,
      } : undefined,
    };
  }

  /**
   * Extract features from description text
   */
  private static extractFeatures(description?: string): string[] {
    if (!description) return [];
    
    const features: string[] = [];
    const lowerDesc = description.toLowerCase();

    const featurePatterns = [
      'pool', 'backyard', 'garage', 'fireplace', 'hardwood',
      'granite', 'stainless', 'updated', 'renovated', 'new',
    ];

    for (const pattern of featurePatterns) {
      if (lowerDesc.includes(pattern)) {
        features.push(pattern);
      }
    }

    return features;
  }

  /**
   * Calculate days on market
   */
  private static calculateDaysOnMarket(listDate: string): number {
    const listed = new Date(listDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - listed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}