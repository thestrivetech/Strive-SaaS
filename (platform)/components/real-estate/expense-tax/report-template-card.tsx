'use client';

import React, { useState } from 'react';
import { EnhancedCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Loader2, FileText, Calculator, FolderTree, CalendarCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definition (previously from mock data)
interface MockReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  whatsIncluded: string[];
  estimatedTime: string;
}

/**
 * Report Template Card Component
 *
 * Displays a report template with:
 * - Template name, description, and icon
 * - What's included expandable section
 * - Year selector dropdown
 * - Generate report button with loading state
 * - Estimated generation time
 * - Responsive card design
 *
 * @client-component - Interactive form with year selection and generation
 */

interface ReportTemplateCardProps {
  template: MockReportTemplate;
  onGenerate: (templateId: string, year: number) => Promise<void>;
}

const ICON_MAP = {
  FileText,
  Calculator,
  FolderTree,
  CalendarCheck,
};

export function ReportTemplateCard({ template, onGenerate }: ReportTemplateCardProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = ICON_MAP[template.icon as keyof typeof ICON_MAP] || FileText;

  // Generate year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(template.id, selectedYear);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-3 rounded-lg',
            template.category === 'tax-form' && 'bg-blue-500/10',
            template.category === 'summary' && 'bg-green-500/10',
            template.category === 'categorization' && 'bg-purple-500/10'
          )}>
            <Icon className={cn(
              'h-6 w-6',
              template.category === 'tax-form' && 'text-blue-500',
              template.category === 'summary' && 'text-green-500',
              template.category === 'categorization' && 'text-purple-500'
            )} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Badge variant="outline" className="text-xs capitalize">
                {template.category.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* What's Included Expandable Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors">
            <span>What&apos;s Included</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'transform rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ul className="space-y-1.5">
              {template.whatsIncluded.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>

        {/* Year Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tax Year</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Estimated time: {template.estimatedTime}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate Report</>
          )}
        </Button>
      </CardFooter>
    </EnhancedCard>
  );
}
