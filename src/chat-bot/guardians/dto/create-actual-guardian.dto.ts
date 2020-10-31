export class CreateActualGuardianDto {
  readonly actualGuardianId: string;
  readonly name: string;
  readonly health: number;
  readonly currentHealth: number;
  readonly numberOfHits: number;
  readonly isDead: boolean;
}