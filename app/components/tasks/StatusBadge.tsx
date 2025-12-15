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
}

export default function StatusBadge({ task, timerSessions = [], todayCompletedSubtasks = 0 }: StatusBadgeProps) {
    const evaluation = useMemo(() => {
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

        // Calculate status based on habit type
        if (habitType === "time") {
            return calculateTimeBasedStatus(todayMinutes, requiredMinutes || 0);
        } else if (habitType === "amount") {
            return calculateAmountBasedStatus(todayCompletedSubtasks, requiredAmount || 0);
        } else if (habitType === "both") {
            return calculateBothStatus(
                todayMinutes,
                requiredMinutes || 0,
                todayCompletedSubtasks,
                requiredAmount || 0
            );
        }

        return null;
    }, [task, timerSessions, todayCompletedSubtasks]);

    if (!evaluation) return null;

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
            {evaluation.label}
        </div>
    );
}
