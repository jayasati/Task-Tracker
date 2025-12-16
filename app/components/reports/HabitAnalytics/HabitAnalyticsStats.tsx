/**
 * Habit Analytics Stats Component
 */
import React from 'react';
import { Heatmap } from '../../analytics/Heatmap';
import { StreakStats } from '../../analytics/StreakStats';
import { PeriodNavigator } from '../../analytics/PeriodNavigator';
import { TimeRange } from '../../analytics/TimeRangeToggle';

interface HabitAnalyticsStatsProps {
  analytics: any;
  category: 'make_habit' | 'break_habit' | 'professional';
  timeRange: TimeRange;
  currentPeriod: Date;
  habitCreatedAt: Date;
  handlePeriodNavigate: (direction: 'prev' | 'next') => void;
  dailyProgress: any;
  colors: {
    gradient: string;
    border: string;
    text: string;
  };
}

export function HabitAnalyticsStats({
  analytics,
  category,
  timeRange,
  currentPeriod,
  habitCreatedAt,
  handlePeriodNavigate,
  dailyProgress,
  colors
}: HabitAnalyticsStatsProps) {
  return (
    <div className={`bg-linear-to-br ${colors.gradient} rounded-2xl shadow-xl border-2 ${colors.border} p-8`}>
      {/* Heatmap Section */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Progress Heatmap</h3>
          <PeriodNavigator
            timeRange={timeRange}
            currentPeriod={currentPeriod}
            habitCreatedAt={habitCreatedAt}
            onNavigate={handlePeriodNavigate}
          />
        </div>
        <Heatmap data={dailyProgress} timeRange={timeRange} currentPeriod={currentPeriod} />
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistics</h3>
        <StreakStats
          currentStreak={analytics.currentStreak}
          longestStreak={analytics.longestStreak}
          totalActiveDays={analytics.totalActiveDays}
          consistency={analytics.consistency}
          averageProgress={analytics.averageProgress}
          category={category}
        />
      </div>
    </div>
  );
}
