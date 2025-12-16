'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Task } from '@/types/task';
import {
    filterByCategory,
    filterBySubView,
    getTodayTasks,
    getHabitsOnly,
    getTaskCounts,
    Category,
    SubView
} from '@/lib/utils/filters';
import TaskCard from '../TaskCard';
import { ReportsCategoryBoxes } from '../reports/ReportsCategoryBoxes';

interface TaskListContainerProps {
    tasks: Task[];
    currentMonth: Date;
    refetch: () => void;
}

export default function TaskListContainer({ tasks, currentMonth, refetch }: TaskListContainerProps) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'today';
    const activeView = (searchParams.get('view') as SubView) || 'active';

    // Calculate counts for sub-tabs
    const counts = useMemo(() => getTaskCounts(tasks), [tasks]);

    // Priority order mapping: high -> medium -> low -> null/undefined
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

    // Sort tasks by priority (high first, then medium, then low)
    const sortByPriority = (taskList: Task[]): Task[] => {
        return [...taskList].sort((a, b) => {
            const priorityA = priorityOrder[a.priority?.toLowerCase() || ''] ?? 3;
            const priorityB = priorityOrder[b.priority?.toLowerCase() || ''] ?? 3;
            return priorityA - priorityB;
        });
    };

    // Filter tasks based on active tab and view
    const filteredTasks = useMemo(() => {
        let result: Task[];
        if (activeTab === 'today') {
            result = getTodayTasks(tasks);
        } else {
            // Regular category filtering
            const categoryTasks = filterByCategory(tasks, activeTab as Category);
            result = filterBySubView(categoryTasks, activeView);
        }
        // Sort by priority: high -> medium -> low
        return sortByPriority(result);
    }, [tasks, activeTab, activeView]);

    // Get current category counts for sub-tabs
    const currentCounts = useMemo(() => {
        if (activeTab === 'today') {
            return counts[activeTab];
        }
        return counts[activeTab as Category];
    }, [counts, activeTab]);

    // If on Reports tab, render ReportsCategoryBoxes instead
    if (activeTab === 'reports') {
        return <ReportsCategoryBoxes tasks={tasks} />;
    }

    if (filteredTasks.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">
                        {activeView === 'completed' ? '🎉' : '📭'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {activeView === 'completed' ? 'No completed tasks yet' : 'No tasks here'}
                    </h3>
                    <p className="text-gray-500">
                        {activeView === 'active' && 'Add a new task to get started!'}
                        {activeView === 'archived' && 'Archived tasks will appear here'}
                        {activeView === 'completed' && 'Complete some tasks to see them here'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="space-y-6">
                {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        currentMonth={currentMonth}
                        refetch={refetch}
                    />
                ))}
            </div>
        </div>
    );
}
