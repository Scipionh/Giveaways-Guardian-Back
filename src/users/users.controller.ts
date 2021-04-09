import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('users')
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

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return await this.usersService.getById(userId);
  }
}
