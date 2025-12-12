import { useMemo } from "react";

/**
 * Memoization utilities for expensive calculations
 */

/**
 * Memoize expensive date calculations
 */
export function useMemoizedDates(year: number, month: number) {
    return useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return { daysInMonth, startDate, endDate };
    }, [year, month]);
}

/**
 * Memoize status calculations
 */
export function useMemoizedStatusMap<T extends { date: Date | string;[key: string]: any }>(
    statuses: T[]
) {
    return useMemo(() => {
        const map = new Map<string, T>();
        statuses.forEach((status) => {
            const dateKey = new Date(status.date).toISOString().split('T')[0];
            map.set(dateKey, status);
        });
        return map;
    }, [statuses]);
}

/**
 * Deep equality check for objects (use sparingly)
 */
export function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

/**
 * FILE: lib/utils/memo.ts
 * 
 * PURPOSE:
 * Memoization utilities for optimizing expensive calculations in React components.
 * Provides custom hooks for common memoization patterns.
 * 
 * WHAT IT DOES:
 * - useMemoizedDates: Memoizes date calculations (daysInMonth, startDate, endDate)
 * - useMemoizedStatusMap: Creates Map for O(1) status lookups
 * - deepEqual: Deep equality comparison for objects (use sparingly)
 * 
 * DEPENDENCIES (imports from):
 * - react: useMemo hook
 * 
 * DEPENDENTS (files that import this):
 * - hooks/useHabitGrid.ts: Could use these utilities (currently has inline memoization)
 * - Future components needing performance optimization
 * 
 * NOTES:
 * - useMemoizedDates: Recalculates only when year or month changes
 * - useMemoizedStatusMap: Converts array to Map for faster lookups
 * - deepEqual: Recursive comparison, can be slow for large objects
 * - Generic type T in useMemoizedStatusMap allows flexibility
 * - Created for performance optimization during SSR implementation
 */
