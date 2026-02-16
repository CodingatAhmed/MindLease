import { Controller, Post, Body, UseGuards, Param, Req } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/auth.controller';

@Controller('agents/:agentId/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async addKnowledge(
    @Param('agentId') agentId: string,
    @Body('content') content: string,
    @Body('fileName') fileName: string,
    @Req() req: RequestWithUser,
  ) {
    // Pass the creatorId (req.user.userId) to ensure ownership
    return this.knowledgeService.ingestText(
      agentId, 
      req.user.userId, 
      fileName, 
      content
    );
  }
}