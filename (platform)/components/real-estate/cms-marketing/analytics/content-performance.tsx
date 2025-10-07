'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Share2, MessageCircle } from 'lucide-react';

interface ContentPerformanceProps {
  data: Array<{
    id: string;
    title: string;
    type: string;
    view_count: number;
    share_count: number;
    like_count: number;
    comment_count: number;
    published_at: Date | null;
    category: { name: string } | null;
  }>;
}

export function ContentPerformance({ data }: ContentPerformanceProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No content data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">
                  <Eye className="h-4 w-4 inline-block" />
                </TableHead>
                <TableHead className="text-center">
                  <Heart className="h-4 w-4 inline-block" />
                </TableHead>
                <TableHead className="text-center">
                  <Share2 className="h-4 w-4 inline-block" />
                </TableHead>
                <TableHead className="text-center">
                  <MessageCircle className="h-4 w-4 inline-block" />
                </TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell className="text-center">{item.view_count.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.like_count.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.share_count.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {item.comment_count.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
