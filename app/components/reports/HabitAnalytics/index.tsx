/**
 * Habit Analytics View - Main Component
 * 
 * This component has been modularized into separate sub-components:
 * - HabitAnalyticsHeader.tsx - Header and breadcrumb navigation
 * - HabitAnalyticsStats.tsx - Statistics, heatmap, and streaks
 * - HabitAnalyticsTimeTracking.tsx - Time tracking visualizations
 * - HabitAnalyticsFooter.tsx - Additional info and back button
 */
'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { TimeRange } from '../../analytics/TimeRangeToggle';
import { calculateAnalytics } from '@/lib/utils/analytics';
import { trpc } from '@/utils/trpc';
import { isProfessionalCategory } from '@/lib/utils/filters';

// Import modular components
import { HabitAnalyticsHeader } from './HabitAnalyticsHeader';
import { HabitAnalyticsStats } from './HabitAnalyticsStats';
import { HabitAnalyticsTimeTracking } from './HabitAnalyticsTimeTracking';
import { HabitAnalyticsFooter } from './HabitAnalyticsFooter';

interface HabitAnalyticsViewProps {
  habitId: string;
  category: 'make_habit' | 'break_habit' | 'professional';
  categoryTitle: string;
  categoryIcon: string;
}

export function HabitAnalyticsView({ habitId, category, categoryTitle, categoryIcon }: HabitAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [currentPeriod, setCurrentPeriod] = useState<Date>(new Date());

  // Fetch tasks using TRPC for automatic refetching
  const { data: tasks, isLoading, refetch } = trpc.task.getTasks.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale, refetch every time
  });

  // Force refetch when component mounts to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Find the specific habit
  const habit = tasks?.find(t =>
    t.id === habitId &&
    (category === 'professional' ? isProfessionalCategory(t.category) : t.category === category)
  );

  // Reset period when time range changes
  React.useEffect(() => {
    setCurrentPeriod(new Date());
  }, [timeRange]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show error if habit not found
  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">Habit not found</p>
          <a href="/?tab=reports" className="text-blue-600 hover:underline">
            Return to Reports
          </a>
        </div>
      </div>
    );
  }

  // Calculate analytics for this specific habit
  const analytics = calculateAnalytics([habit], category, timeRange, currentPeriod, true);

  // Time logs aggregation for time/both habits
  const dailySeconds = (habit.timerSessions || []).reduce<Record<string, number>>((acc, session) => {
    const key = new Date(session.date).toISOString().split('T')[0];
    acc[key] = (acc[key] || 0) + session.seconds;
    return acc;
  }, {});

  const chartDays = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const key = d.toISOString().split('T')[0];
    return { date: key, seconds: dailySeconds[key] || 0 };
  });

  const handlePeriodNavigate = (direction: 'prev' | 'next') => {
    const newPeriod = new Date(currentPeriod);

    switch (timeRange) {
      case 'monthly':
        newPeriod.setMonth(newPeriod.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newPeriod.setDate(newPeriod.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'yearly':
        newPeriod.setFullYear(newPeriod.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentPeriod(newPeriod);
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'make_habit':
        return {
          gradient: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-600'
        };
      case 'break_habit':
        return {
          gradient: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-600'
        };
      case 'professional':
        return {
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          text: 'text-blue-600'
        };
    }
  };

  const colors = getCategoryColor();
  const categorySlug = category.replace('_', '-');

  return (
    <div className={`min-h-screen bg-linear-to-b ${colors.gradient}`}>
      <HabitAnalyticsHeader
        habit={habit}
        category={category}
        categoryTitle={categoryTitle}
        categoryIcon={categoryIcon}
        categorySlug={categorySlug}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        colors={colors}
      />

      {/* Analytics Card */}
      <HabitAnalyticsStats
        analytics={analytics}
        category={category}
        timeRange={timeRange}
        currentPeriod={currentPeriod}
        habitCreatedAt={new Date(habit.createdAt || habit.startDate || new Date())}
        handlePeriodNavigate={handlePeriodNavigate}
        dailyProgress={analytics.dailyProgress}
        colors={colors}
      />

      {(habit.habitType === 'time' || habit.habitType === 'both') && (
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <HabitAnalyticsTimeTracking
            habit={habit}
            chartDays={chartDays}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <HabitAnalyticsFooter
          habit={habit}
          categoryTitle={categoryTitle}
          categorySlug={categorySlug}
        />
      </div>
    </div>
  );
}
