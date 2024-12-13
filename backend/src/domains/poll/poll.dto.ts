import { Expose, Transform, Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  Length,
  IsOptional,
  IsDate,
  IsDateString,
  IsISO8601,
} from 'class-validator';

export class CreatePollDto {
  title: string;
  description: string;
  expiredAt: string;
  cover: string;
}

export class CreatePollOptionDto {
  pollId: number;
  title: string;
  description: string;
  cover: string;
}
