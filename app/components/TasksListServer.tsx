"use client";

import { trpc } from "@/utils/trpc";
import TaskCard from "./TaskCard";
import { useState } from "react";

import { keepPreviousData } from "@tanstack/react-query";

export default function TasksList() {
  const [currentMonth] = useState(new Date());

  const { data: tasks, isLoading } = trpc.task.getTasks.useQuery(
    {
      month: currentMonth.getMonth(),
      year: currentMonth.getFullYear(),
    },
    {
      staleTime: 60000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      placeholderData: keepPreviousData,
    }
  );
  const utils = trpc.useUtils();

  const refetch = () => {
    utils.task.getTasks.invalidate();
  };

  if (isLoading) {
    return (
      <div className="box" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading tasks...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="box" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b', fontSize: '18px' }}>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          refetch={refetch}
          currentMonth={currentMonth}
        />
      ))}
    </>
  );
}

