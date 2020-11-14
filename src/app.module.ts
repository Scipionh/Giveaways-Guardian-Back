import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './chat-bot/service/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './chat-bot/users/users.module';
import { CommandsUtils } from './chat-bot/utils/commands-utils';
import { GuardiansModule } from './chat-bot/guardians/guardians.module';
import { CommandsService } from './chat-bot/service/commands.service';
import { AuthService } from './shared/auth.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest'),
    UsersModule,
    GuardiansModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatService, CommandsUtils, CommandsService, AuthService],
})
export class AppModule {}
