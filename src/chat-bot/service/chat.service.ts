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
import { channelId, clientId, oauthPwd, secret } from '../../auth-config';
import { AuthService } from '../../shared/auth.service';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';
import { ChatClient } from 'twitch-chat-client';
import * as fs from "fs";
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';

@Injectable()
export class ChatService {
  private client : tmi.Client;
  private chatClient;
  private opts: Options = {
    options: { debug: true },
    connection: {
      secure: true,
      reconnect: true
    },
    identity: {
      username: channelId,
      password: oauthPwd
    },
    channels: [
      'iheavyx'
    ]
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly commandsUtils: CommandsUtils,
    private readonly commandsService: CommandsService,
    private readonly authService: AuthService,
    private readonly guardiansService: GuardiansService) {
    const tokenData = JSON.parse(fs.readFileSync('./src/tokens.json', 'UTF-8'));
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(clientId, tokenData.accessToken),
      {
        clientSecret: secret,
        refreshToken: tokenData.refreshToken,
        expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
          const newTokenData = {
            accessToken,
            refreshToken,
            expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
          };
          await fs.promises.writeFile('./src/tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8');
        }
      }
    );
    this.chatClient = new ChatClient(authProvider, {channels: ['iheavyx']});
    // this.client = new tmi.Client(this.opts);
    // this.listenToConnection();
  }

  public async connect() {
    // this.client.connect();
    await this.chatClient.connect();
    await this.guardiansService.resumeGuardian();
    this.listenToChat();
  }

  listenToConnection(): void {
    this.chatClient.onConnect('connected', (addr, port) => {
      console.info(`* Connected to ${addr}:${port}`);
    });
  }

  listenToChat = (): void => {
    this.chatClient.onMessage((channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
      console.log('GUCCI_here');
      this.chatClient.say(channel, 'Pong!');
      const mapToObject = [...msg.userInfo['_userData']].reduce((obj, [key, value]) => (obj[key] = value, obj), {});
      console.log('GUCCI_onMessage', channel, user, message, mapToObject);
    });
    // this.client.on('message', (target: any, userContext: UserContext, msg: any, self: any) => {
    //   if(self) return;
    //   if(!this.commandsUtils.isValidCommand(msg, userContext)) return;
//
    //   const user = new User(userContext);
    //   this.usersService.getById(user.id).then(u => {
    //     if(!u) this.usersService.create(user.toCreateUserDto());
    //   });
//
    //   const commandName = this.commandsUtils.getCommandName(msg, userContext);
    //   const commandParams = this.commandsUtils.getCommandParams(msg);
//
    //   if((!this.guardiansService.guardian || this.guardiansService.guardian.isDead) && commandName !== 'instantiate' && commandName !== 'bitch') {
    //     this.client.say(target, TEXTS.noGuardian);
    //     return;
    //   }
//
    //   switch(commandName) {
    //     // PLEB COMMANDS
    //     case "register": {
    //       // this.commands.register(user)
    //       break;
    //     }
    //     case "kick": {
    //       this.usersService.canUseCommand(user.id, 'kick', 5).then(y => {
    //         if(y) {
    //           if(this.guardiansService.isDead()) {
    //             const damageDealt = Math.floor(Math.random() * 6) + 1;
    //             this.guardiansService.removeHealth(damageDealt).then(x => {
    //               this.usersService.updateLastUsage(user.id, 'kick').then(() => {
    //                 this.guardiansService.getCurrentId().then(g => {
    //                   this.usersService.addParticipation(user, g);
    //                   this.guardiansService.addParticipant(user, damageDealt, g);
    //                 })
    //               })
    //             })
    //           }
    //         } else {
    //           this.usersService.getRemainingTime(user.id, 'kick').then(h => {
    //             this.client.say(target, `Tu dois encore attendre ${h} avant de pouvoir frapper le gardien à nouveau ${user.displayName} !!`)
    //           })
    //         }
    //       })
    //       break;
    //     }
    //     case "stats": {
    //       // instance.commands.stats(user, instance.guardian, instance.client, target)
    //       break;
    //     }
    //     case "bitch": {
    //       // instance.commands.bitch(instance.client, target)
    //       break;
    //     }
//
    //     // ADMIN COMMANDS
    //     case "instantiate": {
    //       if(user.isBroadcaster) {
    //         this.commandsService.instantiate(commandParams, this.client, target);
    //       } else {
    //         this.client.say(target, 'PAS ADMIN FDP');
    //       }
    //       // instantiateBot()
    //       break;
    //     }
    //     case "giveaway": {
    //       // if(isBroadcaster()) instance.commands.giveaway(instance.guardian, instance.client, target)
    //       break;
    //     }
    //     case "relaunch": {
    //       // if(isBroadcaster()) instance.commands.relaunch(instance.client, target)
    //       break;
    //     }
    //     case "win": {
    //       // if(isBroadcaster()) instance.commands.win(commandParams, instance.guardian, instance.client, target)
    //       break;
    //     }
    //   }
    // });
  }
}
