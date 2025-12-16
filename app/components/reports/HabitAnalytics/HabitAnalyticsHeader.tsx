/**
 * Habit Analytics Header Component
 */
import React from 'react';
import Link from 'next/link';
import { Task } from '@/types/task';
import { TimeRangeToggle, TimeRange } from '../../analytics/TimeRangeToggle';
import { isProfessionalCategory } from '@/lib/utils/filters';

interface HabitAnalyticsHeaderProps {
  habit: Task;
  category: 'make_habit' | 'break_habit' | 'professional';
  categoryTitle: string;
  categoryIcon: string;
  categorySlug: string;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  colors: {
    gradient: string;
    border: string;
    text: string;
  };
}

export function HabitAnalyticsHeader({
  habit,
  category,
  categoryTitle,
  categoryIcon,
  categorySlug,
  timeRange,
  setTimeRange,
  colors
}: HabitAnalyticsHeaderProps) {
  const displayType = isProfessionalCategory(habit.category) && habit.type === 'task'
    ? 'habit'
    : habit.type;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/?tab=reports" className="text-blue-600 hover:text-blue-800 font-medium">
              📊 Reports
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/reports/${categorySlug}`} className="text-blue-600 hover:text-blue-800 font-medium">
              {categoryIcon} {categoryTitle}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-semibold">{habit.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className={`text-6xl ${colors.text}`}>{categoryIcon}</span>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
                  {habit.title}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {displayType}
                  </span>
                  {habit.repeatMode !== 'none' && (
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 capitalize">
                      {habit.repeatMode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          </div>

          {/* Notes */}
          {habit.notes && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700">{habit.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
