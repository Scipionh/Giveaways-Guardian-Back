import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat-bot/service/chat.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly chatService: ChatService) {
    this.chatService.connect();
  }
}
