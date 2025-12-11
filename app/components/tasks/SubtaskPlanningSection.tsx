"use client";
import React from 'react';

type SubtaskPlanningSectionProps = {
    isPlanning: boolean;
    setIsPlanning: (v: boolean) => void;
    nextDaySubtasks: string;
    setNextDaySubtasks: (v: string) => void;
    saveNextDayPlan: () => void;
    startPlanning: () => void;
    isSavingPlan: boolean;
    allItemsDone: boolean;
    hasActiveTasks: boolean;
};

export default function SubtaskPlanningSection({
    isPlanning,
    setIsPlanning,
    nextDaySubtasks,
    setNextDaySubtasks,
    saveNextDayPlan,
    startPlanning,
    isSavingPlan,
    allItemsDone,
    hasActiveTasks
}: SubtaskPlanningSectionProps) {

    if (!isPlanning && allItemsDone && hasActiveTasks) {
        return (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    Great job! Want to adjust tasks for tomorrow?
                </p>
                <button
                    className="btn"
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e0', color: '#475569' }}
                    onClick={startPlanning}
                >
                    Plan Next Day
                </button>
            </div>
        );
    }

    if (isPlanning) {
        return (
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
                        onClick={saveNextDayPlan}
                        disabled={isSavingPlan}
                    >
                        {isSavingPlan ? 'Saving...' : 'Save & Close'}
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
        );
    }

    return null;
}
