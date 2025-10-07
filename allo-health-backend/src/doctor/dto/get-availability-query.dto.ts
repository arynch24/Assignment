import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetAvailabilityQueryDto {
    @IsDateString()
    @IsNotEmpty()
    date: string;
}