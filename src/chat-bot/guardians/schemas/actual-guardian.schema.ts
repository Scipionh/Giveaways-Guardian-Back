import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({collection: 'actualGuardian'})
export class ActualGuardianS extends Document {
  @Prop()
  actualGuardianId: string;

  @Prop()
  name: string;

  @Prop()
  health: number;

  @Prop()
  currentHealth: number;

  @Prop()
  numberOfHits: number;

  @Prop()
  isDead: boolean;
}

export const ActualGuardianSchema = SchemaFactory.createForClass(ActualGuardianS);