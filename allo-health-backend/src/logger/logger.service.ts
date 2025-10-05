import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs'
import * as path from 'path'

/**
 * Custom logger service that extends NestJS ConsoleLogger
 * Logs messages to both console and file system
 */
@Injectable()
export class LoggerService extends ConsoleLogger {
    /**
     * Logs an entry to a file
     * @param entry The log entry to write to file
     */
    async logToFile(entry){
        // Format the log entry with timestamp in Indian format
        const formattedEntry = `${Intl.DateTimeFormat('en-IN', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        }).format(new Date())}\t${entry}\n`

        try {
            // Create logs directory if it doesn't exist
            if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))){
                await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'))
            }
            // Append log entry to the log file
            await fsPromises.appendFile(path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'), formattedEntry)
        } catch (e) {
            // Log error message if file operations fail
            if (e instanceof Error) console.error(e.message)
        }
    }

    /**
     * Override default log method to also log to file
     * @param message The message to log
     * @param context Optional context for the log
     */
    log(message: any, context?: string) {
        const entry = `${context}\t${message}`
        this.logToFile(entry)
        // Call parent class log method
        super.log(message, context)
    }

    /**
     * Override default error method to also log errors to file
     * @param message The error message to log
     * @param stackOrContext Optional stack trace or context
     */
    error(message: any, stackOrContext?: string) {
        const entry = `${stackOrContext}\t${message}`
        this.logToFile(entry)
        // Call parent class error method
        super.error(message, stackOrContext)
    }
}