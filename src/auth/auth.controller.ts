import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { DashboardAuthGuard } from "../guards/dashboard.auth.guard";

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get(':code')
  async auth(@Param('code') code: string) {
    return this.authService.twitchAuth(code);
  }

  @Get('validate/token')
  @UseGuards(DashboardAuthGuard)
  async validateToken() {
    // arrives here if it goes through the guard meaning he's authenticated
    // otherwise it is rejected by the guard
    return true;
  }

  @Post('refresh/token')
  async refreshToken(@Body('accessToken') accessToken: string, @Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(accessToken, refreshToken);
  }
}
