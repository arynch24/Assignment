import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Authentication module for the application.
 * 
 * This module handles user authentication and authorization by setting up JWT functionality.
 * It imports DatabaseModule for data access and JwtModule for token operations.
 * 
 * The JWT configuration is loaded asynchronously from environment variables:
 * - JWT_SECRET: Secret key used to sign tokens
 * - JWT_EXPIRES_IN: Token expiration time
 * 
 * @module AuthModule
 */

@Module({
    imports: [
        DatabaseModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }
