'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Rocket } from 'lucide-react';
import { RichTextEditor } from './editor/rich-text-editor';
import { SEOPanel } from './editor/seo-panel';
import { PublishSettings } from './editor/publish-settings';
import {
  createContentItem,
  updateContentItem,
  publishContent,
} from '@/lib/modules/content/content';

interface ContentEditorProps {
  contentId?: string;
  initialContent?: any;
  organizationId: string;
}

export function ContentEditor({
  contentId,
  initialContent,
  organizationId,
}: ContentEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<any>({
    defaultValues: initialContent || {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      type: 'ARTICLE',
      status: 'DRAFT',
      language: 'en',
      keywords: [],
      gallery: [],
      organization_id: organizationId,
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);

    // Only auto-generate slug if it's empty or hasn't been manually edited
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('title'))) {
      const newSlug = generateSlug(title);
      form.setValue('slug', newSlug);
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);

    try {
      const values = form.getValues();
      const data = {
        ...values,
        status: 'DRAFT' as const,
        organization_id: organizationId,
      };

      if (contentId) {
        await updateContentItem({ ...data, id: contentId });
        toast({
          title: 'Success',
          description: 'Content saved successfully',
        });
      } else {
        const newContent = await createContentItem(data);
        toast({
          title: 'Success',
          description: 'Content created successfully',
        });
        router.push(`/real-estate/cms-marketing/content/editor/${newContent.id}`);
      }

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!contentId) {
      toast({
        title: 'Error',
        description: 'Please save the content as draft first',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);

    try {
      const scheduledFor = form.getValues('scheduled_for');

      await publishContent({
        id: contentId,
        scheduled_for: scheduledFor,
      });

      toast({
        title: 'Success',
        description: scheduledFor ? 'Content scheduled successfully' : 'Content published successfully',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish content',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    toast({
      title: 'Preview',
      description: 'Preview functionality coming soon',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {contentId ? 'Edit Content' : 'New Content'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing || !contentId}>
            <Rocket className="mr-2 h-4 w-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (70%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter content title"
                  {...form.register('title')}
                  onChange={handleTitleChange}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {String(form.formState.errors.title.message)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="content-url-slug"
                  {...form.register('slug')}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive mt-1">
                    {String(form.formState.errors.slug.message)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the content"
                  rows={3}
                  {...form.register('excerpt')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rich Text Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={form.watch('content')}
                onChange={(content) => form.setValue('content', content)}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {String(form.formState.errors.content.message)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings Tabs */}
          <Tabs defaultValue="seo">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="seo">
              <SEOPanel form={form} />
            </TabsContent>
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="featured_image">Featured Image URL</Label>
                    <Input
                      id="featured_image"
                      placeholder="https://example.com/image.jpg"
                      {...form.register('featured_image')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                      id="video_url"
                      placeholder="https://youtube.com/watch?v=..."
                      {...form.register('video_url')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar (30%) */}
        <div className="space-y-6">
          <PublishSettings form={form} />
        </div>
      </div>
    </div>
  );
}
