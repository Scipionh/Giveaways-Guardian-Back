import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { ActualGuardian } from "./schemas/actual-guardian.schema";

@Controller('guardians')
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

  @Get('kick/:userId')
  kick(@Param('userId') userId: string): void {
    return this.guardiansService.kick(userId);
  }
}
