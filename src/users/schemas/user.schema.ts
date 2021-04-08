import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserContext } from "../../models/user-context";
import { CreateUserDto } from "../dto/create-user.dto";

export type UserDocument = User & Document;

@Schema({collection: 'users'})
export class User {
  @Prop()
  id: string;

  @Prop()
  username: string;

  @Prop()
  displayName: string;

  @Prop()
  isModerator: boolean;

  @Prop()
  isSubscriber: boolean;

  @Prop()
  foughtGuardians: string[];

  @Prop()
  hitPoints: number;

  isBroadcaster: boolean;

  constructor(userContext: UserContext, foughtGuardians: string[] = [], hitPoints = 0) {
    this.username = userContext.username;
    this.displayName = userContext['display-name'];
    this.isModerator = userContext.mod;
    this.isSubscriber = userContext.subscriber;
    this.id = userContext['user-id'];
    this.foughtGuardians = foughtGuardians;
    this.hitPoints = hitPoints;
    this.isBroadcaster = !!userContext.badges.includes('broadcaster');
  }

  public toCreateUserDto(): CreateUserDto {
    return <CreateUserDto>{
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      isModerator: this.isModerator,
      isSubscriber: this.isSubscriber,
      foughtGuardians: this.foughtGuardians,
      hitPoints: this.hitPoints
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
