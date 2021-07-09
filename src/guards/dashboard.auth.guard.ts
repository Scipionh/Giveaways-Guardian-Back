import { Injectable, CanActivate, ExecutionContext, HttpService, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from "cache-manager"
import { Observable } from 'rxjs';
import { TwitchValidate } from "../models/twitch-validate";

@Injectable()
export class DashboardAuthGuard implements CanActivate {

  constructor(private readonly http: HttpService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request): Promise<boolean> {
    if(request.headers.authorization) {
      const [type, auth] = request.headers['authorization'].split(' ');
      const isCached = await this.cacheManager.get(`${auth}.isValid`);
      if(isCached) {
        request.accessToken = auth;
        return true;
      } else if(type === 'Bearer') {
        request.accessToken = auth;
        return await this.http.get<TwitchValidate>(`https://id.twitch.tv/oauth2/validate`, {headers: {'authorization': 'OAuth ' + auth}})
          .toPromise()
          .then(() => {
            this.cacheManager.set(`${auth}.isValid`, true, { ttl: 3600000 });
            return true;
          })
          .catch(() => false);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
