import { Controller, Post, Body, UseGuards, Param, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentAccessGuard } from '../lease/guards/agent-access.guard';
import { ChatService } from './chat.service';
import { RequestWithUser } from '../auth/auth.controller';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard, AgentAccessGuard)
  @Post(':agentId')
  async sendMessage(
    @Param('agentId') agentId: string,
    @Body('message') message: string,
    @Req() req: RequestWithUser,
  ) {
    // We use the message here to fix the "unused" error
    return this.chatService.processMessage(req.user.userId, agentId, message);
  }

  @UseGuards(JwtAuthGuard, AgentAccessGuard)
  @Get('history/:agentId')
  async getHistory(
    @Param('agentId') agentId: string,
    @Req() req: RequestWithUser
  ) {
    return this.chatService.getHistory(req.user.userId, agentId);
  }
}