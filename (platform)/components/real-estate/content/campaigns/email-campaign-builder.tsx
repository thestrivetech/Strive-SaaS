'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RichTextEditor } from '../editor/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Save } from 'lucide-react';
import { format } from 'date-fns';
import { createEmailCampaign, EmailCampaignSchema } from '@/lib/modules/content/campaigns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface EmailCampaignBuilderProps {
  campaignId?: string;
  organizationId: string;
}

export function EmailCampaignBuilder({ campaignId, organizationId }: EmailCampaignBuilderProps) {
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(EmailCampaignSchema),
    defaultValues: {
      subject: '',
      preheader: '',
      fromName: '',
      fromEmail: '',
      replyTo: '',
      campaignId: campaignId || undefined,
      organizationId,
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(true);
      }

      // Ctrl/Cmd + Shift + S to send/schedule
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        onSave(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave(isDraft = true) {
    setIsSaving(true);
    try {
      const values = form.getValues();
      await createEmailCampaign({
        ...values,
        content,
        scheduledFor: isDraft ? undefined : scheduledFor,
        organizationId,
      });

      toast({
        title: isDraft ? 'Draft saved' : 'Email campaign scheduled',
        description: isDraft ? 'Email campaign saved as draft' : scheduledFor ? 'Scheduled for delivery' : 'Ready to send',
      });

      router.push('/real-estate/cms-marketing/content/campaigns');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save email campaign',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Email Campaign Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keyboard shortcuts: Ctrl+S (save draft), Ctrl+Shift+S (send/schedule)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onSave(true)}
            disabled={isSaving}
            className="min-h-[44px]"
            aria-label="Save email campaign as draft (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
            Save Draft
          </Button>

          <Button
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 min-h-[44px]"
            aria-label={`${scheduledFor ? 'Schedule' : 'Send'} email campaign (Ctrl+Shift+S)`}
          >
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            {scheduledFor ? 'Schedule' : 'Send Now'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">
                  Subject Line <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input
                  id="subject"
                  {...form.register('subject')}
                  placeholder="Your compelling subject line..."
                  maxLength={200}
                  aria-required="true"
                  aria-invalid={form.formState.errors.subject ? 'true' : 'false'}
                  aria-describedby={form.formState.errors.subject ? 'subject-error' : undefined}
                  className="min-h-[44px]"
                />
                {form.formState.errors.subject && (
                  <p id="subject-error" className="text-sm text-destructive mt-1" role="alert">
                    {String(form.formState.errors.subject.message)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="preheader">Preheader Text</Label>
                <Input
                  id="preheader"
                  {...form.register('preheader')}
                  placeholder="Preview text that appears in inbox..."
                  maxLength={150}
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">
                    From Name <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="fromName"
                    {...form.register('fromName')}
                    placeholder="Your Company"
                    aria-required="true"
                    aria-invalid={form.formState.errors.fromName ? 'true' : 'false'}
                    aria-describedby={form.formState.errors.fromName ? 'fromName-error' : undefined}
                    className="min-h-[44px]"
                  />
                  {form.formState.errors.fromName && (
                    <p id="fromName-error" className="text-sm text-destructive mt-1" role="alert">
                      {String(form.formState.errors.fromName.message)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fromEmail">
                    From Email <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="fromEmail"
                    {...form.register('fromEmail')}
                    type="email"
                    placeholder="noreply@example.com"
                    aria-required="true"
                    aria-invalid={form.formState.errors.fromEmail ? 'true' : 'false'}
                    aria-describedby={form.formState.errors.fromEmail ? 'fromEmail-error' : undefined}
                    className="min-h-[44px]"
                  />
                  {form.formState.errors.fromEmail && (
                    <p id="fromEmail-error" className="text-sm text-destructive mt-1" role="alert">
                      {String(form.formState.errors.fromEmail.message)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="replyTo">Reply To</Label>
                <Input
                  id="replyTo"
                  {...form.register('replyTo')}
                  type="email"
                  placeholder="support@example.com"
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="schedule-button">Send Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="schedule-button"
                    variant="outline"
                    className="w-full justify-start text-left mt-2 min-h-[44px]"
                    aria-label={scheduledFor ? `Scheduled for ${format(scheduledFor, 'PPP')}` : 'Send immediately'}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {scheduledFor ? format(scheduledFor, 'PPP') : 'Send immediately'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledFor}
                    onSelect={setScheduledFor}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    From: {form.watch('fromName') || 'Your Company'} &lt;{form.watch('fromEmail') || 'email@example.com'}&gt;
                  </p>
                  <h3 className="font-semibold text-lg">{form.watch('subject') || 'Subject line'}</h3>
                  {form.watch('preheader') && (
                    <p className="text-sm text-muted-foreground">{form.watch('preheader')}</p>
                  )}
                </div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content || '<p>Email content will appear here...</p>' }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
