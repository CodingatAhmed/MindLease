import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ethers } from 'ethers';
import { LoginDto } from './dto/login.dto';
// import { UserRole } from '../users/enums/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 1. Get Nonce
   * Returns the user's stored nonce or a static one for new registrations.
   */
  async getNonce(address: string) {
    const user = await this.usersService.findByAddress(address);
    
    // If user exists, return their real nonce
    if (user) {
      return { nonce: user.nonce };
    }
    
    // For new users, we use a consistent "Registration" nonce
    // You can also make this random, but for simple auth, "123456" is a common starting point
    return { nonce: "123456" };
  }

  /**
   * 2. Login / Verify Signature
   */
  async login(loginDto: LoginDto) {
    const { address, signature, role } = loginDto;

    try {
      let user = await this.usersService.findByAddress(address);
      
      // Determine the nonce to verify against
      // If user exists, we use their DB nonce. If not, we use the registration nonce "123456"
      const nonceToVerify = user ? user.nonce : "123456";

      // 1. Reconstruct the message that was signed on the frontend
      const message = `Sign this message to login to MindLease: ${nonceToVerify}`;

      // 2. Verify the Signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      // 3. Registration: Create User if they don't exist
      if (!user) {
        user = await this.usersService.create({ 
          walletAddress: address, 
          role: role // 'role' comes from our LoginDto
        });
      }

      // 4. SECURITY: Rotate the Nonce
      // This invalidates the current signature so it can't be reused (Replay Attack Protection)
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save(); 

      // 5. Issue JWT with RBAC payload
      const payload = { 
        walletAddress: user.walletAddress, 
        sub: user._id,
        role: user.role 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          displayName: user.displayName
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Auth Error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async getFreshUser(userId: string) {
  return this.usersService.findById(userId); // Ensure you add findById to UsersService
}
}