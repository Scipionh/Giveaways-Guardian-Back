import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Cooldown } from '../../models/cooldown';

@Schema({collection: 'users'})
export class UserS extends Document {
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
  commandsCooldown: Cooldown[];
}

export const UserSchema = SchemaFactory.createForClass(UserS);