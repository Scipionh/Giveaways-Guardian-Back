import { Controller, Get, Param, UseGuards, Req } from "@nestjs/common";
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { ExtensionAuthGuard } from "../guards/extension.auth.guard";
import { Request } from 'express';

@Controller('extension/users')
@UseGuards(ExtensionAuthGuard)
export class UsersExtensionController {
  constructor(private readonly usersService: UsersService) {}

  @Get('load-profile')
  async loadProfile(@Req() request: Request): Promise<User> {
    if((request as any).extension.user_id) {
      return this.usersService.loadProfile((request as any).extension);
    }
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.usersService.getById(userId);
  }
}
