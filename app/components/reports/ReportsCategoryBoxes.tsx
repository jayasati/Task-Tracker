'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { isProfessionalCategory } from '@/lib/utils/filters';

interface ReportsCategoryBoxesProps {
    tasks: Task[];
}

interface CategoryBoxData {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    route: string;
    gradient: string;
    borderColor: string;
    iconColor: string;
}

const categories: CategoryBoxData[] = [
    {
        id: 'make_habit',
        title: 'Make Habit',
        subtitle: 'Consistency & Growth',
        icon: '🟢',
        route: '/reports/make-habit',
        gradient: 'from-green-50 via-emerald-50 to-green-100',
        borderColor: 'border-green-300 hover:border-green-400',
        iconColor: 'text-green-600'
    },
    {
        id: 'break_habit',
        title: 'Break Habit',
        subtitle: 'Reduction & Control',
        icon: '🔴',
        route: '/reports/break-habit',
        gradient: 'from-red-50 via-rose-50 to-red-100',
        borderColor: 'border-red-300 hover:border-red-400',
        iconColor: 'text-red-600'
    },
    {
        id: 'professional',
        title: 'Professional',
        subtitle: 'Productivity & Focus',
        icon: '💼',
        route: '/reports/professional',
        gradient: 'from-blue-50 via-indigo-50 to-blue-100',
        borderColor: 'border-blue-300 hover:border-blue-400',
        iconColor: 'text-blue-600'
    }
];

export function ReportsCategoryBoxes({ tasks }: ReportsCategoryBoxesProps) {
    const router = useRouter();

    // Calculate summary stats for each category
    const getCategoryStats = (categoryId: string) => {
        const categoryTasks = categoryId === 'professional'
            ? tasks.filter(t => isProfessionalCategory(t.category))
            : tasks.filter(t => t.category === categoryId);

        return {
            totalHabits: categoryTasks.length
        };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-12 text-center">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-3">
                    📊 Analytics & Reports
                </h1>
                <p className="text-lg text-gray-600">
                    Select a category to view detailed analytics and progress tracking
                </p>
            </div>

            {/* Category Boxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {categories.map((category) => {
                    const stats = getCategoryStats(category.id);

                    return (
                        <button
                            key={category.id}
                            onClick={() => router.push(category.route)}
                            className={`
                                group relative overflow-hidden
                                bg-linear-to-br ${category.gradient}
                                border-2 ${category.borderColor}
                                rounded-2xl p-8
                                shadow-lg hover:shadow-2xl
                                transform transition-all duration-300
                                hover:-translate-y-2 hover:scale-105
                                cursor-pointer
                                text-left
                            `}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-between mb-6">
                                <span className={`text-6xl ${category.iconColor}`}>
                                    {category.icon}
                                </span>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-gray-800">
                                        {stats.totalHabits}
                                    </div>
                                    <div className="text-xs text-gray-600 font-medium">
                                        {stats.totalHabits === 1 ? 'Habit' : 'Habits'}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {category.title}
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                {category.subtitle}
                            </p>

                            {/* Hover Arrow */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-2xl">→</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Info Section */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <span className="text-3xl">💡</span>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2 text-lg">How It Works</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Click a category box</strong> to see all habits in that category</li>
                            <li>• <strong>Click on a specific habit</strong> to view detailed analytics with heatmaps and statistics</li>
                            <li>• Streaks count when you achieve <strong>50% or better progress</strong> (level 2+)</li>
                            <li>• You can modify progress until <strong>2 AM of the next day</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
