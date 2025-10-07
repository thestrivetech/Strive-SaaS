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
import { CalendarIcon, Send, Save, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { format } from 'date-fns';
import { createSocialPost, SocialPostSchema } from '@/lib/modules/content/campaigns';
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
  const [isSaving, setIsSaving] = useState(false);
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

  async function onSave(isDraft = true) {
    setIsSaving(true);
    try {
      if (platforms.length === 0) {
        throw new Error('Please select at least one platform');
      }

      if (!content.trim()) {
        throw new Error('Post content is required');
      }

      await createSocialPost({
        content,
        mediaUrls,
        platforms: platforms as any,
        scheduledFor: isDraft ? undefined : scheduledFor,
        campaignId,
        organizationId,
      });

      toast({
        title: isDraft ? 'Draft saved' : 'Post scheduled',
        description: isDraft ? 'Social post saved as draft' : scheduledFor ? 'Scheduled for publishing' : 'Ready to publish',
      });

      router.push('/real-estate/cms-marketing/content/campaigns');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save social post',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const maxChars = Math.min(...platforms.map(p =>
    PLATFORMS.find(platform => platform.id === p)?.maxChars || 280
  ));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Media Post</h1>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onSave(true)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {scheduledFor ? 'Schedule' : 'Post Now'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = platforms.includes(platform.id);

              return (
                <label
                  key={platform.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
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
              {platforms.length > 1 && ' (limited by shortest platform)'}
            </p>
          </div>

          <div>
            <Label>Media URLs (Optional)</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    setMediaUrls([...mediaUrls, value]);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button
                      onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                      className="text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Schedule Post</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start mt-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Posting to:</span>
                {platforms.map(p => {
                  const platform = PLATFORMS.find(pl => pl.id === p);
                  if (!platform) return null;
                  const Icon = platform.icon;
                  return <Icon key={p} className="h-4 w-4" />;
                })}
              </div>
              <p className="whitespace-pre-wrap">{content || 'Your post content will appear here...'}</p>
              {mediaUrls.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  📎 {mediaUrls.length} media file(s) attached
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Input({ ...props }) {
  return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
}
