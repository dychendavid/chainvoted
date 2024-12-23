import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('google_token') googleToken: string) {
    const signed = await this.authService.googleTokenLogin(googleToken);
    return {
      status: HttpStatus.OK,
      data: signed,
    };
  }
}
