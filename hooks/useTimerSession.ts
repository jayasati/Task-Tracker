import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { get2AMDayKey, get2AMBoundaries } from "@/lib/utils/date";

interface UseTimerSessionProps {
    taskId: string;
    onRefresh: () => void;
}

export function useTimerSession({ taskId, onRefresh }: UseTimerSessionProps) {
    const [localSeconds, setLocalSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const { data: activeTimer, refetch: refetchActiveTimer } = trpc.task.getActiveTimer.useQuery(
        { taskId },
        { refetchInterval: isRunning ? 1000 : false }
    );

    const startTimer = trpc.task.startTimer.useMutation({
        onSuccess: (session) => {
            setSessionId(session.id);
            setIsRunning(true);
            setLocalSeconds(0);
            refetchActiveTimer();
        },
    });

    const stopTimer = trpc.task.stopTimer.useMutation({
        onSuccess: () => {
            setIsRunning(false);
            setSessionId(null);
            setLocalSeconds(0);
            onRefresh();
            refetchActiveTimer();
        },
    });

    // Update local seconds when timer is running
    useEffect(() => {
        if (!isRunning || !activeTimer) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
            setLocalSeconds(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, activeTimer]);

    // Check for active timer on mount
    useEffect(() => {
        if (activeTimer) {
            setSessionId(activeTimer.id);
            setIsRunning(true);
            const elapsed = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
            setLocalSeconds(elapsed);
        }
    }, [activeTimer]);

    const handleStart = () => {
        const dayKey = get2AMDayKey(new Date());
        startTimer.mutate({ taskId, date: dayKey });
    };

    const handleStop = () => {
        stopTimer.mutate({ taskId });
    };

    return {
        localSeconds,
        isRunning,
        start: handleStart,
        stop: handleStop,
        isPending: startTimer.isPending || stopTimer.isPending,
    };
}

/**
 * FILE: hooks/useTimerSession.ts
 * 
 * PURPOSE:
 * Hook for managing timer sessions with 2AM reset logic
 * 
 * FEATURES:
 * - Start/stop timer sessions
 * - Track elapsed time in real-time
 * - Persist timer state across page refreshes
 * - Use 2AM day boundaries for session tracking
 */
