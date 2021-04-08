export class CreateUserDto {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly isModerator: boolean;
  readonly isSubscriber: boolean;
  readonly foughtGuardians: string[];
  readonly hitPoints: number;
}
