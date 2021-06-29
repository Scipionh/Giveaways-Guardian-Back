import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { extensionSecret } from "../auth-config";

@Injectable()
export class ExtensionAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request): boolean {
    if(request.headers.authorization) {
      const [type, auth] = request.headers['authorization'].split(' ');
      if(type === 'Bearer') {
        return jwt.verify(auth, Buffer.from(extensionSecret, 'base64'), ((err, decoded) => {
          if(err) {
            console.log('JWT Error', err);
            request.status('401').json({error: true, message: 'Invalid authorization'})
            return;
          }
          request.extension = decoded;
          console.log('Extension Data:', request.extension);
          return !err;
        }));
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
