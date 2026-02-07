import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent } from './schemas/agent.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>
  ) {}

  create(createAgentDto: any, ownerId: string) {
    const createdAgent = new this.agentModel({
      ...createAgentDto,
      ownerId: new Types.ObjectId(ownerId),
    });
    return createdAgent.save();
  }

  async findAllActive() {
    return this.agentModel.find({ status: 'active' }).exec();
  }

  async findByOwner(ownerId: string) {
    return this.agentModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
  }
}