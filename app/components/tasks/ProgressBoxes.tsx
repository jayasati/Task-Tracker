import React from 'react';

interface ProgressBoxesProps {
    level: number; // 0-4
    onChange: (level: number) => void;
    taskId: string;
}

export function ProgressBoxes({ level, onChange, taskId }: ProgressBoxesProps) {
    const boxes = [1, 2, 3, 4];

    const getBoxColor = (boxNumber: number): string => {
        // If this box is beyond the current level, show gray
        if (boxNumber > level) {
            return 'bg-gray-200';
        }

        // Color all boxes up to current level based on the level value
        if (level === 0) return 'bg-gray-200';      // Not attempted
        if (level === 1) return 'bg-gray-300';      // Box 1: Not productive
        if (level === 2) return 'bg-yellow-400';    // Boxes 1-2: 50% done (yellow)
        if (level === 3) return 'bg-green-400';     // Boxes 1-3: 70% done (light green)
        if (level === 4) return 'bg-green-600';     // Boxes 1-4: 100% done (dark green)

        return 'bg-gray-200';
    };

    const handleBoxClick = (boxNumber: number) => {
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
                        transition-all duration-200 ease-in-out
                        border border-gray-300
                        hover:transform hover:-translate-y-0.5
                        hover:shadow-md
                        ${getBoxColor(boxNumber)}
                        ${boxNumber === level ? 'ring-1 ring-blue-400' : ''}
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
