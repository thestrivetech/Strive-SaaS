'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PlatformSettings } from '@/lib/modules/admin';

interface SecuritySettingsProps {
  settings: PlatformSettings['security'];
  onUpdate: (settings: PlatformSettings['security']) => void;
}

export default function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
          <Input
            id="max_login_attempts"
            type="number"
            value={settings.max_login_attempts}
            onChange={(e) =>
              onUpdate({
                ...settings,
                max_login_attempts: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
          <Input
            id="lockout_duration"
            type="number"
            value={settings.lockout_duration}
            onChange={(e) =>
              onUpdate({
                ...settings,
                lockout_duration: Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_min_length">Password Minimum Length</Label>
        <Input
          id="password_min_length"
          type="number"
          value={settings.password_min_length}
          onChange={(e) =>
            onUpdate({
              ...settings,
              password_min_length: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Require 2FA for Admins</Label>
          <p className="text-sm text-muted-foreground">
            Force two-factor authentication for admin users
          </p>
        </div>
        <Switch
          checked={settings.require_2fa_for_admins}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, require_2fa_for_admins: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Require 2FA for All</Label>
          <p className="text-sm text-muted-foreground">
            Force two-factor authentication for all users
          </p>
        </div>
        <Switch
          checked={settings.require_2fa_for_all}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, require_2fa_for_all: checked })
          }
        />
      </div>
    </>
  );
}
