'use client';

import React from 'react';

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

interface TimeRangeToggleProps {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
}

const ranges: { id: TimeRange; label: string }[] = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' }
];

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
    return (
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {ranges.map((range) => (
                <button
                    key={range.id}
                    onClick={() => onChange(range.id)}
                    className={`
                        px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                        ${value === range.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
                    `}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
}
