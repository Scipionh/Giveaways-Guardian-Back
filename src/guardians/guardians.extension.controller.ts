import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { GuardiansService } from './guardians.service';
import { ActualGuardian } from "./schemas/actual-guardian.schema";
import { Participant } from "../models/participant";
import { ExtensionAuthGuard } from "../guards/extension.auth.guard";
import { User } from "../users/schemas/user.schema";

@Controller('extension/guardians')
@UseGuards(ExtensionAuthGuard)
export class GuardiansExtensionController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post('kick')
  kick(@Body('userId') userId: string, @Body('numberOfHitPoints') numberOfHitPoints: number): Promise<User> {
    console.log('KICK');
    return this.guardiansService.kick(userId, numberOfHitPoints);
  }
}
