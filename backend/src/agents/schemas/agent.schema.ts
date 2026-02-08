import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AgentStatus {
  ACTIVE = 'active',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance'
}

@Schema({ timestamps: true })
export class Agent extends Document {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  category!: string; // e.g., 'trading', 'social'

  @Prop({ required: true, min: 0 })
  basePrice!: number; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  creator!: Types.ObjectId; // The permanent owner

  @Prop({ 
    type: String, 
    enum: Object.values(AgentStatus), 
    default: AgentStatus.ACTIVE 
  })
  status!: AgentStatus;
  
  @Prop([String])
  capabilities!: string[];

  // Optional: Track who is currently using it
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  currentRenter!: Types.ObjectId | null;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);