"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import HabitGrid from "./HabitGrid";
import { Status } from "@prisma/client";


type TaskCardProps = {
  task: {
    id: string;
    title: string;
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
  const updateSeconds = trpc.task.updateSeconds.useMutation();

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

  return (
    <div className="box task">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>{task.title}</h3>
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
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '12px',
        border: '2px solid #e2e8f0'
      }}>
        <p className="time">{format(localSeconds)}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-blue" 
            onClick={start}
            disabled={!!tick}
            style={{ opacity: tick ? 0.6 : 1, cursor: tick ? 'not-allowed' : 'pointer' }}
          >
            {tick ? 'Running...' : 'Start'}
          </button>
          <button 
            className="btn btn-red" 
            onClick={stop}
            disabled={!tick}
            style={{ opacity: !tick ? 0.6 : 1, cursor: !tick ? 'not-allowed' : 'pointer' }}
          >
            Stop
          </button>
        </div>
      </div>

      <HabitGrid task={task} refetch={refetch} currentMonth={currentMonth} />
    </div>
  );
}
