// app/lib/modules/real-estate/services/rentcast-service.ts
import 'server-only';

import { CacheService } from '@strive/shared/services/cache-service';

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

      const priceDiff = params.maxPrice - property.price;
      const pricePercentUnderBudget = (priceDiff / params.maxPrice) * 100;

      // Sweet spot: 5-15% under budget gets maximum points
      if (pricePercentUnderBudget >= 5 && pricePercentUnderBudget <= 15) {
        score += 35; // Perfect price range
        matchReasons.push(`Perfect price - $${priceDiff.toLocaleString()} under budget`);
      } else if (pricePercentUnderBudget > 15) {
        score += 25; // Way under budget (might be missing features)
        matchReasons.push(`Great value - well under budget`);
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
        matchReasons.push(`${property.bedrooms} bedrooms (bonus room)`);
      } else if (property.bedrooms > params.minBedrooms + 1) {
        score += 20; // Too many bedrooms might mean higher maintenance
        matchReasons.push(`${property.bedrooms} bedrooms (spacious)`);
      }

      // ========================================
      // 3. BATHROOM MATCHING (Max 20 points)
      // ========================================
      if (params.minBathrooms) {
        if (property.bathrooms >= params.minBathrooms) {
          score += 15;
          if (property.bathrooms > params.minBathrooms) {
            score += 5;
            matchReasons.push(`${property.bathrooms} bathrooms`);
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
        matchReasons.push('🔥 Just listed!');
      } else if (property.daysOnMarket <= 7) {
        score += 10;
        matchReasons.push('Recently listed');
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
          matchReasons.push('Brand new construction');
        } else if (age <= 15) {
          score += 7;
          matchReasons.push('Modern build');
        } else if (age <= 30) {
          score += 3;
        } else if (age > 50) {
          score -= 3; // Older homes might need work
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
          matchReasons.push('⭐ Exceptional schools nearby');
        } else if (avgRating >= 8) {
          score += 12;
          matchReasons.push('Top-rated schools');
        } else if (avgRating >= 7) {
          score += 8;
          matchReasons.push('Great schools');
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
          matchReasons.push('Excellent value per sqft');
        } else if (pricePerSqft < marketAvg * 0.9) {
          score += 7;
          matchReasons.push('Good value');
        } else if (pricePerSqft > marketAvg * 1.2) {
          score -= 5; // Overpriced per sqft
        }
      }

      // ========================================
      // 11. LOT SIZE (Max 5 points)
      // ========================================
      if (property.lotSize && property.lotSize > 10000) {
        score += 5;
        matchReasons.push('Large lot');
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