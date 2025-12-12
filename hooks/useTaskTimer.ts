import { useState, useEffect } from 'react';

export function useTaskTimer(initialSeconds: number, onStop: (gained: number) => void) {
    const [localSeconds, setLocalSeconds] = useState(initialSeconds);
    const [tick, setTick] = useState<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Sync with DB if not running
        if (!tick) setLocalSeconds(initialSeconds);
    }, [initialSeconds, tick]);

    const start = () => {
        if (tick) return;
        const id = setInterval(() => setLocalSeconds((prev) => prev + 1), 1000);
        setTick(id);
    };

    const stop = () => {
        if (!tick) return;
        clearInterval(tick);
        setTick(null);
        const gained = localSeconds - initialSeconds;
        if (gained > 0) onStop(gained);
    };

    return { localSeconds, isRunning: !!tick, start, stop };
}

/**
 * FILE: hooks/useTaskTimer.ts
 * 
 * PURPOSE:
 * Custom hook for managing task timer state and controls.
 * Handles start/stop functionality with automatic second counting.
 * 
 * WHAT IT DOES:
 * - Manages local timer state (seconds elapsed)
 * - Provides start/stop controls
 * - Syncs with database value when not running
 * - Calculates time gained when stopping
 * - Calls onStop callback with gained seconds
 * - Uses setInterval for automatic counting
 * 
 * DEPENDENCIES (imports from):
 * - react: useState, useEffect hooks
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TaskCard.tsx: Uses for timer functionality
 * - app/components/tasks/TaskTimer.tsx: Timer display component
 * 
 * NOTES:
 * - localSeconds: Current timer value (updates every second when running)
 * - initialSeconds: Value from database (synced when timer stops)
 * - tick: setInterval ID (null when stopped, number when running)
 * - onStop callback receives gained seconds (localSeconds - initialSeconds)
 * - Only calls onStop if gained > 0 (prevents saving 0-second sessions)
 * - useEffect syncs localSeconds with initialSeconds when timer is stopped
 */
