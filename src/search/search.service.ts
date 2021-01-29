import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { RedisService } from 'nestjs-redis';
import { Comic } from 'src/comic/entities/comic.entity';
import { CommonHelper } from 'src/common/common.helper';
import { Connection } from 'typeorm';

const REDIS_KEY = 'keywords';
@Injectable()
export class SearchService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    private commonHelper: CommonHelper,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}
  // 模糊搜索
  async main(keyword: string, page_no?: number): Promise<Comic[]> {
    const key = keyword.trim();
    if (!key) return [];
    const p = page_no || 0;
    const page_size = this.configService.get('PAGE_SIZE');
    const keyArr = this.commonHelper.divide(key); // 分词
    let select = '',
      from = '',
      where = '';
    // 所有规则的权重相加(目前有2个大规则, 3个小规则)
    let s = '';
    const n = 2;
    for (let j = 0; j < n; j++) {
      s += `comics.w100${j}`;
      if (j < n - 1) s += ' + ';
    }
    select += `* (${s})`;
    // 订立规则
    from += `
      CASE WHEN co.title LIKE '${key}' THEN
        10 ELSE 0.1
        END AS w1000,
      CASE WHEN co.author LIKE '${key}' THEN
        10 ELSE 0.1
        END AS w1001,
    `;
    for (let i = 0, len = keyArr.length; i < len; i++) {
      const k = keyArr[i];
      // 权重相加
      let s = '';
      const n = 3;
      for (let j = 0; j < n; j++) {
        s += `comics.w${i}${j}`;
        if (j < n - 1) s += ' + ';
      }
      select += `* (${s})`;
      // 订立规则
      from += `
        CASE WHEN co.title LIKE '%${k}%' THEN
          5 ELSE 0.1
          END AS w${i}0,
        CASE WHEN co.author LIKE '%${k}%' THEN
          4 ELSE 0.1
          END AS w${i}1,
        CASE WHEN co.desc LIKE '%${k}%' THEN
          2 ELSE 0.1
          END AS w${i}2,`;
      // 找到所有包含关键词的数据
      where += `CONCAT(co2.title, co2.author, co2.desc) LIKE '%${k}%'`;
      if (i < len - 1) where += ' OR ';
    }
    const results = await this.connection.query(
      `
      SELECT 1 ${select} AS w,
      comics.*, cl.name AS class_name
      FROM (
        SELECT
         ${from}
         co.*
       FROM comics AS co
     ) comics
      LEFT JOIN comics co2
      ON comics.id = co2.id
      LEFT OUTER JOIN classes AS cl
      ON co2.class_id = cl.id
      WHERE ${where}
      HAVING w > 0.09
      ORDER BY w DESC
      LIMIT ?, ?
      `,
      [p * page_size, page_size],
    );
    return results;
  }
  // 记录搜索关键词
  async record(keyword: string) {
    if (!keyword) return;
    const redis = this.redisService.getClient();
    const score = await redis.zscore(REDIS_KEY, keyword);
    await redis.zadd(REDIS_KEY, String((Number(score) || 0) + 1), keyword);
  }
  // 返回按热度排行的关键词
  async rank(size?: number): Promise<string[]> {
    const page_size = this.configService.get('PAGE_SIZE');
    return await this.redisService
      .getClient()
      .zrevrange(REDIS_KEY, 0, size || page_size);
  }
}
