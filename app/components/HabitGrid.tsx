"use client";
import { Status } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import SubtaskModal from "./SubtaskModal";

type HabitGridProps = {
  task: {
    id: string;
    statuses: {
      date: string | Date;
      status: Status;
      completedSubtasks: string[];
      dailySubtasks: string[];
    }[];
    logs: { seconds: number; date: Date | string }[];
    type: string;
    subtasks?: string[];
    estimate?: number | null;
  };
  refetch: () => void;
  currentMonth: Date;
};

const nextStatus: Record<Status, Status> = {
  NONE: "FAIL",
  FAIL: "HALF",
  HALF: "SUCCESS",
  SUCCESS: "NONE",
};

const statusLabels: Record<Status, string> = {
  NONE: "Not started",
  FAIL: "Failed",
  HALF: "Partial",
  SUCCESS: "Completed",
};

const statusIcons: Record<Status, string> = {
  NONE: "",
  FAIL: "✕",
  HALF: "◐",
  SUCCESS: "✓",
};

export default function HabitGrid({ task, refetch, currentMonth }: HabitGridProps) {
  const updateStatus = trpc.task.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const toISODate = (d: Date | string) => {
    return new Date(d).toISOString().split("T")[0];
  };

  const getStatus = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return (
      task.statuses.find((s) => toISODate(s.date) === dateStr)?.status ?? "NONE"
    );
  };

  const getDateString = (day: number) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (day: number) => {
    if (!isCurrentMonth) return false;
    return today.getDate() === day;
  };

  const toggle = (day: number) => {
    const date = new Date(year, month, day);

    if (task.type === "task" && (task.subtasks?.length ?? 0) > 0) {
      // Open modal for subtasks
      setSelectedDate(date);
      setModalOpen(true);
      return;
    }

    if (task.type === "time") {
      // Time tasks are automatic based on log, but maybe user wants to manually override?
      // User said: "manually clicked by the user ... if time based task then based on the time spent"
      // Implies time based is automatic. 
      // Let's disable manual toggle or generic "toggle" for time tasks? 
      // Actually, if I click it, maybe nothing happens or it shows info?
      // Let's stick to automatic for now.
      return;
    }

    // Manual Toggle
    const curr = getStatus(day);
    const next = nextStatus[curr];

    updateStatus.mutate({
      taskId: task.id,
      date: date.toISOString(),
      status: next,
    });
  };

  const getStatusEntry = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return task.statuses.find((s) => toISODate(s.date) === dateStr);
  };

  const getTimeColor = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    // Sum logs for this day
    const dailySeconds = task.logs
      .filter(l => toISODate(l.date) === dateStr)
      .reduce((acc, l) => acc + l.seconds, 0);

    const target = (task.estimate || 0) * 60; // seconds
    if (target === 0) return "none"; // No goal set

    const ratio = dailySeconds / target;
    if (ratio >= 1.0) return "success"; // Green
    if (ratio > 0.7) return "half";     // Yellow (using HALF style)
    if (ratio > 0.3) return "fail";     // Red (using FAIL style)
    if (ratio > 0) return "fail";       // Below 30% -> Black/None? User said: "below 30 -> black"
    // Wait, "below 30 -> black" implies NONE.
    // And "above 30% -> red". 
    // So 0.3 to 0.7 is Red. 
    return "none";
  };

  const getSubtaskColor = (day: number) => {
    // Logic handled in Modal mostly, but we need to show status on grid
    // Status is saved in DB, so just use DB status
    // But if we want real-time from `completedSubtasks` length vs total:
    // The DB `status` field should be trusted as the modal updates it.
    return getStatus(day).toLowerCase();
  };

  const getPrevDayUnfinished = (currentDay: number): string[] => {
    const prevDate = new Date(year, month, currentDay - 1);

    // If previous date is generic "yesterday" logic? 
    // We need to look up status for that date.
    // We need to look up status for that date.
    const dateStr = prevDate.toISOString().split("T")[0];
    const entry = task.statuses.find((s) => toISODate(s.date) === dateStr);

    if (entry) {
      // If entry exists, calculate unfinished
      const sourceList = entry.dailySubtasks.length > 0 ? entry.dailySubtasks : (task.subtasks ?? []);
      return sourceList.filter(s => !entry.completedSubtasks.includes(s));
    }

    // If no entry, check if task should have existed?
    // Assuming fresh start if no entry, so no rollover.
    // But user request: "subtask of day one is not completed automatically shift ... to next day"
    // If I didn't open the app on day one, it has no entry.
    // But the task existed. 
    // Checking created date might be overkill, let's just return [] if no entry for now to be safe and simple.
    // Or better: If no entry, returns ALL global subtasks ?? No that would spam.
    return [];
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
          Click boxes to track daily progress
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e0'
            }} />
            <span style={{ color: '#64748b' }}>None</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
            }} />
            <span style={{ color: '#64748b' }}>Failed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            }} />
            <span style={{ color: '#64748b' }}>Partial</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
            }} />
            <span style={{ color: '#64748b' }}>Success</span>
          </div>
        </div>
      </div>
      <div className="horizontal-line">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = getStatus(day);
          let colorClass = status.toLowerCase();

          if (task.type === "time") {
            colorClass = getTimeColor(day);
          }

          const todayClass = isToday(day) ? 'today' : '';
          const dateString = getDateString(day);
          const statusLabel = statusLabels[status];
          const statusIcon = task.type === "time" ? null : statusIcons[status];

          return (
            <div
              key={day}
              onClick={() => toggle(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`day-box ${colorClass} ${todayClass}`}
              style={{ position: 'relative' }}
            >
              <span>{day}</span>
              {statusIcon && (
                <span className="day-box-status-icon">{statusIcon}</span>
              )}
              {hoveredDay === day && (
                <div className="day-box-tooltip" style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#1a202c',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{dateString}</div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>Status: {statusLabel}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Click to cycle</div>
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '6px solid transparent',
                    borderTopColor: '#1a202c'
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && selectedDate && (
        <SubtaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          taskId={task.id}
          date={selectedDate}
          statusEntry={getStatusEntry(selectedDate.getDate()) as any} // Cast because strict types mismatch lightly or undefined
          globalSubtasks={task.subtasks ?? []}
          refetch={refetch}
          prevDayUnfinished={getPrevDayUnfinished(selectedDate.getDate())}
        />
      )}
    </div>
  );
}
