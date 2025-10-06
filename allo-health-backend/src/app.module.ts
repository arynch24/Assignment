import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger.service';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from '@nestjs/core';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    AuthModule,
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,
      limit: 3,
    }, {
      name: 'long',
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    PatientModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    DatabaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }],
})
export class AppModule { }
