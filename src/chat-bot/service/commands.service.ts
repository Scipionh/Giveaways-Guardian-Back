import { Injectable } from '@nestjs/common';
import { Guardian } from '../guardians/guardians.model';
import * as tmi from 'tmi.js'
import { GuardiansService } from '../guardians/guardians.service';
import { TEXTS } from '../config/texts';
import { ActualGuardian } from '../guardians/actual-guardian.model';

@Injectable()
export class CommandsService {
  constructor(private readonly guardiansService: GuardiansService) {}

  /* kick(user: User, guardian: Guardian, client: tmi.Client, target: any) {

  } */

  instantiate(commandParams: string[], client: tmi.Client, target: any) {
    this.guardiansService.isDead().then(isDead => {
      if(isDead) {
        const guardian = new Guardian(parseInt(commandParams[0]), commandParams[1]);
        this.guardiansService.guardian = new ActualGuardian(guardian, isDead);
        this.guardiansService.create(guardian.toCreateGuardianDto())
          .then(x => {
            this.guardiansService.createActualGuardian(x).then(() => {
              client.say(target, TEXTS.newGuardian.found + " " + TEXTS.newGuardian.name + " " + x.name + " " + TEXTS.newGuardian.andHas + " " + x.health + " " + TEXTS.newGuardian.healthPoints)
            });
          });
      } else {
        client.say(target, TEXTS.alreadyFighthting);
      }
    });
  }
}