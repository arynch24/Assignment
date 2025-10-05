import { Module } from '@nestjs/common';
import { LoggerService } from "./logger.service";

/**
 * @module LoggerModule
 * @description Module for handling logging functionality
 * 
 * This module provides and exports the LoggerService for application-wide logging.
 * Other modules can import LoggerModule to use the LoggerService for logging purposes.
 */
@Module({
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule { }
