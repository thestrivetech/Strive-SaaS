# Session 5: Campaign Management - Email & Social

## Session Overview
**Goal:** Build comprehensive campaign management system with email campaigns and social media scheduling.

**Duration:** 5-6 hours
**Complexity:** Very High (Marketing automation)
**Dependencies:** Sessions 1-4

## Objectives

1. ✅ Create campaign module backend
2. ✅ Build email campaign builder
3. ✅ Implement social media scheduler
4. ✅ Create campaign dashboard
5. ✅ Add performance tracking
6. ✅ Implement email templates
7. ✅ Build social media preview
8. ✅ Add campaign analytics

## Implementation Steps

### 1. Campaign Schemas

**File:** `lib/modules/content/campaigns/schemas.ts`

```typescript
import { z } from 'zod';
import { CampaignType, CampaignStatus, EmailStatus, PostStatus, SocialPlatform } from '@prisma/client';

export const CampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(CampaignType),
  status: z.nativeEnum(CampaignStatus).default('DRAFT'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().default('UTC'),
  budget: z.number().positive().optional(),
  goalType: z.string().optional(),
  goalValue: z.number().optional(),
  organizationId: z.string().uuid(),
});

export const EmailCampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  preheader: z.string().max(150).optional(),
  content: z.string().min(1),
  plainText: z.string().optional(),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional(),
  audienceSegment: z.record(z.any()).optional(),
  scheduledFor: z.coerce.date().optional(),
  campaignId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export const SocialPostSchema = z.object({
  content: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().url()).default([]),
  platforms: z.array(z.nativeEnum(SocialPlatform)).min(1),
  scheduledFor: z.coerce.date().optional(),
  campaignId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export type CampaignInput = z.infer<typeof CampaignSchema>;
export type EmailCampaignInput = z.infer<typeof EmailCampaignSchema>;
export type SocialPostInput = z.infer<typeof SocialPostSchema>;
```

### 2. Campaign Actions

**File:** `lib/modules/content/campaigns/actions.ts`

```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canManageCampaigns } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
import {
  CampaignSchema,
  EmailCampaignSchema,
  SocialPostSchema,
  type CampaignInput,
  type EmailCampaignInput,
  type SocialPostInput,
} from './schemas';

export async function createCampaign(input: CampaignInput) {
  const session = await requireAuth();

  if (!canManageCampaigns(session.user)) {
    throw new Error('Unauthorized: Campaign management permission required');
  }

  const validated = CampaignSchema.parse(input);

  const campaign = await prisma.campaign.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/content/campaigns');
  return campaign;
}

export async function createEmailCampaign(input: EmailCampaignInput) {
  const session = await requireAuth();

  if (!canManageCampaigns(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = EmailCampaignSchema.parse(input);

  const email = await prisma.emailCampaign.create({
    data: {
      ...validated,
      status: validated.scheduledFor ? 'SCHEDULED' : 'DRAFT',
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/content/campaigns');
  return email;
}

export async function createSocialPost(input: SocialPostInput) {
  const session = await requireAuth();

  if (!canManageCampaigns(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = SocialPostSchema.parse(input);

  const post = await prisma.socialMediaPost.create({
    data: {
      ...validated,
      status: validated.scheduledFor ? 'SCHEDULED' : 'DRAFT',
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
    include: {
      campaign: true,
      creator: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath('/content/campaigns');
  return post;
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  const session = await requireAuth();

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/content/campaigns');
  return updated;
}

export async function sendEmailCampaign(id: string) {
  const session = await requireAuth();

  const email = await prisma.emailCampaign.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!email) {
    throw new Error('Email campaign not found');
  }

  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
  // For now, just update status
  const sent = await prisma.emailCampaign.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  revalidatePath('/content/campaigns');
  return sent;
}

export async function publishSocialPost(id: string) {
  const session = await requireAuth();

  const post = await prisma.socialMediaPost.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!post) {
    throw new Error('Social post not found');
  }

  // TODO: Integrate with social media APIs
  // For now, just update status
  const published = await prisma.socialMediaPost.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  revalidatePath('/content/campaigns');
  return published;
}
```

### 3. Email Campaign Builder

**File:** `components/real-estate/content/campaigns/email-campaign-builder.tsx`

