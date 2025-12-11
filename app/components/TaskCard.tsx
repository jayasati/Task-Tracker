"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import HabitGrid from "./HabitGrid";
import { Status } from "@prisma/client";


type TaskCardProps = {
  task: {
    id: string;
    title: string;
    type: string; // relax from literal union to string to match Prisma
    // New fields
    repeatMode?: string;
    weekdays?: number[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    priority?: string;
    category?: string | null;
    amount?: string | null;
    estimate?: number | null;
    subtasks?: string[];
    notes?: string | null;

    logs: { seconds: number }[];

    statuses: {
      id: string;
      taskId: string;
      date: string | Date;
      status: Status;
    }[];
  };

  refetch: () => void;
  currentMonth: Date;
};


export default function TaskCard({ task, refetch, currentMonth }: TaskCardProps) {
  const utils = trpc.useUtils();
  const updateSeconds = trpc.task.updateSeconds.useMutation();
  const deleteTask = trpc.task.deleteTask.useMutation({
    // Optimistic remove; rollback on error
    onMutate: async ({ taskId }) => {
      await utils.task.getTasks.cancel();
      const prev = utils.task.getTasks.getData();
      if (prev) {
        utils.task.getTasks.setData(undefined, prev.filter((t) => t.id !== taskId));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.task.getTasks.setData(undefined, ctx.prev);
    },
    onSuccess: () => {
      // Keep cache in sync; background refetch
      utils.task.getTasks.invalidate();
      refetch();
    },
  });

  const totalFromDB = task.logs.reduce((s, l) => s + l.seconds, 0);
  const [localSeconds, setLocalSeconds] = useState(totalFromDB);
  const [tick, setTick] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tick) setLocalSeconds(totalFromDB);
  }, [totalFromDB]);

  const today = new Date().toISOString().split("T")[0];

  const start = () => {
    if (tick) return;
    const id = setInterval(() => setLocalSeconds((prev) => prev + 1), 1000);
    setTick(id);
  };

  const stop = () => {
    if (!tick) return;
    clearInterval(tick);
    setTick(null);

    const gained = localSeconds - totalFromDB;
    if (gained > 0) {
      updateSeconds.mutate(
        {
          taskId: task.id,
          seconds: gained,
          date: today,
        },
        { onSuccess: refetch }
      );
    }
  };

  const format = (s: number) =>
    new Date(s * 1000).toISOString().substring(11, 19);

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this task? This cannot be undone.");
    if (!confirmed) return;
    deleteTask.mutate({ taskId: task.id });
  };

  return (
    <div className="box task">
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
            onClick={handleDelete}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              opacity: deleteTask.isPending ? 0.6 : 1,
              cursor: deleteTask.isPending ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
            disabled={deleteTask.isPending}
          >
            {deleteTask.isPending ? 'Deleting...' : 'Delete'}
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

      {task.type === "time" && (
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
          <p className="time" style={{ fontSize: '24px', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{format(localSeconds)}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-blue"
              onClick={start}
              disabled={!!tick}
              style={{ opacity: tick ? 0.6 : 1, cursor: tick ? 'not-allowed' : 'pointer' }}
            >
              Start
            </button>
            <button
              className="btn"
              onClick={stop}
              disabled={!tick}
              style={{
                background: '#ec4899',
                color: 'white',
                opacity: !tick ? 0.6 : 1,
                cursor: !tick ? 'not-allowed' : 'pointer'
              }}
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Subtasks Section */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>Subtasks</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {task.subtasks.map((sub, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <div style={{ width: '16px', height: '16px', border: '1px solid #cbd5e0', borderRadius: '4px' }}></div>
                <span>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <HabitGrid task={task} refetch={refetch} currentMonth={currentMonth} />

      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
        <div>Priority: <span style={{ fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>{task.priority || 'Medium'}</span></div>
        <div>Category: <span style={{ fontWeight: 600, color: '#1f2937' }}>{task.category || '-'}</span></div>
      </div>
    </div>
  );
}
