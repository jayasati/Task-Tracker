-- Add userId column to Task table for user-specific task filtering
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL DEFAULT '';

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS "Task_userId_idx" ON "Task"("userId");

-- Note: Existing tasks will have empty string as userId
-- You may want to clean up or migrate existing data separately




