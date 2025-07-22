/*
  Warnings:

  - A unique constraint covering the columns `[queueNumber]` on the table `QueueEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_queueNumber_key" ON "QueueEntry"("queueNumber");
