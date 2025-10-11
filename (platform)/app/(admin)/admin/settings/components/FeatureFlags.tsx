'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PlatformSettings } from '@/lib/modules/admin';

interface FeatureFlagsProps {
  settings: PlatformSettings['features'];
  onUpdate: (settings: PlatformSettings['features']) => void;
}

export default function FeatureFlags({ settings, onUpdate }: FeatureFlagsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>AI Assistant</Label>
          <p className="text-sm text-muted-foreground">
            Enable AI-powered assistant platform-wide
          </p>
        </div>
        <Switch
          checked={settings.enable_ai_assistant}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, enable_ai_assistant: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Marketplace</Label>
          <p className="text-sm text-muted-foreground">
            Enable tool marketplace for users
          </p>
        </div>
        <Switch
          checked={settings.enable_marketplace}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, enable_marketplace: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Analytics</Label>
          <p className="text-sm text-muted-foreground">
            Enable advanced analytics features
          </p>
        </div>
        <Switch
          checked={settings.enable_analytics}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, enable_analytics: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Webhooks</Label>
          <p className="text-sm text-muted-foreground">Enable webhook support</p>
        </div>
        <Switch
          checked={settings.enable_webhooks}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, enable_webhooks: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>API Access</Label>
          <p className="text-sm text-muted-foreground">
            Enable external API access
          </p>
        </div>
        <Switch
          checked={settings.enable_api_access}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, enable_api_access: checked })
          }
        />
      </div>
    </div>
  );
}
