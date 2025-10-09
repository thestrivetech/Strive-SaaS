/**
 * REID (Real Estate Intelligence Dashboard) Data Provider
 *
 * Switches between mock data and real Prisma queries
 * Usage: Import from this file instead of directly from Prisma or mocks
 */

import { dataConfig, simulateDelay, maybeThrowError } from '../config';
import {
  generateMockMarketData,
  generateMockMarketDataSet,
  generateMockTrendSeries,
  generateMockDemographics,
  generateMockDemographicsSet,
  generateMockROISimulation,
  generateMockAlert,
  generateMockAlerts,
  generateMockSchool,
  generateMockSchools,
  generateMockAIProfile,
  generateMockAIProfiles,
  generateMockREIDReport,
  type MockMarketData,
  type MockTrendPoint,
  type MockDemographics,
  type MockROISimulation,
  type MockAlert,
  type MockSchool,
  type MockAIProfile,
  type MockREIDReport,
  MAJOR_METROS,
} from '../mocks/reid';

// ============================================================================
// IN-MEMORY MOCK STORAGE
// ============================================================================

let mockMarketDataStore: MockMarketData[] = [];
let mockDemographicsStore: MockDemographics[] = [];
let mockAlertsStore: MockAlert[] = [];
let mockAIProfilesStore: MockAIProfile[] = [];
let mockReportsStore: MockREIDReport[] = [];

/**
 * Initialize mock data stores
 */
function initializeMockData() {
  if (mockMarketDataStore.length === 0) {
    // Generate 50 market data entries
    mockMarketDataStore = generateMockMarketDataSet(50);

    // Generate 50 demographics entries (matching markets)
    mockDemographicsStore = generateMockDemographicsSet(50);

    // Generate 10 active alerts
    mockAlertsStore = generateMockAlerts(10);

    // Generate 10 AI profiles
    mockAIProfilesStore = generateMockAIProfiles(10);

    // Generate 2-3 sample reports
    const sampleZips1 = ['90210', '10001', '33139'];
    const sampleZips2 = ['94102', '98101', '78701', '60611'];
    mockReportsStore.push(generateMockREIDReport(sampleZips1, 'MARKET_ANALYSIS'));
    mockReportsStore.push(generateMockREIDReport(sampleZips2, 'INVESTMENT_OPPORTUNITY'));
    mockReportsStore.push(generateMockREIDReport(['92101', '85003'], 'COMPARATIVE_ANALYSIS'));
  }
}

// ============================================================================
// MARKET DATA PROVIDER
// ============================================================================

