'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Mail, X, UserCheck } from 'lucide-react';

/**
 * Share Report Dialog Component
 *
 * Modal dialog for sharing reports with:
 * - Email input with validation
 * - Permission selector (View Only / View & Download)
 * - Optional message textarea
 * - List of currently shared users
 * - Ability to revoke access
 * - Form validation with react-hook-form + Zod
 *
 * @client-component - Uses form state and dialog
 */

const shareReportSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  permissions: z.enum(['view', 'download'], {
    required_error: 'Please select permissions',
  }),
  message: z.string().optional(),
});

type ShareReportFormValues = z.infer<typeof shareReportSchema>;

interface ShareReportDialogProps {
  reportId: string | null;
  reportName?: string;
  currentShares: string[];
  onShare: (reportId: string, data: { email: string; permissions: 'view' | 'download'; message?: string }) => Promise<void>;
  onRevoke: (reportId: string, email: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareReportDialog({
  reportId,
  reportName,
  currentShares,
  onShare,
  onRevoke,
  isOpen,
  onClose,
}: ShareReportDialogProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);

  const form = useForm<ShareReportFormValues>({
    resolver: zodResolver(shareReportSchema),
    defaultValues: {
      permissions: 'download',
      message: '',
    },
  });

  const handleShare = async (data: ShareReportFormValues) => {
    if (!reportId) return;

    setIsSharing(true);
    try {
      await onShare(reportId, {
        email: data.email,
        permissions: data.permissions,
        message: data.message,
      });
      form.reset();
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async (email: string) => {
    if (!reportId) return;

    setRevokingEmail(email);
    try {
      await onRevoke(reportId, email);
    } finally {
      setRevokingEmail(null);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            {reportName ? `Share "${reportName}" with others` : 'Share this report with others'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleShare)} className="space-y-4">
            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="accountant@example.com"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the person you want to share with
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Permissions Selector */}
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="download">View & Download</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose what the recipient can do with this report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a message for the recipient..."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Include a note with the shared report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currently Shared With */}
            {currentShares.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Currently Shared With:</span>
                </div>
                <div className="space-y-2">
                  {currentShares.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{email}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(email)}
                        disabled={revokingEmail === email}
                      >
                        {revokingEmail === email ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSharing}>
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  'Share Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
