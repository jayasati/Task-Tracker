"use client";
import React from 'react';
import SubtaskModal from "./SubtaskModal";
import { Task } from "@/types/task";
import { useHabitGrid } from "@/hooks/useHabitGrid";
import HabitLegend from "./tasks/HabitLegend";
import HabitDayBox from "./tasks/HabitDayBox";

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
      )}
    </div>
  );
}
