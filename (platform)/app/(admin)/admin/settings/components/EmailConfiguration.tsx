'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PlatformSettings } from '@/lib/data/admin/mock-settings';

interface EmailConfigurationProps {
  settings: PlatformSettings['email'];
  onUpdate: (settings: PlatformSettings['email']) => void;
}

export default function EmailConfiguration({ settings, onUpdate }: EmailConfigurationProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="smtp_host">SMTP Host</Label>
          <Input
            id="smtp_host"
            value={settings.smtp_host}
            onChange={(e) =>
              onUpdate({ ...settings, smtp_host: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtp_port">SMTP Port</Label>
          <Input
            id="smtp_port"
            type="number"
            value={settings.smtp_port}
            onChange={(e) =>
              onUpdate({ ...settings, smtp_port: Number(e.target.value) })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from_email">From Email</Label>
          <Input
            id="from_email"
            type="email"
            value={settings.from_email}
            onChange={(e) =>
              onUpdate({ ...settings, from_email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from_name">From Name</Label>
          <Input
            id="from_name"
            value={settings.from_name}
            onChange={(e) =>
              onUpdate({ ...settings, from_name: e.target.value })
            }
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>SMTP Secure</Label>
          <p className="text-sm text-muted-foreground">Enable SSL/TLS encryption</p>
        </div>
        <Switch
          checked={settings.smtp_secure}
          onCheckedChange={(checked) =>
            onUpdate({ ...settings, smtp_secure: checked })
          }
        />
      </div>
    </>
  );
}
