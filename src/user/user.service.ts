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

  /** 通过user_id找到用户信息(去除password) */
  async findById(id: number) {
    return this.userRepository.findOne({ id });
  }
  /** 通过其他字段找到用户信息 */
  async findOne(value: FindConditions<User>) {
    return this.userRepository.findOne(value);
  }
  /** 通过用户名查找用户（包含password） */
  async findByUsername(username: User['username']) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }
  /** 更新用户信息 */
  async update(id: number, data: QueryDeepPartialEntity<User>) {
    data.last_modified_time = new Date();
    return this.userRepository.update({ id }, data);
  }
  /** 注册用户信息 */
  async create(data: QueryDeepPartialEntity<User>) {
    const { username, password, tel, avatar, email, name } = data;
    const now = new Date();
    const userInfo = {
      username,
      password,
      tel,
      avatar,
      email,
      name: name || username,
      last_modified_time: now,
      last_login_time: now,
      created_time: now,
    }; // 添加注册时间
    return this.userRepository.insert(userInfo);
  }
}
