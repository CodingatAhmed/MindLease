import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '@mindlease/shared';

@Schema({ timestamps: true })
export class Agent extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  basePrice: number; // Price in your platform token or ETH

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.CREATOR 
  })
  ownerRole: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ default: 'active' })
  status: string; // e.g., 'active', 'rented', 'maintenance'
  
  @Prop([String])
  capabilities: string[]; // e.g., ['coding', 'translation', 'analysis']
}

export const AgentSchema = SchemaFactory.createForClass(Agent);