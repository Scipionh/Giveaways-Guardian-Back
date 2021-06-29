import { Injectable, CanActivate, ExecutionContext, HttpService } from "@nestjs/common";
import { Observable } from 'rxjs';
import { AuthService } from "../auth/auth.service";
import { TwitchValidate } from "../models/twitch-validate";

@Injectable()
export class DashboardAuthGuard implements CanActivate {

  constructor(private readonly http: HttpService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request): Promise<boolean> {
    if(request.headers.authorization) {
      const [type, auth] = request.headers['authorization'].split(' ');
      if(type === 'Bearer') {
        request.accessToken = auth;
        return await this.http.get<TwitchValidate>(`https://id.twitch.tv/oauth2/validate`, {headers: {'authorization': 'OAuth ' + auth}})
          .toPromise()
          .then(data => true)
          .catch(error => false);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
