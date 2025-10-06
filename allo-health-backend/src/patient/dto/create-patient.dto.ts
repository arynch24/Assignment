import { IsString, IsOptional, IsEnum, IsNumber, IsEmail, IsUrl, IsPhoneNumber } from 'class-validator';

export class CreatePatientDto {

    @IsString()
    name: string;

    @IsNumber()
    age: number;

    @IsEnum(['MALE', 'FEMALE', 'OTHER'], { message: "Gender must be either MALE, FEMALE or OTHER" })
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    @IsPhoneNumber('IN')
    phone: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @IsString()
    @IsOptional()
    medicalNotes?: string;

    @IsUrl()
    @IsOptional()
    profilePhoto?: string;
}
