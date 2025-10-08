import { IsString, IsPhoneNumber, ValidateNested, IsOptional, IsEmpty, IsEmail, IsEnum, IsNumber, IsUrl, IsArray, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class CreateDoctorDto {
    @IsString()
    name: string;

    @IsString()
    specialization: string;

    @IsEnum(['MALE', 'FEMALE'], { message: "Gender must be either MALE or FEMALE" })
    gender: 'MALE' | 'FEMALE';

    @IsString()
    location: string;

    @IsPhoneNumber('IN')
    phone: string;

    @IsEmail()
    email: string;

    @IsNumber()
    experience: number; // in years

    @IsString()
    @IsOptional()
    qualifications?: string; // e.g., "MBBS, MD - General Medicine"

    @IsUrl()
    @IsOptional()
    profilePhoto?: string;

    @IsNumber()
    @IsOptional()
    consultationDuration?: number; // in minutes

    @IsNumber()
    @IsOptional()
    maxAppointmentsPerDay?: number; // in number of patients

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    schedule: ScheduleDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BreakDto)
    breaks: BreakDto[];
}

export class ScheduleDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], { message: "Day of week must be a valid day" })
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: "startTime must be in HH:MM:SS format" })
    @IsString()
    startTime: string;

    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: "endTime must be in HH:MM:SS format" })
    @IsString()
    endTime: string;

    @IsBoolean()
    isWorking: boolean;
}

export class BreakDto {

    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], { message: "Day of week must be a valid day" })
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: "startTime must be in HH:MM:SS format" })
    @IsString()
    startTime: string;

    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: "endTime must be in HH:MM:SS format" })
    @IsString()
    endTime: string;

    @IsEnum(['LUNCH', 'BREAK', 'MEETING'], { message: "Break type must be one of the following values: LUNCH, BREAK, MEETING" })
    breakType: 'LUNCH' | 'BREAK' | 'MEETING'; // e.g., "LUNCH", "TEA", etc.
}
