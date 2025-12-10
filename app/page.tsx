"use client";

import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";

export default function Page() {
  const { data: tasks, refetch } = trpc.task.getTasks.useQuery();
  const updateSeconds = trpc.task.updateSeconds.useMutation({
    onSuccess: () => refetch(),
  });

  const [activeTimers, setActiveTimers] = useState<Record<string, any>>({});

  const startTimer = (taskId: string) => {
    if (activeTimers[taskId]) return;

    const interval = setInterval(() => {
      updateSeconds.mutate({ taskId, seconds: 1 });
    }, 1000);

    setActiveTimers((prev) => ({ ...prev, [taskId]: interval }));
  };

  const stopTimer = (taskId: string) => {
    clearInterval(activeTimers[taskId]);
    setActiveTimers((prev) => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Task + Time Tracker</h2>

      {tasks?.map((task) => {
        const totalSeconds =
          task.logs.reduce((sum, l) => sum + l.seconds, 0) || 0;

        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");

        return (
          <div key={task.id} style={{ background: "#fff", padding: 12, marginTop: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 18 }}>{task.title}</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>
              {h}:{m}:{s}
            </div>

            <button style={{ background: "#0a84ff", color: "#fff", padding: "6px 12px", borderRadius: 6, marginRight: 6 }}
              onClick={() => startTimer(task.id)}>
              Start
            </button>

            <button style={{ background: "#d9534f", color: "#fff", padding: "6px 12px", borderRadius: 6 }}
              onClick={() => stopTimer(task.id)}>
              Stop
            </button>
          </div>
        );
      })}
    </div>
  );
}
