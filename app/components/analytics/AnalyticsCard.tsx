'use client';

import React, { useState } from 'react';
import { TimeRangeToggle, TimeRange } from './TimeRangeToggle';
import { Heatmap } from './Heatmap';
import { StreakStats } from './StreakStats';
import { AnalyticsData } from '@/lib/utils/analytics';

interface AnalyticsCardProps {
    category: 'make_habit' | 'break_habit' | 'professional';
    title: string;
    subtitle: string;
    icon: string;
    data: AnalyticsData;
    onTimeRangeChange: (range: TimeRange) => void;
    currentTimeRange: TimeRange;
}

export function AnalyticsCard({
    category,
    title,
    subtitle,
    icon,
    data,
    onTimeRangeChange,
    currentTimeRange
}: AnalyticsCardProps) {
    const getCategoryColor = () => {
        switch (category) {
            case 'make_habit':
                return 'from-green-50 to-emerald-50 border-green-200';
            case 'break_habit':
                return 'from-red-50 to-rose-50 border-red-200';
            case 'professional':
                return 'from-blue-50 to-indigo-50 border-blue-200';
        }
    };

    const getIconColor = () => {
        switch (category) {
            case 'make_habit':
                return 'text-green-600';
            case 'break_habit':
                return 'text-red-600';
            case 'professional':
                return 'text-blue-600';
        }
    };

    return (
        <div className={`bg-gradient-to-br ${getCategoryColor()} rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className={`text-4xl ${getIconColor()}`}>{icon}</span>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <p className="text-sm text-gray-600">{subtitle}</p>
                    </div>
                </div>
                <TimeRangeToggle value={currentTimeRange} onChange={onTimeRangeChange} />
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress Heatmap</h3>
                <Heatmap data={data.dailyProgress} timeRange={currentTimeRange} currentPeriod={new Date()} />
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
                <StreakStats
                    currentStreak={data.currentStreak}
                    longestStreak={data.longestStreak}
                    totalActiveDays={data.totalActiveDays}
                    consistency={data.consistency}
                    averageProgress={data.averageProgress}
                    category={category}
                    showAllStats={false}
                />
            </div>
        </div>
    );
}
