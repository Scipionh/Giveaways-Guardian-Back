import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { clientId, secret } from '../auth-config';
import { ApiClient } from 'twitch';
import { PubSubClient, PubSubSubscriptionMessage } from 'twitch-pubsub-client';
import { ChatClient } from 'twitch-chat-client';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';

@Injectable()
export class AuthService {
  public apiClient;
  public pubSubClient;
  public chatClient;
  public authProvider;

  public async pubSubConnect() {
    const tokenData = JSON.parse(fs.readFileSync('./src/tokens.json', 'UTF-8'));
    this.authProvider = new RefreshableAuthProvider(
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

    await this.createApiClient(this.authProvider);
    // await this.createChatClient(this.authProvider);
    await this.createPubSubClient();
    // this.listenToChat();
    this.listenToRedemption();
  }

  private async createApiClient(authProvider) {
    this.apiClient = new ApiClient({authProvider});
  }

  private async createPubSubClient() {
    this.pubSubClient = new PubSubClient();
    await this.pubSubClient.registerUserListener(this.apiClient);
  }

  private async createChatClient(authProvider) {
    this.chatClient = new ChatClient(authProvider, {channels: ['iheavyx']});
    await this.chatClient.connect();
  }

  private listenToRedemption = (): void => {
    this.pubSubClient.onRedemption(140398983, (message: PubSubSubscriptionMessage) => {
      this.chatClient.say('iheavyx', 'SPORT');
      console.log('GUCCI_channelPointUsed', message['_data'].data.redemption);
    });
  }

  private listenToChat = (): void => {
    this.chatClient.onMessage((channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
      this.chatClient.say(channel, 'Pong!');
      const mapToObject = [...msg.userInfo['_userData']].reduce((obj, [key, value]) => (obj[key] = value, obj), {});
      console.log('GUCCI_onMessage', channel, user, message, mapToObject);
    });
  }
}