import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lease } from './schemas/lease.schema';
import { LeaseStatus } from './enums/lease-status.enum';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { AgentsService } from '../agents/agents.service';
import { AgentStatus } from '../agents/schemas/agent.schema';
import { ethers } from 'ethers';

@Injectable()
export class LeaseService {
  private readonly logger = new Logger(LeaseService.name);
  private provider: ethers.JsonRpcProvider;

  constructor(
    @InjectModel(Lease.name) private leaseModel: Model<Lease>,
    private agentsService: AgentsService,
  ) {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.sepolia.org');

  }

  async verifyTransaction(txHash: string, expectedPrice: number): Promise<boolean> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return false;

      // 1. Wait for at least 1 confirmation to prevent "double spend"
      const receipt = await tx.wait(1);
      if (!receipt || receipt.status === 0) return false;

      // 2. Verify the amount (Convert Wei to Ether)
      const amountPaid = parseFloat(ethers.formatEther(tx.value));
      
      // Allow a tiny margin for rounding errors, but ensure it's enough
      return amountPaid >= expectedPrice;
    } catch (error) {
      this.logger.error(`Transaction verification failed: ${txHash}`, error);
      return false;
    }
  }

  async startLease(createLeaseDto: CreateLeaseDto, userId: string): Promise<Lease> {
    const { agentId, durationInHours } = createLeaseDto;

    const agent = await this.agentsService.findOne(agentId);
    if (!agent || agent.status !== AgentStatus.ACTIVE) {
      throw new BadRequestException('Agent is currently not available for lease');
    }

    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(startTime.getHours() + durationInHours);

    const newLease = new this.leaseModel({
      renter: new Types.ObjectId(userId),
      agent: new Types.ObjectId(agentId),
      startTime,
      endTime,
      totalPrice: agent.basePrice * durationInHours,
      status: LeaseStatus.ACTIVE,
      transactionHash: createLeaseDto.transactionHash,
    });

    const savedLease = await newLease.save();
    await this.agentsService.markAsRented(agentId, userId);

    return savedLease;
  }

  async getMyLeases(userId: string): Promise<Lease[]> {
    return this.leaseModel.find({ renter: new Types.ObjectId(userId) })
      .populate('agent')
      .exec();
  }

  async expireCompletedLeases(): Promise<void> {
    const now = new Date();

    const expiredLeases = await this.leaseModel.find({
      status: LeaseStatus.ACTIVE,
      endTime: { $lte: now }
    }).exec();

    for (const lease of expiredLeases) {
      lease.status = LeaseStatus.EXPIRED;
      await lease.save();

      // Convert ObjectId to string for the service call
      const agentIdStr = lease.agent.toString();
      await this.agentsService.markAsAvailable(agentIdStr);
      
      this.logger.log(`Lease ${lease._id.toString()} expired. Agent ${agentIdStr} is now available.`);
    }
  }

  async hasActiveLease(userId: string, agentId: string): Promise<boolean> {
    try {
      const now = new Date();
      
      const lease = await this.leaseModel.findOne({
        renter: new Types.ObjectId(userId),
        agent: new Types.ObjectId(agentId),
        status: LeaseStatus.ACTIVE,
        endTime: { $gt: now }, // Must be in the future
      }).exec();

      // Return true if lease exists, false otherwise
      return !!lease;
    } catch (error) {
      this.logger.error(`Error checking lease status for user ${userId}:`, error);
      return false;
    }
  }
}