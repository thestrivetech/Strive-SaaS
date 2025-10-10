'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PlatformSettings } from '@/lib/data/admin/mock-settings';

interface BillingConfigurationProps {
  settings: PlatformSettings['billing'];
  onUpdate: (settings: PlatformSettings['billing']) => void;
}

export default function BillingConfiguration({ settings, onUpdate }: BillingConfigurationProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trial_period_days">Trial Period (days)</Label>
          <Input
            id="trial_period_days"
            type="number"
            value={settings.trial_period_days}
            onChange={(e) =>
              onUpdate({
                ...settings,
                trial_period_days: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grace_period_days">Grace Period (days)</Label>
          <Input
            id="grace_period_days"
            type="number"
            value={settings.grace_period_days}
            onChange={(e) =>
              onUpdate({
                ...settings,
                grace_period_days: Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
        <Input
          id="invoice_prefix"
          value={settings.invoice_prefix}
          onChange={(e) =>
            onUpdate({ ...settings, invoice_prefix: e.target.value })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Stripe Enabled</Label>
          <p className="text-sm text-muted-foreground">
            Enable Stripe payment processing
          </p>
        </div>
        <Switch
          checked={settings.stripe_enabled}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, stripe_enabled: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Dunning Enabled</Label>
          <p className="text-sm text-muted-foreground">
            Retry failed payments automatically
          </p>
        </div>
        <Switch
          checked={settings.dunning_enabled}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, dunning_enabled: checked })
          }
        />
      </div>
    </>
  );
}
