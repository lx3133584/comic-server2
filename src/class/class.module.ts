import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Comic } from '../comic/entities/comic.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Class, Comic])],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
