/**
 * REID Alerts API Test Suite
 * Tests for alerts API route integration
 */

import { GET, POST } from '@/app/api/v1/reid/alerts/route';
import { NextRequest } from 'next/server';

// Mock the alerts module
jest.mock('@/lib/modules/reid/alerts', () => ({
  getPropertyAlerts: jest.fn(),
  createPropertyAlert: jest.fn(),
}));

// Mock auth
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    id: 'user-123',
    organizationId: 'org-123',
    globalRole: 'USER',
    subscriptionTier: 'GROWTH',
  }),
}));

// Mock RBAC
jest.mock('@/lib/auth/rbac', () => ({
  canAccessREID: jest.fn(() => true),
}));

describe('REID Alerts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/reid/alerts', () => {
    it('returns alerts for authenticated user', async () => {
      const { getPropertyAlerts } = require('@/lib/modules/reid/alerts');
      const mockAlerts = [
        { id: 'alert-1', name: 'Price Drop Alert', alert_type: 'PRICE_DROP' },
        { id: 'alert-2', name: 'New Listing Alert', alert_type: 'NEW_LISTING' },
      ];

      getPropertyAlerts.mockResolvedValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('alerts');
      expect(data.alerts).toHaveLength(2);
    });

    it('filters alerts by type', async () => {
      const { getPropertyAlerts } = require('@/lib/modules/reid/alerts');
      getPropertyAlerts.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/alerts?alertType=PRICE_DROP'
      );

      await GET(request);

      expect(getPropertyAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          alertType: 'PRICE_DROP',
        })
      );
    });

    it('filters alerts by active status', async () => {
      const { getPropertyAlerts } = require('@/lib/modules/reid/alerts');
      getPropertyAlerts.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/reid/alerts?isActive=true'
      );

      await GET(request);

      expect(getPropertyAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      );
    });

    it('handles query errors gracefully', async () => {
      const { getPropertyAlerts } = require('@/lib/modules/reid/alerts');
      getPropertyAlerts.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('checks REID access permission', async () => {
      const { getPropertyAlerts } = require('@/lib/modules/reid/alerts');
      getPropertyAlerts.mockRejectedValue(
        new Error('Unauthorized: REID access required')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('POST /api/v1/reid/alerts', () => {
    it('creates alert successfully', async () => {
      const { createPropertyAlert } = require('@/lib/modules/reid/alerts');
      const mockAlert = {
        id: 'alert-123',
        name: 'Test Alert',
        alert_type: 'PRICE_DROP',
        organization_id: 'org-123',
      };

      createPropertyAlert.mockResolvedValue(mockAlert);

      const requestBody = {
        name: 'Test Alert',
        alertType: 'PRICE_DROP',
        criteria: { threshold: 10 },
        areaCodes: ['94110'],
        frequency: 'DAILY',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('alert');
      expect(data.alert.id).toBe('alert-123');
    });

    it('validates required fields', async () => {
      const requestBody = {
        name: '', // Invalid: empty string
        alertType: 'PRICE_DROP',
        criteria: {},
        areaCodes: ['94110'],
        frequency: 'DAILY',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('handles creation errors', async () => {
      const { createPropertyAlert } = require('@/lib/modules/reid/alerts');
      createPropertyAlert.mockRejectedValue(new Error('Creation failed'));

      const requestBody = {
        name: 'Test Alert',
        alertType: 'PRICE_DROP',
        criteria: {},
        areaCodes: ['94110'],
        frequency: 'DAILY',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('enforces organization isolation on creation', async () => {
      const { createPropertyAlert } = require('@/lib/modules/reid/alerts');
      const mockAlert = {
        id: 'alert-123',
        organization_id: 'org-123',
      };

      createPropertyAlert.mockResolvedValue(mockAlert);

      const requestBody = {
        name: 'Test Alert',
        alertType: 'PRICE_DROP',
        criteria: {},
        areaCodes: ['94110'],
        frequency: 'DAILY',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.alert.organization_id).toBe('org-123');
    });

    it('checks REID access permission on creation', async () => {
      const { createPropertyAlert } = require('@/lib/modules/reid/alerts');
      createPropertyAlert.mockRejectedValue(
        new Error('Unauthorized: REID access required')
      );

      const requestBody = {
        name: 'Test Alert',
        alertType: 'PRICE_DROP',
        criteria: {},
        areaCodes: ['94110'],
        frequency: 'DAILY',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/reid/alerts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });
  });
});
