'use client';

import { type MockSchool } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, Users, GraduationCap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolComparisonDialogProps {
  schools: MockSchool[];
  open: boolean;
  onClose: () => void;
}

export function SchoolComparisonDialog({ schools, open, onClose }: SchoolComparisonDialogProps) {
  if (schools.length < 2) return null;

  // Determine best values for highlighting
  const bestRating = Math.max(...schools.map(s => s.rating));
  const bestTestScores = Math.max(...schools.map(s => s.test_scores));
  const bestRatio = Math.min(...schools.map(s => s.teacher_ratio));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">School Comparison</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-400 w-48">Metric</th>
                {schools.map((school, idx) => (
                  <th key={school.id} className="text-center p-4 text-sm font-semibold text-slate-400">
                    School {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* School Name */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400">School Name</td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className="text-white font-medium">{school.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{school.district}</div>
                  </td>
                ))}
              </tr>

              {/* Type */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400">Type</td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <Badge variant="outline" className="text-xs">{school.type}</Badge>
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b border-slate-800 bg-slate-800/20">
                <td className="p-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Rating
                </td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className={cn(
                      'text-2xl font-bold',
                      school.rating === bestRating ? 'text-green-400' : 'text-white'
                    )}>
                      {school.rating}
                    </div>
                    <div className="text-xs text-slate-400">out of 10</div>
                  </td>
                ))}
              </tr>

              {/* Test Scores */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Test Scores
                </td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className={cn(
                      'text-xl font-bold',
                      school.test_scores === bestTestScores ? 'text-green-400' : 'text-white'
                    )}>
                      {school.test_scores}
                    </div>
                    <div className="text-xs text-slate-400">percentile</div>
                  </td>
                ))}
              </tr>

              {/* Enrollment */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Enrollment
                </td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className="text-xl font-bold text-white">
                      {school.student_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">students</div>
                  </td>
                ))}
              </tr>

              {/* Student:Teacher Ratio */}
              <tr className="border-b border-slate-800 bg-slate-800/20">
                <td className="p-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-400" />
                  Student:Teacher Ratio
                </td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className={cn(
                      'text-xl font-bold',
                      school.teacher_ratio === bestRatio ? 'text-green-400' : 'text-white'
                    )}>
                      1:{school.teacher_ratio}
                    </div>
                    <div className="text-xs text-slate-400">ratio</div>
                  </td>
                ))}
              </tr>

              {/* Grade Levels */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400">Grade Levels</td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className="text-white font-medium">{school.grade_levels}</div>
                  </td>
                ))}
              </tr>

              {/* Distance */}
              <tr className="border-b border-slate-800">
                <td className="p-4 text-sm font-medium text-slate-400">Distance</td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className="text-white font-medium">{school.distance_miles.toFixed(1)} miles</div>
                  </td>
                ))}
              </tr>

              {/* Address */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-400">Address</td>
                {schools.map(school => (
                  <td key={school.id} className="p-4 text-center">
                    <div className="text-xs text-slate-300">
                      {school.address}<br />
                      {school.city}, {school.state} {school.zip_code}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Best value</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
