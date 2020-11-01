import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat-bot/service/chat.service';
import { PubSubService } from './pub-sub/service/pub-sub.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly chatService: ChatService, private readonly pubSubService: PubSubService) {
    this.chatService.connect();
    this.pubSubService.pubSubConnect();
  }
}
