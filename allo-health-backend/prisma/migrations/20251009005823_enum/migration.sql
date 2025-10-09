/*
  Warnings:

  - The values [NO_SHOW] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `specialization` on the `doctors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('SEXOLOGIST', 'UROLOGIST', 'GYNECOLOGIST', 'ANDROLOGIST', 'PSYCHOLOGIST', 'COUNSELOR', 'ENDOCRINOLOGIST');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'BOOKED';
COMMIT;

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "specialization",
ADD COLUMN     "specialization" "Specialization" NOT NULL;
