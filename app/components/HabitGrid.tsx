"use client";
import React, { lazy, Suspense } from 'react';
import { Task } from "@/types/task";
import { useHabitGrid } from "@/hooks/useHabitGrid";
import HabitLegend from "./tasks/HabitLegend";
import HabitDayBox from "./tasks/HabitDayBox";

// Lazy load SubtaskModal for code splitting
const SubtaskModal = lazy(() => import("./SubtaskModal"));

type HabitGridProps = {
  task: Task;
  refetch: () => void;
  currentMonth: Date;
};

export default function HabitGrid({ task, refetch, currentMonth }: HabitGridProps) {
  const {
    year,
    month,
    daysInMonth,
    modalOpen,
    setModalOpen,
    selectedDate,
    getStatus,
    isDayToday,
    toggle,
    getTimeColor,
    getPrevDayUnfinished,
    getStatusEntry
  } = useHabitGrid(task, refetch, currentMonth);

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
        <HabitLegend />
      </div>

      <div className="horizontal-line">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = getStatus(day);
          let colorClass = status.toLowerCase();

          if (task.type === "time") {
            colorClass = getTimeColor(day);
          }

          return (
            <HabitDayBox
              key={day}
              day={day}
              year={year}
              month={month}
              status={status}
              isToday={isDayToday(day)}
              colorClass={colorClass}
              isTimeTask={task.type === "time"}
              onClick={() => toggle(day)}
            />
          );
        })}
      </div>

      {modalOpen && selectedDate && (
        <Suspense fallback={
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
          </div>
        }>
          <SubtaskModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            taskId={task.id}
            date={selectedDate}
            statusEntry={getStatusEntry(selectedDate.getDate()) as any}
            globalSubtasks={task.subtasks ?? []}
            refetch={refetch}
            prevDayUnfinished={getPrevDayUnfinished(selectedDate.getDate())}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * FILE: app/components/HabitGrid.tsx
 * 
 * PURPOSE:
 * Displays monthly habit tracking grid with day boxes showing task status.
 * Handles status toggling and subtask modal for tasks with subtasks.
 * 
 * WHAT IT DOES:
 * - Renders grid of day boxes for current month
 * - Shows HabitLegend explaining status colors
 * - Displays HabitDayBox for each day with appropriate color/status
 * - Handles day box clicks (toggle status or open modal)
 * - Lazy loads SubtaskModal for code splitting
 * - Shows modal with Suspense fallback
 * - Passes all necessary data to modal (date, status, subtasks, etc.)
 * 
 * DEPENDENCIES (imports from):
 * - react: lazy, Suspense for code splitting
 * - @/types/task: Task type
 * - @/hooks/useHabitGrid: All grid logic and state
 * - ./tasks/HabitLegend: Legend component
 * - ./tasks/HabitDayBox: Individual day box component
 * - ./SubtaskModal: Lazy loaded modal (code split)
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TaskCard.tsx: Renders HabitGrid for each task
 * 
 * NOTES:
 * - Client component ("use client") - uses hooks
 * - SubtaskModal is lazy loaded to reduce initial bundle size
 * - Suspense shows "Loading..." while modal loads
 * - All logic delegated to useHabitGrid hook
 * - Grid scrolls horizontally on mobile
 * - Day boxes are color-coded based on status or time progress
 */
