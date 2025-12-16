/**
 * Task Router - combines all task-related procedures
 * 
 * This is the main entry point for all task API endpoints.
 * Procedures are organized into separate files by concern.
 */
import { router } from "../../trpc";

// Import all procedures
import { getTasks } from "./queries";
import { addTask, editTask, updateTask, deleteTask } from "./mutations";
import { updateStatus, updateProgress, updateSeconds } from "./statusProcedures";
import { startTimer, stopTimer, addMissedTime, getActiveTimer } from "./timerProcedures";
import { toggleTaskSelection, deleteMultipleTasks } from "./selectionProcedures";

/**
 * Task Router
 * 
 * Organized by:
 * - queries.ts: Read operations (getTasks)
 * - mutations.ts: CRUD operations (add, edit, update, delete)
 * - statusProcedures.ts: Status/progress updates
 * - timerProcedures.ts: Timer management
 * - selectionProcedures.ts: Multi-select operations
 */
export const taskRouter = router({
  // Queries
  getTasks,

  // Task CRUD
  addTask,
  editTask,
  updateTask,
  deleteTask,

  // Status & Progress
  updateStatus,
  updateProgress,
  updateSeconds,

  // Timer Management
  startTimer,
  stopTimer,
  addMissedTime,
  getActiveTimer,

  // Multi-Select
  toggleTaskSelection,
  deleteMultipleTasks,
});