export const marketDataProvider = {
  /**
   * Find all market data
   */
  async findAll(): Promise<MockMarketData[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch market data');

      return mockMarketDataStore;
    }

    // TODO: Replace with real Prisma query when schema is ready
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find market data by zip code
   */
  async findByZipCode(zipCode: string): Promise<MockMarketData | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch market data');

      return mockMarketDataStore.find((m) => m.zip_code === zipCode) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find market data by city
   */
  async findByCity(city: string, state: string): Promise<MockMarketData[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch market data');

      return mockMarketDataStore.filter(
        (m) => m.city.toLowerCase() === city.toLowerCase() && m.state === state
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find market data by state
   */
  async findByState(state: string): Promise<MockMarketData[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch market data');

      return mockMarketDataStore.filter((m) => m.state === state);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get heatmap data with coordinates
   */
  async getHeatmapData(bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<
    Array<{
      lat: number;
      lng: number;
      intensity: number;
      median_price: number;
      zip_code: string;
    }>
  > {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch heatmap data');

      // Get coordinates from MAJOR_METROS
      const heatmapData = mockMarketDataStore.map((market) => {
        const metro = MAJOR_METROS.find((m) => m.zip === market.zip_code);
        if (!metro) return null;

        // Filter by bounds if provided
        if (bounds) {
          if (
            metro.lat > bounds.north ||
            metro.lat < bounds.south ||
            metro.lng > bounds.east ||
            metro.lng < bounds.west
          ) {
            return null;
          }
        }

        // Calculate intensity (0-100) based on market temperature
        const intensity =
          market.market_temperature === 'HOT' ? 100 :
          market.market_temperature === 'WARM' ? 75 :
          market.market_temperature === 'MODERATE' ? 50 :
          market.market_temperature === 'COOL' ? 25 :
          10;

        return {
          lat: metro.lat,
          lng: metro.lng,
          intensity,
          median_price: market.median_price,
          zip_code: market.zip_code,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      return heatmapData;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get top markets by metric
   */
  async getTopMarkets(
    limit: number = 10,
    metric: 'price_change' | 'investment_score' | 'demand_score' = 'investment_score'
  ): Promise<MockMarketData[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch top markets');

      let sorted = [...mockMarketDataStore];

      if (metric === 'price_change') {
        sorted = sorted.sort((a, b) => b.price_change_1yr - a.price_change_1yr);
      } else if (metric === 'investment_score') {
        sorted = sorted.sort((a, b) => b.investment_score - a.investment_score);
      } else if (metric === 'demand_score') {
        sorted = sorted.sort((a, b) => b.demand_score - a.demand_score);
      }

      return sorted.slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Search market data
   */
  async search(query: string): Promise<MockMarketData[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to search market data');

      const searchLower = query.toLowerCase();
      return mockMarketDataStore.filter(
        (m) =>
          m.city.toLowerCase().includes(searchLower) ||
          m.state.toLowerCase().includes(searchLower) ||
          m.zip_code.includes(searchLower) ||
          m.county.toLowerCase().includes(searchLower)
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// TRENDS PROVIDER
// ============================================================================

export const trendsProvider = {
  /**
   * Get historical trends
   */
  async getHistorical(zipCode: string, months: number = 24): Promise<MockTrendPoint[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch historical trends');

      const trendSeries = generateMockTrendSeries(zipCode, months, 0);
      return trendSeries.historical;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get prediction trends
   */
  async getPredictions(zipCode: string, months: number = 12): Promise<MockTrendPoint[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch prediction trends');

      const trendSeries = generateMockTrendSeries(zipCode, 0, months);
      return trendSeries.predictions;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get complete trends (historical + predictions)
   */
  async getComplete(
    zipCode: string,
    historicalMonths: number = 24,
    predictionMonths: number = 12
  ): Promise<{
    historical: MockTrendPoint[];
    predictions: MockTrendPoint[];
  }> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch trends');

      return generateMockTrendSeries(zipCode, historicalMonths, predictionMonths);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Compare trends across multiple markets
   */
  async compareMarkets(
    zipCodes: string[]
  ): Promise<Array<{ zipCode: string; trends: MockTrendPoint[] }>> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch market comparison');

      return zipCodes.map((zipCode) => ({
        zipCode,
        trends: generateMockTrendSeries(zipCode, 12, 6).historical,
      }));
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// DEMOGRAPHICS PROVIDER
// ============================================================================

export const demographicsProvider = {
  /**
   * Find demographics by zip code
   */
  async findByZipCode(zipCode: string): Promise<MockDemographics | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch demographics');

      return mockDemographicsStore.find((d) => d.zip_code === zipCode) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find demographics by city
   */
  async findByCity(city: string, state: string): Promise<MockDemographics[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch demographics');

      return mockDemographicsStore.filter(
        (d) => d.city.toLowerCase() === city.toLowerCase() && d.state === state
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find all demographics
   */
  async findAll(): Promise<MockDemographics[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch demographics');

      return mockDemographicsStore;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get growth leaders
   */
  async getGrowthLeaders(limit: number = 10): Promise<MockDemographics[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch growth leaders');

      return [...mockDemographicsStore]
        .sort((a, b) => b.growth_rate_5yr - a.growth_rate_5yr)
        .slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// ROI PROVIDER
// ============================================================================

export const roiProvider = {
  /**
   * Simulate ROI calculation
   */
  async simulate(params: {
    property_price: number;
    down_payment_percentage: number;
    interest_rate: number;
    loan_term: number;
    rental_income: number;
    property_tax_rate?: number;
    hoa_fees?: number;
  }): Promise<MockROISimulation> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to simulate ROI');

      const downPayment = Math.floor((params.property_price * params.down_payment_percentage) / 100);
      return generateMockROISimulation(params.property_price, {
        down_payment: downPayment,
        interest_rate: params.interest_rate,
        loan_term: params.loan_term,
        rental_income: params.rental_income,
        hoa_fees: params.hoa_fees || 0,
      });
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get historical ROI simulations for a zip code
   */
  async getHistorical(zipCode: string): Promise<MockROISimulation[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch historical ROI');

      const marketData = await marketDataProvider.findByZipCode(zipCode);
      if (!marketData) return [];

      // Generate 3-5 historical simulations
      const count = Math.floor(Math.random() * 3) + 3;
      return Array.from({ length: count }, () =>
        generateMockROISimulation(marketData.median_price)
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Compare multiple ROI scenarios
   */
  async compareScenarios(
    scenarios: Array<{ property_price: number; down_payment_percentage: number }>
  ): Promise<MockROISimulation[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to compare scenarios');

      return scenarios.map((scenario) => {
        const downPayment = Math.floor((scenario.property_price * scenario.down_payment_percentage) / 100);
        return generateMockROISimulation(scenario.property_price, {
          down_payment: downPayment,
        });
      });
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// ALERTS PROVIDER
// ============================================================================

export const alertsProvider = {
  /**
   * Find all alerts with optional filters
   */
  async findAll(filters?: {
    alert_type?: MockAlert['alert_type'];
    severity?: MockAlert['severity'];
    is_read?: boolean;
    is_dismissed?: boolean;
  }): Promise<MockAlert[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch alerts');

      let alerts = [...mockAlertsStore];

      if (filters?.alert_type) {
        alerts = alerts.filter((a) => a.alert_type === filters.alert_type);
      }

      if (filters?.severity) {
        alerts = alerts.filter((a) => a.severity === filters.severity);
      }

      if (filters?.is_read !== undefined) {
        alerts = alerts.filter((a) => a.is_read === filters.is_read);
      }

      if (filters?.is_dismissed !== undefined) {
        alerts = alerts.filter((a) => a.is_dismissed === filters.is_dismissed);
      }

      return alerts.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find alert by ID
   */
  async findById(id: string): Promise<MockAlert | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch alert');

      return mockAlertsStore.find((a) => a.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Mark alert as read
   */
  async markAsRead(id: string): Promise<MockAlert> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to mark alert as read');

      const alert = mockAlertsStore.find((a) => a.id === id);
      if (!alert) throw new Error('Alert not found');

      alert.is_read = true;
      return alert;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Dismiss alert
   */
  async dismiss(id: string): Promise<MockAlert> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to dismiss alert');

      const alert = mockAlertsStore.find((a) => a.id === id);
      if (!alert) throw new Error('Alert not found');

      alert.is_dismissed = true;
      return alert;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create alert
   */
  async create(data: Partial<MockAlert>): Promise<MockAlert> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to create alert');

      if (!data.zip_code) throw new Error('zip_code is required');

      const newAlert = generateMockAlert(data.zip_code, data);
      mockAlertsStore.push(newAlert);

      return newAlert;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();

      return mockAlertsStore.filter((a) => !a.is_read && !a.is_dismissed).length;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// AI PROFILES PROVIDER
// ============================================================================

export const aiProfilesProvider = {
  /**
   * Find all AI profiles with optional filters
   */
  async findAll(filters?: {
    status?: 'active' | 'archived';
    min_score?: number;
    recommendation?: MockAIProfile['recommendation'];
  }): Promise<MockAIProfile[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch AI profiles');

      let profiles = [...mockAIProfilesStore];

      if (filters?.status) {
        profiles = profiles.filter((p) => p.status === filters.status);
      }

      if (filters?.min_score !== undefined) {
        profiles = profiles.filter((p) => p.ai_score >= filters.min_score);
      }

      if (filters?.recommendation) {
        profiles = profiles.filter((p) => p.recommendation === filters.recommendation);
      }

      return profiles.sort((a, b) => b.analysis_date.getTime() - a.analysis_date.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find profile by ID
   */
  async findById(id: string): Promise<MockAIProfile | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch AI profile');

      return mockAIProfilesStore.find((p) => p.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Create new AI profile
   */
  async create(data: Partial<MockAIProfile>): Promise<MockAIProfile> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to create AI profile');

      const newProfile = generateMockAIProfile(data);
      mockAIProfilesStore.push(newProfile);

      return newProfile;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Update profile
   */
  async update(id: string, data: Partial<MockAIProfile>): Promise<MockAIProfile> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to update AI profile');

      const index = mockAIProfilesStore.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Profile not found');

      mockAIProfilesStore[index] = { ...mockAIProfilesStore[index], ...data };
      return mockAIProfilesStore[index];
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Archive profile
   */
  async archive(id: string): Promise<MockAIProfile> {
    return this.update(id, { status: 'archived' });
  },

  /**
   * Unarchive profile
   */
  async unarchive(id: string): Promise<MockAIProfile> {
    return this.update(id, { status: 'active' });
  },

  /**
   * Delete profile
   */
  async delete(id: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to delete AI profile');

      const index = mockAIProfilesStore.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Profile not found');

      mockAIProfilesStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get summary stats
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    archived: number;
    avg_score: number;
    strong_buy_count: number;
  }> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();

      const total = mockAIProfilesStore.length;
      const active = mockAIProfilesStore.filter((p) => p.status === 'active').length;
      const archived = mockAIProfilesStore.filter((p) => p.status === 'archived').length;
      const avgScore = Math.floor(
        mockAIProfilesStore.reduce((sum, p) => sum + p.ai_score, 0) / total
      );
      const strongBuyCount = mockAIProfilesStore.filter((p) => p.recommendation === 'strong-buy').length;

      return {
        total,
        active,
        archived,
        avg_score: avgScore,
        strong_buy_count: strongBuyCount,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// SCHOOLS PROVIDER
// ============================================================================

export const schoolsProvider = {
  /**
   * Find schools by zip code
   */
  async findByZipCode(zipCode: string): Promise<MockSchool[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch schools');

      return generateMockSchools(zipCode, 8);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find schools nearby (by lat/lng)
   */
  async findNearby(lat: number, lng: number, radius: number = 5): Promise<MockSchool[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch nearby schools');

      // Find closest metro to coordinates
      const distances = MAJOR_METROS.map((metro) => ({
        metro,
        distance: Math.sqrt(Math.pow(metro.lat - lat, 2) + Math.pow(metro.lng - lng, 2)),
      }));

      const closest = distances.sort((a, b) => a.distance - b.distance)[0];
      return generateMockSchools(closest.metro.zip, 8);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find school by ID
   */
  async findById(id: string): Promise<MockSchool | null> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch school');

      // Generate a school and match by ID (simplified for mock)
      const metro = MAJOR_METROS[0];
      const schools = generateMockSchools(metro.zip, 1);
      return schools[0] || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Search schools
   */
  async search(query: string): Promise<MockSchool[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to search schools');

      // Generate schools from multiple metros and filter
      const allSchools: MockSchool[] = [];
      MAJOR_METROS.slice(0, 10).forEach((metro) => {
        allSchools.push(...generateMockSchools(metro.zip, 3));
      });

      const searchLower = query.toLowerCase();
      return allSchools.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.city.toLowerCase().includes(searchLower) ||
          s.district.toLowerCase().includes(searchLower)
      );
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get top rated schools
   */
  async getTopRated(limit: number = 10, type?: MockSchool['type']): Promise<MockSchool[]> {
    if (dataConfig.useMocks) {
      await simulateDelay();
      maybeThrowError('Failed to fetch top rated schools');

      // Generate schools from multiple metros
      const allSchools: MockSchool[] = [];
      MAJOR_METROS.slice(0, 15).forEach((metro) => {
        allSchools.push(...generateMockSchools(metro.zip, 4));
      });

      let filtered = allSchools;
      if (type) {
        filtered = filtered.filter((s) => s.type === type);
      }

      return filtered.sort((a, b) => b.rating - a.rating).slice(0, limit);
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// REPORTS PROVIDER
// ============================================================================

export const reidReportsProvider = {
  /**
   * Find all reports
   */
  async findAll(): Promise<MockREIDReport[]> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch reports');

      return mockReportsStore.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Find report by ID
   */
  async findById(id: string): Promise<MockREIDReport | null> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch report');

      return mockReportsStore.find((r) => r.id === id) || null;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Generate a new report
   */
  async generate(params: {
    report_type: MockREIDReport['report_type'];
    zip_codes: string[];
  }): Promise<MockREIDReport> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to generate report');

      const newReport = generateMockREIDReport(params.zip_codes, params.report_type);
      mockReportsStore.push(newReport);

      return newReport;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Delete report
   */
  async delete(id: string): Promise<void> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to delete report');

      const index = mockReportsStore.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Report not found');

      mockReportsStore.splice(index, 1);
      return;
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};

// ============================================================================
// REID ANALYTICS PROVIDER
// ============================================================================

export const reidAnalyticsProvider = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    activeMarkets: number;
    totalAlerts: number;
    avgInvestmentScore: number;
    hotMarkets: MockMarketData[];
  }> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch dashboard stats');

      const activeMarkets = mockMarketDataStore.length;
      const totalAlerts = mockAlertsStore.filter((a) => !a.is_dismissed).length;
      const avgInvestmentScore = Math.floor(
        mockMarketDataStore.reduce((sum, m) => sum + m.investment_score, 0) / mockMarketDataStore.length
      );
      const hotMarkets = mockMarketDataStore
        .filter((m) => m.market_temperature === 'HOT')
        .slice(0, 5);

      return {
        activeMarkets,
        totalAlerts,
        avgInvestmentScore,
        hotMarkets,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },

  /**
   * Get complete market overview
   */
  async getMarketOverview(zipCode: string): Promise<{
    market: MockMarketData;
    demographics: MockDemographics;
    trends: MockTrendPoint[];
    schools: MockSchool[];
    alerts: MockAlert[];
  }> {
    if (dataConfig.useMocks) {
      initializeMockData();
      await simulateDelay();
      maybeThrowError('Failed to fetch market overview');

      const market = await marketDataProvider.findByZipCode(zipCode);
      if (!market) throw new Error('Market not found');

      const demographics = await demographicsProvider.findByZipCode(zipCode);
      if (!demographics) throw new Error('Demographics not found');

      const trendData = await trendsProvider.getComplete(zipCode, 12, 6);
      const trends = [...trendData.historical, ...trendData.predictions];

      const schools = await schoolsProvider.findByZipCode(zipCode);

      const alerts = mockAlertsStore.filter(
        (a) => a.zip_code === zipCode && !a.is_dismissed
      );

      return {
        market,
        demographics,
        trends,
        schools,
        alerts,
      };
    }

    // TODO: Replace with real Prisma query
    throw new Error('Real database not implemented yet - enable mock mode');
  },
};
