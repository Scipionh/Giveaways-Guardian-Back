import { Body, Controller, Get, Param, Post, UseGuards, Req } from "@nestjs/common";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { AuthGuard } from "../guards/auth.guard";
import { Request } from 'express';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
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
