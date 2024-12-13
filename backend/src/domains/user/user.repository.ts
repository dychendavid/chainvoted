import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserPollEntity } from './user.entity';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateUserPollDto } from './user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(UserPollEntity)
    private userPollRepo: Repository<UserPollEntity>,
  ) {}

  findAll(where: FindOptionsWhere<UserEntity>): Promise<UserEntity[]> {
    return this.userRepo.find({
      where,
    });
  }

  async findToBeParticipantsByPoll(pollId: number): Promise<UserEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin(
        'user_polls',
        'user_polls',
        'user_polls.user_id = user.id AND user_polls.poll_id = :pollId',
        { pollId },
      )
      .where('user.is_email_verified = :isEmailVerified', {
        isEmailVerified: true,
      })
      .andWhere('user_polls.user_id IS NULL')
      .getMany();
  }

  findByEmail(email: string): Promise<UserEntity> {
    return this.userRepo.findOneBy({ email });
  }

  findOne(id: number): Promise<UserEntity> {
    return this.userRepo.findOneBy({ id });
  }

  async upsert({
    name,
    email,
    sms,
    isEmailVerified,
    isSmsVerified,
    address,
    picture,
  }: {
    name?: string;
    email?: string;
    sms?: string;
    isEmailVerified?: boolean;
    isSmsVerified?: boolean;
    address?: string;
    picture?: string;
  }) {
    const insertResult = await this.userRepo.upsert(
      {
        email,
        sms,
        isEmailVerified,
        isSmsVerified,
        address,
        picture,
      },
      ['email'],
    );
    console.log(insertResult);
  }

  update(id: number, data: Partial<UserEntity>): Promise<UpdateResult> {
    return this.userRepo.update(id, data);
  }

  addVoters(dto: CreateUserPollDto[]): Promise<UserPollEntity[]> {
    const entities = this.userPollRepo.create(dto);
    return this.userRepo.save(entities);
  }
}
