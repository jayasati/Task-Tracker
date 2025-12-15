-- Add performance indexes for frequently queried fields

-- Index on TimeLog.date for date range queries
CREATE INDEX IF NOT EXISTS "TimeLog_date_idx" ON "TimeLog"("date");

-- Index on TimeLog.taskId for foreign key lookups
CREATE INDEX IF NOT EXISTS "TimeLog_taskId_idx" ON "TimeLog"("taskId");

-- Index on TaskStatus.date for date range queries
CREATE INDEX IF NOT EXISTS "TaskStatus_date_idx" ON "TaskStatus"("date");

-- Index on TaskStatus.taskId for foreign key lookups
CREATE INDEX IF NOT EXISTS "TaskStatus_taskId_idx" ON "TaskStatus"("taskId");

-- Index on Task.isArchived for filtering archived tasks
--CREATE INDEX IF NOT EXISTS "Task_isArchived_idx" ON "Task"("isArchived");

-- Index on Task.category for category filtering
--CREATE INDEX IF NOT EXISTS "Task_category_idx" ON "Task"("category");

