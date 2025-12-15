"use client";
import { useMemo } from "react";
import { get2AMBoundaries } from "@/lib/utils/date";

interface ProgressIndicatorProps {
    task: any;
    timerSessions?: any[];
    todayCompletedSubtasks?: number;
}

export default function ProgressIndicator({ task, timerSessions = [], todayCompletedSubtasks = 0 }: ProgressIndicatorProps) {
    const percentage = useMemo(() => {
        const { habitType, requiredMinutes, requiredAmount } = task;

        // Calculate today's time from timer sessions (2AM to 2AM)
        const { start, end } = get2AMBoundaries(new Date());
        const todaySeconds = timerSessions
            .filter((session) => {
                const sessionDate = new Date(session.date);
                return sessionDate >= start && sessionDate < end && !session.isActive;
            })
            .reduce((sum, session) => sum + (session.seconds || 0), 0);

        const todayMinutes = todaySeconds / 60;

        // Calculate percentage based on habit type
        if (habitType === "time" && requiredMinutes) {
            return Math.min((todayMinutes / requiredMinutes) * 100, 100);
        } else if (habitType === "amount" && requiredAmount) {
            return Math.min((todayCompletedSubtasks / requiredAmount) * 100, 100);
        } else if (habitType === "both" && requiredMinutes && requiredAmount) {
            const timePercent = Math.min((todayMinutes / requiredMinutes) * 100, 100);
            const amountPercent = Math.min((todayCompletedSubtasks / requiredAmount) * 100, 100);
            return Math.max(timePercent, amountPercent);
        }

        return 0;
    }, [task, timerSessions, todayCompletedSubtasks]);

    if (!task.habitType || task.habitType === "") return null;

    const getColor = () => {
        if (percentage >= 100) return "bg-green-600";
        if (percentage >= 70) return "bg-green-400";
        if (percentage >= 50) return "bg-yellow-500";
        if (percentage > 0) return "bg-red-500";
        return "bg-gray-200";
    };

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
