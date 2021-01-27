import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('user_id', ['user_id', 'comic_id'], { unique: true })
@Entity('history_record', { schema: 'comic' })
export class History {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'comic_id' })
  comic_id: number;

  @Column('int', { name: 'user_id' })
  user_id: number;

  @Column('int', {
    name: 'chapter_id',
    nullable: true,
    comment: '当前阅读章节',
  })
  chapter_id: number | null;

  @Column('int', { name: 'index', nullable: true })
  index: number | null;

  @Column('datetime', { name: 'last_read_time', nullable: true })
  last_read_time: Date | null;

  @Column('datetime', { name: 'created_time', nullable: true })
  created_time: Date | null;
}
