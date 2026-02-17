import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Knowledge } from '../schemas/knowledge.schema';
import { KnowledgeSearchResult, IngestionResponse } from '@mindlease/shared';
import OpenAI from 'openai';
import { NotFoundException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
// import { PdfParseResult } from '@mindlease/shared';
import { InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class KnowledgeService {
  private openai: OpenAI;
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(@InjectModel(Knowledge.name) private knowledgeModel: Model<Knowledge>) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

async processFileUpload(agentId: string, creatorId: string, file: Express.Multer.File): Promise<IngestionResponse> {
    let content = '';

    try {
      const fileData = file as unknown as Record<string, unknown>;
      
      const mimeType = (fileData['mimetype'] ?? "") as string;
      const originalName = (fileData['originalname'] ?? "unknown_file") as string;
      const buffer = fileData['buffer'] as Buffer;

      if (mimeType === 'application/pdf') {
        const parsePdf = pdf as unknown as (dataBuffer: Buffer) => Promise<Record<string, unknown>>;
        const pdfData = await parsePdf(buffer);

        // Safe extraction
        if (pdfData && typeof pdfData['text'] === 'string') {
          content = pdfData['text'];
        } else {
          throw new Error('PDF parsing failed to extract valid text.');
        }
      } else {
        content = buffer.toString('utf-8');
      }

      if (!content || content.trim().length < 10) {
        throw new Error('File content is too short or could not be parsed.');
      }

      return await this.ingestText(agentId, creatorId, originalName, content);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      this.logger.error(`File processing failed: ${errorMessage}`);
      throw new InternalServerErrorException(`Failed to process file: ${errorMessage}`);
    }
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

    // 1. Execute the aggregate
    // We cast to 'any' first to break the Mongoose type chain, then to our interface array
    const docs = (await this.knowledgeModel.aggregate([
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
    ]).exec()) as KnowledgeSearchResult[]; 

    // 2. Check for empty results
    if (!docs || docs.length === 0) {
      this.logger.warn(`No relevant knowledge found for agent ${agentId}`);
      return "No specific internal knowledge found.";
    }

    // 3. Mapping is now safe because 'docs' is strictly KnowledgeSearchResult[]
    return docs
      .map((d: KnowledgeSearchResult) => d.content)
      .join("\n\n");
  }

  async ingestText(agentId: string, creatorId: string, fileName: string, content: string) {
    const CHUNK_SIZE = 1000; // Characters per chunk
    const CHUNK_OVERLAP = 200; // Overlap to maintain context between chunks
    const chunks: string[] = [];

    // 1. Simple Slidng Window Chunking
    for (let i = 0; i < content.length; i += (CHUNK_SIZE - CHUNK_OVERLAP)) {
      const chunk = content.substring(i, i + CHUNK_SIZE);
      if (chunk.length > 50) { // Avoid saving tiny fragments
        chunks.push(chunk);
      }
      if (i + CHUNK_SIZE >= content.length) break;
    }

    this.logger.log(`Splitting file "${fileName}" into ${chunks.length} chunks.`);

    // 2. Process chunks and save them
    let chunksCount = 0;
    for (const [index, chunkText] of chunks.entries()) {
      const vector = await this.createEmbedding(chunkText);
      
      await new this.knowledgeModel({
        agentId: new Types.ObjectId(agentId),
        creatorId: new Types.ObjectId(creatorId),
        fileName: `${fileName} (Part ${index + 1})`,
        content: chunkText,
        vector,
      }).save();
      
      chunksCount++;
    }

    return { 
      message: 'Ingestion complete', 
      chunksProcessed: chunksCount 
    };
  }

  async findByAgent(agentId: string) {
  return this.knowledgeModel.find({ agentId: new Types.ObjectId(agentId) }).select('-vector').sort({ createdAt: -1 }).exec();
}

async remove(knowledgeId: string, creatorId: string) {
  const result = await this.knowledgeModel.deleteOne({ 
    _id: new Types.ObjectId(knowledgeId),
    creatorId: new Types.ObjectId(creatorId) // Security: Only owner can delete
  });
  
  if (result.deletedCount === 0) throw new NotFoundException('Knowledge piece not found or you do not have permission to delete it');
  return { message: 'Knowledge deleted successfully' };
}
}