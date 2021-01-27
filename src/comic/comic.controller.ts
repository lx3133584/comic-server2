import { HistoryService } from './../history/history.service';
import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard, OptionalAuthGuard } from 'src/auth/auth.guard';
import { ClassService } from 'src/class/class.service';
import { BaseController } from 'src/common/base.controller';
import { ComicService } from './comic.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AllComicId = require('../../crawler/all_comic_id.json');
// const AllComicId = require('../../crawler/all_comic_class.json');

@Controller('comic')
export class ComicController extends BaseController {
  constructor(
    private comicService: ComicService,
    private classService: ClassService,
    private historyService: HistoryService,
    private configService: ConfigService,
  ) {
    super();
  }

  /** 漫画详情 */
  @Get('/:id/detail')
  @UseGuards(OptionalAuthGuard)
  async detail(@Param('id') id: number, @Request() req) {
    const user_id = req.user ? req.user.id : undefined;
    const comicInfo = await this.comicService.findByIdDetail(id, user_id);

    if (comicInfo) {
      await this.historyService.toolForAdd({ comic_id: comicInfo.id, user_id });
      return this.success(comicInfo);
    }

    const res = await this.comicService.crawl(id);
    if (!res) throw new NotFoundException('该漫画不存在');

    await this.comicService.create(id, res);
    await this.historyService.toolForAdd({ comic_id: id, user_id });
    return this.success(res.detail);
  }
  /** 漫画目录 */
  @Get('/:id/list')
  async list(@Param('id') id: number) {
    const list = await this.comicService.findList(id);

    return this.success(list);
  }
  /** 漫画内容(单章节) */
  @Get('/content/:id')
  async content(@Param('id') id: number, @Query() query) {
    const { page, no_size, all, source = '0' } = query;
    const domain_len = this.configService.get('CONTENT_IMG_DOMAINS').split(',')
      .length;
    const s = RegExp(`[0-${domain_len - 1}]`).test(source) ? ~~source : 0;

    const [contents, total] = await Promise.all([
      all
        ? this.comicService.findAllContents(id, s)
        : this.comicService.findContents(id, ~~page, s),
      this.comicService.findContentsTotal(id),
    ]);
    if (!no_size) await this.comicService.addSize(contents);
    if (!total) await this.contentOne(id); // 未找到则爬取
    return this.success(contents, undefined, { total });
  }
  /** 爬取漫画内容的接口 */
  @Get('/contentOne/:id')
  async contentOne(@Param('id') id: number) {
    const contents = await this.comicService.findContents(id, 0);

    if (contents.length) {
      return;
    }

    // 根据chapter_id找到章节的link
    const chapter = await this.comicService.findLink(id);
    if (!chapter) throw new NotFoundException('未找到该章节');

    const res = await this.comicService.crawlContent(chapter.link);

    if (!res) throw new NotFoundException('未找到该章节');

    await this.comicService.saveContents(id, res);
    return this.success(res);
  }
  /** 漫画内容(全部章节) */
  @Post('/load_all_content/:id')
  async contentAll(@Param('id') id: number) {
    const list = await this.comicService.findList(id);

    if (!list.length) throw new NotFoundException('该漫画不存在');

    for (const { data } of list as any) {
      for (const { id } of data) {
        await this.contentOne(id);
      }
    }
    return this.success();
  }
  /** 为漫画加上分类 */
  async addClass(id: number, { class_name }: { class_name: string }) {
    const class_item = await this.classService.findClass({
      name: class_name,
    });
    await this.comicService.update(id, { class_id: class_item.id });
  }
  /** 更新漫画 */
  async updateComic(id: number) {
    await this.comicService.updateComic(id);
  }
  // 遍历全部ID的数据
  async getAll(fn: (...any: any[]) => void) {
    for (let i = 0, len = AllComicId.length; i < len; i++) {
      const { id } = AllComicId[i];
      Logger.log(`${fn.name}:[${i}/${len}], comic_id: ${id}`);
      try {
        await fn.call(this, AllComicId[i]);
      } catch (e) {
        Logger.error(new Error(e));
      }
    }
  }
  /** 通过全部ID的数据爬取所有漫画 */
  @Post('/get_all')
  getAllRouter() {
    // this.getAll(this.detail);
    // this.getAll(this.contentAll);
    this.getAll(this.updateComic);
    // this.getAll(this.addClass);
    this.success();
  }
  /** 重新爬取漫画 */
  @Post('/reset/:id')
  @UseGuards(JwtAuthGuard)
  async reset(@Param('id') id: number, @Request() req) {
    const comicInfo = await this.comicService.findByIdDetail(id, req.user.id);
    if (!comicInfo) throw new NotFoundException('该漫画不存在');
    await this.comicService.clean(id);
    this.comicService.updateComic(id);
    this.success();
  }
}
