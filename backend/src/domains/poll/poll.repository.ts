import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { PollEntity } from './poll.entity';

@Injectable()
export class PollRepository extends Repository<PollEntity> {
  constructor(private dataSource: DataSource) {
    super(PollEntity, dataSource.createEntityManager());
  }

  getBaseFindProperties() {
    return {
      select: {
        id: true,
        title: true,
        description: true,
        votes: true,
        cover: true,
        expiredAt: true,
        isEnableDonations: true,
        isEmailVerification: true,
        isSmsVerification: true,
        isIdVerification: true,
        options: {
          votes: true,
          title: true,
          description: true,
          cover: true,
        },
      },
      relations: {
        options: true,
      },
    };
  }

  async findAllFilteredAndDesc(
    where?: FindOptionsWhere<PollEntity>,
  ): Promise<PollEntity[]> {
    const find = this.getBaseFindProperties();
    return this.find({
      ...find,
      where,
      order: { expiredAt: 'DESC', id: 'DESC' },
    });
  }

  getPollWithOptions(pollId: number): Promise<PollEntity> {
    return this.findOne({
      where: { id: pollId },
      relations: {
        options: true,
      },
      order: {
        options: {
          id: 'ASC',
        },
      },
    });
  }
}
