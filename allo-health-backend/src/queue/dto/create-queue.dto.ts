import { IsString, isEnum, IsOptional, IsDateString, IsEAN, IsEnum } from "class-validator";

export class CreateQueueDto {

    @IsString()
    patientId: string;

    @IsString()
    doctorId: string;

    @IsString()
    priority?: string;

    @IsString()
    notes?: string;

    @IsString()
    queueNumber: string;

    @IsString()
    @IsEnum(['WAITING', 'IN_WITH_DOCTOR', 'COMPLETED', 'CANCELLED'], { message: 'Status must be one of the following values: WAITING, IN_WITH_DOCTOR, COMPLETED, CANCELLED' })
    status?: string;

    @IsDateString()
    startedAt?: Date;

    @IsDateString()
    completedAt?: Date;
}
