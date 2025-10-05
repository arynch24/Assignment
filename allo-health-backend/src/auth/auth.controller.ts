import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post, Body, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() CreateUserDto: CreateUserDto) {
        return this.authService.signup(CreateUserDto);
    }

    @Post('login')
    async login(@Body() LoginUserDto: LoginUserDto) {
        return this.authService.login(LoginUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('user')
    async getUser(@Request() req) {
        return this.authService.findUserById(req.user.userId);
    }

}
