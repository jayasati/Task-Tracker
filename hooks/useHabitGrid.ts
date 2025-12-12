import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/utils/trpc";
import { Task } from "@/types/task";
import { formatDateKey, toISODate, getDateString, isSameDay } from "@/lib/utils/date";
import { nextStatus, statusLabels, statusIcons } from "@/lib/utils/status";

export function useHabitGrid(task: Task, refetch: () => void, currentMonth: Date) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const updateStatus = trpc.task.updateStatus.useMutation({
        onSuccess: () => refetch(),
    });

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Memoize date calculations
    const { daysInMonth, today, isCurrentMonth } = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = isSameDay(new Date(year, month, 1), new Date(today.getFullYear(), today.getMonth(), 1));
        return { daysInMonth, today, isCurrentMonth };
    }, [year, month]);

    // Memoize status map for faster lookups
    const statusMap = useMemo(() => {
        const map = new Map<string, typeof task.statuses[0]>();
        task.statuses.forEach((status) => {
            const dateStr = toISODate(status.date);
            map.set(dateStr, status);
        });
        return map;
    }, [task.statuses]);

    // Memoize logs map for time calculations
    const logsMap = useMemo(() => {
        const map = new Map<string, number>();
        task.logs.forEach((log) => {
            const dateStr = toISODate(log.date);
            map.set(dateStr, (map.get(dateStr) || 0) + log.seconds);
        });
        return map;
    }, [task.logs]);

    const getStatus = useCallback((day: number) => {
        const dateStr = formatDateKey(year, month, day);
        return statusMap.get(dateStr)?.status ?? "NONE";
    }, [year, month, statusMap]);

    const isDayToday = useCallback((day: number) => {
        if (!isCurrentMonth) return false;
        return today.getDate() === day;
    }, [isCurrentMonth, today]);

    const toggle = useCallback((day: number) => {
        const date = new Date(year, month, day);

        if (task.type === "task" && (task.subtasks?.length ?? 0) > 0) {
            setSelectedDate(date);
            setModalOpen(true);
            return;
        }

        if (task.type === "time") {
            return;
        }

        const curr = getStatus(day);
        const next = nextStatus[curr];
        const dateStr = formatDateKey(year, month, day);

        updateStatus.mutate({
            taskId: task.id,
            date: dateStr,
            status: next,
        });
    }, [year, month, task.type, task.subtasks, task.id, getStatus, updateStatus]);

    const getTimeColor = useCallback((day: number) => {
        const dateStr = formatDateKey(year, month, day);
        const dailySeconds = logsMap.get(dateStr) || 0;

        const target = (task.estimate || 0) * 60;
        if (target === 0) return "none";

        const ratio = dailySeconds / target;
        if (ratio >= 1.0) return "success";
        if (ratio > 0.7) return "half";
        if (ratio > 0.3) return "fail";
        return "none";
    }, [year, month, logsMap, task.estimate]);

    const getPrevDayUnfinished = useCallback((currentDay: number): string[] => {
        const targetDate = new Date(year, month, currentDay);
        const targetTime = targetDate.getTime();
        const getTime = (d: string | Date) => new Date(d).getTime();

        const prevStatuses = task.statuses.filter(s => getTime(s.date) < targetTime);

        if (prevStatuses.length === 0) return [];

        const lastStatus = prevStatuses.sort((a, b) => getTime(b.date) - getTime(a.date))[0];

        const sourceList = (lastStatus.dailySubtasks && lastStatus.dailySubtasks.length > 0)
            ? lastStatus.dailySubtasks
            : (task.subtasks ?? []);

        return sourceList.filter(s => !lastStatus.completedSubtasks.includes(s));
    }, [year, month, task.statuses, task.subtasks]);

    const getStatusEntry = useCallback((day: number) => {
        const dateStr = formatDateKey(year, month, day);
        return statusMap.get(dateStr);
    }, [year, month, statusMap]);

    return {
        year,
        month,
        daysInMonth,
        modalOpen,
        setModalOpen,
        selectedDate,
        getStatus,
        isDayToday,
        toggle,
        getTimeColor,
        getPrevDayUnfinished,
        getStatusEntry
    };
}

/**
 * FILE: hooks/useHabitGrid.ts
 * 
 * PURPOSE:
 * Complex hook managing habit grid logic including status tracking, time-based colors,
 * subtask modals, and rollover functionality.
 * 
 * WHAT IT DOES:
 * - Manages modal state for subtask selection
 * - Provides memoized date calculations (daysInMonth, today, isCurrentMonth)
 * - Creates optimized Maps for status and log lookups (O(1) instead of O(n))
 * - getStatus: Returns status for a specific day
 * - isDayToday: Checks if a day is today
 * - toggle: Handles day box clicks (cycles status or opens subtask modal)
 * - getTimeColor: Calculates color based on time spent vs estimate
 * - getPrevDayUnfinished: Gets uncompleted subtasks from previous day
 * - getStatusEntry: Returns full status entry for a day
 * 
 * DEPENDENCIES (imports from):
 * - react: useState, useMemo, useCallback for optimization
 * - @/utils/trpc: TRPC client for updateStatus mutation
 * - @/types/task: Task type definition
 * - @/lib/utils/date: Date formatting utilities
 * - @/lib/utils/status: Status cycle and labels
 * 
 * DEPENDENTS (files that import this):
 * - app/components/HabitGrid.tsx: Main consumer of this hook
 * 
 * NOTES:
 * - Heavily optimized with useMemo and useCallback to prevent re-renders
 * - statusMap and logsMap convert arrays to Maps for O(1) lookups
 * - Time colors: green (≥100%), yellow (>70%), red (>30%), black (<30%)
 * - For task type with subtasks, clicking opens modal instead of toggling
 * - For time type tasks, boxes are non-interactive (color shows progress)
 * - Rollover logic: uncompleted subtasks from previous day carry forward
 */
