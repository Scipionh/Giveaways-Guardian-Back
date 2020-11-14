import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat-bot/service/chat.service';
import { AuthService } from './shared/auth.service';
import fs from "fs";
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { clientId, secret } from './auth-config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly chatService: ChatService,
              private readonly authService: AuthService) {
    this.chatService.connect();
    this.authService.pubSubConnect();
  }
}
