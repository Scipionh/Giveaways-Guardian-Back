import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { clientId, secret } from '../auth-config';
import { ChatClient } from 'twitch-chat-client';

@Injectable()
export class ChatClientService {
  public chatClient;
  public channel = 'iheavyx';

  constructor() {
    const tokenData = JSON.parse(fs.readFileSync('./src/config/tokens.json', 'UTF-8'));
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
  }

  public async connect() {
    await this.chatClient.connect();
    this.listenToConnection();
  }

  private listenToConnection(): void {
    this.chatClient.onConnect('connected', (addr, port) => {
      console.info(`* Connected to ${addr}:${port}`);
    });
  }
}
