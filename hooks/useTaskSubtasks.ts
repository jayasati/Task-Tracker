import { useState, useEffect } from "react";
import { Task } from "@/types/task";

export function useTaskSubtasks(
    task: Task,
    updateStatus: any,
    refetch: () => void
) {
    const today = new Date().toISOString().split("T")[0];

    const currentStatus = task.statuses.find((s) => {
        const d = new Date(s.date);
        return d.toISOString().split("T")[0] === today;
    });

    const [localCompleted, setLocalCompleted] = useState<string[]>([]);

    useEffect(() => {
        if (currentStatus) {
            setLocalCompleted(currentStatus.completedSubtasks);
        } else {
            setLocalCompleted([]);
        }
    }, [currentStatus]);

    const completedSubtasks = localCompleted;

    // Rollover Logic
    const prevStatus = task.statuses
        .filter(s => new Date(s.date) < new Date(today))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    let rolledOverSubtasks: string[] = [];
    if (prevStatus) {
        const prevDaily = (prevStatus.dailySubtasks && prevStatus.dailySubtasks.length > 0)
            ? prevStatus.dailySubtasks
            : (task.subtasks ?? []);
        rolledOverSubtasks = prevDaily.filter(s => !prevStatus.completedSubtasks.includes(s));
    }

    const hasDailySubtasks = currentStatus?.dailySubtasks && currentStatus.dailySubtasks.length > 0;
    const activeSubtasks = hasDailySubtasks
        ? (currentStatus?.dailySubtasks ?? [])
        : Array.from(new Set([...rolledOverSubtasks, ...(task.subtasks ?? [])]));

    const toggleSubtask = (sub: string) => {
        const isCompleted = completedSubtasks.includes(sub);
        const newCompleted = isCompleted
            ? completedSubtasks.filter((s) => s !== sub)
            : [...completedSubtasks, sub];

        setLocalCompleted(newCompleted);

        let newStatus = currentStatus?.status ?? "NONE";
        const total = activeSubtasks.length;
        if (total > 0) {
            const count = newCompleted.length;
            if (count === total) {
                newStatus = "SUCCESS";
            } else if (count > 0) {
                newStatus = "HALF";
            } else {
                newStatus = "NONE";
            }
        }

        updateStatus.mutate({
            taskId: task.id,
            date: today,
            completedSubtasks: newCompleted,
            status: newStatus as "NONE" | "FAIL" | "HALF" | "SUCCESS",
            dailySubtasks: activeSubtasks,
        });
    };

    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskName, setNewSubtaskName] = useState("");

    const handleAddSubtask = () => {
        if (!newSubtaskName.trim()) return;

        const newActive = [...activeSubtasks, newSubtaskName.trim()];
        const uniqueActive = Array.from(new Set(newActive));

        updateStatus.mutate({
            taskId: task.id,
            date: today,
            dailySubtasks: uniqueActive,
            completedSubtasks: completedSubtasks,
            status: (currentStatus?.status === "SUCCESS") ? "HALF" : (currentStatus?.status ?? "NONE")
        }, {
            onSuccess: () => {
                setIsAddingSubtask(false);
                setNewSubtaskName("");
                refetch();
            }
        });
    };

    return {
        activeSubtasks,
        completedSubtasks,
        toggleSubtask,
        handleAddSubtask,
        isAddingSubtask,
        setIsAddingSubtask,
        newSubtaskName,
        setNewSubtaskName
    };
}

/**
 * FILE: hooks/useTaskSubtasks.ts
 * 
 * PURPOSE:
 * Hook managing subtask state and logic for tasks with subtasks.
 * Handles completion tracking, rollover, and adding new subtasks.
 * 
 * WHAT IT DOES:
 * - Finds today's status entry from task statuses
 * - Manages local completed subtasks state
 * - Implements rollover logic (uncompleted from previous day)
 * - Determines active subtasks (daily frozen or global + rolled over)
 * - toggleSubtask: Marks subtask complete/incomplete, updates status
 * - handleAddSubtask: Adds new subtask to today's daily list
 * - Calculates task status based on completion ratio
 * 
 * DEPENDENCIES (imports from):
 * - react: useState, useEffect hooks
 * - @/types/task: Task type definition
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TaskCard.tsx: Uses for subtask management
 * - app/components/tasks/SubtaskList.tsx: Displays subtasks
 * 
 * NOTES:
 * - Rollover: Uncompleted subtasks from previous day carry to today
 * - Daily freeze: Once status is set, dailySubtasks are frozen for that day
 * - Status calculation: 0% = NONE, 100% = SUCCESS, partial = HALF
 * - updateStatus mutation includes completedSubtasks and dailySubtasks
 * - Uses ISO date string for today comparison
 * - prevStatus: Most recent status before today (for rollover)
 */
