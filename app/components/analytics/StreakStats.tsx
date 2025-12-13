'use client';

import React from 'react';

interface StreakStatsProps {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    consistency: number;
    averageProgress: number;
    category: 'make_habit' | 'break_habit' | 'professional';
    showAllStats?: boolean; // If false, hide Current Streak and Consistency
}

export function StreakStats({
    currentStreak,
    longestStreak,
    totalActiveDays,
    consistency,
    averageProgress,
    category,
    showAllStats = true // Default to showing all stats
}: StreakStatsProps) {
    const allStats = [
        {
            label: 'Current Streak',
            value: `${currentStreak} days`,
            icon: '🔥',
            color: 'text-orange-600',
            show: showAllStats
        },
        {
            label: 'Longest Streak',
            value: `${longestStreak} days`,
            icon: '🏆',
            color: 'text-yellow-600',
            show: true
        },
        {
            label: 'Active Days',
            value: totalActiveDays,
            icon: '📅',
            color: 'text-blue-600',
            show: true
        },
        {
            label: 'Consistency',
            value: `${consistency}%`,
            icon: '📊',
            color: 'text-green-600',
            show: showAllStats
        },
        {
            label: 'Avg Progress',
            value: averageProgress.toFixed(1),
            icon: '⭐',
            color: 'text-purple-600',
            show: true
        }
    ];

    // Filter stats based on show property
    const stats = allStats.filter(stat => stat.show);

    return (
        <div className={`grid grid-cols-2 ${showAllStats ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-3`}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
