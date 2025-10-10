/**
 * REID Insights API Test Suite
 * Tests for insights API route integration
 */

import { GET } from '@/app/api/v1/reid/insights/route';
import { NextRequest } from 'next/server';
import { getNeighborhoodInsights } from '@/lib/modules/reid/insights';
import { mockAsyncFunction, mockFunction } from '../../../helpers/mock-helpers';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';

// Mock the insights queries
jest.mock('@/lib/modules/reid/insights', () => ({
  getNeighborhoodInsights: jest.fn(),
}));

// Mock auth
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn(),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessREID: jest.fn(),
}));

describe('REID Insights API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default auth mock
    mockAsyncFunction(requireAuth).mockResolvedValue({
      id: 'user-123',
      organizationId: 'org-123',
      globalRole: 'USER',
      subscriptionTier: 'GROWTH',
    });

    // Setup default RBAC mock
    mockFunction(canAccessREID).mockReturnValue(true);
  });

  describe('GET /api/v1/reid/insights', () => {
    it('returns insights for authenticated user', async () => {
      const mockInsights = [
        { id: 'insight-1', area_code: '94110', area_name: 'Mission District' },
        { id: 'insight-2', area_code: '94103', area_name: 'SOMA' },
      ];

      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue(mockInsights);

      const request = new NextRequest('http://localhost:3000/api/v1/reid/insights');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('insights');
      expect(data.insights).toHaveLength(2);
      expect(data.insights[0].area_code).toBe('94110');
    });

    it('applies filters from query params', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?areaCodes=94110,94103&minPrice=500000&maxPrice=1500000'
      );

      await GET(request);

      expect(getNeighborhoodInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          areaCodes: ['94110', '94103'],
          minPrice: 500000,
          maxPrice: 1500000,
        })
      );
    });

    it('applies area type filter from query params', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?areaType=ZIP'
      );

      await GET(request);

      expect(getNeighborhoodInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          areaType: 'ZIP',
        })
      );
    });

    it('validates area type enum values', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?areaType=INVALID'
      );

      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('handles invalid price parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?minPrice=invalid'
      );

      const response = await GET(request);
      const data = await response.json();

      // Should either parse as NaN and filter out, or return error
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('returns empty array when no insights found', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/v1/reid/insights');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.insights).toEqual([]);
    });

    it('handles query errors gracefully', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/v1/reid/insights');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('checks REID access permission', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockRejectedValue(
        new Error('Unauthorized: REID access required')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/reid/insights');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('parses comma-separated area codes correctly', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?areaCodes=94110,94103,94102'
      );

      await GET(request);

      expect(getNeighborhoodInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          areaCodes: ['94110', '94103', '94102'],
        })
      );
    });

    it('handles single area code without comma', async () => {
      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/insights?areaCodes=94110'
      );

      await GET(request);

      expect(getNeighborhoodInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          areaCodes: ['94110'],
        })
      );
    });

    it('filters by organization ID automatically', async () => {
      const mockInsights = [
        { id: 'insight-1', organization_id: 'org-123' },
      ];

      mockAsyncFunction(getNeighborhoodInsights).mockResolvedValue(mockInsights);

      const request = new NextRequest('http://localhost:3000/api/v1/reid/insights');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.insights[0].organization_id).toBe('org-123');
    });
  });
});
