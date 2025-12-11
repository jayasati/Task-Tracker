type SubtaskListProps = {
    activeSubtasks: string[];
    completedSubtasks: string[];
    toggleSubtask: (sub: string) => void;
    hasSubtasksConfigured: boolean;
};

export function SubtaskList({ activeSubtasks, completedSubtasks, toggleSubtask, hasSubtasksConfigured }: SubtaskListProps) {
    if (activeSubtasks.length === 0 && !hasSubtasksConfigured) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeSubtasks.map((sub, idx) => {
                const isCompleted = completedSubtasks.includes(sub);
                return (
                    <div
                        key={idx}
                        onClick={() => toggleSubtask(sub)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: isCompleted ? '1px solid #3b82f6' : '1px solid #cbd5e0',
                            borderRadius: '4px',
                            background: isCompleted ? '#3b82f6' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}>
                            {isCompleted && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span style={{
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? '#9ca3af' : 'inherit'
                        }}>{sub}</span>
                    </div>
                );
            })}
        </div>
    );
}
