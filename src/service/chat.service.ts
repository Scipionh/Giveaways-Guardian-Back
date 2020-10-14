import * as tmi from 'tmi.js'
import { Options } from '../models/options';
import { UserContext } from '../models/user-context';
import { CommandsUtils } from '../utils/commands-utils';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';
import { Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { TEXTS } from '../config/texts';
import { GuardiansService } from '../guardians/guardians.service';
import { opts } from '../opts';

@Injectable()
export class ChatService {
  private client : tmi.Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly commandsUtils: CommandsUtils,
    private readonly commandsService: CommandsService,
    private readonly guardiansService: GuardiansService) {
    this.client = new tmi.Client(opts);
    this.listenToConnection();
  }

  public connect(): void {
    this.client.connect();
    this.listenToChat();
    this.guardiansService.resumeGuardian();
  }

  listenToConnection(): void {
    this.client.on('connected', (addr, port) => {
      console.info(`* Connected to ${addr}:${port}`);
    });
  }

  listenToChat = (): void => {
    this.client.on('message', (target: any, userContext: UserContext, msg: any, self: any) => {
      if(self) return;
      if(!this.commandsUtils.isValidCommand(msg, userContext)) return;

      const user = new User(userContext);
      this.usersService.getById(user.id).then(u => {
        if(!u) this.usersService.create(user.toCreateUserDto());
      });

      const commandName = this.commandsUtils.getCommandName(msg, userContext);
      const commandParams = this.commandsUtils.getCommandParams(msg);

      if((!this.guardiansService.guardian || this.guardiansService.guardian.isDead) && commandName !== 'instantiate' && commandName !== 'bitch') {
        this.client.say(target, TEXTS.noGuardian);
        return;
      }

      switch(commandName) {
        // PLEB COMMANDS
        case "register": {
          // this.commands.register(user)
          break;
        }
        case "kick": {
          this.usersService.canUseCommand(user.id, 'kick', 5).then(y => {
            if(y) {
              if(this.guardiansService.isDead()) {
                const damageDealt = Math.floor(Math.random() * 6) + 1;
                this.guardiansService.removeHealth(damageDealt).then(x => {
                  this.usersService.updateLastUsage(user.id, 'kick').then(() => {
                    this.guardiansService.getCurrentId().then(g => {
                      this.usersService.addParticipation(user, g);
                      this.guardiansService.addParticipant(user, damageDealt, g);
                    })
                  })
                })
              }
            } else {
              this.usersService.getRemainingTime(user.id, 'kick').then(h => {
                this.client.say(target, `Tu dois encore attendre ${h} avant de pouvoir frapper le gardien à nouveau ${user.displayName} !!`)
              })
            }
          })
          break;
        }
        case "stats": {
          // instance.commands.stats(user, instance.guardian, instance.client, target)
          break;
        }
        case "bitch": {
          // instance.commands.bitch(instance.client, target)
          break;
        }

        // ADMIN COMMANDS
        case "instantiate": {
          if(user.isBroadcaster) {
            this.commandsService.instantiate(commandParams, this.client, target);
          } else {
            this.client.say(target, 'PAS ADMIN FDP');
          }
          // instantiateBot()
          break;
        }
        case "giveaway": {
          // if(isBroadcaster()) instance.commands.giveaway(instance.guardian, instance.client, target)
          break;
        }
        case "relaunch": {
          // if(isBroadcaster()) instance.commands.relaunch(instance.client, target)
          break;
        }
        case "win": {
          // if(isBroadcaster()) instance.commands.win(commandParams, instance.guardian, instance.client, target)
          break;
        }
      }
    });
  }
}
