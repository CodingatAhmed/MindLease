import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { LeaseModule } from 'src/lease/lease.module'; // Required for AgentAccessGuard

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    LeaseModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}