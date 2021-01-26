import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClassService } from './class.service';

@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}

  /** 分类列表 */
  @Get('/')
  async list() {
    return await this.classService.find();
  }

  /** 单个分类下所有漫画 */
  @Get('/:id')
  async findOne(@Param('id') id: number, @Query('page') page: number) {
    return await this.classService.findOne(id, page);
  }
}
