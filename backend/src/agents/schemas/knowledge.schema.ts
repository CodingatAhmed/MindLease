import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Knowledge extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId!: Types.ObjectId;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  content!: string; // For the MVP, we store text. For Production, we'd store an S3 URL.

  @Prop({ type: [Number] }) 
  vector?: number[]; // This is where the mathematical "meaning" of the text lives
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);