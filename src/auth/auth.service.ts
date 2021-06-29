import { HttpService, Injectable } from "@nestjs/common";
import { clientId, secret } from "../auth-config";
import { TwitchAuth } from "../models/twitch-auth";
import { TwitchValidate } from "../models/twitch-validate";

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpService) {}

  twitchAuth(code: string): Promise<TwitchAuth> {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${secret}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:4200`;
    return this.http.post<TwitchAuth>(url).toPromise()
      .then(x => x.data)
      // .then(y => this.http.get('https://api.twitch.tv/helix/users', {headers: {'client-id': clientId, 'authorization': 'Bearer ' + y.access_token}}).toPromise().then(r => {
      //   const user = r.data.data[0];
      //   this.usersService.create(new User(user).toCreateUserDto()); // add check if already exists
      //   return user;
      // }));
  };
}
