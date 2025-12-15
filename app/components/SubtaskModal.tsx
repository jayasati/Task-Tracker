"use client";
import React from "react";
import { Status } from "@/types/task";
import { useSubtaskModal } from "@/hooks/useSubtaskModal";
import SubtaskModalList from "./tasks/SubtaskModalList";
import SubtaskPlanningSection from "./tasks/SubtaskPlanningSection";

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

export default function SubtaskModal(props: SubtaskModalProps) {
    if (!props.isOpen) return null;

    const {
        activeTasks,
        completed,
        toggleSubtask,
        isPlanning,
        setIsPlanning,
        nextDaySubtasks,
        setNextDaySubtasks,
        saveNextDayPlan,
        startPlanning,
        isSavingPlan
    } = useSubtaskModal(props);

    const itemsDone = completed.filter(c => activeTasks.includes(c)).length;
    const allItemsDone = itemsDone === activeTasks.length && itemsDone > 0;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={props.onClose}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', minWidth: '300px', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>
                    {props.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>

                <SubtaskModalList
                    activeTasks={activeTasks}
                    completed={completed}
                    toggleSubtask={toggleSubtask}
                />

                <SubtaskPlanningSection
                    isPlanning={isPlanning}
                    setIsPlanning={setIsPlanning}
                    nextDaySubtasks={nextDaySubtasks}
                    setNextDaySubtasks={setNextDaySubtasks}
                    saveNextDayPlan={saveNextDayPlan}
                    startPlanning={startPlanning}
                    isSavingPlan={isSavingPlan}
                    allItemsDone={allItemsDone}
                    hasActiveTasks={activeTasks.length > 0}
                />

                {!isPlanning && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={props.onClose} className="btn">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}
