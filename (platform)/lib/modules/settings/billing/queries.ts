import { prisma } from '@/lib/database/prisma';

export async function getSubscription(organizationId: string) {
  // For now, return mock subscription data
  // In future, this would query subscriptions table or Stripe API
  return {
    tier: 'ELITE' as const,
    status: 'active' as const,
    billingCycle: 'monthly' as const,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    seats: 5,
    price: 999,
  };
}

export async function getPaymentMethods(organizationId: string) {
  // For now, return mock payment method data
  // In future, this would query Stripe API
  return [
    {
      id: 'pm_mock_123',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
      },
      isDefault: true,
    },
  ];
}

export async function getInvoices(organizationId: string) {
  // For now, return mock invoice data
  // In future, this would query Stripe API
  return [
    {
      id: 'inv_mock_1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 999,
      status: 'paid' as const,
      pdfUrl: '#',
    },
    {
      id: 'inv_mock_2',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      amount: 999,
      status: 'paid' as const,
      pdfUrl: '#',
    },
  ];
}
