import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersDashboardController } from './users.dashboard.controller';
import { UsersService } from './users.service';
import { UsersExtensionController } from "./users.extension.controller";

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), HttpModule],
  controllers: [UsersDashboardController, UsersExtensionController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
