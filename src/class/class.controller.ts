import { Controller, Get, Param, Query } from '@nestjs/common';
import { BaseController } from 'src/base.controller';
import { ClassService } from './class.service';

@Controller('class')
export class ClassController extends BaseController {
  constructor(private classService: ClassService) {
    super();
  }

  /** 分类列表 */
  @Get('/')
  async list() {
    const res = await this.classService.find();
    return this.success(res);
  }

  /** 单个分类下所有漫画 */
  @Get('/:id')
  async findOne(@Param('id') id: number, @Query('page') page: number) {
    const res = await this.classService.findOne(id, page || 0);
    return this.success(res);
  }
}
