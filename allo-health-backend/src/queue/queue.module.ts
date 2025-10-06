import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { DatabaseModule } from '../database/database.module';

/**
 * @module QueueModule
 * @description Module for managing queue-related operations.
 * This module imports the DatabaseModule to interact with the database.
 * It provides the QueueService for handling business logic and the QueueController
 * for managing incoming requests related to queues.
 */

@Module({
  imports: [DatabaseModule],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
