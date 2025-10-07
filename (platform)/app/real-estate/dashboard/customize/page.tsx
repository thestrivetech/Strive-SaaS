import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layout, Palette, Sliders, Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/auth-helpers';

export const metadata: Metadata = {
  title: 'Customize Dashboard | Strive Platform',
  description: 'Personalize your dashboard layout and widgets',
};

/**
 * Dashboard Customization Page
 *
 * Allows users to customize their dashboard layout, widgets, and preferences
 * Currently displays placeholder UI - to be implemented in future sessions
 *
 * @protected - Requires authentication via layout
 */
export default async function CustomizeDashboardPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/real-estate/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Customize Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Personalize your dashboard layout and widgets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Available Widgets</CardTitle>
              </div>
              <CardDescription>
                Drag and drop widgets to customize your dashboard layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Widget customization will be available in a future update.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'KPI Cards', icon: Layout },
                    { name: 'Activity Feed', icon: Layout },
                    { name: 'Quick Actions', icon: Layout },
                    { name: 'Metrics', icon: Layout },
                  ].map((widget) => {
                    const Icon = widget.icon;
                    return (
                      <div
                        key={widget.name}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                      >
                        <Icon className="h-6 w-6 mb-2 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {widget.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle>Dashboard Theme</CardTitle>
              </div>
              <CardDescription>
                Configure your dashboard appearance and theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Theme customization will be available in a future update.
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Light Mode', description: 'Clean and bright' },
                    { name: 'Dark Mode', description: 'Easy on the eyes' },
                    { name: 'System Default', description: 'Matches your device' },
                  ].map((theme) => (
                    <div
                      key={theme.name}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-green-600" />
                <CardTitle>Layout Options</CardTitle>
              </div>
              <CardDescription>
                Choose your preferred dashboard layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Layout options will be available in a future update.
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Compact', description: 'Dense information display' },
                    { name: 'Comfortable', description: 'Balanced spacing' },
                    { name: 'Spacious', description: 'More breathing room' },
                  ].map((layout) => (
                    <div
                      key={layout.name}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {layout.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {layout.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-orange-600" />
                <CardTitle>Advanced Settings</CardTitle>
              </div>
              <CardDescription>
                Configure advanced dashboard preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Advanced settings will be available in a future update.
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Auto-refresh', description: 'Automatically update data' },
                    { name: 'Notifications', description: 'Desktop notifications' },
                    { name: 'Data density', description: 'Control information density' },
                  ].map((setting) => (
                    <div
                      key={setting.name}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {setting.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Customization Coming Soon
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Dashboard customization features are currently in development. You&apos;ll soon be
                  able to personalize your dashboard with drag-and-drop widgets, custom themes,
                  and layout options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
