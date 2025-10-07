import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {

    @IsEnum(['BOOKED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED','NO_SHOW'],{message:'Status must be one of BOOKED, SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, NO_SHOW'})
    @IsOptional()
    status: 'BOOKED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

    @IsString()
    @IsOptional()
    cancellationReason?: string;

}
