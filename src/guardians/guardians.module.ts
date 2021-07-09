import { CacheModule, HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { Guardian, GuardianSchema } from './schemas/guardian.schema';
import { GuardiansDashboardController } from './guardians.dashboard.controller';
import { GuardiansService } from './guardians.service';
import { ActualGuardian, ActualGuardianSchema } from './schemas/actual-guardian.schema';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ChatClientService } from '../service/chat-client.service';
import { GuardiansExtensionController } from "./guardians.extension.controller";

@Module({
  imports: [MongooseModule.forFeature([
    { name: Guardian.name, schema: GuardianSchema },
    { name: User.name, schema: UserSchema },
    { name: ActualGuardian.name, schema: ActualGuardianSchema }
    ]),
    HttpModule,
    CacheModule.register()
  ],
  controllers: [GuardiansDashboardController, GuardiansExtensionController],
  providers: [GuardiansService, UsersService, ChatClientService],
  exports: [GuardiansService]
})
export class GuardiansModule {}
