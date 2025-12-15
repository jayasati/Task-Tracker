'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { calculateAnalytics } from '@/lib/utils/analytics';
import { isProfessionalCategory } from '@/lib/utils/filters';

interface CategoryHabitListProps {
    tasks: Task[];
    category: 'make_habit' | 'break_habit' | 'professional';
    categoryTitle: string;
    categoryIcon: string;
}

export function CategoryHabitList({ tasks, category, categoryTitle, categoryIcon }: CategoryHabitListProps) {
    const router = useRouter();

    // Filter tasks by category
    const categoryTasks = category === 'professional'
        ? tasks.filter(t => isProfessionalCategory(t.category))
        : tasks.filter(t => t.category === category);

    // Calculate analytics for each habit
    const habitsWithStats = categoryTasks.map(task => {
        const analytics = calculateAnalytics([task], category, 'monthly');

        // Get last activity date
        const lastStatus = task.statuses.length > 0
            ? task.statuses[task.statuses.length - 1]
            : null;

        return {
            ...task,
            currentStreak: analytics.currentStreak,
            consistency: analytics.consistency,
            lastActivity: lastStatus ? new Date(lastStatus.date) : null
        };
    });

    const handleHabitClick = (habitId: string) => {
        const categorySlug = category.replace('_', '-');
        router.push(`/reports/${categorySlug}/${habitId}`);
    };

    if (categoryTasks.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">{categoryIcon}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        No {categoryTitle} Habits Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Create your first {categoryTitle.toLowerCase()} habit to start tracking progress
                    </p>
                    <Link
                        href={`/?tab=${category}`}
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Habit
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitsWithStats.map((habit) => {
                const displayType = isProfessionalCategory(habit.category) && habit.type === 'task'
                    ? 'habit'
                    : habit.type;

                return (
                <button
                    key={habit.id}
                    onClick={() => handleHabitClick(habit.id)}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-blue-400 p-6 text-left transition-all duration-200 transform hover:-translate-y-1"
                >
                    {/* Habit Title */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {habit.title}
                    </h3>

                    {/* Habit Type Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">
                            {displayType}
                        </span>
                        {habit.repeatMode !== 'none' && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 capitalize">
                                {habit.repeatMode}
                            </span>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">🔥 Streak</div>
                            <div className="text-xl font-bold text-gray-800">
                                {habit.currentStreak}
                            </div>
                        </div>
                        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">📊 Consistency</div>
                            <div className="text-xl font-bold text-gray-800">
                                {habit.consistency}%
                            </div>
                        </div>
                    </div>

                    {/* Last Activity */}
                    {habit.lastActivity && (
                        <div className="text-xs text-gray-500">
                            Last activity: {habit.lastActivity.toLocaleDateString()}
                        </div>
                    )}

                    {/* Hover Arrow */}
                    <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm text-blue-600 font-medium">View Analytics</span>
                        <span className="ml-2 text-blue-600">→</span>
                    </div>
                </button>
                );
            })}
        </div>
    );
}
