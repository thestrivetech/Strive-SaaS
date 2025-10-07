import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as stripeWebhook } from '@/app/api/webhooks/stripe/route';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('stripe');
vi.mock('@/lib/database/prisma');

const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
};

const mockPrisma = {
  onboarding_sessions: {
    update: vi.fn(),
  },
  organizations: {
    findFirst: vi.fn(),
  },
  subscriptions: {
    upsert: vi.fn(),
    update: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error - Mock implementation for testing
  Stripe.mockImplementation(() => mockStripe);
});

describe('Stripe Webhook Handler', () => {
  describe('POST /api/webhooks/stripe', () => {
    it('should reject invalid webhook signatures', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
        body: JSON.stringify({ type: 'payment_intent.succeeded' }),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid signature');
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: {
              sessionToken: 'session-123',
            },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as unknown as Stripe.Event);
      mockPrisma.onboarding_sessions.update.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(mockPrisma.onboarding_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { session_token: 'session-123' },
          data: expect.objectContaining({
            payment_status: 'SUCCEEDED',
          }),
        })
      );
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_123',
            metadata: {
              sessionToken: 'session-123',
            },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as unknown as Stripe.Event);
      mockPrisma.onboarding_sessions.update.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.onboarding_sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            payment_status: 'FAILED',
          }),
        })
      );
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
            items: {
              data: [
                {
                  price: {
                    recurring: {
                      interval: 'month',
                    },
                  },
                },
              ],
            },
            metadata: {
              tier: 'STARTER',
            },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as unknown as Stripe.Event);
      mockPrisma.organizations.findFirst.mockResolvedValue({
        id: 'org-123',
        name: 'Test Org',
      });
      mockPrisma.subscriptions.upsert.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.subscriptions.upsert).toHaveBeenCalled();
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as unknown as Stripe.Event);
      mockPrisma.organizations.findFirst.mockResolvedValue({
        id: 'org-123',
        name: 'Test Org',
      });
      mockPrisma.subscriptions.update.mockResolvedValue({});

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.subscriptions.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANCELLED',
          }),
        })
      );
    });

    it('should handle unhandled event types gracefully', async () => {
      const mockEvent = {
        type: 'customer.created',
        data: {
          object: {},
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as unknown as Stripe.Event);

      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should reject requests without signature header', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'payment_intent.succeeded' }),
      });

      const response = await stripeWebhook(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing signature');
    });
  });
});
