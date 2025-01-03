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
      let user = await this.userRepositoy.findOneBy({ email: payload.email });
      if (!user) {
        user = await this.userRepositoy.create({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          isEmailVerified: true,
        });
        await this.userRepositoy.save(user);
      } else {
        // if email exists, just update info from google
        await this.userRepositoy.upsert(
          {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            isEmailVerified: true,
          },
          ['email'],
        );
      }

      const signed = await this.login(payload.email);
      return signed;
    } catch (error) {
      console.log('Err', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async login(email) {
    const user = await this.userRepositoy.findOneBy({ email: email });
    const userToSign = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isEmailVerified: user.isEmailVerified,
      isSmsVerified: user.isSmsVerified,
      isIdVerified: user.isIdVerified,
    };

    const signed = await this.jwtService.sign(
      {
        user: userToSign,
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
    return {
      token: signed,
      user: userToSign,
    };
  }

  async validateUserPayload(payload) {
    const user = await this.userRepositoy.findOneBy({
      id: payload.user?.id,
      email: payload.user?.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
