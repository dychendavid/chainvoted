import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserPollEntity } from '../user/user.entity';
import { UserController } from '../user/user.controller';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, UserPollEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    UserService,
    JwtService,
    UserRepository,
  ],
})
export class AuthModule {}
