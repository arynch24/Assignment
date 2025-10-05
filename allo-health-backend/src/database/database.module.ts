import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * A module that provides database-related functionality.
 * 
 * This module encapsulates the DatabaseService which handles database operations.
 * It also exports the DatabaseService making it available for other modules that import
 * the DatabaseModule.
 * 
 * @module DatabaseModule
 */
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
