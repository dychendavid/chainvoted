import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PollOptionEntity } from './poll-option.entity';

@Injectable()
export class PollOptionRepository extends Repository<PollOptionEntity> {
  constructor(private dataSource: DataSource) {
    super(PollOptionEntity, dataSource.createEntityManager());
  }

  async getPollOptionCount(pollId: number): Promise<number> {
    return this.createQueryBuilder('pollOption')
      .where('pollOption.pollId = :pollId', { pollId })
      .getCount();
  }
}
