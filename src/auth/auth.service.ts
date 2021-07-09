import { HttpService, Injectable } from "@nestjs/common";
import { clientId, secret } from "../auth-config";
import { TwitchAuth } from "../models/twitch-auth";

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpService) {}

  twitchAuth(code: string): Promise<TwitchAuth> {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${secret}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:4200`;
    return this.http.post<TwitchAuth>(url).toPromise().then(x => x.data);
  };

  refreshToken(accessToken: string, refreshToken: string): Promise<TwitchAuth> {
    const url = `https://id.twitch.tv/oauth2/token--data-urlencode?grant_type=refresh_token&refresh_token=${refreshToken}client_id=${clientId}&client_secret=${secret}`;
    return this.http.post<TwitchAuth>(url, {headers: {'authorization': 'OAuth ' + accessToken}}).toPromise().then(x => x.data)
  }
}
