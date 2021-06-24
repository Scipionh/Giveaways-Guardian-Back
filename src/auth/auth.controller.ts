import { Controller, Get, Param } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get(':code')
  async auth(@Param('code') code: string) {
    console.log('GUCCI_auth', code);
    return this.authService.twitchAuth(code);
  }
}