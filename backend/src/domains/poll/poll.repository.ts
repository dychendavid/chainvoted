import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { PollEntity } from './poll.entity';

@Injectable()
export class PollRepository extends Repository<PollEntity> {
  constructor(private dataSource: DataSource) {
    super(PollEntity, dataSource.createEntityManager());
  }

  async findAllDesc(
    where?: FindOptionsWhere<PollEntity>,
  ): Promise<PollEntity[]> {
    return this.find({
      where,
      relations: {
        options: true,
      },
      order: { expiredAt: 'DESC', id: 'DESC' },
    });
  }

  getPollWithOptions(pollId: number): Promise<PollEntity> {
    return this.findOne({
      where: { id: pollId },
      relations: {
        options: true,
      },
    });
  }
}
