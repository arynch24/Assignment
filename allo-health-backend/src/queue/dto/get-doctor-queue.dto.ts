import { IsString, IsOptional, IsEnum } from 'class-validator';
import { QueueStatus } from 'generated/prisma';

export class GetDoctorQueueDto {
    @IsString()
    doctorId: string;

    @IsEnum(QueueStatus)
    @IsOptional()
    status?: QueueStatus;
}