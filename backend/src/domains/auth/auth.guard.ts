import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class FlexibleJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  handleRequest(err: any, user: any, info: JsonWebTokenError) {
    // allow no auth token or valid token
    if (info?.message === 'No auth token') {
      return;
    }

    if (info) {
      throw new UnauthorizedException(info.message);
    }

    if (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
