/**
 * Analytics utility functions for Reports page
 * Handles streak calculations, consistency metrics, and data aggregation
 */

import { Task, TaskStatus } from '@/types/task';

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface DailyProgress {
    date: Date;
    progressLevel: number; // 0-4
    taskId: string;
    taskTitle: string;
}

export interface AnalyticsData {
    dailyProgress: DailyProgress[];
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    consistency: number; // percentage
    averageProgress: number;
}

/**
 * Calculate current streak from daily progress data
 * A streak counts when progress level >= 2 (50% or better)
 */
export function calculateCurrentStreak(data: DailyProgress[]): number {
    if (data.length === 0) return 0;

    // Sort by date descending (most recent first)
    const sorted = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
        const itemDate = new Date(sorted[i].date);
        itemDate.setHours(0, 0, 0, 0);

        // Calculate expected date for streak continuity
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        // Check if date matches and progress is sufficient
        if (itemDate.getTime() === expectedDate.getTime() && sorted[i].progressLevel >= 2) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate longest streak in history
 */
export function calculateLongestStreak(data: DailyProgress[]): number {
    if (data.length === 0) return 0;

    // Sort by date ascending
    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const item of sorted) {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        if (item.progressLevel >= 2) {
            if (lastDate === null) {
                // First item
                currentStreak = 1;
            } else {
                // Check if consecutive day
                const expectedDate = new Date(lastDate);
                expectedDate.setDate(expectedDate.getDate() + 1);

                if (itemDate.getTime() === expectedDate.getTime()) {
                    currentStreak++;
                } else {
                    // Streak broken, reset
                    currentStreak = 1;
                }
            }

            longestStreak = Math.max(longestStreak, currentStreak);
            lastDate = itemDate;
        } else {
            // Progress too low, reset streak
            currentStreak = 0;
            lastDate = null;
        }
    }

    return longestStreak;
}

/**
 * Calculate consistency percentage based on days since habit creation
 * (Days with progress >= 2) / (Days since creation in period) * 100
 */
