import { IsString, isEnum, IsOptional, IsDateString, IsEAN, IsEnum } from "class-validator";

export class CreateQueueDto {

    @IsString()
    patientId: string;

    @IsString()
    doctorId: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    queueNumber: string;

    @IsString()
    @IsEnum(['WAITING', 'IN_WITH_DOCTOR', 'COMPLETED', 'CANCELLED'], { message: 'Status must be one of the following values: WAITING, IN_WITH_DOCTOR, COMPLETED, CANCELLED' })
    status?: string;

    @IsDateString()
    @IsOptional()
    startedAt?: Date;

    @IsDateString()
    @IsOptional()
    completedAt?: Date;
}
