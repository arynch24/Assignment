import { CreateUserDto } from "./create-user.dto"
import { PartialType } from "@nestjs/mapped-types"
import { IsString, IsEmail } from "class-validator"

/**
 * Data Transfer Object for user login.
 * Extends PartialType of CreateUserDto to inherit properties.
 */

export class LoginUserDto extends PartialType(CreateUserDto) {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}