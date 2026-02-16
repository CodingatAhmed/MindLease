import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { AgentsService } from '../agents/agents.service';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { KnowledgeService } from 'src/agents/knowledge/knowledge.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly agentsService: AgentsService,
    private readonly knowledgeService: KnowledgeService,

  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(userId: string, agentId: string, content: string) {
    // 1. Fetch Agent metadata for the System Prompt
    const agent = await this.agentsService.findOne(agentId);
    if (!agent) throw new NotFoundException('Agent not found');

    try {
      // 2. Retrieve Conversation History (Sliding Window: last 10 messages)
      const history = await this.messageModel
        .find({
          sender: new Types.ObjectId(userId),
          agent: new Types.ObjectId(agentId),
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();

      // Reverse so it's in chronological order for OpenAI
      const formattedHistory = history.reverse().map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // 3. Define the Agent's "Persona
      // 1. Get Knowledge Context
    const context = await this.knowledgeService.findRelevantContext(agentId, content);

    // 2. Inject into System Prompt
    const systemPrompt: ChatCompletionMessageParam = {
    role: 'system',
    content: `You are ${agent.name}. 
    Use the following context to answer the user: 
    ---
    ${context}
    ---
    If the answer isn't in the context, use your general knowledge but mention you're acting as ${agent.name}.`,
    };

      const messages: ChatCompletionMessageParam[] = [
        systemPrompt,
        ...formattedHistory,
        { role: 'user', content },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages, // Now perfectly typed
        temperature: 0.7,
      });

      const aiContent = response.choices[0].message.content || 'No response from agent.';

      // 5. Save BOTH messages to the database (Persistence)
      const userMsg = new this.messageModel({
        sender: new Types.ObjectId(userId),
        agent: new Types.ObjectId(agentId),
        content,
        role: 'user',
      });

      const agentMsg = new this.messageModel({
        sender: new Types.ObjectId(userId),
        agent: new Types.ObjectId(agentId),
        content: aiContent,
        role: 'agent',
      });

      // Use Promise.all to save both simultaneously
      await Promise.all([userMsg.save(), agentMsg.save()]);

      return agentMsg;

    } catch (error) {
      this.logger.error(`OpenAI Processing Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw new InternalServerErrorException('Agent is currently unavailable. Please try again later.');
    }
  }

  async getHistory(userId: string, agentId: string) {
    return this.messageModel
      .find({
        sender: new Types.ObjectId(userId),
        agent: new Types.ObjectId(agentId),
      })
      .sort({ createdAt: 1 }) // Oldest first for the UI
      .exec();
  }
}