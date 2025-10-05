'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentSource = searchParams.get('source') || 'all';
  const currentScore = searchParams.get('score') || 'all';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset to page 1 when filtering
    params.delete('page');

    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    router.push(`?${params.toString()}`);
  }

  const hasActiveFilters = currentStatus !== 'all' || currentSource !== 'all' || currentScore !== 'all';

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={currentStatus} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="NEW_LEAD">New Lead</SelectItem>
          <SelectItem value="IN_CONTACT">In Contact</SelectItem>
          <SelectItem value="QUALIFIED">Qualified</SelectItem>
          <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
          <SelectItem value="CONVERTED">Converted</SelectItem>
          <SelectItem value="LOST">Lost</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentSource} onValueChange={(value) => updateFilter('source', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="WEBSITE">Website</SelectItem>
          <SelectItem value="REFERRAL">Referral</SelectItem>
          <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
          <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
          <SelectItem value="COLD_CALL">Cold Call</SelectItem>
          <SelectItem value="EMAIL_CAMPAIGN">Email Campaign</SelectItem>
          <SelectItem value="EVENT">Event</SelectItem>
          <SelectItem value="PARTNER">Partner</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentScore} onValueChange={(value) => updateFilter('score', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Scores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Scores</SelectItem>
          <SelectItem value="HOT">🔥 Hot</SelectItem>
          <SelectItem value="WARM">🌡️ Warm</SelectItem>
          <SelectItem value="COLD">❄️ Cold</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
