import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import ConfigModule from './config/config.module';

import { UserModule } from './user/user.module';
import { ScoreModule } from './score/score.module';
import { ComicModule } from './comic/comic.module';
import { ClassModule } from './class/class.module';
import { FavoriteModule } from './favorite/favorite.module';
import { RankModule } from './rank/rank.module';
import { SearchModule } from './search/search.module';
import { HistoryModule } from './history/history.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';

@Module({
  imports: [
    RateLimiterModule,
    UserModule,
    ScoreModule,
    ComicModule,
    ClassModule,
    FavoriteModule,
    RankModule,
    SearchModule,
    HistoryModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<string>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USERNAME'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor,
    },
  ],
})
export class AppModule {}
