import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('user_id', ['userId', 'comicId'], { unique: true })
@Entity('history_record', { schema: 'comic' })
export class History {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'comic_id' })
  comicId: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', {
    name: 'chapter_id',
    nullable: true,
    comment: '当前阅读章节',
  })
  chapterId: number | null;

  @Column('int', { name: 'index', nullable: true })
  index: number | null;

  @Column('datetime', { name: 'last_read_time', nullable: true })
  lastReadTime: Date | null;

  @Column('datetime', { name: 'created_time', nullable: true })
  createdTime: Date | null;
}
