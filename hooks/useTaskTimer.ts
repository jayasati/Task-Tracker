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
