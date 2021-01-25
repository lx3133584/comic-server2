import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 通过user_id找到用户信息(去除password)
  async findById(id: number) {
    return this.userRepository.findOne({ id });
  }
  // 通过其他字段找到用户信息
  async findOne(value: FindConditions<User>) {
    return this.userRepository.findOne(value);
  }
  // 通过用户名查找用户（包含password）
  async findByUsername(username: User['username']) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }
  // 更新用户信息
  async update(id: number, data: QueryDeepPartialEntity<User>) {
    return this.userRepository.update({ id }, data);
  }
  // 注册用户信息
  async create(data: QueryDeepPartialEntity<User>) {
    const { username, password, tel, avatar, email, name } = data;
    const userInfo = {
      username,
      password,
      tel,
      avatar,
      email,
      name: name || username,
    }; // 添加注册时间
    return this.userRepository.insert(userInfo);
  }
  // 上传头像
  // async upload(id: number) {
  //   const { ctx } = this;
  //   const stream = await ctx.getFileStream();
  //   const url = await ctx.helper.saveFileFromUpload(stream, 'avatar');
  //   await this.update(id, { avatar: url });
  //   return url;
  // }
  // // 登录
  // async login({ id, admin = 0 }: { id: number, admin?: number }) {
  //   const { ctx } = this;
  //   // 更新登录时间
  //   const now = this.userRepository.literals.now;
  //   await this.update(id, { last_login_time: now });

  //   // 刷新用户的 CSRF token
  //   ctx.rotateCsrfSecret();

  //   // 保存用户ID到cookie
  //   ctx.login({ id, admin });
  // }
}
