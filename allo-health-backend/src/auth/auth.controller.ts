import { Controller, Get, UseGuards, Post, Body, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res
    ) {
        const { access_token, user } = await this.authService.signup(createUserDto);

        // Set token in httpOnly cookie
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return user;
    }

    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res
    ) {
        const { access_token, user } = await this.authService.login(loginUserDto);

        // Set token in httpOnly cookie
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return user;
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    logout(@Res({ passthrough: true }) res) {
        res.clearCookie('access_token');
        return { message: 'Logged out successfully' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getUser(@Request() req) {
        return this.authService.findUserById(req.user.userId);
    }
}