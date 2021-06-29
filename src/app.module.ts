import { HttpModule, Module } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './service/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CommandsUtils } from './utils/commands-utils';
import { GuardiansModule } from './guardians/guardians.module';
import { PubsubService } from './service/pubsub.service';
import { ChatClientService } from './service/chat-client.service';
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest'),
    UsersModule,
    GuardiansModule,
    AuthModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatService, CommandsUtils, PubsubService, ChatClientService, AuthService],
})
export class AppModule {}
