import { Injectable } from '@nestjs/common';
import { ApiClient } from 'twitch';
import { StaticAuthProvider, RefreshableAuthProvider, AccessToken } from 'twitch-auth';
import { clientId, secret } from '../../auth-config';
import { PubSubSubscriptionMessage, PubSubClient  } from 'twitch-pubsub-client';
import * as fs from 'fs';

@Injectable()
export class PubSubService {
  private apiClient;
  private pubSubClient;

  public async pubSubConnect() {
    await this.createApiClient();
    await this.createPubSubClient();
    this.pubSubClient.onRedemption(140398983, (message: PubSubSubscriptionMessage) => {
      console.log('GUCCI_channelPointUsed', message['_data'].data.redemption);
    });
    await this.isStreamLive('iheavyx').then(x => console.log('GUCCI_isStreamLive', x)).catch(e => console.log('GUCCI_isStreamLiveError', e));
  }

  private async isStreamLive(userName: string) {
    const user = await this.apiClient.helix.users.getUserByName(userName);
    if (!user) {
      return false;
    }
    return await this.apiClient.helix.streams.getStreamByUserId(user.id) !== null;
  }

  private async createApiClient() {
    const tokenData = JSON.parse(fs.readFileSync('./src/tokens.json', 'UTF-8'));
    console.log('GUCCI_tokenData', tokenData);
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
    this.apiClient = new ApiClient({authProvider});
  }

  private async createPubSubClient() {
    this.pubSubClient = new PubSubClient();
    await this.pubSubClient.registerUserListener(this.apiClient);
  }
}