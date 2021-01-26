import {
  Controller,
  Request,
  Response,
  Post,
  UseGuards,
  HttpCode,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RateLimit } from 'nestjs-rate-limiter';
import { AuthService } from 'src/auth/auth.service';
import { BaseController } from 'src/base.controller';
import { UserService } from 'src/user/user.service';
import { RegisterParams } from './auth.validator';

@Controller()
export class AuthController extends BaseController {
  constructor(
    private userService: UserService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  /** 登录 */
  @RateLimit({
    keyPrefix: 'sign-up',
    points: 10,
    duration: 60,
    errorMessage: '尝试次数超出限制，请等几分钟再试。',
  })
  @UseGuards(AuthGuard('local'))
  @Post('/passport/local')
  @HttpCode(200)
  async login(@Request() req, @Response({ passthrough: true }) res) {
    await this.userService.update(req.user.id, { lastLoginTime: new Date() });
    const user = await this.userService.findById(req.user.id);
    const result = await this.authService.login(user);
    const now = Date.now();
    const expires = new Date(now + 1000 * 60 * 60 * 24 * 14); // 14 day
    res.cookie('token', result.token, {
      expires,
      httpOnly: true,
    });
    return this.success(result, '登录成功');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(200)
  async logout(@Response({ passthrough: true }) res) {
    res.cookie('token', '', { expires: new Date(0) });
    return this.success(null, '退出登录成功');
  }

  /** 注册 */
  @Post('/user')
  async create(
    @Body() registerParams: RegisterParams,
    @Request() req,
    @Response({ passthrough: true }) res,
  ) {
    // 密码相等校验
    if (registerParams.password !== registerParams['re-password']) {
      throw new BadRequestException('两次输入密码不一致');
    }
    // 数据库校验
    const userInfo = await this.userService.findOne({
      username: registerParams.username,
    });
    if (userInfo) {
      throw new BadRequestException('用户名已存在');
    }

    const insertData = await this.userService.create(registerParams);
    const newUserInfo = await this.userService.findById(
      insertData.raw.insertId,
    );
    // 登录
    const result = await this.authService.login(newUserInfo);
    const now = Date.now();
    const expires = new Date(now + 1000 * 60 * 60 * 24 * 14); // 14 day
    res.cookie('token', result.token, {
      expires,
      httpOnly: true,
    });
    return this.success(result, '注册成功');
  }
}
