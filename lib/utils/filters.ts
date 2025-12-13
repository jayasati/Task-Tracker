/**
 * Utility functions for filtering tasks by category and view
 */

import { Task } from "@/types/task";

export type Category = 'task' | 'make_habit' | 'break_habit' | 'professional';
export type SubView = 'active' | 'archived' | 'completed';
export type MainTab = Category | 'reports' | 'today';

/**
 * Filter tasks by category
 */
export function filterByCategory(tasks: Task[], category: Category): Task[] {
    // Professional subcategories should be treated as professional
    const professionalSubcategories = ['meeting', 'coding', 'study', 'sales'];

    if (category === 'professional') {
        return tasks.filter(t =>
            t.category === 'professional' ||
            professionalSubcategories.includes(t.category?.toLowerCase() || '')
        );
    }

    return tasks.filter(t => t.category === category);
}

/**
 * Filter tasks by sub-view (active/archived/completed)
 */
export function filterBySubView(tasks: Task[], subView: SubView): Task[] {
    const now = new Date();

    switch (subView) {
        case 'active':
            // Active: not completed, not archived, and not past end date
            return tasks.filter(t =>
                !t.isCompleted &&
                !t.isArchived &&
                (!t.endDate || new Date(t.endDate) >= now)
            );

        case 'archived':
            // Archived: manually archived OR past end date (but not completed)
            return tasks.filter(t =>
                t.isArchived ||
                (t.endDate && new Date(t.endDate) < now && !t.isCompleted)
            );

        case 'completed':
            // Completed: marked as completed
            return tasks.filter(t => t.isCompleted);

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
