import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {

    @IsEnum(['BOOKED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],{message:'Status must be one of BOOKED, SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED'})
    @IsOptional()
    status: 'BOOKED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

    @IsString()
    @IsOptional()
    cancellationReason?: string;

}
