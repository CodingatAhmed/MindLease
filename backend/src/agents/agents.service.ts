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
      status: AgentStatus.ACTIVE, // Use Enum
    });
    return await createdAgent.save();
  }

  async findAllActive(): Promise<Agent[]> {
    return await this.agentModel
      .find({ status: AgentStatus.ACTIVE }) // Use Enum
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
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async findActiveRentals(userId: string): Promise<Agent[]> {
    return await this.agentModel
      .find({ 
        currentRenter: new Types.ObjectId(userId),
        status: AgentStatus.RENTED // Logically, if I'm renting it, the status is RENTED
      })
      .exec();
  }

  async update(id: string, userId: string, updateData: Partial<CreateAgentDto>): Promise<Agent> {
    const agent = await this.findOne(id);
    
    if (agent.creator.toString() !== userId) {
      throw new ForbiddenException('You do not own this agent');
    }

    return await this.agentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<void> {
    const agent = await this.findOne(id);
    if (agent.creator.toString() !== userId) {
      throw new ForbiddenException('You do not own this agent');
    }
    await this.agentModel.findByIdAndDelete(id).exec();
  }
}