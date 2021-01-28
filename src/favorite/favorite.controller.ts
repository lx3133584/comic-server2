import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { BaseController } from 'src/common/base.controller';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoriteController extends BaseController {
  constructor(private favoriteService: FavoriteService) {
    super();
  }
  /** 收藏列表 */
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async list(@Request() req) {
    const user_id = req.user.id;

    const list = await this.favoriteService.find(user_id);

    return this.success(list);
  }
  /** 添加到收藏夹 */
  @Post('/:id')
  @UseGuards(JwtAuthGuard)
  async add(@Request() req, @Param('id') comic_id: number) {
    const user_id = req.user.id;

    const comic = await this.favoriteService.findOne(user_id, comic_id);

    if (comic) {
      throw new BadRequestException('收藏夹中已存在');
    }

    await this.favoriteService.add(user_id, comic_id);

    return this.success(null, '成功添加收藏');
  }
  /** 从收藏夹删除 */
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') comic_id: number) {
    const user_id = req.user.id;

    await this.favoriteService.remove(user_id, comic_id);

    return this.success(null, '成功移除收藏');
  }
}
