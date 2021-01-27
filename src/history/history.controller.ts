import { HistoryService } from './history.service';
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { BaseController } from 'src/common/base.controller';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('history_record')
export class HistoryController extends BaseController {
  constructor(private historyService: HistoryService) {
    super();
  }
  /** 历史记录列表 */
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async list(@Request() req, @Query('page') page: number) {
    const list = await this.historyService.findByUser(req.user.id, page);
    return this.success(list);
  }
  /** 添加浏览记录 */
  @Post('/')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body) {
    const {
      chapter_id,
      index = 0,
    }: { chapter_id: number; index?: number } = body;
    await this.historyService.toolForAdd({
      chapter_id,
      index,
      user_id: req.user.id,
    });
    return this.success();
  }
  // 删除浏览记录
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: number) {
    await this.historyService.remove(req.user.id, id);
    this.success(null, '成功删除浏览历史记录');
  }
}
