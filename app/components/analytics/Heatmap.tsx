'use client';

import React from 'react';
import { DailyProgress } from '@/lib/utils/analytics';
import { getProgressColor } from '@/lib/utils/analytics';

interface HeatmapProps {
    data: DailyProgress[];
    timeRange: 'weekly' | 'monthly' | 'yearly';
    currentPeriod: Date;
}

export function Heatmap({ data, timeRange, currentPeriod }: HeatmapProps) {
    // Create a map for quick lookup
    const progressMap = new Map<string, number>();
    data.forEach(d => {
        // Normalize to UTC date string to avoid timezone issues
        const dateObj = new Date(d.date);
        const key = `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`;
        progressMap.set(key, d.progressLevel);
    });

    // Get month details
    const getMonthDetails = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
        const daysInMonth = lastDay.getDate();

        return { year, month, firstDay, lastDay, startDayOfWeek, daysInMonth };
    };

    // Render monthly calendar view
    const renderMonthlyView = () => {
        const period = new Date(currentPeriod);
        const { year, month, startDayOfWeek, daysInMonth } = getMonthDetails(period);
        const monthName = period.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cells: React.JSX.Element[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push(
                <div key={`empty-${i}`} className="w-12 h-12" />
            );
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Create date key in YYYY-MM-DD format (same as progress map)
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const level = progressMap.get(dateKey) ?? 0;
            const color = getProgressColor(level);

            const date = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.getTime() === today.getTime();
            const isFuture = date > today;

            cells.push(
                <div
                    key={dateKey}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all hover:scale-105 cursor-pointer relative ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${isFuture ? 'opacity-40' : ''}`}
                    style={{ backgroundColor: isFuture ? '#F3F4F6' : color }}
                    title={`${date.toLocaleDateString()}: ${level === 0 ? 'No activity' : `Level ${level}`}`}
                >
                    <span className={level >= 3 ? 'text-white' : 'text-gray-700'}>
                        {day}
                    </span>
                </div>
            );
        }

        return (
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{monthName}</h3>

                {/* Day of week labels */}
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {dayLabels.map(label => (
                        <div key={label} className="text-center text-xs font-semibold text-gray-500 w-12">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {cells}
                </div>
            </div>
        );
    };

    // Render weekly view
    const renderWeeklyView = () => {
        const dates: Date[] = [];
        const startDate = new Date(currentPeriod);
        startDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }

        return (
            <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                    // Create date key in YYYY-MM-DD format (same as progress map)
                    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const level = progressMap.get(dateKey) ?? 0;
                    const color = getProgressColor(level);
                    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = date.getTime() === today.getTime();
                    const isFuture = date > today;

                    return (
                        <div key={dateKey} className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-gray-500">{dayLabel}</span>
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all hover:scale-105 cursor-pointer ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                                    } ${isFuture ? 'opacity-40' : ''}`}
                                style={{ backgroundColor: isFuture ? '#F3F4F6' : color }}
                                title={`${date.toLocaleDateString()}: ${level === 0 ? 'No activity' : `Level ${level}`}`}
                            >
                                <span className={level >= 3 ? 'text-white' : 'text-gray-700'}>
                                    {dayNum}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render yearly view (month-by-month layout)
    const renderYearlyView = () => {
        const year = currentPeriod.getFullYear();
        const months = [];

        // Generate all 12 months
        for (let month = 0; month < 12; month++) {
            const monthDate = new Date(year, month, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDayOfWeek = monthDate.getDay();

            const monthCells: React.JSX.Element[] = [];

            // Add empty cells for days before month starts
            for (let i = 0; i < startDayOfWeek; i++) {
                monthCells.push(
                    <div key={`empty-${month}-${i}`} className="w-6 h-6" />
                );
            }

            // Add cells for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                // Create date key in YYYY-MM-DD format (same as progress map)
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const level = progressMap.get(dateKey) ?? 0;
                const color = getProgressColor(level);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = date.getTime() === today.getTime();
                const isFuture = date > today;

                monthCells.push(
                    <div
                        key={dateKey}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-semibold transition-all hover:scale-125 cursor-pointer ${isToday ? 'ring-1 ring-blue-500' : ''
                            } ${isFuture ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: isFuture ? '#F3F4F6' : color }}
                        title={`${date.toLocaleDateString()}: ${level === 0 ? 'No activity' : `Level ${level}`}`}
                    >
                        <span className={level >= 3 ? 'text-white' : 'text-gray-600'}>
                            {day}
                        </span>
                    </div>
                );
            }

            months.push(
                <div key={month} className="mb-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">{monthName}</div>
                    <div className="grid grid-cols-7 gap-0.5">
                        {monthCells}
                    </div>
                </div>
            );
        }

        return (
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{year}</h3>
                <div className="grid grid-cols-3 gap-4">
                    {months}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            {timeRange === 'monthly' && renderMonthlyView()}
            {timeRange === 'weekly' && renderWeeklyView()}
            {timeRange === 'yearly' && renderYearlyView()}

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div
                        key={level}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getProgressColor(level) }}
                        title={`Level ${level}`}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
