'use client';

import { useState, useEffect } from 'react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { MetricCard } from '../shared/MetricCard';
import { SchoolComparisonDialog } from './SchoolComparisonDialog';
import { GraduationCap, Star, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getSchoolsData } from '@/lib/modules/reid/insights/queries';

// Type definition for school display format
interface MockSchool {
  id: string;
  name: string;
  district: string;
  type: string;
  rating: number;
  test_scores: number;
  student_count: number;
  teacher_ratio: number;
  grade_levels: string;
  distance_miles: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export function SchoolsClient() {
  const [schools, setSchools] = useState<MockSchool[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<MockSchool[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<MockSchool[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [distanceFilter, setDistanceFilter] = useState<number>(10);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schools, searchQuery, typeFilter, ratingFilter, distanceFilter]);

  async function loadSchools() {
    try {
      setLoading(true);
      setError(null);

      // Fetch neighborhood insights with school data
      const insights = await getSchoolsData({
        sortBy: 'school_rating',
        sortOrder: 'desc'
      });

      // Transform neighborhood_insights to school display format
      const schoolsFromInsights: MockSchool[] = insights.map((insight) => {
        // Default school type based on area characteristics
        // In real implementation, this would be derived from additional data
        const schoolType = 'PUBLIC';

        // Calculate test scores from school rating (convert 0-10 to percentage-like score)
        const test_scores = insight.school_rating ? Math.round(insight.school_rating * 10) : 85;

        // Use households as proxy for student count (average school per neighborhood)
        const student_count = insight.households ? Math.min(insight.households, 1500) : 500;

        return {
          id: insight.id,
          name: insight.area_name,
          district: insight.county || 'Unknown District',
          type: schoolType,
          rating: insight.school_rating || 0,
          test_scores,
          student_count,
          teacher_ratio: 15, // Default ratio
          grade_levels: 'K-12',
          distance_miles: 0, // Would need user location to calculate
          address: insight.area_name,
          city: insight.city || '',
          state: insight.state || '',
          zip_code: insight.zip_code || ''
        };
      });

      setSchools(schoolsFromInsights);
    } catch (err) {
      console.error('Failed to load schools:', err);
      setError(err instanceof Error ? err.message : 'Failed to load school data');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...schools];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(s => s.rating >= ratingFilter);
    }

    // Distance filter
    filtered = filtered.filter(s => s.distance_miles <= distanceFilter);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.district.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query)
      );
    }

    setFilteredSchools(filtered);
  }

  function toggleSchoolSelection(school: MockSchool) {
    if (selectedSchools.find(s => s.id === school.id)) {
      setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
    } else if (selectedSchools.length < 3) {
      setSelectedSchools([...selectedSchools, school]);
    }
  }

  function handleCompare() {
    if (selectedSchools.length >= 2) {
      setShowComparison(true);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading schools...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <Button onClick={loadSchools} variant="outline">Retry</Button>
      </div>
    );
  }

  const totalSchools = schools.length;
  const avgRating = schools.length > 0
    ? (schools.reduce((sum, s) => sum + s.rating, 0) / schools.length).toFixed(1)
    : '0.0';
  const topRatedCount = schools.filter(s => s.rating >= 9).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Schools Analyzed" value={totalSchools} icon={GraduationCap} className="reid-metric" />
        <MetricCard label="Average Rating" value={avgRating} icon={Star} className="reid-metric" />
        <MetricCard label="Top Rated (9+)" value={topRatedCount} icon={Award} className="reid-metric" />
      </div>

      {/* Filters & Actions */}
      <REIDCard>
        <REIDCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Filter Schools</h3>
            {selectedSchools.length >= 2 && (
              <Button onClick={handleCompare} size="sm" className="bg-green-600 hover:bg-green-700">
                Compare ({selectedSchools.length})
              </Button>
            )}
          </div>
        </REIDCardHeader>
        <REIDCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ELEMENTARY">Elementary</SelectItem>
                <SelectItem value="MIDDLE">Middle School</SelectItem>
                <SelectItem value="HIGH">High School</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="CHARTER">Charter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter.toString()} onValueChange={(v) => setRatingFilter(Number(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ratings</SelectItem>
                <SelectItem value="9">9+ Rating</SelectItem>
                <SelectItem value="8">8+ Rating</SelectItem>
                <SelectItem value="7">7+ Rating</SelectItem>
                <SelectItem value="6">6+ Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select value={distanceFilter.toString()} onValueChange={(v) => setDistanceFilter(Number(v))}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Within 10 mi</SelectItem>
                <SelectItem value="5">Within 5 mi</SelectItem>
                <SelectItem value="3">Within 3 mi</SelectItem>
                <SelectItem value="1">Within 1 mi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </REIDCardContent>
      </REIDCard>

      {/* Schools Table */}
      <REIDCard>
        <REIDCardContent className="p-0">
          {schools.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No school data available. Neighborhood insights with school ratings are needed to display school information.
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No schools found matching your filters. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-400">School</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-400">Type</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Rating</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Test Scores</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Students</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Ratio</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Distance</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-400">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school, idx) => (
                    <tr
                      key={school.id}
                      className={cn(
                        'border-b border-slate-800 hover:bg-slate-800/30 transition-colors',
                        selectedSchools.find(s => s.id === school.id) && 'bg-green-500/10'
                      )}
                    >
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">{school.name}</div>
                          <div className="text-sm text-slate-400">{school.district}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">{school.type}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className={cn('w-4 h-4', school.rating >= 8 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
                          <span className="text-white font-semibold">{school.rating}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-white">{school.test_scores}</td>
                      <td className="p-4 text-center text-white">{school.student_count.toLocaleString()}</td>
                      <td className="p-4 text-center text-white">1:{school.teacher_ratio}</td>
                      <td className="p-4 text-center text-slate-300">{school.distance_miles.toFixed(1)} mi</td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={!!selectedSchools.find(s => s.id === school.id)}
                          onChange={() => toggleSchoolSelection(school)}
                          disabled={!selectedSchools.find(s => s.id === school.id) && selectedSchools.length >= 3}
                          className="w-4 h-4"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </REIDCardContent>
      </REIDCard>

      {/* Comparison Dialog */}
      <SchoolComparisonDialog
        schools={selectedSchools}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
}
