import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Participant } from '../../models/participant';

@Schema({collection: 'guardians'})
export class GuardianS extends Document {
  @Prop()
  name: string;

  @Prop()
  health: number;

  @Prop()
  numberOfHits: number;

  @Prop()
  participants: Participant[];
}

export const GuardianSchema = SchemaFactory.createForClass(GuardianS);