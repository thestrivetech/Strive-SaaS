'use client';

import { useState, useEffect } from 'react';
import { reidReportsProvider, type MockREIDReport } from '@/lib/data';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { ReportCard } from './ReportCard';
import { MetricCard } from '../shared/MetricCard';
import { FileText, Clock, Download } from 'lucide-react';

export function ReportsClient() {
  const [reports, setReports] = useState<MockREIDReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await reidReportsProvider.findAll();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id: string, format: string) {
    console.log(`Downloading report ${id} in ${format} format`);
    // Mock download - in real app would trigger actual download
  }

  async function handleDelete(id: string) {
    try {
      await reidReportsProvider.delete(id);
      await loadReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading reports...</div>;
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
              No reports generated yet. Create your first report to get started.
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
