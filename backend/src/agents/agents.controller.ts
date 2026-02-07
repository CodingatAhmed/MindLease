import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard.ts';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@mindlease/shared';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

@Post('create')
@Roles(UserRole.CREATOR)
create(
  @Body() createAgentDto: CreateAgentDto, // Type-safe!
  @GetUser('userId') userId: string
) {
  return this.agentsService.create(createAgentDto, userId);
}

  @Get('my-rentals')
  @Roles(UserRole.RENTER)
  getRentals(@Req() req: any) {
    const renterId = req.user.userId;
    return this.agentsService.findActiveRentals(renterId);
  }
}