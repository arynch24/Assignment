/*
  Warnings:

  - Changed the type of `startTime` on the `doctor_breaks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `doctor_breaks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `doctor_schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `doctor_schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "doctor_breaks" DROP COLUMN "startTime",
ADD COLUMN     "startTime" VARCHAR(8) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" VARCHAR(8) NOT NULL;

-- AlterTable
ALTER TABLE "doctor_schedules" DROP COLUMN "startTime",
ADD COLUMN     "startTime" VARCHAR(8) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" VARCHAR(8) NOT NULL;
