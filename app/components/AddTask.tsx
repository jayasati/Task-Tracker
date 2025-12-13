"use client";
import React, { useRef, memo } from "react";
import { useAddTaskForm } from "@/hooks/useAddTaskForm";
import ModeHeader from "./add-task/ModeHeader";
import AddTaskHeader from "./add-task/AddTaskHeader";
import ScheduleSection from "./add-task/ScheduleSection";
import TaskDetails from "./add-task/TaskDetails";
import AdditionalInfo from "./add-task/AdditionalInfo";

interface AddTaskProps {
  activeTab: string;
}

function AddTask({ activeTab }: AddTaskProps) {
  const { form, updateForm, toggleWeekday, submit, isExpanded, setIsExpanded, isPending } = useAddTaskForm(activeTab);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100 relative overflow-hidden">
      <form ref={formRef} onSubmit={submit} className="space-y-6 relative z-10">
        <ModeHeader category={form.category} />

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

// Memoize to prevent re-renders when parent re-renders
export default memo(AddTask);

/**
 * FILE: app/components/AddTask.tsx
 * 
 * PURPOSE:
 * Task creation form with expandable sections for detailed task configuration.
 * Provides UI for all task properties with validation and submission.
 * 
 * WHAT IT DOES:
 * - Renders collapsible form (expands on focus)
 * - Shows AddTaskHeader with title input
 * - Displays ScheduleSection for repeat mode and dates
 * - Shows TaskDetails for type, priority, category
 * - Displays AdditionalInfo for amount, estimate, subtasks, notes
 * - Handles form submission via useAddTaskForm hook
 * - Resets and collapses form after successful submission
 * 
 * DEPENDENCIES (imports from):
 * - react: useRef, memo
 * - @/hooks/useAddTaskForm: Form state and submission logic
 * - ./add-task/*: Form section sub-components
 * 
 * DEPENDENTS (files that import this):
 * - app/page.tsx: Renders at top of main page
 * 
 * NOTES:
 * - Client component ("use client") - uses hooks
 * - Memoized to prevent re-renders from parent
 * - Form expands/collapses based on isExpanded state
 * - Uses formRef for potential future form manipulation
 * - Decorative gradient background for visual appeal
 * - All form logic delegated to useAddTaskForm hook
 */
