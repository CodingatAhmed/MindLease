import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent, AgentStatus } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>
  ) {}

  async create(createAgentDto: CreateAgentDto, userId: string): Promise<Agent> {
    const createdAgent = new this.agentModel({
      ...createAgentDto,
      creator: new Types.ObjectId(userId),
      status: AgentStatus.ACTIVE,
    });
    return await createdAgent.save();
  }

  async findAllActive(): Promise<Agent[]> {
    return await this.agentModel
      .find({ status: AgentStatus.ACTIVE })
      .populate('creator', 'walletAddress displayName')
      .exec();
  }

  async findByCreator(userId: string): Promise<Agent[]> {
    return await this.agentModel
      .find({ creator: new Types.ObjectId(userId) })
      .exec();
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentModel.findById(id).populate('creator').exec();
    
    // This check satisfies TypeScript that 'agent' is not null
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    
    return agent;
  }

  async findActiveRentals(userId: string): Promise<Agent[]> {
    return await this.agentModel
      .find({ 
        currentRenter: new Types.ObjectId(userId),
        status: AgentStatus.RENTED
      })
      .exec();
  }

  async update(id: string, userId: string, updateData: Partial<CreateAgentDto>): Promise<Agent> {
    // 1. Check if agent exists and check ownership
    const agent = await this.findOne(id);
    
    if (agent.creator.toString() !== userId) {
      throw new ForbiddenException('You do not own this agent');
    }

    // 2. Perform the update
    const updatedAgent = await this.agentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    // 3. Explicit check to ensure the return type is 'Agent' and not 'null'
    if (!updatedAgent) {
      throw new NotFoundException('Update failed: Agent no longer exists');
    }

    return updatedAgent;
  }

  async markAsRented(agentId: string, renterId: string): Promise<void> {
  await this.agentModel.findByIdAndUpdate(agentId, {
    status: AgentStatus.RENTED,
    currentRenter: new Types.ObjectId(renterId)
  }).exec();
}

  async delete(id: string, userId: string): Promise<void> {
    const agent = await this.findOne(id);
    
    if (agent.creator.toString() !== userId) {
      throw new ForbiddenException('You do not own this agent');
    }
    
    await this.agentModel.findByIdAndDelete(id).exec();
  }

  async markAsAvailable(agentId: string): Promise<void> {
  await this.agentModel.findByIdAndUpdate(agentId, {
    status: AgentStatus.ACTIVE,
    currentRenter: null // Remove the renter reference
  }).exec();
}
}