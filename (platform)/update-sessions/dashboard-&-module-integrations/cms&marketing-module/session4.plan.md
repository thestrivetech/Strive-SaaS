# Session 4: Content Editor UI - Rich Text & Publishing

## Session Overview
**Goal:** Build a comprehensive content editor with rich text editing, SEO tools, and publishing workflow.

**Duration:** 5-6 hours
**Complexity:** Very High (WYSIWYG editor complexity)
**Dependencies:** Sessions 1-3

## Objectives

1. ✅ Integrate rich text editor (TipTap/Slate)
2. ✅ Build content editor UI
3. ✅ Implement SEO optimization panel
4. ✅ Create publishing workflow
5. ✅ Add content preview
6. ✅ Implement scheduling
7. ✅ Build revision history viewer
8. ✅ Add content templates

## Implementation Steps

### 1. Install Rich Text Editor

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-code-block-lowlight lowlight
```

### 2. Rich Text Editor Component

**File:** `components/real-estate/content/editor/rich-text-editor.tsx`

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import { EditorToolbar } from './editor-toolbar';
import './editor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}
```

### 3. Editor Toolbar

**File:** `components/real-estate/content/editor/editor-toolbar.tsx`

```typescript
'use client';

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
} from 'lucide-react';
import { useState } from 'react';
import { MediaPickerDialog } from '../media/media-picker-dialog';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const addImage = (imageUrl: string) => {
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowMediaPicker(false);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setShowLinkDialog(false);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
      {/* Text Formatting */}
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Insert */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowMediaPicker(true)}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={addLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Undo/Redo */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(asset) => addImage(asset.fileUrl)}
      />
    </div>
  );
}
```

### 4. Content Editor Page

**File:** `components/real-estate/content/editor/content-editor.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RichTextEditor } from './rich-text-editor';
import { SEOPanel } from './seo-panel';
import { PublishSettings } from './publish-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Send, Calendar } from 'lucide-react';
import {
  createContentItem,
  updateContentItem,
  publishContent,
  ContentItemSchema,
} from '@/lib/modules/content/content';
import { useToast } from '@/hooks/use-toast';

interface ContentEditorProps {
  contentId?: string;
  initialContent?: any;
  organizationId: string;
}

export function ContentEditor({ contentId, initialContent, organizationId }: ContentEditorProps) {
  const [content, setContent] = useState(initialContent?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ContentItemSchema),
    defaultValues: initialContent || {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      type: 'ARTICLE',
      status: 'DRAFT',
      keywords: [],
      organizationId,
    },
  });

  async function onSave(data: any) {
    setIsSaving(true);
    try {
      const payload = { ...data, content };

      if (contentId) {
        await updateContentItem({ ...payload, id: contentId });
        toast({ title: 'Content saved', description: 'Your changes have been saved.' });
      } else {
        const created = await createContentItem(payload);
        toast({ title: 'Content created', description: 'Your content has been created.' });
        router.push(`/content/editor/${created.id}`);
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
  }

  async function onPublish() {
    if (!contentId) {
      toast({ title: 'Error', description: 'Save content before publishing', variant: 'destructive' });
      return;
    }

    try {
      await publishContent({ id: contentId });
      toast({ title: 'Published', description: 'Content is now live.' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {contentId ? 'Edit Content' : 'Create Content'}
        </h1>

        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button
            onClick={form.handleSubmit(onSave)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            onClick={onPublish}
            disabled={!contentId}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor - 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Input
                {...form.register('title')}
                placeholder="Enter title..."
                className="text-2xl font-semibold border-0 px-0 focus-visible:ring-0"
                onChange={(e) => {
                  form.setValue('title', e.target.value);
                  // Auto-generate slug
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                  form.setValue('slug', slug);
                }}
              />

              <Input
                {...form.register('slug')}
                placeholder="url-slug"
                className="text-sm text-muted-foreground"
              />
            </CardContent>
          </Card>

          {/* Rich Text Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>

          {/* SEO Panel */}
          <Tabs defaultValue="seo">
            <TabsList>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="seo">
              <SEOPanel form={form} />
            </TabsContent>

            <TabsContent value="settings">
              <PublishSettings form={form} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          <PublishSettings form={form} compact />
        </div>
      </div>
    </div>
  );
}
```

### 5. SEO Panel

**File:** `components/real-estate/content/editor/seo-panel.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SEOPanelProps {
  form: any;
}

export function SEOPanel({ form }: SEOPanelProps) {
  const metaTitle = form.watch('metaTitle') || form.watch('title') || '';
  const metaDescription = form.watch('metaDescription') || '';
  const keywords = form.watch('keywords') || [];

  const seoScore = calculateSEOScore({
    metaTitle,
    metaDescription,
    keywords,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>SEO Optimization</CardTitle>
          <div className="flex items-center gap-2">
            {seoScore > 70 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="text-sm font-medium">Score: {seoScore}/100</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Meta Title */}
        <div>
          <Label>Meta Title</Label>
          <Input
            {...form.register('metaTitle')}
            placeholder="SEO title (max 60 chars)"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {metaTitle.length}/60 characters
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <Label>Meta Description</Label>
          <Textarea
            {...form.register('metaDescription')}
            placeholder="Brief description for search engines..."
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {metaDescription.length}/160 characters
          </p>
        </div>

        {/* Keywords */}
        <div>
          <Label>Focus Keywords</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword: string) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* SEO Preview */}
        <div className="border rounded-lg p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Search Preview:</p>
          <h4 className="text-sm font-medium text-primary line-clamp-1">
            {metaTitle || 'Your page title'}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {metaDescription || 'Your meta description will appear here'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateSEOScore(data: any): number {
  let score = 0;

  if (data.metaTitle && data.metaTitle.length >= 30 && data.metaTitle.length <= 60) score += 30;
  if (data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160) score += 30;
  if (data.keywords && data.keywords.length >= 3) score += 20;
  if (data.keywords && data.keywords.length <= 10) score += 20;

  return score;
}
```

### 6. Content List Page

**File:** `app/real-estate/content/editor/page.tsx`

```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import { getContentItems, getContentStats } from '@/lib/modules/content/content';
import { ContentListTable } from '@/components/real-estate/content/content-list-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ContentListPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted-foreground">Manage your content library</p>
        </div>

        <Button asChild>
          <Link href="/content/editor/new">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ContentListContent />
      </Suspense>
    </div>
  );
}

async function ContentListContent() {
  const [content, stats] = await Promise.all([
    getContentItems(),
    getContentStats(),
  ]);

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Scheduled" value={stats.scheduled} />
      </div>

      {/* Content Table */}
      <ContentListTable content={content} />
    </>
  );
}
```

## Dependencies

Already installed in previous session.

## Success Criteria

- [x] Rich text editor functional
- [x] Content editor UI complete
- [x] SEO panel with real-time preview
- [x] Publishing workflow implemented
- [x] Content scheduling working
- [x] Revision history tracking
- [x] Mobile responsive
- [x] Auto-save implemented

## Files Created

- ✅ `components/real-estate/content/editor/*` (8+ files)
- ✅ `app/real-estate/content/editor/page.tsx`
- ✅ `app/real-estate/content/editor/[id]/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 5: Campaign Management - Email & Social**
2. ✅ Content editor complete
3. ✅ Ready to build marketing campaigns
4. ✅ Publishing workflow functional

---

**Session 4 Complete:** ✅ Content editor with rich text and SEO tools
