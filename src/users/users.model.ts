import { UserContext } from '../models/user-context';
import { CreateUserDto } from './dto/create-user.dto';
import { Cooldown } from '../models/cooldown';

export class User {
  id: string;
  username: string;
  displayName: string;
  isModerator: boolean;
  isSubscriber: boolean;
  foughtGuardians: string[];
  commandsCooldown: Cooldown[];
  isBroadcaster: boolean;

  constructor(userContext: UserContext, foughtGuardians: string[] = [], commandsCooldown: Cooldown[] = []) {
    this.username = userContext.username;
    this.displayName = userContext['display-name'];
    this.isModerator = userContext.mod;
    this.isSubscriber = userContext.subscriber;
    this.id = userContext['user-id'];
    this.foughtGuardians = foughtGuardians;
    this.commandsCooldown = commandsCooldown;
    this.isBroadcaster = !!userContext.badges.includes('broadcaster');
  }

  public toCreateUserDto(): CreateUserDto {
    return <CreateUserDto>{
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      isModerator: this.isModerator,
      isSubscriber: this.isSubscriber,
      foughtGuardians: this.foughtGuardians,
      commandsCooldown: this.commandsCooldown
    }
  }
}
