import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ethers } from 'ethers';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string) {
    const user = await this.usersService.findByAddress(address);
    return { nonce: user ? user.nonce : "123456" };
  }

  async login(loginDto: LoginDto) {
    const { address, signature, role } = loginDto;
    try {
      let user = await this.usersService.findByAddress(address);
      const nonceToVerify = user ? user.nonce : "123456";
      const message = `Sign this message to login to MindLease: ${nonceToVerify}`;

      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      if (!user) {
        user = await this.usersService.create({ walletAddress: address, role });
      }

      // Rotate Nonce
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();

      // Issue Dual Tokens
      const tokens = await this.generateTokens(user._id.toString(), user.walletAddress, user.role);
      await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

      return {
        ...tokens,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          displayName: user.displayName
        }
      };
    } catch (error) {
      console.error('Detailed Auth Error:', error); 
      
      // If it's already an UnauthorizedException (from signature mismatch), re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }

  // Generate Access (15m) and Refresh (7d) tokens
  async generateTokens(userId: string, walletAddress: string, role: string) {
    const payload = { sub: userId, walletAddress, role };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersService.updateToken(userId, hashed);
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

    const matches = await bcrypt.compare(rt, user.refreshToken);
    if (!matches) throw new ForbiddenException('Invalid Refresh Token');

    const tokens = await this.generateTokens(user._id.toString(), user.walletAddress, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return tokens;
  }

  async getFreshUser(userId: string) {
    return this.usersService.findById(userId);
  }
}