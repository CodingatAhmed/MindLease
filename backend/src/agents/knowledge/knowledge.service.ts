import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Knowledge } from '../schemas/knowledge.schema';
import { KnowledgeSearchResult } from '@mindlease/shared';
import OpenAI from 'openai';

@Injectable()
export class KnowledgeService {
  private openai: OpenAI;
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(@InjectModel(Knowledge.name) private knowledgeModel: Model<Knowledge>) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async findRelevantContext(agentId: string, userQuery: string): Promise<string> {
  const queryVector = await this.createEmbedding(userQuery);

  // 1. Execute and cast to unknown first
  const rawDocs = await this.knowledgeModel.aggregate<KnowledgeSearchResult>([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "vector",
        queryVector: queryVector,
        numCandidates: 10,
        limit: 3,
        filter: { agentId: new Types.ObjectId(agentId) }
      }
    },
    {
      $project: {
        _id: 0,
        content: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).exec() as unknown[];

  if (!rawDocs || rawDocs.length === 0) {
    return "No specific internal knowledge found.";
  }

  // 2. The Fix: Use a type-safe map that doesn't rely on the 'any' or 'unresolved' state
  const contextParts: string[] = rawDocs.map((doc) => {
    // We treat the doc as a Record and explicitly extract the string
    const item = doc as Record<string, unknown>;
    const content = item['content'];
    
    // Return the content only if it's a string, otherwise return empty
    return typeof content === 'string' ? content : '';
  });

  return contextParts.filter(text => text.length > 0).join("\n\n");
}

  async ingestText(agentId: string, creatorId: string, fileName: string, content: string) {
    const knowledge = new this.knowledgeModel({
      agentId: new Types.ObjectId(agentId),
      creatorId: new Types.ObjectId(creatorId),
      fileName,
      content,
    });

    return await knowledge.save();
  }
}