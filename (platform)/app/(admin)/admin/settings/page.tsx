'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  MOCK_PLATFORM_SETTINGS,
  getSettingsCategories,
  type PlatformSettings,
} from '@/lib/data/admin/mock-settings';
import {
  Settings,
  Mail,
  Shield,
  Gauge,
  Sparkles,
  CreditCard,
  Save,
} from 'lucide-react';
import GeneralSettings from './components/GeneralSettings';
import EmailConfiguration from './components/EmailConfiguration';
import SecuritySettings from './components/SecuritySettings';
import RateLimits from './components/RateLimits';
import FeatureFlags from './components/FeatureFlags';
import BillingConfiguration from './components/BillingConfiguration';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(MOCK_PLATFORM_SETTINGS);

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Platform settings updated successfully (mock mode)',
    });
  };

  const categoryIcons: Record<string, any> = {
    general: Settings,
    email: Mail,
    security: Shield,
    limits: Gauge,
    features: Sparkles,
    billing: CreditCard,
  };

  const renderSettingsComponent = (categoryKey: string) => {
    switch (categoryKey) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings.general}
            onUpdate={(general) => setSettings({ ...settings, general })}
          />
        );
      case 'email':
        return (
          <EmailConfiguration
            settings={settings.email}
            onUpdate={(email) => setSettings({ ...settings, email })}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={settings.security}
            onUpdate={(security) => setSettings({ ...settings, security })}
          />
        );
      case 'limits':
        return (
          <RateLimits
            settings={settings.limits}
            onUpdate={(limits) => setSettings({ ...settings, limits })}
          />
        );
      case 'features':
        return (
          <FeatureFlags
            settings={settings.features}
            onUpdate={(features) => setSettings({ ...settings, features })}
          />
        );
      case 'billing':
        return (
          <BillingConfiguration
            settings={settings.billing}
            onUpdate={(billing) => setSettings({ ...settings, billing })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
              <p className="text-muted-foreground">
                Configure platform-wide settings and preferences
              </p>
            </div>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          {/* Settings Categories */}
          <div className="space-y-6">
            {getSettingsCategories().map((category) => {
              const Icon = categoryIcons[category.key];

              return (
                <Card key={category.key} className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {category.label}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderSettingsComponent(category.key)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
