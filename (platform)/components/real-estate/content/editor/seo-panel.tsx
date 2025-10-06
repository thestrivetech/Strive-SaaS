'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface SEOPanelProps {
  form: UseFormReturn<any>;
}

export function SEOPanel({ form }: SEOPanelProps) {
  const metaTitle = form.watch('meta_title') || form.watch('title') || '';
  const metaDescription = form.watch('meta_description') || '';
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
          <Label htmlFor="meta_title">Meta Title</Label>
          <Input
            id="meta_title"
            {...form.register('meta_title')}
            placeholder="SEO title (max 60 chars)"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {metaTitle.length}/60 characters
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            {...form.register('meta_description')}
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
            {keywords.length > 0 ? (
              keywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No keywords added</p>
            )}
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

function calculateSEOScore(data: {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}): number {
  let score = 0;

  if (data.metaTitle && data.metaTitle.length >= 30 && data.metaTitle.length <= 60) {
    score += 30;
  }
  if (data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
    score += 30;
  }
  if (data.keywords && data.keywords.length >= 3) {
    score += 20;
  }
  if (data.keywords && data.keywords.length <= 10) {
    score += 20;
  }

  return score;
}
