import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComicService } from './comic.service';

@Injectable()
export class ComicSchedule {
  private readonly logger = new Logger(ComicSchedule.name);

  constructor(private comicService: ComicService) {}

  /** 根据要更新的漫画列表更新漫画 */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCron() {
    // this.logger.debug('Called when the current second is 45');
    const update_list = await this.comicService.crawlUpdateList();
    for (const { id } of update_list) {
      await this.comicService.updateComic(~~id);
    }
  }
}
