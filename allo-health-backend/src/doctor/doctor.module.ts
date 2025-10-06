import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DatabaseModule } from '../database/database.module';

/**
 * @module DoctorModule
 * @description Module for managing doctor-related operations.
 * This module imports the DatabaseModule to interact with the database.
 * It provides the DoctorService for handling business logic and the DoctorController
 * for managing incoming requests related to doctors.
 */

@Module({
  imports: [DatabaseModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule { }
