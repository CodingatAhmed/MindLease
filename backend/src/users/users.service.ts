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
    const newUser = new this.userModel({
      walletAddress: userData.walletAddress.toLowerCase(),
      role: userData.role,
      // displayName can be left empty or set as a default here
      displayName: `User_${userData.walletAddress.slice(0, 6)}`, 
    });
    return newUser.save();
  }
}