import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private userRepositoy: UserRepository,
    private configService: ConfigService,
  ) {
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(googleClientId);
  }

  async verifyGoogleTokenAndLogin(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      console.log('payload', payload);
      await this.userRepositoy.upsert({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isEmailVerified: false,
      });

      const user = await this.userRepositoy.findByEmail(payload.email);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      };
    } catch (error) {
      console.log('Err', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
