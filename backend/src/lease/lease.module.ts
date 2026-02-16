import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaseService } from './lease.service';
import { LeaseController } from './lease.controller';
import { Lease, LeaseSchema } from './schemas/lease.schema';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    // Register the Lease Schema in Mongoose
    MongooseModule.forFeature([{ name: Lease.name, schema: LeaseSchema }]),
    
    // Import AgentsModule because LeaseService needs AgentsService
    AgentsModule,
    
    // Required for the @Cron jobs we wrote for auto-expiration
    ScheduleModule.forRoot(),
  ],
  controllers: [LeaseController],
  providers: [LeaseService],
  // We MUST export LeaseService so AgentAccessGuard can use it in ChatModule
  exports: [LeaseService], 
})
export class LeaseModule {}