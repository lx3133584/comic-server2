import { Controller, Request, Response, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RateLimit } from 'nestjs-rate-limiter';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Controller()
export class AuthController {
  constructor(
    private userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @RateLimit({
    keyPrefix: 'sign-up',
    points: 10,
    duration: 60,
    errorMessage: '尝试次数超出限制，请等几分钟再试。',
  })
  @UseGuards(AuthGuard('local'))
  @Post('/passport/local')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    await this.userService.update(req.user.id, { lastLoginTime: new Date() });
    const user = await this.userService.findById(req.user.id);
    const result = await this.authService.login(user);
    res.cookie('token', result.token, {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
    });
    return result;
  }
}
