import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@mindlease/shared';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  walletAddress!: string;

  // Restored displayName - optional initially, can be set in profile update
  @Prop({ trim: true })
  displayName?: string;

  @Prop({ 
    type: String, 
    enum: UserRole, 
    default: UserRole.RENTER 
  })
  role!: UserRole;

  @Prop({ default: () => Math.floor(Math.random() * 1000000).toString() })
  nonce!: string;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);