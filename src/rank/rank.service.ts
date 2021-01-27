import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from 'src/comic/entities/comic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    private configService: ConfigService,
  ) {}
  /** 找到单个type下的rank列表 */
  find(type: number, pageNo = 0): Promise<Comic[]> {
    const pageSize = this.configService.get('PAGE_SIZE');
    const rankTypes = this.configService.get('RANK_TYPES').split(',');
    const typeName = rankTypes[type] || 'popularity_number';
    return this.comicRepository
      .createQueryBuilder('co')
      .select(['co.*', 'cl.name AS class_name'])
      .leftJoin('classes', 'cl', 'cl.id = co.class_id')
      .orderBy(`co.${typeName}`, 'DESC')
      .addOrderBy('co.score_number', 'DESC')
      .offset(pageNo * pageSize)
      .limit(pageSize)
      .getRawMany();
  }
}
