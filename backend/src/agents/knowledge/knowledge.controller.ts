import { Controller, Post, Get, Delete, UseGuards, Param, Req, Body,
  UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/auth.controller';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';


@Controller('agents/:agentId/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' matches the field name in Postman/Frontend
  uploadFile(
    @Param('agentId') agentId: string,
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: /(text\/plain|application\/pdf)/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.knowledgeService.processFileUpload(
      agentId,
      req.user.userId,
      file
    );
  }

  @Post()
  async addKnowledge(
    @Param('agentId') agentId: string,
    @Body() createKnowledgeDto: CreateKnowledgeDto,
    @Req() req: RequestWithUser,
  ) {
    // Pass the creatorId (req.user.userId) to ensure ownership
    return this.knowledgeService.ingestText(
      agentId, 
      req.user.userId, 
      createKnowledgeDto.fileName, 
      createKnowledgeDto.content
    );
  }

  @Get()
  async getKnowledge(@Param('agentId') agentId: string) {
    return this.knowledgeService.findByAgent(agentId);
  }

  @Delete(':id')
  async removeKnowledge(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.knowledgeService.remove(id, req.user.userId);
  }
}