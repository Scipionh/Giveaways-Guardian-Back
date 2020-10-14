import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './service/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CommandsUtils } from './utils/commands-utils';
import { GuardiansModule } from './guardians/guardians.module';
import { CommandsService } from './service/commands.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest'),
    UsersModule,
    GuardiansModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatService, CommandsUtils, CommandsService],
})
export class AppModule {}