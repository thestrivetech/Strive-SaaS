'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
              const categorySettings = settings[category.key] as any;

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
                    {/* General Settings */}
                    {category.key === 'general' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="platform_name">Platform Name</Label>
                            <Input
                              id="platform_name"
                              value={categorySettings.platform_name}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  general: { ...settings.general, platform_name: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="support_email">Support Email</Label>
                            <Input
                              id="support_email"
                              type="email"
                              value={categorySettings.support_email}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  general: { ...settings.general, support_email: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary_domain">Primary Domain</Label>
                          <Input
                            id="primary_domain"
                            value={categorySettings.primary_domain}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                general: { ...settings.general, primary_domain: e.target.value },
                              })
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
                            checked={categorySettings.maintenance_mode}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                general: { ...settings.general, maintenance_mode: checked },
                              })
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
                            checked={categorySettings.allow_signups}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                general: { ...settings.general, allow_signups: checked },
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* Email Settings */}
                    {category.key === 'email' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input
                              id="smtp_host"
                              value={categorySettings.smtp_host}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  email: { ...settings.email, smtp_host: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input
                              id="smtp_port"
                              type="number"
                              value={categorySettings.smtp_port}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  email: { ...settings.email, smtp_port: Number(e.target.value) },
                                })
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
                              value={categorySettings.from_email}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  email: { ...settings.email, from_email: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                              id="from_name"
                              value={categorySettings.from_name}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  email: { ...settings.email, from_name: e.target.value },
                                })
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
                            checked={categorySettings.smtp_secure}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                email: { ...settings.email, smtp_secure: checked },
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* Security Settings */}
                    {category.key === 'security' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                            <Input
                              id="max_login_attempts"
                              type="number"
                              value={categorySettings.max_login_attempts}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  security: {
                                    ...settings.security,
                                    max_login_attempts: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                            <Input
                              id="lockout_duration"
                              type="number"
                              value={categorySettings.lockout_duration}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  security: {
                                    ...settings.security,
                                    lockout_duration: Number(e.target.value),
                                  },
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
                            value={categorySettings.password_min_length}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                security: {
                                  ...settings.security,
                                  password_min_length: Number(e.target.value),
                                },
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
                            checked={categorySettings.require_2fa_for_admins}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                security: { ...settings.security, require_2fa_for_admins: checked },
                              })
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
                            checked={categorySettings.require_2fa_for_all}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                security: { ...settings.security, require_2fa_for_all: checked },
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {/* Limits Settings */}
                    {category.key === 'limits' && (
                      <>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_orgs_per_user">Max Organizations per User</Label>
                            <Input
                              id="max_orgs_per_user"
                              type="number"
                              value={categorySettings.max_orgs_per_user}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  limits: {
                                    ...settings.limits,
                                    max_orgs_per_user: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max_file_upload_size">Max File Upload Size (MB)</Label>
                            <Input
                              id="max_file_upload_size"
                              type="number"
                              value={categorySettings.max_file_upload_size}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  limits: {
                                    ...settings.limits,
                                    max_file_upload_size: Number(e.target.value),
                                  },
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
                              value={categorySettings.max_api_requests_per_minute}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  limits: {
                                    ...settings.limits,
                                    max_api_requests_per_minute: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Features Settings */}
                    {category.key === 'features' && (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>AI Assistant</Label>
                              <p className="text-sm text-muted-foreground">
                                Enable AI-powered assistant platform-wide
                              </p>
                            </div>
                            <Switch
                              checked={categorySettings.enable_ai_assistant}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  features: { ...settings.features, enable_ai_assistant: checked },
                                })
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
                              checked={categorySettings.enable_marketplace}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  features: { ...settings.features, enable_marketplace: checked },
                                })
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
                              checked={categorySettings.enable_analytics}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  features: { ...settings.features, enable_analytics: checked },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Webhooks</Label>
                              <p className="text-sm text-muted-foreground">Enable webhook support</p>
                            </div>
                            <Switch
                              checked={categorySettings.enable_webhooks}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  features: { ...settings.features, enable_webhooks: checked },
                                })
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
                              checked={categorySettings.enable_api_access}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  features: { ...settings.features, enable_api_access: checked },
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Billing Settings */}
                    {category.key === 'billing' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trial_period_days">Trial Period (days)</Label>
                            <Input
                              id="trial_period_days"
                              type="number"
                              value={categorySettings.trial_period_days}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  billing: {
                                    ...settings.billing,
                                    trial_period_days: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grace_period_days">Grace Period (days)</Label>
                            <Input
                              id="grace_period_days"
                              type="number"
                              value={categorySettings.grace_period_days}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  billing: {
                                    ...settings.billing,
                                    grace_period_days: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                          <Input
                            id="invoice_prefix"
                            value={categorySettings.invoice_prefix}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                billing: { ...settings.billing, invoice_prefix: e.target.value },
                              })
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
                            checked={categorySettings.stripe_enabled}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                billing: { ...settings.billing, stripe_enabled: checked },
                              })
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
                            checked={categorySettings.dunning_enabled}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                billing: { ...settings.billing, dunning_enabled: checked },
                              })
                            }
                          />
                        </div>
                      </>
                    )}
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
