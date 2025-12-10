"use client";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    logs: { seconds: number }[];
  };
  refetch: () => void;
};

export default function TaskCard({ task, refetch }: TaskCardProps) {
  const updateSeconds = trpc.task.updateSeconds.useMutation();

  // Always sync UI with latest DB when task changes
  const totalFromDB = task.logs.reduce((s, l) => s + l.seconds, 0);
  const [localSeconds, setLocalSeconds] = useState(totalFromDB);
  const [tick, setTick] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tick) setLocalSeconds(totalFromDB);
  }, [totalFromDB]);

  const start = () => {
    if (tick) return;

    const id = setInterval(() => {
      setLocalSeconds(prev => prev + 1);
    }, 1000);

    setTick(id);
  };

  const stop = () => {
    if (!tick) return;
    clearInterval(tick);
    setTick(null);

    const gained = localSeconds - totalFromDB;
    if (gained > 0) {
      updateSeconds.mutate({ taskId: task.id, seconds: gained }, {
        onSuccess: () => refetch(),
      });
    }
  };

  const format = (s: number) =>
    new Date(s * 1000).toISOString().substring(11, 19);

  return (
    <div className="box task">
      <h3>{task.title}</h3>
      <p className="time">{format(localSeconds)}</p>
      <button className="btn btn-blue" onClick={start}>Start</button>
      <button className="btn btn-red" onClick={stop}>Stop</button>
    </div>
  );
}
