-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NONE', 'FAIL', 'HALF', 'SUCCESS');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'task',
    "habitType" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL DEFAULT '',
    "repeatMode" TEXT NOT NULL DEFAULT 'none',
    "weekdays" INTEGER[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL DEFAULT 'task',
    "amount" TEXT,
    "estimate" INTEGER,
    "requiredMinutes" INTEGER DEFAULT 0,
    "requiredAmount" INTEGER DEFAULT 0,
    "subtasks" TEXT[],
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "progressLevel" INTEGER NOT NULL DEFAULT 0,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "lastResetDate" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeLog" (
    "id" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NONE',
    "completedSubtasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailySubtasks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progressLevel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerSession" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_isArchived_idx" ON "Task"("isArchived");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "TimeLog_date_idx" ON "TimeLog"("date");

-- CreateIndex
CREATE INDEX "TimeLog_taskId_idx" ON "TimeLog"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeLog_taskId_date_key" ON "TimeLog"("taskId", "date");

-- CreateIndex
CREATE INDEX "TaskStatus_date_idx" ON "TaskStatus"("date");

-- CreateIndex
CREATE INDEX "TaskStatus_taskId_idx" ON "TaskStatus"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStatus_taskId_date_key" ON "TaskStatus"("taskId", "date");

-- CreateIndex
CREATE INDEX "TimerSession_taskId_idx" ON "TimerSession"("taskId");

-- CreateIndex
CREATE INDEX "TimerSession_date_idx" ON "TimerSession"("date");

-- CreateIndex
CREATE INDEX "TimerSession_isActive_idx" ON "TimerSession"("isActive");

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimerSession" ADD CONSTRAINT "TimerSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
