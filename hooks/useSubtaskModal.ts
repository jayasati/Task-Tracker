import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { Status } from "@prisma/client";
import { calculateStatusFromSubtasks } from "@/lib/utils/status";
import { toISODate } from "@/lib/utils/date";

type UseSubtaskModalProps = {
    isOpen: boolean;
    taskId: string;
    date: Date;
    statusEntry: any;
    globalSubtasks: string[];
    refetch: () => void;
    prevDayUnfinished: string[];
};

export function useSubtaskModal({
    isOpen,
    taskId,
    date,
    statusEntry,
    globalSubtasks,
    refetch,
    prevDayUnfinished
}: UseSubtaskModalProps) {

    const updateStatus = trpc.task.updateStatus.useMutation({ onSuccess: () => refetch() });
    const updateTask = trpc.task.updateTask.useMutation({ onSuccess: () => { refetch(); setIsPlanning(false); } });

    const [activeTasks, setActiveTasks] = useState<string[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);

    const [isPlanning, setIsPlanning] = useState(false);
    const [nextDaySubtasks, setNextDaySubtasks] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCompleted(statusEntry?.completedSubtasks || []);

            const isHistory = statusEntry && statusEntry.dailySubtasks.length > 0;
            const currentDailyTasks = isHistory ? statusEntry.dailySubtasks : globalSubtasks;

            let tasksToShow: string[] = [];
            if (isHistory) {
                tasksToShow = currentDailyTasks;
            } else {
                tasksToShow = [...prevDayUnfinished, ...currentDailyTasks];
                tasksToShow = Array.from(new Set(tasksToShow));
            }

            setActiveTasks(tasksToShow);
        }
    }, [isOpen, statusEntry, globalSubtasks, prevDayUnfinished]);

    const toggleSubtask = (sub: string) => {
        const newCompleted = completed.includes(sub)
            ? completed.filter((c) => c !== sub)
            : [...completed, sub];

        setCompleted(newCompleted);

        const matchCount = newCompleted.filter(c => activeTasks.includes(c)).length;
        const newStatus = calculateStatusFromSubtasks(activeTasks.length, matchCount);

        // Correct timezone issue locally
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        const dateStr = toISODate(localDate);

        updateStatus.mutate({
            taskId,
            date: dateStr,
            status: newStatus,
            completedSubtasks: newCompleted,
            dailySubtasks: activeTasks,
        });
    };

    const saveNextDayPlan = () => {
        const lines = nextDaySubtasks.split("\n").map(s => s.trim()).filter(Boolean);
        updateTask.mutate({ id: taskId, subtasks: lines });
    };

    const startPlanning = () => {
        setIsPlanning(true);
        setNextDaySubtasks(globalSubtasks.join("\n"));
    };

    return {
        activeTasks,
        completed,
        toggleSubtask,
        isPlanning,
        setIsPlanning,
        nextDaySubtasks,
        setNextDaySubtasks,
        saveNextDayPlan,
        startPlanning,
        isSavingPlan: updateTask.isPending
    };
}

/**
 * FILE: hooks/useSubtaskModal.ts
 * 
 * PURPOSE:
 * Hook managing subtask modal state and logic for a specific day.
 * Handles viewing/editing subtasks for any day (past, present, future).
 * 
 * WHAT IT DOES:
 * - Manages active subtasks and completed state for selected day
 * - Handles subtask toggling with status calculation
 * - Implements "plan next day" feature
 * - Determines if viewing history (frozen) or current day (editable)
 * - Includes rollover logic for current day
 * - Fixes timezone issues when saving dates
 * 
 * DEPENDENCIES (imports from):
 * - react: useState, useEffect hooks
 * - @/utils/trpc: TRPC client for mutations
 * - @prisma/client: Status enum type
 * - @/lib/utils/status: calculateStatusFromSubtasks function
 * - @/lib/utils/date: toISODate for date formatting
 * 
 * DEPENDENTS (files that import this):
 * - app/components/SubtaskModal.tsx: Main modal component
 * 
 * NOTES:
 * - isHistory: true if day has dailySubtasks (frozen), false otherwise
 * - For history days: shows frozen dailySubtasks
 * - For current/future: shows global + rolled over from previous day
 * - toggleSubtask: Updates status based on completion ratio
 * - Timezone fix: Adjusts date by offset before saving
 * - Planning feature: Allows editing global subtasks for next day
 */
