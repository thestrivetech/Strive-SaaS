'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface UpgradePromptProps {
  currentTier: 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';
  requiredTier: 'FREE' | 'CUSTOM' | 'STARTER' | 'GROWTH' | 'ELITE' | 'ENTERPRISE';
  feature: string;
}

/**
 * Tier display metadata
 * Aligns with Prisma enum: FREE, CUSTOM, STARTER, GROWTH, ELITE, ENTERPRISE
 */
const TIER_META: Record<string, {
  name: string;
  color: string;
  description: string;
  price?: string;
}> = {
  FREE: {
    name: 'Free',
    color: 'gray',
    description: 'Limited access - Assigned by Admin',
    price: '$0',
  },
  CUSTOM: {
    name: 'Custom',
    color: 'blue',
    description: 'Pay for what you use from marketplace',
    price: 'Pay as you go',
  },
  STARTER: {
    name: 'Starter',
    color: 'green',
    description: 'CRM, CMS, and Transaction modules',
    price: '$299/seat/month',
  },
  GROWTH: {
    name: 'Growth',
    color: 'purple',
    description: 'Starter + additional modules and tools',
    price: '$699/seat/month',
  },
  ELITE: {
    name: 'Elite',
    color: 'amber',
    description: 'Everything + all basic and industry tools',
    price: '$999/seat/month',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    color: 'orange',
    description: 'Unlimited access with dedicated support',
    price: 'Custom Pricing',
  },
};

/**
 * Upgrade Prompt Component
 *
 * Shows when user tries to access a feature not included in their tier
 * Displays current tier, required tier, and upgrade CTA
 *
 * @param currentTier - User's current subscription tier
 * @param requiredTier - Required tier to access the feature
 * @param feature - Name of the feature being accessed
 */
export function UpgradePrompt({ currentTier, requiredTier, feature }: UpgradePromptProps) {
  const currentMeta = TIER_META[currentTier];
  const requiredMeta = TIER_META[requiredTier];

  return (
    <div className="flex min-h-[600px] items-center justify-center p-8">
      <Card className="max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Upgrade Required</CardTitle>
          <CardDescription className="text-base">
            {feature} is only available on the <strong>{requiredMeta.name}</strong> plan and above
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current vs Required Tier */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Plan</span>
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <Badge variant="outline" className={`bg-${currentMeta.color}-50`}>
                  {currentMeta.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMeta.description}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-primary p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Required Plan</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Badge variant="default" className={`bg-${requiredMeta.color}-500`}>
                  {requiredMeta.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {requiredMeta.description}
              </p>
            </div>
          </div>

          {/* Feature Benefits */}
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <h4 className="font-semibold">What you'll get with {requiredMeta.name}:</h4>
            <ul className="space-y-2 text-sm">
              {requiredTier === 'STARTER' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Full CRM module with contacts, leads, and deals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>CMS module for content management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Transaction management module</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Basic analytics and reporting</span>
                  </li>
                </>
              )}
              {requiredTier === 'GROWTH' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Everything in Starter, plus...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>2-3 additional premium modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Select tools from marketplace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Advanced workflow automation</span>
                  </li>
                </>
              )}
              {requiredTier === 'ELITE' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Everything in Growth, plus...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>All basic tools included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>All industry-specific tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </>
              )}
              {requiredTier === 'ENTERPRISE' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Everything in Elite, plus...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Unlimited access to all modules and tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Dedicated support and onboarding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Custom integrations and SLA guarantees</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/settings/billing">
                Upgrade to {requiredMeta.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/real-estate/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground">
            Need help choosing the right plan?{' '}
            <Link href="/settings/billing" className="text-primary underline">
              Compare all plans
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
