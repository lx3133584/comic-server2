import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('user_id', ['user_id', 'comic_id'], { unique: true })
@Entity('favorites', { schema: 'comic' })
export class Favorite {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  user_id: number;

  @Column('int', { name: 'comic_id' })
  comic_id: number;

  @Column('datetime', { name: 'created_time', nullable: true })
  created_time: Date | null;
}
