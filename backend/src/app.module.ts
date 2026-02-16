import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UsersModule} from './users/users.module';
import {AgentsModule} from './agents/agents.module';
import {LeaseModule} from './lease/lease.module';
import {ChatModule} from './chat/chat.module';
// import {UsersModule} from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AgentsModule,
    LeaseModule, 
    ChatModule,
    // 1. ConfigModule with .env support [cite: 88, 523]
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 2. MongoDB Connection [cite: 88, 531]
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }