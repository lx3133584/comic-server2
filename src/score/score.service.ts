import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComicService } from 'src/comic/comic.service';
import { Repository } from 'typeorm';
import { Score } from './score.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    private comicService: ComicService,
  ) {}
  /** 找到单个评分 */
  findOne(user_id: number, comic_id: number) {
    return this.scoreRepository.findOne({ user_id, comic_id });
  }
  /** 添加评分 */
  async add(user_id: number, comic_id: number, score: number) {
    const now = new Date();
    const data = { created_time: now, user_id, comic_id, score };
    const result = await this.scoreRepository.manager.transaction(
      async (conn) => {
        await conn.insert(Score, data);
        const comic_info = await this.comicService.findById(comic_id, conn);
        const newScore =
          (comic_info.score_number * comic_info.score + score) /
          (comic_info.score_number + 1);
        await this.comicService.updateAddOne(
          comic_id,
          'score_number',
          true,
          conn,
        );
        await this.comicService.update(comic_id, { score: newScore }, conn);
      },
    );
    return result;
  }
}
