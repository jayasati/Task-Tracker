"use client";
import { useState, useMemo } from "react";
import { get2AMBoundaries } from "@/lib/utils/date";
import {
    calculateTimeBasedStatus,
    calculateAmountBasedStatus,
    calculateBothStatus,
    getStatusColor,
} from "@/lib/utils/autoEvaluation";

interface StatusBadgeProps {
    task: any;
    timerSessions?: any[];
    todayCompletedSubtasks?: number;
    totalSubtasks?: number;
}

export default function StatusBadge({ task, timerSessions = [], todayCompletedSubtasks = 0, totalSubtasks = 0 }: StatusBadgeProps) {
    const evaluation = useMemo(() => {
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

        // Calculate status based on habit type
        if (habitType === "time") {
            // If time habit has subtasks, use subtask completion for status
            if (hasSubtasks) {
                return calculateAmountBasedStatus(todayCompletedSubtasks, totalSubtasks);
            }
            return calculateTimeBasedStatus(todayMinutes, requiredMinutes || 0);
        } else if (habitType === "amount") {
            // Use subtasks count if available, otherwise requiredAmount
            const required = hasSubtasks ? totalSubtasks : (requiredAmount || 0);
            return calculateAmountBasedStatus(todayCompletedSubtasks, required);
        } else if (habitType === "both") {
            const required = hasSubtasks ? totalSubtasks : (requiredAmount || 0);
            return calculateBothStatus(
                todayMinutes,
                requiredMinutes || 0,
                todayCompletedSubtasks,
                required
            );
        }

        return null;
    }, [task, timerSessions, todayCompletedSubtasks, totalSubtasks]);

    if (!evaluation) return null;

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
            {evaluation.label}
        </div>
    );
}
