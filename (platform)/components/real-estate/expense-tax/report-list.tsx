'use client';

import React, { useState } from 'react';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  Share2,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Type definition (previously from mock data)
interface MockGeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  year: number;
  status: 'completed' | 'generating' | 'failed';
  dateGenerated: Date;
  fileSize: string;
  sharedWith: string[];
  formats: Array<'pdf' | 'excel'>;
}

/**
 * Report List Component
 *
 * Displays list of generated reports with:
 * - Search and filter by year/template
 * - Status badges (completed, generating, failed)
 * - Action buttons (Download, Share, Delete)
 * - Shared-with indicators
 * - Responsive table/card hybrid layout
 * - Empty state when no reports
 *
 * @client-component - Interactive table with actions
 */

interface ReportListProps {
  reports: MockGeneratedReport[];
  onDownload: (reportId: string, format: 'pdf' | 'excel') => Promise<void>;
  onShare: (reportId: string) => void;
  onDelete: (reportId: string) => Promise<void>;
}

export function ReportList({ reports, onDownload, onShare, onDelete }: ReportListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get unique years for filter
  const uniqueYears = Array.from(new Set(reports.map((r) => r.year))).sort((a, b) => b - a);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || report.year.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  const handleDownload = async (reportId: string, format: 'pdf' | 'excel') => {
    setDownloadingId(reportId);
    try {
      await onDownload(reportId, format);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    setDeletingId(reportId);
    try {
      await onDelete(reportId);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: MockGeneratedReport['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'generating':
        return (
          <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Generating
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  // Empty state
  if (reports.length === 0) {
    return (
      <EnhancedCard glassEffect="medium" neonBorder="purple" className="p-12">
        <div className="text-center space-y-3">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="text-lg font-semibold">No Reports Generated</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate your first tax report to get started
            </p>
          </div>
        </div>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Year Filter */}
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <EnhancedCard
            key={report.id}
            glassEffect="medium"
            neonBorder="none"
            hoverEffect={true}
            className="transition-all"
          >
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Report Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{report.templateName}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Year: {report.year}</span>
                      <span>•</span>
                      <span>{format(report.dateGenerated, 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{report.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Shared */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(report.status)}
                  {report.sharedWith.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{report.sharedWith.length}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Download Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={report.status !== 'completed' || downloadingId === report.id}
                      >
                        {downloadingId === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {report.formats.includes('pdf') && (
                        <DropdownMenuItem onClick={() => handleDownload(report.id, 'pdf')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                      )}
                      {report.formats.includes('excel') && (
                        <DropdownMenuItem onClick={() => handleDownload(report.id, 'excel')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Download Excel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Share Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(report.id)}
                    disabled={report.status !== 'completed'}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                  >
                    {deletingId === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        ))}
      </div>

      {/* No Results */}
      {filteredReports.length === 0 && reports.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reports match your filters</p>
        </div>
      )}
    </div>
  );
}
