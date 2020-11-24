import { UserContext } from '../models/user-context';

export class PermissionService {
  public hasPermission(userContext: UserContext, requiredPermission: number) {
    let permissionLevel: number;

    if(userContext == null) return;
    if(userContext.badges.includes('broadcaster')) {
      permissionLevel = 5;
    } else if(userContext.badges.includes('moderator')) {
      permissionLevel = 3;
    }

    return permissionLevel >= requiredPermission;
  }
}
