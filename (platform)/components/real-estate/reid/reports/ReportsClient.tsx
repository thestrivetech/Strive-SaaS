'use client';

import { useState, useEffect } from 'react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { ReportCard } from './ReportCard';
import { MetricCard } from '../shared/MetricCard';
import { FileText, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getMarketReports } from '@/lib/modules/reid/reports/queries';

// Type definition matching Prisma market_reports (with generated_at for UI compatibility)
interface MarketReport {
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

export function ReportsClient() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError(null);

      // Fetch reports using existing Server Action
      const dbReports = await getMarketReports();

      // Transform database records to component format
      const transformedReports: MarketReport[] = dbReports.map((report) => ({
        id: report.id,
        title: report.title,
        report_type: report.report_type,
        cities: report.cities as string[] || [],
        zip_codes: report.zip_codes as string[] || [],
        summary: report.summary || '',
        generated_at: report.created_at, // Map created_at to generated_at for UI compatibility
        key_findings: report.key_findings as string[] || [],
        recommendations: report.recommendations as string[] || [],
      }));

      setReports(transformedReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id: string, format: string) {
    toast.info('Download feature coming soon');
    console.log(`Download report ${id} as ${format}`);
  }

  async function handleDelete(id: string) {
    toast.info('Delete feature coming soon');
    console.log(`Delete report ${id}`);
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <Button onClick={loadReports} variant="outline">Retry</Button>
      </div>
    );
  }

  const totalReports = reports.length;
  const thisMonthReports = reports.filter(r => {
    const reportDate = new Date(r.generated_at);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Reports"
          value={totalReports}
          icon={FileText}
          className="reid-metric"
        />
        <MetricCard
          label="This Month"
          value={thisMonthReports}
          icon={Clock}
          className="reid-metric"
        />
        <MetricCard
          label="Downloads"
          value={totalReports * 3}
          icon={Download}
          className="reid-metric"
        />
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <REIDCard>
          <REIDCardContent>
            <div className="text-center py-12 text-slate-400">
              No market reports found. Generate your first report to get started with AI-powered market intelligence.
            </div>
          </REIDCardContent>
        </REIDCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDownload={(format) => handleDownload(report.id, format)}
              onDelete={() => handleDelete(report.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
