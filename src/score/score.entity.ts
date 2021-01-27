import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('user_id', ['user_id', 'comic_id'], { unique: true })
@Entity('score', { schema: 'comic' })
export class Score {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('float', {
    name: 'score',
    precision: 255,
    scale: 1,
    default: () => "'0.0'",
  })
  score: number;

  @Column('int', { name: 'user_id', nullable: true })
  user_id: number | null;

  @Column('int', { name: 'comic_id', nullable: true })
  comic_id: number | null;

  @Column('datetime', { name: 'created_time', nullable: true })
  created_time: Date | null;
}
