import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from './enums/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto'; // Ensure this path is correct

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Find a user by their wallet address (case-insensitive)
   */
  async findByAddress(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ walletAddress: walletAddress.toLowerCase() }).exec();
  }

  /**
   * Find a user by their MongoDB ObjectId
   */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Create a new user or return existing (Web3 Registration)
   */
  async create(userData: { walletAddress: string; role: UserRole }): Promise<UserDocument> {
    const address = userData.walletAddress.toLowerCase();
    
    // Safety check: though AuthService usually handles this, we double-check here
    const existing = await this.findByAddress(address);
    if (existing) return existing;

    const newUser = new this.userModel({
      walletAddress: address,
      role: userData.role,
      nonce: Math.floor(Math.random() * 1000000).toString(),
      displayName: `User_${address.slice(2, 8)}`, 
    });
    
    return newUser.save();
  }

  /**
   * Updates the user profile (Display Name, Email, etc.)
   */
  async updateProfile(userId: string, updateData: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true } 
    ).exec();
    
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Persists or clears the hashed refresh token for session management
   */
  async updateToken(userId: string, refreshToken: string | null): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(
      userId, 
      { refreshToken }
    ).exec();

    if (!result) throw new NotFoundException('User not found during token update');
  }
}