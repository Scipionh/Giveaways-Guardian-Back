import { Injectable } from '@nestjs/common';
import { Guardian } from '../guardians/guardians.model';
import * as tmi from 'tmi.js'
import { GuardiansService } from '../guardians/guardians.service';
import { TEXTS } from '../config/texts';
import { ActualGuardian } from '../guardians/actual-guardian.model';
import { ChatClientService } from './chat-client.service';

@Injectable()
export class CommandsService {
  private chatClient;

  constructor(private readonly guardiansService: GuardiansService, private readonly chatClientService: ChatClientService) {
    this.chatClient = this.chatClientService.chatClient;
  }

  /* kick(user: User, guardian: Guardian, client: tmi.Client, target: any) {

  } */

  instantiate(commandParams: string[]) {
    this.guardiansService.hasGuardianInProgress().then(inProgress => {
      if(!inProgress) {
        const guardian = new Guardian(parseInt(commandParams[0]), commandParams[1]);
        this.guardiansService.guardian = new ActualGuardian(guardian, false, false);
        this.guardiansService.create(guardian.toCreateGuardianDto())
          .then(x => {
            this.guardiansService.createActualGuardian(x).then(() => {
              this.chatClient.say(this.chatClientService.channel, TEXTS.newGuardian.found + " " + TEXTS.newGuardian.name + " " + x.name + " " + TEXTS.newGuardian.andHas + " " + x.health + " " + TEXTS.newGuardian.healthPoints)
            });
          });
      } else {
        this.chatClient.say(this.chatClientService.channel, TEXTS.alreadyFighthting);
      }
    });
  }
}