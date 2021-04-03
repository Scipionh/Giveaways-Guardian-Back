import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { GuardianS } from './schemas/guardian.schema';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { log } from 'util';

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  async create(@Body() createGuardianDto: CreateGuardianDto): Promise<GuardianS> {
    return await this.guardiansService.create(createGuardianDto);
  }

  @Get()
  async findAll(): Promise<GuardianS[]> {
    return await this.guardiansService.findAll();
  }

  @Get(':userId')
  kick(@Param('userId') userId: string): void {
    return this.guardiansService.kick(userId);
  }
}
