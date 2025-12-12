export const formatTime = (s: number): string =>
    new Date(s * 1000).toISOString().substring(11, 19);

/**
 * FILE: lib/utils/time.ts
 * 
 * PURPOSE:
 * Utility function for formatting time durations.
 * Converts seconds to HH:MM:SS format.
 * 
 * WHAT IT DOES:
 * - formatTime: Converts seconds (number) to HH:MM:SS string format
 * - Uses ISO string conversion for consistent formatting
 * - Extracts time portion from ISO datetime string
 * 
 * DEPENDENCIES (imports from):
 * - None (pure utility function)
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TimerDisplay.tsx: Formats timer display
 * - app/components/tasks/TaskTimer.tsx: Formats time values
 * 
 * NOTES:
 * - Input: seconds as number (e.g., 3661)
 * - Output: HH:MM:SS string (e.g., "01:01:01")
 * - Uses Date object with epoch time for conversion
 * - substring(11, 19) extracts time from ISO string
 */
