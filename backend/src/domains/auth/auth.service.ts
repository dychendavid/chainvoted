import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthLogRepository } from './auth.repository';
import { SessionLogRepository } from './session/session.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private authLogRepository: AuthLogRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
    private sessionLogRepository: SessionLogRepository,
    private userRepositoy: UserRepository,
  ) {
    const googleClientId = this.configService.get('GOOGLE_ID');
    this.googleClient = new OAuth2Client(googleClientId);
  }

  async googleTokenLogin(token: string) {
    try {
      // handle token logging and verification
      const insertResult = await this.authLogRepository.insert({
        token,
      });
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }
      await this.authLogRepository.update(insertResult.identifiers[0].id, {
        email: payload.email,
        name: payload.name,
        isSuccess: true,
      });

      // update user profile
      const user = await this.userRepositoy.findOneBy({ email: payload.email });
      await this.userRepositoy.update(user.id, {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        isEmailVerified: true,
      });

      const signed = await this.login(payload.email);
      return signed;
    } catch (error) {
      console.log('Err', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async login(email) {
    const user = await this.userRepositoy.findOneBy({ email: email });
    const signed = await this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
      },
    );
    this.sessionLogRepository.insert({
      userId: user.id,
      token: signed,
      expiredAt: new Date(
        Date.now() +
          this.configService.get('JWT_EXPIRES_IN_DAYS') * 24 * 60 * 60 * 1000,
      ),
    });

    // login
    await this.userRepositoy.update(user.id, {
      token: signed,
    });
    return signed;
  }
}
