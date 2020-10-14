import { UserContext } from '../models/user-context';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommandsUtils {
  public isValidCommand(message: string, userContext: UserContext): boolean {
    return (message.startsWith("!") && this.checkWhiteSpaces(message)) || this.isChannelPointsCommand(userContext);
  }

  public isValidCommandName(commandName: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(commandName);
  }

  public isValidCommandContent(content: string): boolean {
    return !(content[0].startsWith("/") || content[0].startsWith(".")) || content[0].startsWith('!');
  }

  public getCommandName(rawInput, userContext): string {
    if (this.isRegisterCommand(userContext)) return 'register'
    const input = this.unwrapCommandPrefix(rawInput);
    return input.split(' ')[0];
  }

  public getCommandParams(rawInput): string[] {
    const input = this.unwrapCommandPrefix(rawInput);
    const splitStr = input.split(' ');
    return splitStr.slice(1, splitStr.length);
  }

  private unwrapCommandPrefix(rawInput): string {
    return rawInput.substr(1);
  }

  private checkWhiteSpaces(message: string): boolean {
    return /\S/.test(message.slice(1, message.length)) && message.charAt(1) !== ' ';
  }

  private isChannelPointsCommand(userContext: UserContext): boolean {
    return userContext.hasOwnProperty('custom-reward-id');
  }

  private isRegisterCommand(userContext: UserContext): boolean {
    return this.isChannelPointsCommand(userContext) && userContext['custom-reward-id'] == 'ec7b285a-eb52-4967-9c45-5046e9b0922f'
  }
}