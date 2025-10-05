import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

/**
 * JWT Strategy class for handling authentication with JSON Web Tokens
 * 
 * This strategy extends Passport's strategy using JWT for authenticating requests.
 * It extracts the JWT from the Authorization header as a Bearer token,
 * verifies it with the JWT_SECRET from configuration, and validates the payload.
 * 
 * @extends PassportStrategy
 */
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }
    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}