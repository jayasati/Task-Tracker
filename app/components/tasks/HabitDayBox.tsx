"use client";
import React, { useState } from 'react';
import { getDateString } from "@/lib/utils/date";
import { statusLabels, statusIcons } from "@/lib/utils/status";

type HabitDayBoxProps = {
    day: number;
    year: number;
    month: number;
    status: string;
    isToday: boolean;
    colorClass: string;
    isTimeTask: boolean;
    onClick: () => void;
};

export default function HabitDayBox({
    day,
    year,
    month,
    status,
    isToday,
    colorClass,
    isTimeTask,
    onClick
}: HabitDayBoxProps) {
    const [isHovered, setIsHovered] = useState(false);

    const dateString = getDateString(new Date(year, month, day));
    const statusLabel = statusLabels[status as keyof typeof statusLabels] || status;
    const statusIcon = isTimeTask ? null : statusIcons[status as keyof typeof statusIcons];

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`day-box ${colorClass} ${isToday ? 'today' : ''}`}
            style={{ position: 'relative' }}
        >
            <span>{day}</span>
            {statusIcon && (
                <span className="day-box-status-icon">{statusIcon}</span>
            )}
            {isHovered && (
                <div className="day-box-tooltip" style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a202c',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{dateString}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Status: {statusLabel}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Click to cycle</div>
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '6px solid transparent',
                        borderTopColor: '#1a202c'
                    }} />
                </div>
            )}
        </div>
    );
}
