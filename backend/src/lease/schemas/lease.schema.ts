import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LeaseStatus } from '../enums/lease-status.enum';

@Schema({ timestamps: true })
export class Lease extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  renter!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agent!: Types.ObjectId;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ required: true })
  totalPrice!: number;

  @Prop({
    type: String,
    enum: LeaseStatus,
    default: LeaseStatus.ACTIVE
  })
  status!: LeaseStatus;

  @Prop()
  transactionHash?: string;
}

export const LeaseSchema = SchemaFactory.createForClass(Lease);