'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Calendar } from 'lucide-react';

interface PublishSettingsProps {
  form: UseFormReturn<any>;
  compact?: boolean;
}

export function PublishSettings({ form, compact = false }: PublishSettingsProps) {
  const status = form.watch('status');

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publish Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusSelector form={form} />
          <TypeSelector form={form} />
          {status === 'SCHEDULED' && <ScheduleDatePicker form={form} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusSelector form={form} />
        <TypeSelector form={form} />
        {status === 'SCHEDULED' && <ScheduleDatePicker form={form} />}
        <LanguageSelector form={form} />
      </CardContent>
    </Card>
  );
}

function StatusSelector({ form }: { form: UseFormReturn<any> }) {
  return (
    <div>
      <Label htmlFor="status">Status</Label>
      <Select
        value={form.watch('status')}
        onValueChange={(value) => form.setValue('status', value)}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="REVIEW">In Review</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="ARCHIVED">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function TypeSelector({ form }: { form: UseFormReturn<any> }) {
  return (
    <div>
      <Label htmlFor="type">Content Type</Label>
      <Select
        value={form.watch('type')}
        onValueChange={(value) => form.setValue('type', value)}
      >
        <SelectTrigger id="type">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ARTICLE">Article</SelectItem>
          <SelectItem value="BLOG_POST">Blog Post</SelectItem>
          <SelectItem value="PAGE">Page</SelectItem>
          <SelectItem value="LANDING_PAGE">Landing Page</SelectItem>
          <SelectItem value="CASE_STUDY">Case Study</SelectItem>
          <SelectItem value="WHITEPAPER">Whitepaper</SelectItem>
          <SelectItem value="PRESS_RELEASE">Press Release</SelectItem>
          <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
          <SelectItem value="EMAIL_TEMPLATE">Email Template</SelectItem>
          <SelectItem value="SOCIAL_POST">Social Post</SelectItem>
          <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
          <SelectItem value="TEMPLATE">Template</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ScheduleDatePicker({ form }: { form: UseFormReturn<any> }) {
  return (
    <div>
      <Label htmlFor="scheduled_for">Schedule For</Label>
      <div className="relative">
        <Input
          id="scheduled_for"
          type="datetime-local"
          {...form.register('scheduled_for')}
          className="pl-10"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function LanguageSelector({ form }: { form: UseFormReturn<any> }) {
  return (
    <div>
      <Label htmlFor="language">Language</Label>
      <Select
        value={form.watch('language')}
        onValueChange={(value) => form.setValue('language', value)}
      >
        <SelectTrigger id="language">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Spanish</SelectItem>
          <SelectItem value="fr">French</SelectItem>
          <SelectItem value="de">German</SelectItem>
          <SelectItem value="it">Italian</SelectItem>
          <SelectItem value="pt">Portuguese</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
