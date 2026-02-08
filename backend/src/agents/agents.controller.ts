import { Controller, Post, Body, UseGuards, Get, Patch, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, JwtPayload } from '@mindlease/shared';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Agent } from './schemas/agent.schema';

@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('create')
  @Roles(UserRole.CREATOR)
  async create(
    @Body() createAgentDto: CreateAgentDto,
    @GetUser('userId' as keyof JwtPayload) userId: string,
  ): Promise<Agent> {
    return this.agentsService.create(createAgentDto, userId);
  }

  @Get('marketplace')
  async getAllActive(): Promise<Agent[]> {
    return this.agentsService.findAllActive();
  }

  @Get('my-agents')
  @Roles(UserRole.CREATOR)
  async getMyCreatedAgents(
    @GetUser('userId' as keyof JwtPayload) userId: string,
  ): Promise<Agent[]> {
    return this.agentsService.findByCreator(userId);
  }

  @Get('my-rentals')
  @Roles(UserRole.RENTER)
  async getRentals(
    @GetUser('userId' as keyof JwtPayload) userId: string,
  ): Promise<Agent[]> {
    return this.agentsService.findActiveRentals(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Agent> {
    return this.agentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CREATOR)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAgentDto>,
    @GetUser('userId' as keyof JwtPayload) userId: string,
  ): Promise<Agent> {
    return this.agentsService.update(id, userId, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.CREATOR)
  async remove(
    @Param('id') id: string,
    @GetUser('userId' as keyof JwtPayload) userId: string,
  ): Promise<void> {
    return this.agentsService.delete(id, userId);
  }
}