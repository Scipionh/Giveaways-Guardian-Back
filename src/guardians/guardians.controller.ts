import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { Guardian } from './schemas/guardian.schema';
import { CreateGuardianDto } from './dto/create-guardian.dto';

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  async create(@Body() createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    return await this.guardiansService.create(createGuardianDto);
  }

  @Get()
  async findAll(): Promise<Guardian[]> {
    return await this.guardiansService.findAll();
  }

  @Get(':userId')
  kick(@Param('userId') userId: string): void {
    return this.guardiansService.kick(userId);
  }
}
