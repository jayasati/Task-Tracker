"use client";
import React, { useRef } from "react";
import { useAddTaskForm } from "@/hooks/useAddTaskForm";
import AddTaskHeader from "./add-task/AddTaskHeader";
import ScheduleSection from "./add-task/ScheduleSection";
import TaskDetails from "./add-task/TaskDetails";
import AdditionalInfo from "./add-task/AdditionalInfo";

export default function AddTask() {
  const { form, updateForm, toggleWeekday, submit, isExpanded, setIsExpanded, isPending } = useAddTaskForm();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <form ref={formRef} onSubmit={submit} className="space-y-6 relative z-10">
        <AddTaskHeader
          form={form}
          updateForm={updateForm}
          setIsExpanded={setIsExpanded}
          isPending={isPending}
        />

        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="h-px bg-gray-100 my-4"></div>

            <ScheduleSection
              form={form}
              updateForm={updateForm}
              toggleWeekday={toggleWeekday}
            />

            <TaskDetails
              form={form}
              updateForm={updateForm}
            />

            <AdditionalInfo
              form={form}
              updateForm={updateForm}
              setIsExpanded={setIsExpanded}
            />
          </div>
        )}
      </form>
    </div>
  );
}

