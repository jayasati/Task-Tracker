type AddSubtaskProps = {
    isAdding: boolean;
    setIsAdding: (val: boolean) => void;
    value: string;
    onChange: (val: string) => void;
    onAdd: () => void;
};

export function AddSubtask({ isAdding, setIsAdding, value, onChange, onAdd }: AddSubtaskProps) {
    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                + Add Subtask
            </button>
        );
    }

    return (
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                }}
                placeholder="New subtask name..."
                style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e0',
                    fontSize: '13px'
                }}
            />
            <button
                onClick={onAdd}
                style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                }}
            >
                Add
            </button>
            <button
                onClick={() => setIsAdding(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer'
                }}
            >
                Cancel
            </button>
        </div>
    );
}
