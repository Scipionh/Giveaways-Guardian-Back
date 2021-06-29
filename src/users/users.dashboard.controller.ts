import { Body, Controller, Get, Param, Post, UseGuards, Req } from "@nestjs/common";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { ExtensionAuthGuard } from "../guards/extension.auth.guard";
import { Request } from 'express';
import { DashboardAuthGuard } from "../guards/dashboard.auth.guard";
import { TwitchUser } from "../models/twitch-user";

@Controller('dashboard/users')
@UseGuards(DashboardAuthGuard)
export class UsersDashboardController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  @Post('hitpoints/add')
  async addHitpoints(@Body('userId') userId: string, @Body('numberOfHitPoints') numberOfHitPoints: number): Promise<User> {
    return this.usersService.addHitpoints(userId, numberOfHitPoints);
  }

  @Post('hitpoints/remove')
  async removeHitpoints(@Body('userId') userId: string, @Body('numberOfHitPoints') numberOfHitPoints: number): Promise<User> {
    return this.usersService.removeHitpoints(userId, numberOfHitPoints);
  }

  @Get('load-profile')
  async loadProfile(@Req() request: Request): Promise<TwitchUser> {
    return this.usersService.getUserInfoFromTwitchFromUserAccessToken((request as any).accessToken);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.usersService.getById(userId);
  }
}
