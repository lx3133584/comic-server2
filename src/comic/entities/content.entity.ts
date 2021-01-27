import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('chapter_id', ['chapter_id'], {})
@Entity('contents', { schema: 'comic' })
export class Content {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'url', length: 255 })
  url: string;

  @Column('int', { primary: true, name: 'chapter_id' })
  chapter_id: number;

  @Column('smallint', { name: 'index' })
  index: number;
}
