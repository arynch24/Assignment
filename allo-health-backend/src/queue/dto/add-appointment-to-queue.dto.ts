import { IsString, IsOptional } from 'class-validator';

export class AddAppointmentToQueueDto {
  @IsString()
  appointmentId: string;

  @IsString()
  doctorId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}