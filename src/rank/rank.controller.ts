import { Controller, Get, Param, Query } from '@nestjs/common';
import { BaseController } from 'src/base.controller';
import { RankService } from './rank.service';

@Controller('rank')
export class RankController extends BaseController {
  constructor(private rankService: RankService) {
    super();
  }

  /** 排行榜列表 */
  @Get('/:type')
  async list(@Param('type') type: number, @Query('page') page: number) {
    const res = await this.rankService.find(type, page || 0);
    return this.success(res);
  }
}
