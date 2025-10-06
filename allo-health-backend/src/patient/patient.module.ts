import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { DatabaseModule } from '../database/database.module';

/**
 * @module PatientModule
 * @description Module for managing patient-related operations.
 * This module imports the DatabaseModule to interact with the database.
 * It provides the PatientService for handling business logic and the PatientController
 * for managing incoming requests related to patients.
 */

@Module({
  imports: [DatabaseModule],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
