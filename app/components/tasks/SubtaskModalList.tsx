"use client";
import React from 'react';

type SubtaskModalListProps = {
    activeTasks: string[];
    completed: string[];
    toggleSubtask: (sub: string) => void;
};

export default function SubtaskModalList({ activeTasks, completed, toggleSubtask }: SubtaskModalListProps) {
    return (
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
    );
}
