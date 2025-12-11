import { useState } from "react";
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
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = isSameDay(new Date(year, month, 1), new Date(today.getFullYear(), today.getMonth(), 1));

    const getStatus = (day: number) => {
        const dateStr = formatDateKey(year, month, day);
        return (
            task.statuses.find((s) => toISODate(s.date) === dateStr)?.status ?? "NONE"
        );
    };

    const isDayToday = (day: number) => {
        if (!isCurrentMonth) return false;
        return today.getDate() === day;
    };

    const toggle = (day: number) => {
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
    };

    const getTimeColor = (day: number) => {
        const dateStr = formatDateKey(year, month, day);
        const dailySeconds = task.logs
            .filter(l => toISODate(l.date) === dateStr)
            .reduce((acc, l) => acc + l.seconds, 0);

        const target = (task.estimate || 0) * 60;
        if (target === 0) return "none";

        const ratio = dailySeconds / target;
        if (ratio >= 1.0) return "success";
        if (ratio > 0.7) return "half";
        if (ratio > 0.3) return "fail";
        return "none";
    };

    const getPrevDayUnfinished = (currentDay: number): string[] => {
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
    };

    const getStatusEntry = (day: number) => {
        const dateStr = formatDateKey(year, month, day);
        return task.statuses.find((s) => toISODate(s.date) === dateStr);
    };

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
