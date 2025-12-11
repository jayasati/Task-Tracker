"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { Status } from "@prisma/client";

type SubtaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    date: Date;
    statusEntry: {
        status: Status;
        completedSubtasks: string[];
        dailySubtasks: string[];
    } | undefined;
    globalSubtasks: string[];
    refetch: () => void;
    prevDayUnfinished: string[];
};

export default function SubtaskModal({
    isOpen,
    onClose,
    taskId,
    date,
    statusEntry,
    globalSubtasks,
    refetch,
    prevDayUnfinished,
}: SubtaskModalProps) {
    const updateStatus = trpc.task.updateStatus.useMutation({
        onSuccess: () => {
            refetch();
        }
    });

    const updateTask = trpc.task.updateTask.useMutation({
        onSuccess: () => {
            refetch();
            setIsPlanning(false);
        }
    });

    // If dailySubtasks exists (history), use it. Else use global.
    const isHistory = statusEntry && statusEntry.dailySubtasks.length > 0;
    const currentDailyTasks = isHistory ? statusEntry.dailySubtasks : globalSubtasks;

    // State for optimistic updates
    const [completed, setCompleted] = useState<string[]>(statusEntry?.completedSubtasks || []);

    // Combine Today's + Rollover
    const [activeTasks, setActiveTasks] = useState<string[]>([]);

    // Planning Mode State
    const [isPlanning, setIsPlanning] = useState(false);
    const [nextDaySubtasks, setNextDaySubtasks] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCompleted(statusEntry?.completedSubtasks || []);
            // If we have history, use it. If not, use global + rollover

            let tasksToShow = [...currentDailyTasks];

            // If this is a fresh day (no history preserved yet), prepend rollover tasks
            // Ensure unique strings if simple strings
            if (!isHistory && prevDayUnfinished.length > 0) {
                tasksToShow = [...prevDayUnfinished, ...tasksToShow];
                // Dedupe?
                tasksToShow = Array.from(new Set(tasksToShow));
            }
            setActiveTasks(tasksToShow);
        }
    }, [isOpen, statusEntry, globalSubtasks, prevDayUnfinished, isHistory]);

    if (!isOpen) return null;

    const toggleSubtask = (sub: string) => {
        const newCompleted = completed.includes(sub)
            ? completed.filter((c) => c !== sub)
            : [...completed, sub];

        setCompleted(newCompleted);

        // Calculate status: Match TaskCard logic
        // All done = SUCCESS
        // Some done = HALF
        // None done = NONE (or FAIL if explicitly failed, but for auto-update let's use NONE)

        const total = activeTasks.length;
        const done = newCompleted.filter(c => activeTasks.includes(c)).length;

        let newStatus: Status = "NONE";
        if (total > 0) {
            if (done === total) newStatus = "SUCCESS";
            else if (done > 0) newStatus = "HALF";
            else newStatus = "NONE";
        }

        updateStatus.mutate({
            taskId,
            date: date.toLocaleDateString("en-CA"),
            status: newStatus,
            completedSubtasks: newCompleted,
            dailySubtasks: activeTasks, // Freeze the list!
        });
    };

    const isToday = new Date().toLocaleDateString("en-CA") === date.toLocaleDateString("en-CA");
    const itemsDone = completed.filter(c => activeTasks.includes(c)).length;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={onClose}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', minWidth: '300px', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>
                    {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto' }}>
                    {activeTasks.length === 0 ? (
                        <p style={{ color: '#888' }}>No subtasks for this day.</p>
                    ) : (
                        activeTasks.map((sub, idx) => (
                            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={completed.includes(sub)}
                                    onChange={() => toggleSubtask(sub)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{
                                    textDecoration: completed.includes(sub) ? 'line-through' : 'none',
                                    color: completed.includes(sub) ? '#94a3b8' : '#334155'
                                }}>{sub}</span>
                            </label>
                        ))
                    )}
                </div>

                {/* Plan Next Day Section */}
                {!isPlanning && itemsDone === activeTasks.length && itemsDone > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                            Great job! Want to adjust tasks for tomorrow?
                        </p>
                        <button
                            className="btn"
                            style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e0', color: '#475569' }}
                            onClick={() => {
                                setIsPlanning(true);
                                setNextDaySubtasks(globalSubtasks.join("\n"));
                            }}
                        >
                            Plan Next Day
                        </button>
                    </div>
                )}

                {isPlanning && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>Edit Tomorrow's Subtasks</h4>
                        <textarea
                            value={nextDaySubtasks}
                            onChange={(e) => setNextDaySubtasks(e.target.value)}
                            placeholder="Enter subtasks, one per line..."
                            style={{
                                width: '100%', minHeight: '100px', padding: '8px',
                                borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', fontFamily: 'inherit'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                                className="btn btn-blue"
                                style={{ flex: 1, background: '#3b82f6', color: 'white' }}
                                onClick={() => {
                                    const lines = nextDaySubtasks.split("\n").map(s => s.trim()).filter(Boolean);
                                    updateTask.mutate({ id: taskId, subtasks: lines });
                                }}
                                disabled={updateTask.isPending}
                            >
                                {updateTask.isPending ? 'Saving...' : 'Save & Close'}
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'transparent', border: '1px solid #cbd5e0', color: '#64748b' }}
                                onClick={() => setIsPlanning(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {!isPlanning && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={onClose} className="btn">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}
