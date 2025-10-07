-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
