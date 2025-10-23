import { Controller, Get, UseGuards, Post, Body, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private configService: ConfigService) { }

    @Post('signup')
    async signup(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res
    ) {
        const { token, user } = await this.authService.signup(createUserDto);

        // Set token in httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return user;
    }

    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res
    ) {
        const { token, user } = await this.authService.login(loginUserDto);

        // Set token in httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return user;
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    logout(@Res({ passthrough: true }) res) {
        res.clearCookie('token');
        return { message: 'Logged out successfully' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getUser(@Request() req) {
        return this.authService.findUserById(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.authService.dashboardStats();
    }
}