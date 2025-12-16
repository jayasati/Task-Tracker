"use client";
import React, { useState, useEffect } from 'react';

interface ProgressBoxesProps {
    level: number; // 0-4
    onChange: (level: number) => void;
    taskId: string;
}

export function ProgressBoxes({ level, onChange, taskId }: ProgressBoxesProps) {
    const boxes = [1, 2, 3, 4];
    // Local state for instant visual feedback
    const [localLevel, setLocalLevel] = useState(level);

    // Sync with prop changes from server
    useEffect(() => {
        setLocalLevel(level);
    }, [level]);

    const getBoxColor = (boxNumber: number): string => {
        // If this box is beyond the current level, show gray
        if (boxNumber > localLevel) {
            return 'bg-gray-200';
        }

        // Color all boxes up to current level based on the level value
        if (localLevel === 0) return 'bg-gray-200';      // Not attempted
        if (localLevel === 1) return 'bg-gray-300';      // Box 1: Not productive
        if (localLevel === 2) return 'bg-yellow-400';    // Boxes 1-2: 50% done (yellow)
        if (localLevel === 3) return 'bg-green-400';     // Boxes 1-3: 70% done (light green)
        if (localLevel === 4) return 'bg-green-600';     // Boxes 1-4: 100% done (dark green)

        return 'bg-gray-200';
    };

    const handleBoxClick = (boxNumber: number) => {
        // Update local state immediately for instant feedback
        setLocalLevel(boxNumber);
        // Then trigger the mutation
        onChange(boxNumber);
    };

    return (
        <div className="flex gap-1.5">
            {boxes.map((boxNumber) => (
                <button
                    key={boxNumber}
                    type="button"
                    onClick={() => handleBoxClick(boxNumber)}
                    className={`
                        w-12 h-8 rounded cursor-pointer
                        transition-colors duration-100
                        border border-gray-300
                        hover:transform hover:-translate-y-0.5
                        hover:shadow-md
                        active:scale-95
                        ${getBoxColor(boxNumber)}
                        ${boxNumber === localLevel ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    `}
                    title={`Level ${boxNumber}: ${boxNumber === 1 ? 'Not productive' :
                        boxNumber === 2 ? '50% done' :
                            boxNumber === 3 ? '70% done' :
                                '100% complete'
                        }`}
                    aria-label={`Set progress to level ${boxNumber}`}
                />
            ))}
        </div>
    );
}
