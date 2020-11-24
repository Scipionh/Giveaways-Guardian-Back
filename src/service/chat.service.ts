import { CommandsUtils } from '../utils/commands-utils';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { GuardiansService } from '../guardians/guardians.service';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';
import { User } from '../users/users.model';
import { TEXTS } from '../config/texts';
import { ChatClientService } from './chat-client.service';

@Injectable()
export class ChatService {
  private chatClient;

  constructor(
    private readonly usersService: UsersService,
    private readonly commandsUtils: CommandsUtils,
    private readonly commandsService: CommandsService,
    private readonly guardiansService: GuardiansService,
    private readonly chatClientService: ChatClientService)
  {
    this.chatClient = this.chatClientService.chatClient;
    this.connect();
  }

  private async connect() {
    await this.guardiansService.resumeGuardian();
    this.listenToChat();
  }

  listenToChat = (): void => {
    this.chatClient.onMessage((channel: string, chatUser: string, message: string, msg: TwitchPrivateMessage) => {
      const userContext = [...msg.userInfo['_userData']].reduce((obj, [key, value]) => (obj[key] = value, obj), {});

      if(!this.commandsUtils.isValidCommand(message, userContext)) return;

      const user = new User(userContext);
      this.usersService.getById(user.id).then(u => {
        if(!u) this.usersService.create(user.toCreateUserDto());
      });

      const commandName = this.commandsUtils.getCommandName(message, userContext);
      const commandParams = this.commandsUtils.getCommandParams(message);

      console.log('GUCCI_guardian', this.guardiansService?.guardian, !!this.guardiansService?.guardian);
      console.log('GUCCI_isDead', this.guardiansService?.guardian?.isDead);

      if((!this.guardiansService?.guardian || this.guardiansService?.guardian?.isDead) && commandName !== 'instantiate' && commandName !== 'bitch') {
        this.chatClient.say(this.chatClientService.channel, TEXTS.noGuardian);
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
            console.log('GUCCI_canUseCommand', y);
            if(y) {
              this.guardiansService.isDead().then(w => {
                console.log('GUCCI_isDead', w);
                if(!w) {
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
              })
            } else {
              this.usersService.getRemainingTime(user.id, 'kick').then(h => {
                this.chatClient.say(this.chatClientService.channel, `Tu dois encore attendre ${h} avant de pouvoir frapper le gardien à nouveau ${user.displayName} !!`)
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
            this.commandsService.instantiate(commandParams);
          } else {
            this.chatClient.say(this.chatClientService.channel, 'PAS ADMIN FDP');
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
