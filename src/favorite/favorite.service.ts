import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComicService } from 'src/comic/comic.service';
import { Comic } from 'src/comic/entities/comic.entity';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private comicService: ComicService,
  ) {}
  /** 找到user_id的所有收藏 */
  find(user_id: number): Promise<Comic[]> {
    return this.favoriteRepository.query(
      `
      SELECT co.*, hr.index, hr.last_read_time, hr.chapter_id, ch.title AS cur_chapter,
      unix_timestamp(hr.last_read_time) < unix_timestamp(co.last_crawl_time) AS is_updated
      FROM favorites AS f
      JOIN comics AS co
      ON f.comic_id = co.id
      LEFT OUTER JOIN history_record AS hr
      ON hr.comic_id = f.comic_id AND hr.user_id = f.user_id
      LEFT OUTER JOIN chapters AS ch
      ON hr.chapter_id = ch.id
      WHERE f.user_id = ?
      ORDER BY hr.last_read_time DESC
      `,
      [user_id],
    );
  }
  // 找到单个收藏
  findOne(user_id: number, comic_id: number) {
    return this.favoriteRepository.findOne({
      user_id,
      comic_id,
    });
  }
  // 添加到本用户收藏夹
  add(user_id: number, comic_id: number) {
    const now = new Date();
    const data = { created_time: now, user_id, comic_id };
    return this.favoriteRepository.manager.transaction(async (conn) => {
      await conn.insert(Favorite, data);
      await this.comicService.updateAddOne(
        comic_id,
        'collection_number',
        true,
        conn,
      );
    });
  }
  // 从收藏夹删除
  remove(user_id: number, comic_id: number) {
    const data = { user_id, comic_id };
    return this.favoriteRepository.manager.transaction(async (conn) => {
      await conn.delete(Favorite, data);
      await this.comicService.updateAddOne(
        comic_id,
        'collection_number',
        false,
        conn,
      );
    });
  }
}
