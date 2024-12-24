import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/authenticate')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('google_token') googleToken: string) {
    const { token, user } =
      await this.authService.googleTokenLogin(googleToken);
    return {
      status: HttpStatus.OK,
      data: {
        token,
        user,
      },
    };
  }
}
