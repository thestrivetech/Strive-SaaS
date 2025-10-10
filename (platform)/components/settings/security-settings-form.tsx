'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  changePassword,
  enable2FA,
  disable2FA,
  revokeSession,
  revokeAllSessions,
} from '@/lib/modules/settings';
import { Key, Shield, Smartphone, Monitor, AlertTriangle } from 'lucide-react';

// Temporary type during UI development
type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface SecuritySettingsFormProps {
  sessions: any[];
  securityLog: any[];
  twoFactorEnabled: boolean;
}

export function SecuritySettingsForm({
  sessions,
  securityLog,
  twoFactorEnabled: initialTwoFactorEnabled,
}: SecuritySettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const { toast } = useToast();

  const passwordForm = useForm<ChangePasswordInput>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const result = await changePassword(data);

      if (result.success) {
        toast({
          title: 'Password changed',
          description: result.message,
        });
        passwordForm.reset();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleEnable2FA = () => {
    startTransition(async () => {
      // In real implementation, would show QR code dialog first
      const result = await enable2FA({ code: '123456' }); // Mock code

      if (result.success) {
        setTwoFactorEnabled(true);
        toast({
          title: '2FA enabled',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleDisable2FA = () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    startTransition(async () => {
      const result = await disable2FA({ password });

      if (result.success) {
        setTwoFactorEnabled(false);
        toast({
          title: '2FA disabled',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    startTransition(async () => {
      const result = await revokeSession({ sessionId });

      if (result.success) {
        toast({
          title: 'Session revoked',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRevokeAllSessions = () => {
    if (!confirm('Are you sure you want to revoke all other sessions?')) return;

    startTransition(async () => {
      const result = await revokeAllSessions();

      if (result.success) {
        toast({
          title: 'Sessions revoked',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security</p>
      </div>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password regularly to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled ? 'Currently enabled' : 'Not configured'}
                </p>
              </div>
            </div>
            <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <Separator />

          {twoFactorEnabled ? (
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isPending}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleEnable2FA} disabled={isPending}>
              Enable 2FA
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices where you are currently signed in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{session.device}</p>
                  {session.current && <Badge variant="outline">Current</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.browser} · {session.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active: {session.lastActive.toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={isPending}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}

          <Separator />

          <Button variant="outline" onClick={handleRevokeAllSessions} disabled={isPending}>
            Revoke All Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Security Log Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security Activity</CardTitle>
          <CardDescription>Recent security events on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-1">
                  {log.event === 'login_failed' ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.timestamp.toLocaleString()} · {log.device} · {log.ipAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
