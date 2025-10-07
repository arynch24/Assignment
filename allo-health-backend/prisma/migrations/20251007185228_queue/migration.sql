-- CreateEnum
CREATE TYPE "QueueType" AS ENUM ('WALK_IN', 'APPOINTMENT');

-- AlterTable
ALTER TABLE "queue" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "type" "QueueType" NOT NULL DEFAULT 'WALK_IN';
