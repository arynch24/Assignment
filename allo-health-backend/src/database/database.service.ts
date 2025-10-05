import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

/**
 * DatabaseService
 * 
 * This service extends PrismaClient to provide database access throughout the NestJS application.
 * 
 * - Marked with `@Injectable()` so it can be injected into other classes via NestJS dependency injection.
 * - Implements `OnModuleInit` lifecycle hook, which runs when the module is initialized.
 * - Inside `onModuleInit`, it calls `this.$connect()` to establish a connection with the database
 *   as soon as the NestJS module is initialized.
 * 
 * Usage:
 *   - Import DatabaseService into any module that needs database access.
 *   - Inject it into services or controllers to run Prisma queries.
 */

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}