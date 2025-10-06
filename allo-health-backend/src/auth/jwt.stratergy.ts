import { Injectable } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

/**
 * JWT Strategy class for handling authentication with JSON Web Tokens
 * 
 * This strategy extends Passport's strategy using JWT for authenticating requests.
 * It extracts the JWT from cookies, verifies it with the JWT_SECRET from configuration,
 * and validates the payload.
 * 
 * @extends PassportStrategy
 */
@Injectable() // ✅ Add this decorator
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    let token = null;
                    if (request && request.cookies) {
                        token = request.cookies['token']; 
                    }
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'), 
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}