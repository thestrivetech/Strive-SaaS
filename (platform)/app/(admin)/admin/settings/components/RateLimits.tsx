'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlatformSettings } from '@/lib/modules/admin';

interface RateLimitsProps {
  settings: PlatformSettings['limits'];
  onUpdate: (settings: PlatformSettings['limits']) => void;
}

export default function RateLimits({ settings, onUpdate }: RateLimitsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="max_orgs_per_user">Max Organizations per User</Label>
        <Input
          id="max_orgs_per_user"
          type="number"
          value={settings.max_orgs_per_user}
          onChange={(e) =>
            onUpdate({
              ...settings,
              max_orgs_per_user: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max_file_upload_size">Max File Upload Size (MB)</Label>
        <Input
          id="max_file_upload_size"
          type="number"
          value={settings.max_file_upload_size}
          onChange={(e) =>
            onUpdate({
              ...settings,
              max_file_upload_size: Number(e.target.value),
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max_api_requests_per_minute">
          API Rate Limit (requests/minute)
        </Label>
        <Input
          id="max_api_requests_per_minute"
          type="number"
          value={settings.max_api_requests_per_minute}
          onChange={(e) =>
            onUpdate({
              ...settings,
              max_api_requests_per_minute: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
}
