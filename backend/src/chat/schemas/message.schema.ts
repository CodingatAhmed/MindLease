import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agent!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, enum: ['user', 'agent'] })
  role!: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);