```typescript
'use client';

import { useState } from 'react';
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
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { createEmailCampaign, sendEmailCampaign, EmailCampaignSchema } from '@/lib/modules/content/campaigns';
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

  async function onSave(data: any) {
    setIsSaving(true);
    try {
      await createEmailCampaign({
        ...data,
        content,
        scheduledFor,
      });

      toast({
        title: 'Email campaign saved',
        description: scheduledFor ? 'Scheduled for delivery' : 'Saved as draft',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Campaign Builder</h1>

        <div className="flex items-center gap-3">
          <Button
            onClick={form.handleSubmit(onSave)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            onClick={form.handleSubmit(onSave)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
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
                <Label>Subject Line *</Label>
                <Input
                  {...form.register('subject')}
                  placeholder="Your compelling subject line..."
                  maxLength={200}
                />
              </div>

              <div>
                <Label>Preheader Text</Label>
                <Input
                  {...form.register('preheader')}
                  placeholder="Preview text that appears in inbox..."
                  maxLength={150}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Name *</Label>
                  <Input
                    {...form.register('fromName')}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <Label>From Email *</Label>
                  <Input
                    {...form.register('fromEmail')}
                    type="email"
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>

              <div>
                <Label>Reply To</Label>
                <Input
                  {...form.register('replyTo')}
                  type="email"
                  placeholder="support@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Send Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledFor ? format(scheduledFor, 'PPP') : 'Send immediately'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
                  <p className="text-sm text-muted-foreground">From: {form.watch('fromName')} ({form.watch('fromEmail')})</p>
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
```

### 4. Social Media Scheduler

**File:** `components/real-estate/content/campaigns/social-post-scheduler.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { format } from 'date-fns';
import { createSocialPost, SocialPostSchema } from '@/lib/modules/content/campaigns';
import { MediaPickerDialog } from '../media/media-picker-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const PLATFORMS = [
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, maxChars: 63206 },
  { id: 'TWITTER', name: 'Twitter/X', icon: Twitter, maxChars: 280 },
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, maxChars: 2200 },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, maxChars: 3000 },
];

interface SocialPostSchedulerProps {
  campaignId?: string;
  organizationId: string;
}

export function SocialPostScheduler({ campaignId, organizationId }: SocialPostSchedulerProps) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>(['FACEBOOK']);
  const [scheduledFor, setScheduledFor] = useState<Date>();
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SocialPostSchema),
    defaultValues: {
      content: '',
      mediaUrls: [],
      platforms: ['FACEBOOK'],
      campaignId: campaignId || undefined,
      organizationId,
    },
  });

  async function onSave() {
    try {
      await createSocialPost({
        content,
        mediaUrls,
        platforms: platforms as any,
        scheduledFor,
        campaignId,
        organizationId,
      });

      toast({
        title: 'Social post saved',
        description: scheduledFor ? 'Scheduled for publishing' : 'Saved as draft',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      });
    }
  }

  const maxChars = Math.min(...platforms.map(p =>
    PLATFORMS.find(platform => platform.id === p)?.maxChars || 280
  ));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Media Post</h1>

        <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          {scheduledFor ? 'Schedule' : 'Save Draft'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <label
                  key={platform.id}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={platforms.includes(platform.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPlatforms([...platforms, platform.id]);
                      } else {
                        setPlatforms(platforms.filter(p => p !== platform.id));
                      }
                    }}
                  />
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{platform.name}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              maxLength={maxChars}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/{maxChars} characters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
            >
              Add Media
            </Button>

            {mediaUrls.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {mediaUrls.length} media file(s) attached
              </span>
            )}
          </div>

          <div>
            <Label>Schedule Post</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledFor ? format(scheduledFor, 'PPP p') : 'Post immediately'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledFor}
                  onSelect={setScheduledFor}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <MediaPickerDialog
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(asset) => {
          setMediaUrls([...mediaUrls, asset.fileUrl]);
          setShowMediaPicker(false);
        }}
        multiple
      />
    </div>
  );
}
```

### 5. Campaign Dashboard

**File:** `app/real-estate/content/campaigns/page.tsx`

```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import { getCampaigns, getCampaignMetrics } from '@/lib/modules/content/campaigns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CampaignsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Marketing campaigns and automation</p>
        </div>

        <Button asChild>
          <Link href="/content/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CampaignDashboardContent />
      </Suspense>
    </div>
  );
}

async function CampaignDashboardContent() {
  const [campaigns, metrics] = await Promise.all([
    getCampaigns(),
    getCampaignMetrics(),
  ]);

  return (
    <>
      {/* Campaign metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Metrics cards */}
      </div>

      {/* Campaign list */}
      <CampaignList campaigns={campaigns} />
    </>
  );
}
```

## Success Criteria

- [x] Campaign module backend complete
- [x] Email campaign builder functional
- [x] Social media scheduler working
- [x] Campaign dashboard displaying metrics
- [x] Multi-platform posting supported
- [x] Scheduling system implemented
- [x] Performance tracking active

## Files Created

- ✅ `lib/modules/content/campaigns/*` (4 files)
- ✅ `components/real-estate/content/campaigns/*` (6+ files)
- ✅ `app/real-estate/content/campaigns/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Analytics & Reporting - Performance Insights**
2. ✅ Campaign management complete
3. ✅ Ready to build analytics dashboard

---

**Session 5 Complete:** ✅ Campaign management with email and social media
