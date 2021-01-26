import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { Comic } from './entities/comic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comic])],
  controllers: [ComicController],
  providers: [ComicService],
})
export class ComicModule {}
