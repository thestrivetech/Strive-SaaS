'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PlatformSettings } from '@/lib/modules/admin';

interface GeneralSettingsProps {
  settings: PlatformSettings['general'];
  onUpdate: (settings: PlatformSettings['general']) => void;
}

export default function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="platform_name">Platform Name</Label>
          <Input
            id="platform_name"
            value={settings.platform_name}
            onChange={(e) =>
              onUpdate({ ...settings, platform_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_email">Support Email</Label>
          <Input
            id="support_email"
            type="email"
            value={settings.support_email}
            onChange={(e) =>
              onUpdate({ ...settings, support_email: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="primary_domain">Primary Domain</Label>
        <Input
          id="primary_domain"
          value={settings.primary_domain}
          onChange={(e) =>
            onUpdate({ ...settings, primary_domain: e.target.value })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Maintenance Mode</Label>
          <p className="text-sm text-muted-foreground">
            Disable access to the platform
          </p>
        </div>
        <Switch
          checked={settings.maintenance_mode}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, maintenance_mode: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Allow Signups</Label>
          <p className="text-sm text-muted-foreground">
            Enable new user registrations
          </p>
        </div>
        <Switch
          checked={settings.allow_signups}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, allow_signups: checked })
          }
        />
      </div>
    </>
  );
}
