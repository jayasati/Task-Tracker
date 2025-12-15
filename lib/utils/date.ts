export const formatDateKey = (y: number, m: number, d: number) => {
    // m is 0-indexed
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export const toISODate = (d: Date | string) => {
    return new Date(d).toISOString().split("T")[0];
};

export const getDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

export const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

/**
 * Get the 2AM boundaries for a given date
 * Returns the start (previous day 2AM) and end (current day 2AM) of the "2AM day"
 * 
 * Example: For 2025-12-15 15:00:
 * - start: 2025-12-15 02:00:00
 * - end: 2025-12-16 02:00:00
 * 
 * Example: For 2025-12-15 01:30 (before 2AM):
 * - start: 2025-12-14 02:00:00
 * - end: 2025-12-15 02:00:00
 */
export const get2AMBoundaries = (date: Date): { start: Date; end: Date } => {
    const d = new Date(date);
    const hour = d.getHours();

    // If before 2AM, the "day" started yesterday at 2AM
    if (hour < 2) {
        const start = new Date(d);
        start.setDate(start.getDate() - 1);
        start.setHours(2, 0, 0, 0);

        const end = new Date(d);
        end.setHours(2, 0, 0, 0);

        return { start, end };
    } else {
        // If after 2AM, the "day" started today at 2AM
        const start = new Date(d);
        start.setHours(2, 0, 0, 0);

        const end = new Date(d);
        end.setDate(end.getDate() + 1);
        end.setHours(2, 0, 0, 0);

        return { start, end };
    }
};

/**
 * Check if a timestamp is within the same "2AM day" as the reference date
 */
export const isWithin2AMDay = (timestamp: Date, referenceDate: Date): boolean => {
    const { start, end } = get2AMBoundaries(referenceDate);
    return timestamp >= start && timestamp < end;
};

/**
 * Get the next 2AM timestamp from a given date
 */
export const getNext2AM = (date: Date): Date => {
    const d = new Date(date);
    const hour = d.getHours();

    if (hour < 2) {
        // Next 2AM is today
        d.setHours(2, 0, 0, 0);
    } else {
        // Next 2AM is tomorrow
        d.setDate(d.getDate() + 1);
        d.setHours(2, 0, 0, 0);
    }

    return d;
};

/**
 * Get the ISO date string for the "2AM day" that a timestamp belongs to
 * This is used as the date key for timer sessions
 */
export const get2AMDayKey = (date: Date): string => {
    const { start } = get2AMBoundaries(date);
    // Use local date components to avoid timezone shifts
    return formatDateKey(start.getFullYear(), start.getMonth(), start.getDate());
};

/**
 * FILE: lib/utils/date.ts
 * 
 * PURPOSE:
 * Utility functions for date formatting and manipulation.
 * Used throughout the app for consistent date handling.
 * 
 * WHAT IT DOES:
 * - formatDateKey: Creates YYYY-MM-DD string from year/month/day numbers
 * - toISODate: Converts Date or string to ISO date format (YYYY-MM-DD)
 * - getDateString: Formats date as human-readable string (e.g., "Mon, Jan 1")
 * - isSameDay: Checks if two dates are the same calendar day
 * 
 * DEPENDENCIES (imports from):
 * - None (pure utility functions)
 * 
 * DEPENDENTS (files that import this):
 * - hooks/useHabitGrid.ts: Uses formatDateKey, toISODate, isSameDay
 * - hooks/useSubtaskModal.ts: Uses toISODate
 * - lib/utils/memo.ts: Uses date manipulation concepts
 * - hooks/useTaskTimer.ts: Uses 2AM boundary functions
 * 
 * NOTES:
 * - formatDateKey: month parameter is 0-indexed (0 = January)
 * - toISODate: Handles both Date objects and date strings
 * - getDateString: Uses en-US locale for consistency
 * - isSameDay: Compares year, month, and day (ignores time)
 * - 2AM functions: Used for timer reset logic (day boundaries at 2AM instead of midnight)
 */
