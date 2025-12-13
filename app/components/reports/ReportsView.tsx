'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { TimeRange } from '../analytics/TimeRangeToggle';
import { calculateAnalytics } from '@/lib/utils/analytics';

interface ReportsViewProps {
    tasks: Task[];
}

export function ReportsView({ tasks }: ReportsViewProps) {
    const [makeHabitRange, setMakeHabitRange] = useState<TimeRange>('monthly');
    const [breakHabitRange, setBreakHabitRange] = useState<TimeRange>('monthly');
    const [professionalRange, setProfessionalRange] = useState<TimeRange>('monthly');

    // Calculate analytics for each category
    const makeHabitData = useMemo(
        () => calculateAnalytics(tasks, 'make_habit', makeHabitRange),
        [tasks, makeHabitRange]
    );

    const breakHabitData = useMemo(
        () => calculateAnalytics(tasks, 'break_habit', breakHabitRange),
        [tasks, breakHabitRange]
    );

    const professionalData = useMemo(
        () => calculateAnalytics(tasks, 'professional', professionalRange),
        [tasks, professionalRange]
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
                    📊 Analytics & Reports
                </h1>
                <p className="text-gray-600">
                    Track your progress, streaks, and consistency across all habit categories
                </p>
            </div>

            {/* Analytics Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Make Habit Card */}
                <AnalyticsCard
                    category="make_habit"
                    title="Make Habit"
                    subtitle="Consistency & Growth"
                    icon="🟢"
                    data={makeHabitData}
                    currentTimeRange={makeHabitRange}
                    onTimeRangeChange={setMakeHabitRange}
                />

                {/* Break Habit Card */}
                <AnalyticsCard
                    category="break_habit"
                    title="Break Habit"
                    subtitle="Reduction & Control"
                    icon="🔴"
                    data={breakHabitData}
                    currentTimeRange={breakHabitRange}
                    onTimeRangeChange={setBreakHabitRange}
                />

                {/* Professional Habit Card */}
                <AnalyticsCard
                    category="professional"
                    title="Professional"
                    subtitle="Productivity & Focus"
                    icon="💼"
                    data={professionalData}
                    currentTimeRange={professionalRange}
                    onTimeRangeChange={setProfessionalRange}
                />
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">How Streaks Work</h3>
                        <p className="text-sm text-blue-800">
                            A streak counts when you achieve <strong>50% or better progress</strong> (level 2+) on consecutive days.
                            You can modify today's progress until <strong>2 AM tomorrow</strong>, after which it becomes read-only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
