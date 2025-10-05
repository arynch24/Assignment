import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Service for handling authentication-related operations such as user signup and login.
 * This service interacts with the DatabaseService to manage user data and uses JwtService to generate JSON Web Tokens for authenticated users.
 * @module AuthService
 * @requires DatabaseService
 * @requires JwtService
 */

@Injectable()
export class AuthService {
    constructor(private readonly databaseService: DatabaseService, private readonly jwtService: JwtService) { }

    async signup(createUserDto: CreateUserDto) {

        const { name, email, password } = createUserDto;

        // Check if user already exists
        const existingUser = await this.databaseService.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Create new user
        const newUser = await this.databaseService.user.create({
            data: {
                name,
                email,
                // Hashing is one way encryption and have same length of string
                password: await hash(password, 10)
            },
        });

        // Generate JWT token
        const access_token = this.jwtService.sign({ sub: newUser.id, email: newUser.email });

        return { access_token, user: newUser };
    }

    async login(LoginUserDto: LoginUserDto) {

        const { email, password } = LoginUserDto;

        // Find user by email
        const user = await this.databaseService.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Compare password
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new ConflictException('Invalid email or password');
        }
        // Generate JWT token
        const access_token = this.jwtService.sign({ sub: user.id, email: user.email });

        return { access_token, user };
    }

    async findUserById(userId: string) {
        const user = await this.databaseService.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}