import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { Knowledge, KnowledgeSchema } from '../schemas/knowledge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Knowledge.name, schema: KnowledgeSchema }]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService], // MUST export to be used in ChatService
})
export class KnowledgeModule {}