import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

class GoogleLoginDto {
  googleToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() googleLoginDto, @Req() req) {
    // console.log('req', req);
    console.log('googleLoginDto', googleLoginDto);
    return this.authService.verifyGoogleTokenAndLogin(
      googleLoginDto.googleToken,
    );
  }
}
