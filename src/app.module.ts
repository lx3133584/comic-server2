import { Module } from '@nestjs/common';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

import { UserModule } from './user/user.module';
import { ScoreService } from './score/score.service';
import { ScoreController } from './score/score.controller';
import { ScoreModule } from './score/score.module';
import { ComicModule } from './comic/comic.module';
import { ClassService } from './class/class.service';
import { ClassController } from './class/class.controller';
import { ClassModule } from './class/class.module';
import { FavoriteModule } from './favorite/favorite.module';
import { RankService } from './rank/rank.service';
import { RankController } from './rank/rank.controller';
import { RankModule } from './rank/rank.module';
import { SearchService } from './search/search.service';
import { SearchModule } from './search/search.module';
import { HistoryController } from './history/history.controller';
import { HistoryModule } from './history/history.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
  ],
  controllers: [
    ScoreController,
    ClassController,
    RankController,
    HistoryController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor,
    },
    ScoreService,
    ClassService,
    RankService,
    SearchService,
  ],
})
export class AppModule {}
