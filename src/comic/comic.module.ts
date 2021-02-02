import { History } from './../history/history.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { Comic } from './entities/comic.entity';
import { Category } from './entities/category.entity';
import { Chapter } from './entities/chapter.entity';
import { Content } from './entities/content.entity';
import { CommonHelper } from 'src/common/common.helper';
import { ClassModule } from 'src/class/class.module';
import { HistoryService } from 'src/history/history.service';
import { ComicSchedule } from './comic.schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comic, Category, Chapter, Content, History]),
    ClassModule,
  ],
  controllers: [ComicController],
  providers: [ComicService, HistoryService, CommonHelper, ComicSchedule],
  exports: [ComicService],
})
export class ComicModule {}
