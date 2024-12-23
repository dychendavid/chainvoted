import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthLogEntity } from './auth_log.entity';

@Injectable()
export class AuthLogRepository extends Repository<AuthLogEntity> {
  constructor(private dataSource: DataSource) {
    super(AuthLogEntity, dataSource.createEntityManager());
  }
}
