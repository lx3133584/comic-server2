import { Module } from '@nestjs/common';
import { CommonHelper } from 'src/common/common.helper';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, CommonHelper],
})
export class SearchModule {}
