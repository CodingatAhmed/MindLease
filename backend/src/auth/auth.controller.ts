import { Controller, Post, Body, Get, UseGuards, Req, Param, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@mindlease/shared';


// 1. Updated Interface to include Role
interface RequestWithUser extends Request {
  user: {
    walletAddress: string;
    userId: string; // Matches the 'sub' from JWT
    role: UserRole; // Now the controller knows if it's a creator or renter
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce/:address')
  async getNonce(@Param('address') address: string) {
    return this.authService.getNonce(address);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // 2. Pass the whole DTO so the service gets address, signature, AND role
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
@Get('me')
async getProfile(@Req() req: RequestWithUser) {
  // Instead of just returning the token payload, get the full user from DB
  const user = await this.authService.getFreshUser(req.user.userId);
  if (!user) throw new UnauthorizedException('User no longer exists');
  return user;
}
}