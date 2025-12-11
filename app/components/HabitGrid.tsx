"use client";
import { Status } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { useState } from "react";

type HabitGridProps = {
  task: {
    id: string;
    statuses: {
        id: string;
        taskId: string;
        date: String | Date;
        status: Status;
    }[]
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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const getStatus = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return (
      task.statuses.find((s) =>
        s.date.toString().startsWith(dateStr)
      )?.status ?? "NONE"
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
    const curr = getStatus(day);
    const next = nextStatus[curr];

    updateStatus.mutate({
      taskId: task.id,
      date: date.toISOString(),
      status: next,
    });
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
        const todayClass = isToday(day) ? 'today' : '';
        const dateString = getDateString(day);
        const statusLabel = statusLabels[status];
        const statusIcon = statusIcons[status];

        return (
          <div
            key={day}
            onClick={() => toggle(day)}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            className={`day-box ${status.toLowerCase()} ${todayClass}`}
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
    </div>
  );
}
