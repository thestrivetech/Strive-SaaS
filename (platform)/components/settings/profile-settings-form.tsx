'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, uploadAvatar, updatePreferences } from '@/lib/modules/settings';

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface ProfileSettingsFormProps {
  initialUser: ProfileData;
}

export function ProfileSettingsForm({ initialUser }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Profile form state
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser?.avatar_url || '');

  // Preferences state
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateProfile({
        name,
        email,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your profile has been updated.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await uploadAvatar(formData);

      if (result.success && result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        toast({
          title: 'Success',
          description: 'Your avatar has been updated.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to upload avatar',
          variant: 'destructive',
        });
      }
    });
  };

  const handlePreferenceChange = async (
    preference: string,
    value: boolean
  ) => {
    // Update local state first for immediate feedback
    if (preference === 'theme') {
      setDarkMode(value);
    } else if (preference === 'compactView') {
      setCompactView(value);
    } else if (preference === 'sidebarCollapsed') {
      setSidebarCollapsed(value);
    }

    const preferences = {
      theme: (preference === 'theme' ? (value ? 'dark' : 'light') : (darkMode ? 'dark' : 'light')) as 'dark' | 'light' | 'system',
      compactView: preference === 'compactView' ? value : compactView,
      sidebarCollapsed: preference === 'sidebarCollapsed' ? value : sidebarCollapsed,
    };

    startTransition(async () => {
      const result = await updatePreferences(preferences);

      if (result.success) {
        toast({
          title: 'Preference Updated',
          description: 'Your preference has been saved.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update preferences',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleProfileSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  {name?.substring(0, 2).toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isPending}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {isPending ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={initialUser?.role || ''}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme across the platform
              </p>
            </div>
            <Switch
              id="theme"
              checked={darkMode}
              onCheckedChange={(checked) => handlePreferenceChange('theme', checked)}
              disabled={isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="compact">Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Show more content with reduced spacing
              </p>
            </div>
            <Switch
              id="compact"
              checked={compactView}
              onCheckedChange={(checked) => handlePreferenceChange('compactView', checked)}
              disabled={isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sidebar">Sidebar Collapsed</Label>
              <p className="text-sm text-muted-foreground">
                Start with sidebar collapsed by default
              </p>
            </div>
            <Switch
              id="sidebar"
              checked={sidebarCollapsed}
              onCheckedChange={(checked) => handlePreferenceChange('sidebarCollapsed', checked)}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
