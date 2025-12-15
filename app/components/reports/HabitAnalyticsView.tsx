'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Task } from '@/types/task';
import { TimeRangeToggle, TimeRange } from '../analytics/TimeRangeToggle';
import { Heatmap } from '../analytics/Heatmap';
import { StreakStats } from '../analytics/StreakStats';
import { PeriodNavigator } from '../analytics/PeriodNavigator';
import { calculateAnalytics } from '@/lib/utils/analytics';
import { trpc } from '@/utils/trpc';

import { isProfessionalCategory } from '@/lib/utils/filters';

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
                    <Link href="/?tab=reports" className="text-blue-600 hover:underline">
                        Return to Reports
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate analytics for this specific habit
    const analytics = calculateAnalytics([habit], category, timeRange, currentPeriod, true);

    const displayType = isProfessionalCategory(habit.category) && habit.type === 'task'
        ? 'habit'
        : habit.type;

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

                {/* Analytics Card */}
                <div className={`bg-linear-to-br ${colors.gradient} rounded-2xl shadow-xl border-2 ${colors.border} p-8`}>
                    {/* Heatmap Section */}
                    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Progress Heatmap</h3>
                            <PeriodNavigator
                                timeRange={timeRange}
                                currentPeriod={currentPeriod}
                                habitCreatedAt={new Date(habit.createdAt || habit.startDate || new Date())}
                                onNavigate={handlePeriodNavigate}
                            />
                        </div>
                        <Heatmap data={analytics.dailyProgress} timeRange={timeRange} currentPeriod={currentPeriod} />
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

                {/* Additional Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">About This Habit</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Created: {new Date(habit.createdAt!).toLocaleDateString()}</li>
                                {habit.startDate && (
                                    <li>• Start Date: {new Date(habit.startDate).toLocaleDateString()}</li>
                                )}
                                {habit.endDate && (
                                    <li>• End Date: {new Date(habit.endDate).toLocaleDateString()}</li>
                                )}
                                <li>• Priority: <span className="capitalize">{habit.priority || 'Medium'}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <Link
                        href={`/reports/${categorySlug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all text-gray-700 font-medium"
                    >
                        <span>←</span>
                        <span>Back to {categoryTitle}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
