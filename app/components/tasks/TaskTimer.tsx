import { formatTime } from "@/lib/utils/time";

type TaskTimerProps = {
    localSeconds: number;
    isRunning: boolean;
    start: () => void;
    stop: () => void;
};

export function TaskTimer({ localSeconds, isRunning, start, stop }: TaskTimerProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
        }}>
            <p className="time" style={{ fontSize: '24px', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{formatTime(localSeconds)}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    className="btn btn-blue"
                    onClick={start}
                    disabled={isRunning}
                    style={{ opacity: isRunning ? 0.6 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                >
                    Start
                </button>
                <button
                    className="btn"
                    onClick={stop}
                    disabled={!isRunning}
                    style={{
                        background: '#ec4899',
                        color: 'white',
                        opacity: !isRunning ? 0.6 : 1,
                        cursor: !isRunning ? 'not-allowed' : 'pointer'
                    }}
                >
                    Stop
                </button>
            </div>
        </div>
    );
}
