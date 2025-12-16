"use client";
import { useMemo } from "react";
import { get2AMBoundaries } from "@/lib/utils/date";

interface ProgressIndicatorProps {
    task: any;
    timerSessions?: any[];
    todayCompletedSubtasks?: number;
    totalSubtasks?: number;
}

export default function ProgressIndicator({ task, timerSessions = [], todayCompletedSubtasks = 0, totalSubtasks = 0 }: ProgressIndicatorProps) {
    const percentage = useMemo(() => {
        const { habitType, requiredMinutes, requiredAmount } = task;
        const hasSubtasks = totalSubtasks > 0;

        // Calculate today's time from timer sessions (2AM to 2AM)
        const { start, end } = get2AMBoundaries(new Date());
        const todaySeconds = timerSessions
            .filter((session) => {
                const sessionDate = new Date(session.date);
                return sessionDate >= start && sessionDate < end && !session.isActive;
            })
            .reduce((sum, session) => sum + (session.seconds || 0), 0);

        const todayMinutes = todaySeconds / 60;

        // For time-based habits WITH subtasks, use subtask completion as progress
        if (habitType === "time" && hasSubtasks) {
            // Subtask progress takes priority if subtasks exist
            const subtaskPercent = Math.min((todayCompletedSubtasks / totalSubtasks) * 100, 100);
            // Also calculate time progress if required
            const timePercent = requiredMinutes ? Math.min((todayMinutes / requiredMinutes) * 100, 100) : 0;
            // Use the higher of the two
            return Math.max(subtaskPercent, timePercent);
        }

        // Calculate percentage based on habit type
        if (habitType === "time" && requiredMinutes) {
            return Math.min((todayMinutes / requiredMinutes) * 100, 100);
        } else if (habitType === "amount") {
            // Use subtasks if available, otherwise use requiredAmount
            if (hasSubtasks) {
                return Math.min((todayCompletedSubtasks / totalSubtasks) * 100, 100);
            } else if (requiredAmount) {
                return Math.min((todayCompletedSubtasks / requiredAmount) * 100, 100);
            }
        } else if (habitType === "both") {
            const timePercent = requiredMinutes ? Math.min((todayMinutes / requiredMinutes) * 100, 100) : 0;
            let amountPercent = 0;
            if (hasSubtasks) {
                amountPercent = Math.min((todayCompletedSubtasks / totalSubtasks) * 100, 100);
            } else if (requiredAmount) {
                amountPercent = Math.min((todayCompletedSubtasks / requiredAmount) * 100, 100);
            }
            return Math.max(timePercent, amountPercent);
        }

        return 0;
    }, [task, timerSessions, todayCompletedSubtasks, totalSubtasks]);

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
