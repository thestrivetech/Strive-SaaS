'use client';

import { REIDCard, REIDCardContent } from '../shared/REIDCard';

// Type definition (previously from mock data)
interface MockREIDReport {
  id: string;
  title: string;
  report_type: string;
  cities: string[];
  zip_codes: string[];
  summary: string;
  generated_at: Date;
  key_findings: string[];
  recommendations: string[];
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Download, Trash2, MapPin, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: MockREIDReport;
  onDownload: (format: string) => void;
  onDelete: () => void;
}

export function ReportCard({ report, onDownload, onDelete }: ReportCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MARKET_ANALYSIS': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'INVESTMENT_OPPORTUNITY': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'COMPARATIVE_ANALYSIS': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'TREND_FORECAST': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <REIDCard className="hover:border-blue-500/50 transition-colors">
      <REIDCardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Content */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
              </div>
              <Badge className={cn('text-xs font-semibold border', getTypeColor(report.report_type))}>
                {getTypeLabel(report.report_type)}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{report.cities.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="w-4 h-4" />
                <span>{report.zip_codes.length} markets analyzed</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 line-clamp-2">{report.summary}</p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Generated {new Date(report.generated_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{report.key_findings.length} key findings</span>
              <span>•</span>
              <span>{report.recommendations.length} recommendations</span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload('pdf')}>
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload('excel')}>
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload('powerpoint')}>
                  Download PowerPoint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </REIDCardContent>
    </REIDCard>
  );
}
