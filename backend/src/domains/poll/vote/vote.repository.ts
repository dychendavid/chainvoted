import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VoteEntity } from './vote.entity';

@Injectable()
export class VoteRepository extends Repository<VoteEntity> {
  constructor(private dataSource: DataSource) {
    super(VoteEntity, dataSource.createEntityManager());
  }
}
