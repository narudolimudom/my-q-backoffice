-- DropForeignKey
ALTER TABLE "QueueEntry" DROP CONSTRAINT "QueueEntry_userId_fkey";

-- DropIndex
DROP INDEX "QueueEntry_userId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "queueEntryId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
