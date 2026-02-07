import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { UserRole } from '../users/enums/roles.enum';
import { JwtPayload } from '@mindlease/shared';

// Updated interface to include role and sub (ID)
// interface JwtPayload {
//   sub: string;            // The MongoDB _id
//   walletAddress: string;
//   role: UserRole;         // The role (creator/renter)
// }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // This method is called after the token is verified
  validate(payload: JwtPayload) {
    // 1. Basic integrity check
    if (!payload || !payload.walletAddress || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. Return the data to be attached to req.user
    // This object is what your RolesGuard will read!
    return { 
      userId: payload.sub, 
      walletAddress: payload.walletAddress, 
      role: payload.role 
    };
  }
}