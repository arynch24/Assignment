import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
    @IsString()
    patientId: string;

    @IsString()
    doctorId: string;

    @IsDateString()
    appointmentDateTime: Date;

    @IsNumber()
    duration: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
