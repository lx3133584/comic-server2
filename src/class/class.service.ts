import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Class } from './class.entity';
import { Comic } from 'src/comic/entities/comic.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    private configService: ConfigService,
  ) {}
  /** 所有分类的列表 */
  async find() {
    return await this.classRepository.find();
  }
  /** 找到单个分类下所有漫画 */
  async findOne(class_id: number, pageNo = 0) {
    const pageSize = this.configService.get('PAGE_SIZE');
    const results = await this.comicRepository.find({
      where: { class_id },
      take: pageSize,
      skip: pageNo * pageSize,
      order: {
        popularity_number: 'DESC',
      },
    });
    return results;
  }
  /** 通过其他信息找到分类 */
  async findClass(value: FindManyOptions<Class>) {
    return await this.classRepository.find(value);
  }
}
