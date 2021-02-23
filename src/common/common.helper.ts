import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { spawn } from 'child_process';
import * as probe from 'probe-image-size';

interface ImageSize {
  width: number;
  height: number;
}

@Injectable()
export class CommonHelper {
  private readonly logger = new Logger(CommonHelper.name);

  /** 调用Python */
  python(spider: string, params = {}): any {
    return new Promise((resolve, reject) => {
      const { jsonFormat } = this;
      let formatStr = '';
      for (const key in params) {
        formatStr += `${key}=${params[key]} `;
      }
      let args = ['crawl', spider];
      if (formatStr) args = args.concat(['-a', formatStr]);
      const cmd = 'scrapy';
      const cwd = path.resolve('crawler');
      const child = spawn(cmd, args, { cwd });
      let result = '';
      child.stdout
        .on('data', (chunk) => {
          result += chunk;
        })
        .on('end', () => {
          const data = jsonFormat.call(this, result.trim());
          resolve(data);
        });

      child.stderr.on('end', (err: any) => {
        reject(err);
      });
    });
  }
  /** 格式化爬取的字符串 */
  jsonFormat(str: string): Record<string, any> {
    const data = str || null;
    let format;
    try {
      format = JSON.parse(data as string);
    } catch (e) {
      this.logger.error(e);
    }
    return format;
  }
  /** 分词函数 */
  divide(str: string) {
    const strArr = str.split('');
    if (strArr.length === 1) return [str];
    const result: string[] = [];
    for (let i = 0, len = strArr.length - 1; i < len; i++) {
      result.push(strArr[i] + strArr[i + 1]);
    }
    return result;
  }
  /** 获取图片size */
  getSize(imgUrl: string): Promise<ImageSize> {
    return probe(imgUrl)
      .then((res: ImageSize) => ({
        width: res.width,
        height: res.height,
      }))
      .catch(() => ({
        width: 0,
        height: 0,
      }));
  }
}
