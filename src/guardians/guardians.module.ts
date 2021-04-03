import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuardianS, GuardianSchema } from './schemas/guardian.schema';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { ActualGuardianS, ActualGuardianSchema } from './schemas/actual-guardian.schema';
import { UsersService } from '../users/users.service';
import { UserS, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: GuardianS.name, schema: GuardianSchema },
    { name: UserS.name, schema: UserSchema },
    { name: ActualGuardianS.name, schema: ActualGuardianSchema }
    ])
  ],
  controllers: [GuardiansController],
  providers: [GuardiansService, UsersService],
  exports: [GuardiansService]
})
export class GuardiansModule {}
