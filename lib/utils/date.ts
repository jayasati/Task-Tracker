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
 * 
 * NOTES:
 * - formatDateKey: month parameter is 0-indexed (0 = January)
 * - toISODate: Handles both Date objects and date strings
 * - getDateString: Uses en-US locale for consistency
 * - isSameDay: Compares year, month, and day (ignores time)
 */
