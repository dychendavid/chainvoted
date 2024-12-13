import { PollEntity, PollOptionEntity } from './poll.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository, UpdateResult } from 'typeorm';
import { CreatePollOptionDto } from './poll.dto';

@Injectable()
export class PollRepository {
  constructor(
    @InjectRepository(PollEntity)
    private pollRepo: Repository<PollEntity>,

    @InjectRepository(PollOptionEntity)
    private optionRepo: Repository<PollOptionEntity>,
  ) {}

  findAllDesc(where?: FindOptionsWhere<PollEntity>): Promise<PollEntity[]> {
    return this.pollRepo.find({
      where,
      relations: {
        options: true,
      },
      order: { expiredAt: 'DESC', id: 'DESC' },
    });
  }

  findAlivePolls(): Promise<PollEntity[]> {
    return this.pollRepo.find({
      where: {
        expiredAt: MoreThan(new Date()),
      },
      relations: {
        options: true,
      },
    });
  }

  findOne(id: number): Promise<PollEntity> {
    return this.pollRepo.findOneBy({ id });
  }

  update(id: number, data: Partial<PollEntity>): Promise<UpdateResult> {
    return this.pollRepo.update(id, data);
  }

  create({
    title,
    description,
    cover,
    expiredAt,
    address,
  }: {
    title: string;
    description: string;
    cover: string;
    expiredAt: string;
    address?: string;
  }): Promise<PollEntity> {
    console.log('cover', cover);
    const pollEntity = this.pollRepo.create({
      title,
      description,
      cover,
      expiredAt: new Date(expiredAt),
      address,
    });
    return this.pollRepo.save(pollEntity);
  }

  createOptions(dto: CreatePollOptionDto[]): Promise<PollOptionEntity[]> {
    const entities = this.optionRepo.create(dto);
    return this.optionRepo.save(entities);
  }

  getPollWithOptions(pollId: number): Promise<PollEntity> {
    return this.pollRepo.findOne({
      where: { id: pollId },
      relations: {
        options: true,
      },
    });
  }
}