export function calculateConsistency(
    data: DailyProgress[],
    habitCreatedAt: Date,
    periodStart: Date
): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const createdDate = new Date(habitCreatedAt);
    createdDate.setHours(0, 0, 0, 0);

    const periodStartDate = new Date(periodStart);
    periodStartDate.setHours(0, 0, 0, 0);

    // Start counting from the later of: habit creation or period start
    const countFrom = createdDate > periodStartDate ? createdDate : periodStartDate;

    // Calculate days since creation within this period
    const daysSinceCreation = Math.floor(
        (now.getTime() - countFrom.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (daysSinceCreation <= 0) return 0;

    const activeDays = data.filter(d => d.progressLevel >= 2).length;
    const consistency = Math.round((activeDays / daysSinceCreation) * 100);

    // Cap at 100% to prevent overflow
    return Math.min(consistency, 100);
}

/**
 * Get average progress level
 */
export function getAverageProgress(data: DailyProgress[]): number {
    if (data.length === 0) return 0;

    const sum = data.reduce((acc, d) => acc + d.progressLevel, 0);
    return Math.round((sum / data.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Filter data by time range
 */
export function filterByTimeRange(data: DailyProgress[], range: TimeRange): DailyProgress[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let startDate = new Date(now);

    switch (range) {
        case 'weekly':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'monthly':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case 'yearly':
            startDate.setDate(startDate.getDate() - 365);
            break;
    }

    return data.filter(d => {
        const itemDate = new Date(d.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= startDate && itemDate <= now;
    });
}

/**
 * Aggregate progress by category from tasks
 */
export function aggregateByCategory(tasks: Task[], category: string): DailyProgress[] {
    const progressMap = new Map<string, DailyProgress>();

    // Filter tasks by category
    const categoryTasks = tasks.filter(t => t.category === category);

    // Aggregate all statuses from all tasks
    for (const task of categoryTasks) {
        for (const status of task.statuses) {
            const dateKey = new Date(status.date).toISOString().split('T')[0];
            const existing = progressMap.get(dateKey);

            // If multiple tasks on same day, take the highest progress level
            if (!existing || status.progressLevel > existing.progressLevel) {
                progressMap.set(dateKey, {
                    date: new Date(status.date),
                    progressLevel: status.progressLevel,
                    taskId: task.id,
                    taskTitle: task.title
                });
            }
        }
    }

    return Array.from(progressMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Aggregate progress for a single habit/task
 * Used for individual habit analytics pages
 */
export function aggregateSingleHabit(task: Task): DailyProgress[] {
    const progressData: DailyProgress[] = [];

    // Collect all statuses from this single task
    for (const status of task.statuses) {
        progressData.push({
            date: new Date(status.date),
            progressLevel: status.progressLevel,
            taskId: task.id,
            taskTitle: task.title
        });
    }

    return progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Map progress level to color (matches ProgressBoxes component)
 */
export function getProgressColor(level: number): string {
    switch (level) {
        case 0:
            return '#E5E7EB'; // bg-gray-200
        case 1:
            return '#D1D5DB'; // bg-gray-300
        case 2:
            return '#FBBF24'; // bg-yellow-400
        case 3:
            return '#4ADE80'; // bg-green-400
        case 4:
            return '#16A34A'; // bg-green-600
        default:
            return '#E5E7EB';
    }
}

/**
 * Get total days in time range
 */
export function getTotalDaysInRange(range: TimeRange): number {
    switch (range) {
        case 'weekly':
            return 7;
        case 'monthly':
            return 30;
        case 'yearly':
            return 365;
    }
}

/**
 * Check if a date's progress can still be modified (before 2 AM cutoff)
 */
export function canModifyProgress(date: Date): boolean {
    const now = new Date();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Calculate cutoff time (2 AM of the next day)
    const cutoff = new Date(targetDate);
    cutoff.setDate(cutoff.getDate() + 1);
    cutoff.setHours(2, 0, 0, 0);

    return now < cutoff;
}

/**
 * Calculate full analytics data for a category or single habit
 */
export function calculateAnalytics(
    tasks: Task[],
    category: string,
    timeRange: TimeRange,
    periodStart?: Date,
    singleHabit?: boolean
): AnalyticsData {
    // Use different aggregation based on mode
    const allProgress = singleHabit && tasks.length === 1
        ? aggregateSingleHabit(tasks[0])
        : aggregateByCategory(tasks, category);

    const filteredProgress = filterByTimeRange(allProgress, timeRange);

    // Get habit creation date
    const relevantTasks = singleHabit && tasks.length === 1 ? tasks : tasks.filter(t => t.category === category);
    const habitCreatedAt = relevantTasks.length > 0
        ? new Date(Math.min(...relevantTasks.map(t => new Date(t.createdAt || t.startDate || new Date()).getTime())))
        : new Date();

    // Calculate period start based on time range
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let calculatedPeriodStart = periodStart || new Date(now);
    if (!periodStart) {
        switch (timeRange) {
            case 'weekly':
                calculatedPeriodStart.setDate(calculatedPeriodStart.getDate() - 7);
                break;
            case 'monthly':
                calculatedPeriodStart.setDate(calculatedPeriodStart.getDate() - 30);
                break;
            case 'yearly':
                calculatedPeriodStart.setDate(calculatedPeriodStart.getDate() - 365);
                break;
        }
    }

    return {
        dailyProgress: filteredProgress,
        currentStreak: calculateCurrentStreak(filteredProgress),
        longestStreak: calculateLongestStreak(allProgress), // Use all data for longest streak
        totalActiveDays: filteredProgress.filter(d => d.progressLevel >= 2).length,
        consistency: calculateConsistency(filteredProgress, habitCreatedAt, calculatedPeriodStart),
        averageProgress: getAverageProgress(filteredProgress)
    };
}
