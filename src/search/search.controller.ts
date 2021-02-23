import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/common/base.controller';
import { CommonHelper } from 'src/common/common.helper';
import { SearchService } from './search.service';

@Controller('/')
export class SearchController extends BaseController {
  private readonly logger = new Logger(SearchController.name);

  constructor(
    private searchService: SearchService,
    private commonHelper: CommonHelper,
  ) {
    super();
  }
  /** 搜索漫画网 */
  @Get('/searchNet')
  async searchNet(@Query('keyword') keyword: string) {
    if (!keyword) throw new BadRequestException('搜索关键词不能为空');
    let res;
    try {
      res = await this.commonHelper.python('search', { keyword });
    } catch (e) {
      this.logger.error(new Error(e));
      throw new InternalServerErrorException('服务器爆炸啦，请重新搜索');
    }
    this.searchService.record(keyword);
    return this.success(res);
  }
  /** 搜索本地 */
  @Get('/searchLocal')
  async searchLocal(
    @Query('page') page: number,
    @Query('keyword') keyword: string,
  ) {
    if (!keyword) throw new BadRequestException('搜索关键词不能为空');
    const results = await this.searchService.main(keyword, page);
    ~~page || this.searchService.record(keyword);
    return this.success(results);
  }
  /** 获取热门搜索关键词 */
  @Get('/keywords')
  async keywords() {
    const results = await this.searchService.rank();
    return this.success(results);
  }
}
