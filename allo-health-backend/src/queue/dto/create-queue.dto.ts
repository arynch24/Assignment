import { IsString, isEnum, IsOptional, IsDateString, IsEAN, IsEnum } from "class-validator";
import {QueuePriority} from 'generated/prisma';

export class CreateQueueDto {

    @IsString()
    patientId: string;

    @IsString()
    doctorId: string;

    @IsEnum(QueuePriority)
    @IsOptional()
    priority?: QueuePriority;

    @IsString()
    @IsOptional()
    notes?: string;
}
