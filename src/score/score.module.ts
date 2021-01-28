import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicModule } from 'src/comic/comic.module';
import { ScoreController } from './score.controller';
import { Score } from './score.entity';
import { ScoreService } from './score.service';

@Module({
  imports: [TypeOrmModule.forFeature([Score]), ComicModule],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
