import { Guardian } from './guardians.model';

export class ActualGuardian {
  id: string;
  name: string;
  health: number;
  currentHealth: number;
  numberOfHits: number;
  isDead: boolean;

  constructor(guardian: Guardian, isDead: boolean) {
    this.id = guardian.id;
    this.name = guardian.name;
    this.health = guardian.health;
    this.currentHealth = guardian.health;
    this.numberOfHits = guardian.numberOfHits;
    this;isDead = isDead;
  }
}
