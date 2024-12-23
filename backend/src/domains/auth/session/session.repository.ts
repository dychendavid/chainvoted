import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SessionLogEntity } from './session_log.entity';

@Injectable()
export class SessionLogRepository extends Repository<SessionLogEntity> {
  constructor(private dataSource: DataSource) {
    super(SessionLogEntity, dataSource.createEntityManager());
  }
}
