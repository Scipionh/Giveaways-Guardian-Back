import { UserContext } from '../models/user-context';

export class PermissionService {
  public hasPermission(userContext: UserContext, requiredPermission: number) {
    let permissionLevel: number;

    if(userContext == null) return;
    if(userContext.badges.brodcaster) {
      permissionLevel = 5;
    } else if(userContext.badges.moderator) {
      permissionLevel = 3;
    }

    return permissionLevel >= requiredPermission;
  }
}
