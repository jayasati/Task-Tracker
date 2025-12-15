/**
 * Utility functions for filtering tasks by category and view
 */

import { Task } from "@/types/task";

export const BASE_CATEGORIES = ['task', 'make_habit', 'break_habit', 'professional'] as const;
export const PROFESSIONAL_SUGGESTED = ['meeting', 'coding', 'study', 'sales', 'leetcode', 'project building', 'machine learning'];

export function isProfessionalCategory(value: string | undefined | null): boolean {
    const normalized = (value || '').trim().toLowerCase();
    if (!normalized) return false;

    // Anything not one of the base categories is treated as Professional
    if (!BASE_CATEGORIES.some((cat) => cat === normalized)) return true;

    return normalized === 'professional' || PROFESSIONAL_SUGGESTED.includes(normalized);
}

export type Category = 'task' | 'make_habit' | 'break_habit' | 'professional';
export type SubView = 'active' | 'archived' | 'completed';
export type MainTab = Category | 'reports' | 'today';

/**
 * Filter tasks by category
 */
export function filterByCategory(tasks: Task[], category: Category): Task[] {
    if (category === 'professional') {
        return tasks.filter(t => isProfessionalCategory(t.category));
    }

    return tasks.filter(t => t.category === category);
}

import { get2AMDayKey, toISODate } from './date';

/**
 * Check if a habit is completed for the current day (2AM boundary)
 */
function isHabitCompletedToday(task: Task): boolean {
    // Skip if it's a one-off task (relies on isCompleted)
    if (task.category === 'task' && task.repeatMode === 'none') return false;

    const todayKey = get2AMDayKey(new Date());

    // 1. Check Checkbox/Status Progress
    const todayStatus = task.statuses?.find(s => {
        const d = new Date(s.date);
        return get2AMDayKey(d) === todayKey || toISODate(d) === todayKey;
    });

    if (todayStatus) {
        if (todayStatus.progressLevel === 4) return true; // 100%
        if (todayStatus.status === 'SUCCESS') return true;
    }

    // 2. Check Timer Progress
    if (task.habitType === 'time' || task.habitType === 'both') {
        const requiredSeconds = (task.requiredMinutes || 0) * 60;
        if (requiredSeconds > 0) {
            const todaySeconds = (task.timerSessions || []).reduce((acc, sess) => {
                const sessKey = get2AMDayKey(new Date(sess.date));
                return sessKey === todayKey ? acc + sess.seconds : acc;
            }, 0);

            // Check if accumulated time meets requirement
            if (todaySeconds >= requiredSeconds) return true;
        }
    }

    // 3. Check Amount/Subtask Progress
    const completedCount = todayStatus?.completedSubtasks?.length || 0;
    const targetAmount = task.requiredAmount ?? task.subtasks?.length ?? 0;

    if (targetAmount > 0 && completedCount >= targetAmount) {
        return true;
    }

    return false;
}

/**
 * Filter tasks by sub-view (active/archived/completed)
 */
export function filterBySubView(tasks: Task[], subView: SubView): Task[] {
    const now = new Date();

    switch (subView) {
        case 'active':
            // Active: not completed, not archived, not past end date
            // AND not completed today (for habits)
            return tasks.filter(t =>
                !t.isCompleted &&
                !t.isArchived &&
                (!t.endDate || new Date(t.endDate) >= now) &&
                !isHabitCompletedToday(t)
            );

        case 'archived':
            // Archived: manually archived OR past end date (but not completed)
            return tasks.filter(t =>
                t.isArchived ||
                (t.endDate && new Date(t.endDate) < now && !t.isCompleted)
            );

        case 'completed':
            // Completed: marked as completed permanently OR completed today
            return tasks.filter(t =>
                t.isCompleted ||
                isHabitCompletedToday(t)
            );

        default:
            return tasks;
    }
}

/**
 * Get tasks due today
 */
export function getTodayTasks(tasks: Task[]): Task[] {
    const today = new Date();

    return tasks.filter(t => {
        // Exclude completed and archived
        if (t.isCompleted || t.isArchived) return false;

        // For irregular tasks, check if scheduled for today
        if (t.category === 'task' && t.repeatMode === 'none') {
            if (!t.startDate) return false;
            const taskDate = new Date(t.startDate);
            return taskDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        }

        // For habits, check if due today based on repeat mode
        return isDueToday(t, today);
    });
}

/**
 * Check if a task/habit is due today
 */
export function isDueToday(task: Task, today: Date): boolean {
    const todayDay = today.getDay(); // 0-6 (Sunday-Saturday)

    // Check if within date range
    if (task.startDate && new Date(task.startDate) > today) return false;
    if (task.endDate && new Date(task.endDate) < today) return false;

    switch (task.repeatMode) {
        case 'daily':
            return true;

        case 'weekly':
            // Due on the same day of week as start date
            const startDay = task.startDate ? new Date(task.startDate).getDay() : 0;
            return todayDay === startDay;

        case 'custom':
            // Check if today's weekday is in the custom weekdays array
            return task.weekdays?.includes(todayDay) ?? false;

        case 'monthly':
            // Due on the same day of month as start date
            const startDate = task.startDate ? new Date(task.startDate).getDate() : 1;
            return today.getDate() === startDate;

        case 'none':
            return false;

        default:
            return false;
    }
}

/**
 * Get only habits (exclude irregular tasks)
 */
export function getHabitsOnly(tasks: Task[]): Task[] {
    return tasks.filter(t =>
        t.category !== 'task' &&
        t.repeatMode !== 'none'
    );
}

/**
 * Count tasks by category and view
 */
export function getTaskCounts(tasks: Task[]) {
    const categories: Category[] = ['task', 'make_habit', 'break_habit', 'professional'];
    const counts: Record<string, { active: number; archived: number; completed: number; total: number }> = {};

    categories.forEach(category => {
        const categoryTasks = filterByCategory(tasks, category);
        counts[category] = {
            active: filterBySubView(categoryTasks, 'active').length,
            archived: filterBySubView(categoryTasks, 'archived').length,
            completed: filterBySubView(categoryTasks, 'completed').length,
            total: categoryTasks.length,
        };
    });

    // Today's tasks count
    counts.today = {
        active: getTodayTasks(tasks).length,
        archived: 0,
        completed: 0,
        total: getTodayTasks(tasks).length,
    };

    // Reports (habits only)
    const habits = getHabitsOnly(tasks);
    counts.reports = {
        active: filterBySubView(habits, 'active').length,
        archived: filterBySubView(habits, 'archived').length,
        completed: 0,
        total: habits.length,
    };

    return counts;
}
