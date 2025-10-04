// app/lib/modules/real-estate/services/rentcast-service.ts
import 'server-only';

import { CacheService } from '@/app/chatbot/services/cache-service';

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

    try {
      // Parse location to get city and state
      const { city, state, zipCode } = this.parseLocation(params.location);

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

      // Transform RentCast response to our Property format
      const properties: Property[] = data.map((listing: any) => this.transformListing(listing));

      // Cache results for 15 minutes
      CacheService.set(cacheKey, properties, 900);

      return properties;
    } catch (error) {
      console.error('RentCast API error:', error);
      throw new Error('Failed to fetch property listings. Please try again.');
    }
  }

  /**
   * Match properties to user preferences with scoring algorithm
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

      // 1. Price matching (hard constraint + scoring)
      if (property.price > params.maxPrice) continue; // Skip if over budget

      const priceDiff = params.maxPrice - property.price;
      const priceScore = Math.min((priceDiff / params.maxPrice) * 30, 30); // Max 30 points
      score += priceScore;
      
      if (priceDiff > params.maxPrice * 0.1) {
        matchReasons.push(`Great value - $${priceDiff.toLocaleString()} under budget`);
      }

      // 2. Bedroom matching (hard constraint)
      if (property.bedrooms < params.minBedrooms) continue;
      score += 20;
      if (property.bedrooms > params.minBedrooms) {
        matchReasons.push(`Extra bedroom (${property.bedrooms} total)`);
        score += 5;
      }

      // 3. Bathroom matching (soft constraint)
      if (params.minBathrooms && property.bathrooms >= params.minBathrooms) {
        score += 15;
        if (property.bathrooms > params.minBathrooms) {
          matchReasons.push(`${property.bathrooms} bathrooms`);
          score += 5;
        }
      }

      // 4. Must-have features (critical)
      let mustHaveScore = 0;
      for (const feature of params.mustHaveFeatures) {
        const hasFeature = this.propertyHasFeature(property, feature);
        if (hasFeature) {
          mustHaveScore += 10;
          matchReasons.push(this.formatFeature(feature));
        } else {
          missingFeatures.push(this.formatFeature(feature));
          mustHaveScore -= 5; // Penalty for missing must-have
        }
      }
      score += mustHaveScore;

      // 5. Nice-to-have features (bonus points)
      if (params.niceToHaveFeatures) {
        for (const feature of params.niceToHaveFeatures) {
          if (this.propertyHasFeature(property, feature)) {
            score += 5;
            matchReasons.push(this.formatFeature(feature));
          }
        }
      }

      // 6. Days on market (newer = better)
      if (property.daysOnMarket <= 3) {
        score += 10;
        matchReasons.push('Just listed!');
      } else if (property.daysOnMarket <= 7) {
        score += 5;
        matchReasons.push('Recently listed');
      }

      // 7. Property condition indicators
      if (property.yearBuilt && property.yearBuilt >= 2010) {
        score += 5;
        matchReasons.push('Modern construction');
      }

      // 8. School ratings (if available)
      if (property.schoolRatings) {
        const avgRating = (
          (property.schoolRatings.elementary || 0) +
          (property.schoolRatings.middle || 0) +
          (property.schoolRatings.high || 0)
        ) / 3;
        
        if (avgRating >= 8) {
          score += 10;
          matchReasons.push('Top-rated schools nearby');
        } else if (avgRating >= 6) {
          score += 5;
        }
      }

      // 9. Price per sqft (efficiency score)
      const pricePerSqft = property.price / property.sqft;
      const marketAvg = 200; // Example: adjust based on market data
      if (pricePerSqft < marketAvg * 0.9) {
        score += 5;
        matchReasons.push('Excellent price per sqft');
      }

      matches.push({
        property,
        matchScore: score,
        matchReasons,
        missingFeatures,
      });
    }

    // Sort by match score (highest first) and return top 5
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
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
    // Handle formats: "Nashville, TN", "37209", "Nashville TN 37209"
    const parts = location.split(/[,\s]+/).filter(Boolean);

    if (parts.length === 1) {
      // Could be just a zip code
      if (/^\d{5}$/.test(parts[0])) {
        return { city: '', state: '', zipCode: parts[0] };
      }
      // Or just a city name
      return { city: parts[0], state: '' };
    }

    if (parts.length === 2) {
      return { city: parts[0], state: parts[1] };
    }

    // "Nashville TN 37209"
    return {
      city: parts[0],
      state: parts[1],
      zipCode: parts[2],
    };
  }

  /**
   * Transform RentCast listing to our Property format
   */
  private static transformListing(listing: any): Property {
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
      images: listing.photos?.map((p: any) => p.href || p.url) || [],
      daysOnMarket: this.calculateDaysOnMarket(listing.listDate),
      listingDate: listing.listDate,
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