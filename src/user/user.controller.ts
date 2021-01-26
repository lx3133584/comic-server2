import {
  Controller,
  Request,
  UseGuards,
  Get,
  Body,
  BadRequestException,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { EditPasswordParams, UpdateParams } from './user.validator';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  /** 获取个人信息 */
  @Get('/')
  show(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  /** 更新用户信息 */
  @Put('/')
  async edit(@Body() updateParams: UpdateParams, @Request() req) {
    await this.userService.update(req.user.id, updateParams);
    return '修改成功';
  }

  /** 修改密码 */
  @Put('/password')
  async editPassword(
    @Body() editPasswordParams: EditPasswordParams,
    @Request() req,
  ) {
    // 密码相等校验
    if (editPasswordParams.password !== editPasswordParams['re-password']) {
      throw new BadRequestException('两次输入密码不一致');
    }
    if (editPasswordParams.password !== editPasswordParams.old_password) {
      throw new BadRequestException('新密码与原密码相同');
    }
    // 数据库校验
    const userInfo = await this.userService.findByUsername(req.user.username);
    if (userInfo.password !== editPasswordParams.old_password) {
      throw new BadRequestException('原密码错误');
    }
    await this.userService.update(req.user.id, {
      password: editPasswordParams.password,
    });
    return '修改成功';
  }

  /** 上传头像 */
  @Put('/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, 'public/avatar');
        },
        filename(req, file, cb) {
          const date = new Date();
          const filename = `${date.getFullYear()}${
            date.getMonth() + 1
          }${date.getDate()}-${date.getTime()}`;
          let extension;
          switch (file.mimetype) {
            case 'image/png':
              extension = 'png';
              break;
            case 'image/jpeg':
              extension = 'jpg';
              break;
            default:
              extension = 'jpg';
          }
          cb(null, `${filename}.${extension}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 10, // 10M
      },
      fileFilter(req, file, cb) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  async upload(@UploadedFile() file, @Request() req) {
    if (!file) {
      throw new BadRequestException('文件格式错误');
    }
    await this.userService.update(req.user.id, {
      avatar: `/${file.path}`,
    });
    return '修改成功';
  }
}
