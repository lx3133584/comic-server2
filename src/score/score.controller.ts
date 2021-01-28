import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { BaseController } from 'src/common/base.controller';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController extends BaseController {
  constructor(private scoreService: ScoreService) {
    super();
  }
  /** 添加评分 */
  @Post('/')
  @UseGuards(JwtAuthGuard)
  async add(
    @Request() req,
    @Param('id') comic_id: number,
    @Body('score') score: number,
  ) {
    const user_id = req.user.id;

    // 查重
    const res = await this.scoreService.findOne(user_id, comic_id);
    if (res) {
      throw new BadRequestException('您已经对此漫画进行过评分');
    }

    await this.scoreService.add(user_id, comic_id, score);

    return this.success(null, '评分成功');
  }
}
