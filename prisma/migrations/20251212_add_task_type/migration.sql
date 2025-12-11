-- Add task type with default 'task' if it doesn't already exist
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'task';

