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

    logs: { seconds: number; date: string | Date }[];

    statuses: {
      id: string;
      taskId: string;
      date: string | Date;
      status: Status;
      completedSubtasks: string[];
      dailySubtasks: string[];
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

  const updateStatus = trpc.task.updateStatus.useMutation({
    onSuccess: refetch, // or optimistically update if feeling brave
  });

  const today = new Date().toISOString().split("T")[0];

  const totalFromDB = task.logs.reduce((s, l) => s + l.seconds, 0);
  const [localSeconds, setLocalSeconds] = useState(totalFromDB);
  const [tick, setTick] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tick) setLocalSeconds(totalFromDB);
  }, [totalFromDB]);

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

  const currentStatus = task.statuses.find((s) => {
    const d = new Date(s.date);
    return d.toISOString().split("T")[0] === today;
  });

  // OPTIMISTIC STATE: Initialize from props, but allow immediate local updates
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);

  useEffect(() => {
    // Sync with server data when it arrives
    if (currentStatus) {
      setLocalCompleted(currentStatus.completedSubtasks);
    } else {
      setLocalCompleted([]);
    }
  }, [currentStatus]);

  const completedSubtasks = localCompleted; // Use local state for rendering

  // Calculate Subtask Rollover Logic
  // 1. Find the most recent status record before today
  const prevStatus = task.statuses
    .filter(s => new Date(s.date) < new Date(today))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // 2. Identify uncompleted tasks from that day
  let rolledOverSubtasks: string[] = [];
  if (prevStatus) {
    const prevDaily = (prevStatus.dailySubtasks && prevStatus.dailySubtasks.length > 0)
      ? prevStatus.dailySubtasks
      : (task.subtasks ?? []);
    rolledOverSubtasks = prevDaily.filter(s => !prevStatus.completedSubtasks.includes(s));
  }

  // Use daily-specific subtasks if they exist (and strictly if array is not empty to avoid overwriting with empty), 
  // otherwise fallback to template + rollover. 
  // Note: If user deletes all day subtasks, we might need a flag, but for now assuming empty = fallback is safer for migration.
  const hasDailySubtasks = currentStatus?.dailySubtasks && currentStatus.dailySubtasks.length > 0;

  const activeSubtasks = hasDailySubtasks
    ? (currentStatus?.dailySubtasks ?? [])
    : Array.from(new Set([...rolledOverSubtasks, ...(task.subtasks ?? [])]));

  const toggleSubtask = (sub: string) => {
    const isCompleted = completedSubtasks.includes(sub);
    const newCompleted = isCompleted
      ? completedSubtasks.filter((s) => s !== sub)
      : [...completedSubtasks, sub];

    // 1. Optimistic Update
    setLocalCompleted(newCompleted);

    // 2. Calculate new status
    let newStatus = currentStatus?.status ?? "NONE";
    const total = activeSubtasks.length;
    if (total > 0) {
      const count = newCompleted.length;
      if (count === total) {
        newStatus = "SUCCESS";
      } else if (count > 0) {
        newStatus = "HALF";
      } else {
        newStatus = "NONE";
      }
    }

    // 3. Mutate (background sync)
    // We don't wait for success to update UI
    updateStatus.mutate({
      taskId: task.id,
      date: today,
      completedSubtasks: newCompleted,
      status: newStatus as "NONE" | "FAIL" | "HALF" | "SUCCESS",
      dailySubtasks: activeSubtasks,
    });
  };

  // ADD SUBTASK LOGIC
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;

    const newActive = [...activeSubtasks, newSubtaskName.trim()];
    const uniqueActive = Array.from(new Set(newActive));

    updateStatus.mutate({
      taskId: task.id,
      date: today,
      dailySubtasks: uniqueActive,
      completedSubtasks: completedSubtasks,
      status: (currentStatus?.status === "SUCCESS") ? "HALF" : (currentStatus?.status ?? "NONE")
    }, {
      onSuccess: () => {
        setIsAddingSubtask(false);
        setNewSubtaskName("");
        refetch();
      }
    });

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
      {/* Subtasks Section */}
      {(
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Subtasks</strong>
          </div>

          {(activeSubtasks.length > 0 || (task.subtasks?.length ?? 0) > 0) && (
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
          )}

          {/* Add Subtask UI */}
          {!isAddingSubtask ? (
            <button
              onClick={() => setIsAddingSubtask(true)}
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
          ) : (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              <input
                autoFocus
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') setIsAddingSubtask(false);
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
                onClick={handleAddSubtask}
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
                onClick={() => setIsAddingSubtask(false)}
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
          )}
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
