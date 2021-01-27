import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from 'src/comic/entities/comic.entity';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comic])],
  controllers: [RankController],
  providers: [RankService],
})
export class RankModule {}
