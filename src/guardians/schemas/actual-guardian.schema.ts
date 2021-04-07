import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Guardian } from "./guardian.schema";

export type ActualGuardianDocument = ActualGuardian & Document;

@Schema({collection: 'actualGuardian'})
export class ActualGuardian {
  id: string;

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

  @Prop()
  isRedeemed: boolean;

  constructor(guardian: Guardian, isDead: boolean, isRedeemed: boolean) {
    this.id = guardian.id;
    this.name = guardian.name;
    this.health = guardian.health;
    this.currentHealth = guardian.health;
    this.numberOfHits = guardian.numberOfHits;
    this.isDead = isDead;
    this.isRedeemed = isRedeemed;
  }
}

export const ActualGuardianSchema = SchemaFactory.createForClass(ActualGuardian);
