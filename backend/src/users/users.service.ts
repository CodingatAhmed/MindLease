import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from './enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByAddress(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ walletAddress: walletAddress.toLowerCase() }).exec();
  }

  // Updated to accept an object with the role
  async create(userData: { walletAddress: string; role: UserRole }): Promise<UserDocument> {

    const address = userData.walletAddress.toLowerCase();
    const existing = await this.findByAddress(address);
    if (existing) return existing;
    const newUser = new this.userModel({
      walletAddress: address,
      role: userData.role,
      nonce: Math.floor(Math.random() * 1000000).toString(),
      // displayName can be left empty or set as a default here
      displayName: `User_${address.slice(2, 8)}`, 
    });
    return newUser.save();
  }

  // Add this method
  async findById(id: string): Promise<UserDocument | null> {
  return this.userModel.findById(id).exec();
}
}