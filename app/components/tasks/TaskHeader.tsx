import { Task } from "@/types/task";

type TaskHeaderProps = {
    task: Task;
    onDelete: () => void;
    isDeleting: boolean;
    tick: any; // Using any for the interval type for simplicity, or we can just pass boolean isRunning
};

export function TaskHeader({ task, onDelete, isDeleting, tick }: TaskHeaderProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{task.title}</h3>
                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: '#f3f4f6', color: '#374151', textTransform: 'capitalize' }}>
                        {task.type}
                    </span>
                    {task.estimate ? <span style={{ fontSize: '12px', color: '#6b7280' }}>{task.estimate}m</span> : null}
                </div>
                {task.notes && <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>{task.notes}</p>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                    className="btn"
                    onClick={onDelete}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '13px',
                        borderRadius: '6px',
                        opacity: isDeleting ? 0.6 : 1,
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        border: 'none'
                    }}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                {tick && (
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        animation: 'pulse 2s infinite',
                        boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
                    }} />
                )}
            </div>
        </div>
    );
}
