import { Controller, Post, Body, Get, UseGuards, Req, Param, UnauthorizedException, Patch } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@mindlease/shared';
import {UpdateUserDto} from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';

// 1. Updated Interface to include Role
export interface RequestWithUser extends Request {
  user: {
    walletAddress: string;
    userId: string; // Matches the 'sub' from JWT
    role: UserRole; // Now the controller knows if it's a creator or renter
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly usersService: UsersService
  ) {}

  @Get('nonce/:address')
  async getNonce(@Param('address') address: string) {
    return this.authService.getNonce(address);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // New: Refresh Token Endpoint
  @Post('refresh')
  async refresh(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken: string
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // New: Logout (clears session in DB)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    return this.authService.updateRefreshToken(req.user.userId, null);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.authService.getFreshUser(req.user.userId);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser, 
    @Body() updateDto: UpdateUserDto
  ) {
    // Calling UsersService directly as per your existing ethic
    return this.usersService.updateProfile(req.user.userId, updateDto);
  }
}