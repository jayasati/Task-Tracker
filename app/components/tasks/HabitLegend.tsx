"use client";
import React from 'react';

export default function HabitLegend() {
    const legends = [
        { label: "None", color: "#f1f5f9", isActive: false },
        { label: "Failed", color: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", isActive: true },
        { label: "Partial", color: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", isActive: true },
        { label: "Success", color: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", isActive: true }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            flexWrap: 'wrap'
        }}>
            {legends.map((legend, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: legend.color,
                        border: legend.isActive ? 'none' : '1px solid #cbd5e0'
                    }} />
                    <span style={{ color: '#64748b' }}>{legend.label}</span>
                </div>
            ))}
        </div>
    );
}
