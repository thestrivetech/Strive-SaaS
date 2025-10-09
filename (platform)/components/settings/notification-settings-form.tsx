'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateNotificationPreferences } from '@/lib/modules/settings';

export function NotificationSettingsForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handlePreferenceChange = async (
    preference: string,
    value: boolean
  ) => {
    // Update local state first for immediate feedback
    if (preference === 'emailNotifications') {
      setEmailNotifications(value);
    } else if (preference === 'projectUpdates') {
      setProjectUpdates(value);
    } else if (preference === 'taskAssignments') {
      setTaskAssignments(value);
    } else if (preference === 'marketingEmails') {
      setMarketingEmails(value);
    }

    // Prepare preferences object with updated value
    const preferences = {
      emailNotifications: preference === 'emailNotifications' ? value : emailNotifications,
      projectUpdates: preference === 'projectUpdates' ? value : projectUpdates,
      taskAssignments: preference === 'taskAssignments' ? value : taskAssignments,
      marketingEmails: preference === 'marketingEmails' ? value : marketingEmails,
    };

    startTransition(async () => {
      const result = await updateNotificationPreferences(preferences);

      if (result.success) {
        toast({
          title: 'Preference Updated',
          description: 'Your notification preference has been saved.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update notification preferences',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange('emailNotifications', checked)
              }
              disabled={isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Project Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about project status changes
              </p>
            </div>
            <Switch
              checked={projectUpdates}
              onCheckedChange={(checked) =>
                handlePreferenceChange('projectUpdates', checked)
              }
              disabled={isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Task Assignments</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when tasks are assigned to you
              </p>
            </div>
            <Switch
              checked={taskAssignments}
              onCheckedChange={(checked) =>
                handlePreferenceChange('taskAssignments', checked)
              }
              disabled={isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and offers
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={(checked) =>
                handlePreferenceChange('marketingEmails', checked)
              }
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
