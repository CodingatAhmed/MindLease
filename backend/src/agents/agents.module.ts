import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { Agent, AgentSchema } from './schemas/agent.schema';

@Module({
  imports: [
    // This line tells Nest how to create the "AgentModel"
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }])
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService]
})
export class AgentsModule {}