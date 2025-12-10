/*
  Warnings:

  - A unique constraint covering the columns `[taskId,date]` on the table `TimeLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TimeLog_taskId_date_key" ON "TimeLog"("taskId", "date");
