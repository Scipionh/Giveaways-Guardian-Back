import { Participant } from '../../models/participant';

export class CreateGuardianDto {
  readonly id: string;
  readonly name: string;
  readonly health: number;
  readonly numberOfHits: number;
  readonly participants: Participant[];
}