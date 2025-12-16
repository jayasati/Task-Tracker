/**
 * Zod schemas for task procedures
 * Centralized validation schemas for all task-related API endpoints
 */
import { z } from "zod";

// Common task input schema for creation
export const createTaskSchema = z.object({
  title: z.string(),
  type: z.enum(["task", "amount", "time", "habit"]).default("task"),
  habitType: z.enum(["", "time", "amount", "both"]).default(""),
  repeatMode: z.string().default("none"),
  weekdays: z.array(z.number()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.string().default("medium"),
  category: z.string().optional(),
  amount: z.string().optional(),
  estimate: z.number().optional(),
  requiredMinutes: z.number().optional(),
  requiredAmount: z.number().optional(),
  subtasks: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// Edit task schema (all fields optional except id)
export const editTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  type: z.enum(["task", "amount", "time", "habit"]).optional(),
  habitType: z.enum(["", "time", "amount", "both"]).optional(),
  repeatMode: z.string().optional(),
  weekdays: z.array(z.number()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  amount: z.string().optional(),
  estimate: z.number().optional(),
  requiredMinutes: z.number().optional(),
  requiredAmount: z.number().optional(),
  subtasks: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Get tasks query schema
export const getTasksSchema = z.object({
  month: z.number().optional(),
  year: z.number().optional()
}).optional();

// Status update schema
export const updateStatusSchema = z.object({
  taskId: z.string(),
  date: z.string(),
  status: z.enum(["NONE", "FAIL", "HALF", "SUCCESS"]).optional(),
  completedSubtasks: z.array(z.string()).optional(),
  dailySubtasks: z.array(z.string()).optional(),
});

// Progress update schema
export const updateProgressSchema = z.object({
  taskId: z.string(),
  date: z.string(),
  progressLevel: z.number().min(0).max(4)
});

// Timer schemas
export const startTimerSchema = z.object({
  taskId: z.string(),
  date: z.string(),
});

export const stopTimerSchema = z.object({
  taskId: z.string(),
});

export const addMissedTimeSchema = z.object({
  taskId: z.string(),
  seconds: z.number(),
  date: z.string(),
});

export const getActiveTimerSchema = z.object({
  taskId: z.string(),
});

// Selection schemas
export const toggleSelectionSchema = z.object({
  taskId: z.string(),
  isSelected: z.boolean(),
});

export const deleteMultipleSchema = z.object({
  taskIds: z.array(z.string()),
});

// Simple task ID schema
export const taskIdSchema = z.object({
  taskId: z.string(),
});

// Update subtasks schema
export const updateSubtasksSchema = z.object({
  id: z.string(),
  subtasks: z.array(z.string()).optional(),
});

// Time log schema
export const updateSecondsSchema = z.object({
  taskId: z.string(),
  seconds: z.number(),
  date: z.string(),
});
