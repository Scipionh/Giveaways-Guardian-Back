import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { GuardiansService } from './guardians.service';
import { ActualGuardian } from "./schemas/actual-guardian.schema";
import { Participant } from "../models/participant";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../users/schemas/user.schema";

@Controller('guardians')
// @UseGuards(AuthGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post('instantiate')
  instantiate(@Body('health') health: number, @Body('name') name: string): void {
    return this.guardiansService.instantiate(health, name);
  }

  @Get('actual-guardian')
  async getActualGuardian(): Promise<ActualGuardian> {
    return await this.guardiansService.getActualGuardian();
  }

  @Post('kick')
  kick(@Body('userId') userId: string, @Body('numberOfHitPoints') numberOfHitPoints: number): Promise<User> {
    console.log('KICK');
    return this.guardiansService.kick(userId, numberOfHitPoints);
  }

  @Get('actual-guardian/participants')
  async getPArticipants(): Promise<Participant[]> {
    return await this.guardiansService.getParticipants();
  }

  @Get('giveaway')
  async giveaway(): Promise<Participant> {
    return await this.guardiansService.giveaway();
  }
}
