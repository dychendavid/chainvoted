import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PollOptionEntity } from './poll.entity';

@Injectable()
export class PollOptionRepository extends Repository<PollOptionEntity> {
  constructor(private dataSource: DataSource) {
    super(PollOptionEntity, dataSource.createEntityManager());
  }
}
