import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { Guardian, GuardianSchema } from './schemas/guardian.schema';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { ActualGuardian, ActualGuardianSchema } from './schemas/actual-guardian.schema';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ChatClientService } from '../service/chat-client.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Guardian.name, schema: GuardianSchema },
    { name: User.name, schema: UserSchema },
    { name: ActualGuardian.name, schema: ActualGuardianSchema }
    ]),
    HttpModule
  ],
  controllers: [GuardiansController],
  providers: [GuardiansService, UsersService, ChatClientService],
  exports: [GuardiansService]
})
export class GuardiansModule {}
