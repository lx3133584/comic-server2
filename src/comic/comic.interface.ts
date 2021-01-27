import { Comic } from 'src/comic/entities/comic.entity';
export interface OriginInfo {
  // 爬取的源数据
  detail: Comic;
  list: OriginListItem[];
}
export interface OriginChapterItem {
  title: string;
  link: string;
}
export interface OriginListItem {
  category_name: string;
  list: OriginChapterItem[];
}
export interface ContentItem {
  id: number;
  url: string;
  index: number;
  size?: {
    width: number;
    height: number;
  };
}
export interface Data {
  id: number;
  [key: string]: any;
}
