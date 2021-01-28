import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ComicService } from 'src/comic/comic.service';
import { Comic } from 'src/comic/entities/comic.entity';
import { Repository } from 'typeorm';
import { History } from './history.entity';

interface ToolParams {
  comic_id?: number | void;
  chapter_id?: number;
  user_id?: number;
  index?: number;
}
@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
    private comicService: ComicService,
    private configService: ConfigService,
  ) {}
  /** 创建新记录 */
  async create(user_id: number, comic_id: number, index: number) {
    const now = new Date();
    const data = {
      user_id,
      comic_id,
      index,
      last_read_time: now,
      created_time: now,
    };
    const result = await this.historyRepository.manager.transaction(
      async (conn) => {
        await conn.insert('history_record', data);
        await this.comicService.updateAddOne(
          comic_id,
          'popularity_number',
          true,
          conn,
        );
      },
    );
    return result;
  }
  /** 查询记录 */
  async find(user_id: number, comic_id: number) {
    return await this.historyRepository.findOne({
      user_id,
      comic_id,
    });
  }
  // 删除记录
  async remove(user_id: number, comic_id: number) {
    const data = { user_id, comic_id };
    const result = await this.historyRepository.manager.transaction(
      async (conn) => {
        await conn.delete(History, data);
        await this.comicService.updateAddOne(
          comic_id,
          'popularity_number',
          false,
          conn,
        );
      },
    );
    return result;
  }
  /** 用户浏览记录列表 */
  async findByUser(
    user_id: number,
    page_no: number | string = 0,
  ): Promise<Comic[]> {
    const p = +page_no || 0;
    const pageSize = this.configService.get('PAGE_SIZE') || 0;
    const list = await this.historyRepository.query(
      `
      SELECT co.*, hr.index, date_format(hr.last_read_time, '%Y-%c-%d %H:%i:%s' ) AS last_read_time, hr.chapter_id, ch.title AS cur_chapter
      FROM history_record AS hr
      JOIN comics AS co
      ON hr.comic_id = co.id
      LEFT OUTER JOIN chapters AS ch
      ON hr.chapter_id = ch.id
      WHERE hr.user_id = ?
      ORDER BY hr.last_read_time DESC
      LIMIT ?, ?
      `,
      [user_id, p * pageSize, pageSize],
    );
    return list;
  }
  /** 更新章节记录和index */
  async updateAll(
    user_id: number,
    comic_id: number,
    chapter_id: number,
    index: number,
  ) {
    return await this.historyRepository.query(
      `
      UPDATE history_record
      SET chapter_id = ? , \`index\` = ?, last_read_time = NOW()
      WHERE user_id = ? AND comic_id = ?
      `,
      [chapter_id, index, user_id, comic_id],
    );
  }
  /** 添加浏览记录(工具函数) */
  async toolForAdd({ user_id, comic_id, chapter_id, index = 0 }: ToolParams) {
    if (!user_id) return;
    if (!comic_id && chapter_id) {
      // comic_id不存在则通过chapter_id查找comic_id
      comic_id = await this.comicService.findByChapterId(chapter_id);
    }
    if (!comic_id) return;
    const record = await this.find(user_id, comic_id);
    if (!record) {
      // 如果不存在则创建记录
      await this.create(user_id, comic_id, index);
    } else {
      // 更新数据
      if (!chapter_id) return; // 未读时不更新浏览记录
      await this.updateAll(user_id, comic_id, chapter_id, index);
    }
  }
}
