import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { PubsubService } from './service/pubsub.service';
import { ChatClientService } from './service/chat-client.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly chatClientService: ChatClientService,
              private readonly pubsubService: PubsubService) {
    this.chatClientService.connect();
    this.pubsubService.pubSubConnect();
  }
}
