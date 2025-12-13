'use client';

import React from 'react';

interface PeriodNavigatorProps {
    timeRange: 'weekly' | 'monthly' | 'yearly';
    currentPeriod: Date;
    habitCreatedAt: Date;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export function PeriodNavigator({ timeRange, currentPeriod, habitCreatedAt, onNavigate }: PeriodNavigatorProps) {
    const canNavigatePrev = () => {
        const limit = new Date(habitCreatedAt);
        limit.setHours(0, 0, 0, 0);

        const current = new Date(currentPeriod);
        current.setHours(0, 0, 0, 0);

        switch (timeRange) {
            case 'monthly':
                // Can go back to creation month
                const creationMonth = new Date(limit.getFullYear(), limit.getMonth(), 1);
                const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);
                return currentMonth > creationMonth;
            case 'weekly':
                // Can go back to creation week
                return current > limit;
            case 'yearly':
                // Can go back to creation year
                return current.getFullYear() > limit.getFullYear();
        }
    };

    const canNavigateNext = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const current = new Date(currentPeriod);
        current.setHours(0, 0, 0, 0);

        switch (timeRange) {
            case 'monthly':
                const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);
                const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return currentMonth < nowMonth;
            case 'weekly':
                return current < now;
            case 'yearly':
                return current.getFullYear() < now.getFullYear();
        }
    };

    const getPeriodLabel = () => {
        const date = new Date(currentPeriod);

        switch (timeRange) {
            case 'monthly':
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            case 'weekly':
                const weekStart = new Date(date);
                const weekEnd = new Date(date);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            case 'yearly':
                return date.getFullYear().toString();
        }
    };

    return (
        <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
            <button
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev()}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous period"
            >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <span className="text-sm font-semibold text-gray-700 min-w-[200px] text-center">
                {getPeriodLabel()}
            </span>

            <button
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext()}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next period"
            >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
