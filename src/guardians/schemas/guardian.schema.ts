import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Participant } from '../../models/participant';
import { CreateGuardianDto } from "../dto/create-guardian.dto";

export type GuardianDocument = Guardian & Document;

@Schema({collection: 'guardians'})
export class Guardian {
  id: string;

  @Prop()
  name: string;

  @Prop()
  health: number;

  @Prop()
  numberOfHits: number;

  @Prop()
  participants: Participant[];

  constructor(health: number, name: string, participants: Participant[] = []) {
    if(!isNaN(health)) {
      this.name = name;
      this.health = health;
    }
    this.numberOfHits = 0;
    this.participants = participants;
  }

  public toCreateGuardianDto(): CreateGuardianDto {
    return <CreateGuardianDto>{
      id: this.id,
      name: this.name,
      health: this.health,
      numberOfHits: this.numberOfHits,
      participants: this.participants
    }
  }
}

export const GuardianSchema = SchemaFactory.createForClass(Guardian);
