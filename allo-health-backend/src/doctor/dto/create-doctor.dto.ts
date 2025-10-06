import { IsString, IsPhoneNumber, IsOptional, IsEmail, IsEnum, IsNumber, IsUrl } from 'class-validator';

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
}
