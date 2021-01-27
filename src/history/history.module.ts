import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { History } from './history.entity';
import { ComicModule } from 'src/comic/comic.module';

@Module({
  imports: [TypeOrmModule.forFeature([History]), ComicModule],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
