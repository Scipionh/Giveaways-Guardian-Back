import { Participant } from '../models/participant';
import { CreateGuardianDto } from './dto/create-guardian.dto';

export class Guardian {
  id: string;
  name: string;
  health: number;
  numberOfHits: number;
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
