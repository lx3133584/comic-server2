import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonHelper } from 'src/common/common.helper';
import { EntityManager, FindConditions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Data, OriginInfo, OriginListItem } from './comic.interface';
import { Category } from './entities/category.entity';
import { Chapter } from './entities/chapter.entity';
import { Comic } from './entities/comic.entity';
import { Content } from './entities/content.entity';

@Injectable()
export class ComicService {
  private readonly logger = new Logger(ComicService.name);

  constructor(
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private commonHelper: CommonHelper,
    private configService: ConfigService,
  ) {}
  /** 爬取漫画 */
  async crawl(id: number): Promise<OriginInfo | void> {
    let res;
    try {
      res = await this.commonHelper.python('detail', { id });
    } catch (e) {
      this.logger.error(new Error(e));
    }
    if (!res || !res.detail || !res.detail.title) return;
    return res;
  }
  /** 爬取漫画内容 */
  async crawlContent(link: string): Promise<Content[] | void> {
    let res;
    try {
      res = await this.commonHelper.python('content', { link });
    } catch (e) {
      this.logger.error(new Error(e));
    }
    if (!res || !res.length) return;
    return res;
  }
  /** 爬取漫画更新列表*/
  async crawlUpdateList(): Promise<Data[]> {
    let res = [];
    try {
      res = await this.commonHelper.python('update');
    } catch (e) {
      this.logger.error(new Error(e));
    }
    if (!res || !res.length) return [];
    return res;
  }
  /** 创建新漫画 */
  async create(id: number, comicInfo: OriginInfo) {
    if (!comicInfo) return;
    const { detail, list } = comicInfo;
    detail.id = id;
    detail.source = 'hhimm';
    await this.saveDetail(detail);
    await this.saveList(id, list);
  }
  /** 通过ID找到漫画信息 */
  findById(
    id: number,
    entityManager: EntityManager = this.comicRepository.manager,
  ) {
    return entityManager.findOne(Comic, { id });
  }
  /** 通过ID找到漫画信息(包含class_name) */
  findByIdDetail(comicId: number, userId?: number): Promise<Comic | null> {
    return this.comicRepository
      .createQueryBuilder('co')
      .select([
        'co.*',
        "hr.index as 'index'",
        'hr.last_read_time as last_read_time',
        'hr.chapter_id as chapter_id',
        'ch.title AS cur_chapter',
        'cl.name AS class_name',
        'f.id AS favorite_id',
        's.score AS my_score',
      ])
      .leftJoin('classes', 'cl', 'cl.id = co.class_id')
      .leftJoin(
        'history_record',
        'hr',
        'hr.comic_id = co.id AND hr.user_id = :userId',
      )
      .leftJoin('favorites', 'f', 'f.comic_id = co.id AND hr.user_id = :userId')
      .leftJoin('score', 's', 's.comic_id = co.id AND hr.user_id = :userId')
      .leftJoin('chapters', 'ch', 'hr.chapter_id = ch.id')
      .where('co.id = :comicId')
      .setParameters({ userId, comicId })
      .getRawOne();
  }
  /** 通过其他信息找到漫画信息 */
  find(value: FindConditions<Comic>) {
    return this.comicRepository.findOne(value);
  }
  /** 更新漫画信息 */
  async update(
    id: number,
    data: QueryDeepPartialEntity<Comic>,
    entityManager: EntityManager = this.comicRepository.manager,
  ) {
    data.update_time = new Date();
    return entityManager.update(Comic, { id }, data);
  }
  /** 更新漫画数值加/减1 */
  updateAddOne(
    id: number,
    col: string,
    idAdd: boolean,
    entityManager: EntityManager = this.comicRepository.manager,
  ) {
    const add = idAdd ? '+' : '-';
    return entityManager
      .createQueryBuilder()
      .update(Comic)
      .set({
        [col]: () => `${col} ${add} 1`,
      })
      .where('id = :id', { id })
      .execute();
  }
  /** 更新爬取时间 */
  updateTime(id: number, { update_time }: Comic) {
    const now = new Date();
    return this.update(id, {
      last_crawl_time: now,
      update_time,
    });
  }
  /** 获得新增的章节列表 */
  minus(newList: { title: string }[], oldList: { title: string }[]) {
    const result: any[] = [];
    const obj = {};
    for (const { title } of oldList) {
      obj[title] = 1;
    }
    for (const item of newList) {
      if (obj[item.title]) continue;
      obj[item.title] = 1;
      result.push(item);
    }
    return result;
  }
  /** 更新漫画详细信息 */
  updateDetail(id: number, newDetail: Comic) {
    const {
      cover,
      title,
      author,
      status,
      update_time,
      desc,
      popularity_number,
      collection_number,
      score_number,
      score,
    } = newDetail;
    return this.update(id, {
      cover,
      title,
      author,
      status,
      update_time,
      desc,
      popularity_number,
      collection_number,
      score_number,
      score,
    });
  }
  /** 更新漫画目录 */
  async updateList(id: number, newList: OriginListItem[]) {
    const now = new Date();
    const oldList: any[] = await this.findList(id);
    const oldListData = {}; // 用来记录旧列表数据的对象
    let isUpdated = false; // 标识是否有更新
    for (const oldListItem of oldList) {
      // 将旧列表数据存入对象
      oldListData[oldListItem.name] = oldListItem;
    }
    for (const newListItem of newList) {
      let newDataList: any[] = []; // 待存入目录的数据
      const oldListItem = oldListData[newListItem.category_name];
      let category_id: number;
      if (oldListItem) {
        // 如果分类存在则只插入新增章节
        category_id = oldListItem.id;
        newDataList = this.minus(newListItem.list, oldListItem.data);
      } else {
        // 如果分类不存在则创建新分类
        const {
          raw: { insertId },
        } = await this.categoryRepository.insert({
          name: newListItem.category_name,
          comic_id: id,
          created_time: now,
        });
        category_id = insertId;
        newDataList = newListItem.list;
      }
      for (const { link, title } of newDataList) {
        // 将目录存入数据库
        const {
          raw: { insertId },
        } = await this.chapterRepository.insert({
          category_id,
          link,
          title,
          created_time: now,
        });
        const res = await this.crawlContent(link); // 爬取新章节
        if (res) await this.saveContents(insertId, res);
      }
      if (newDataList.length) isUpdated = true;
    }
    return isUpdated;
  }
  /** 更新漫画 */
  async updateComic(id: number) {
    const comicInfo = await this.findById(id);
    const newComicData = await this.crawl(id); // 爬取新数据
    if (!newComicData) return;
    if (comicInfo) {
      await this.updateDetail(id, newComicData.detail);
      const isUpdated = await this.updateList(id, newComicData.list);
      if (isUpdated) await this.updateTime(id, newComicData.detail);
    } else {
      await this.create(id, newComicData);
    }
  }
  /** 保存漫画详细信息 */
  saveDetail(data: Comic) {
    const now = new Date();
    const {
      id,
      cover,
      source,
      title,
      author,
      status,
      update_time,
      desc,
      popularity_number,
      collection_number,
      score_number,
      score,
    } = data;
    const comicInfo = {
      last_crawl_time: now,
      created_time: now,
      id,
      cover,
      source,
      title,
      author,
      status,
      update_time,
      desc,
      popularity_number,
      collection_number,
      score_number,
      score,
    };
    return this.comicRepository.insert(comicInfo);
  }
  /** 保存漫画目录(按分类) */
  saveList(id: number, data: OriginListItem[]) {
    const now = new Date();
    return this.comicRepository.manager.transaction(async (conn) => {
      for (const { category_name, list } of data) {
        const {
          raw: { insertId: category_id },
        } = await conn.insert(Category, {
          name: category_name,
          comic_id: id,
          created_time: now,
        });
        for (const { link, title } of list) {
          const {
            raw: { insertId },
          } = await conn.insert(Chapter, {
            category_id,
            link,
            title,
            created_time: now,
          });
          const res = await this.crawlContent(link); // 爬取新章节
          if (res) await this.saveContents(insertId, res);
        }
      }
      return { success: true };
    });
  }
  /** 通过comic_id找到漫画目录 */
  async findList(id: number): Promise<any> {
    const categories = {};
    const list = await this.chapterRepository.query(
      `
      SELECT ch.id, ch.title, ch.category_id, ca.name
      FROM chapters AS ch
      JOIN categories AS ca
      ON ch.category_id = ca.id
      WHERE ca.comic_id = ?
      ORDER BY ch.title ASC
      `,
      [id],
    );
    for (const { id, title, category_id, name } of list) {
      if (!categories[category_id])
        categories[category_id] = { id: category_id, name, data: [] };
      categories[category_id].data.push({ id, title });
    }
    return Object.values(categories);
  }
  /** 根据chapter_id找到章节的link */
  findLink(id: number) {
    return this.chapterRepository.findOne({ id });
  }
  /** 保存该章节内容 */
  async saveContents(id: number, data: Content[]) {
    await this.contentRepository.manager.transaction(async (conn) => {
      for (const { index, url } of data) {
        await conn.insert(Content, { index, url, chapter_id: id });
      }
    });
  }
  /** 根据chapter_id找到该章节的内容 */
  async findContents(
    id: number,
    page_no?: number,
    source = 0,
  ): Promise<Content[]> {
    const p = page_no || 0;
    const page_size = 5;
    const contents = await this.contentRepository
      .createQueryBuilder()
      .select(['distinct url', "'index'"])
      .where('chapter_id = :chapterId')
      .orderBy("'index'", 'ASC')
      .setParameters({ chapterId: id })
      .limit(page_size)
      .offset(p * page_size)
      .getRawMany();
    const domain = this.configService.get('CONTENT_IMG_DOMAINS').split(',')[
      source
    ];
    return contents.map((item) => ({
      ...item,
      url: domain + item.url,
    }));
  }
  /** 根据chapter_id找到该章节的全部内容 */
  async findAllContents(id: number, source = 0): Promise<Content[]> {
    const contents = await this.contentRepository
      .createQueryBuilder()
      .select(['distinct url', 'index'])
      .where('chapter_id = :chapterId')
      .orderBy('index', 'ASC')
      .setParameters({ chapterId: id })
      .getRawMany();
    const domain = this.configService.get('CONTENT_IMG_DOMAINS').split(',')[
      source
    ];
    return contents.map((item: Content) => ({
      ...item,
      url: domain + item.url,
    }));
  }
  /** 获取该章节总数 */
  async findContentsTotal(chapterId: number): Promise<number> {
    const result = await this.contentRepository
      .createQueryBuilder()
      .select(['count(distinct url, `index`) AS total'])
      .where('chapter_id = :chapterId', { chapterId })
      .getRawOne();
    return ~~result.total;
  }
  /** 获取为内容图片增加宽高 */
  async addSize(content_list: Content[]) {
    const tasks = content_list.map((item: any) => {
      return this.commonHelper.getSize(item.url).then((size) => {
        item.size = size;
      });
    });
    await Promise.all(tasks);
  }
  /** 根据chapter_id找到comic_id */
  async findByChapterId(chapter_id: number): Promise<number | void> {
    const chapter = await this.chapterRepository.findOne({
      id: chapter_id,
    });
    if (!chapter) return;
    const category = await this.categoryRepository.findOne({
      id: chapter.category_id,
    });
    if (!category) return;
    return category.comic_id;
  }
  /** 清空漫画目录和所有内容 */
  async clean(id: number) {
    const categories = await this.categoryRepository.find({
      select: ['id'],
      where: { comic_id: id },
    });
    let chapters: Data[] = [];
    for (const item of categories) {
      chapters = chapters.concat(
        await this.chapterRepository.find({
          select: ['id'],
          where: { category_id: item.id },
        }),
      );
    }
    let contents: Data[] = [];
    for (const item of chapters) {
      contents = contents.concat(
        await this.contentRepository.find({
          select: ['id'],
          where: { chapter_id: item.id },
        }),
      );
    }
    await this.comicRepository.manager.transaction(async (conn) => {
      for (const item of categories) {
        await conn.remove(Category, item);
      }
      for (const item of chapters) {
        await conn.delete(Chapter, item);
      }
      for (const item of contents) {
        await conn.delete(Content, item);
      }
    });
  }
}
