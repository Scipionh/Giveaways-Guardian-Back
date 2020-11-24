import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { clientId, secret } from '../auth-config';
import { ApiClient } from 'twitch';
import { PubSubClient, PubSubSubscriptionMessage } from 'twitch-pubsub-client';
import { ChatClientService } from './chat-client.service';

@Injectable()
export class PubsubService {
  public apiClient;
  public pubSubClient;
  public chatClient;
  public authProvider;

  constructor(private readonly chatClientService: ChatClientService) {
    this.chatClient = chatClientService.chatClient;
  }

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
    await this.createPubSubClient();
    this.listenToRedemption();
  }

  private async createApiClient(authProvider) {
    this.apiClient = new ApiClient({authProvider});
  }

  private async createPubSubClient() {
    this.pubSubClient = new PubSubClient();
    await this.pubSubClient.registerUserListener(this.apiClient);
  }

  private listenToRedemption = (): void => {
    this.pubSubClient.onRedemption(140398983, (message: PubSubSubscriptionMessage) => {
      this.chatClient.say(this.chatClientService.channel, 'SPORT');
      console.log('GUCCI_channelPointUsed');
    });
  }
}