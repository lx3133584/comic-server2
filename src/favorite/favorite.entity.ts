import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('user_id', ['userId', 'comicId'], { unique: true })
@Entity('favorites', { schema: 'comic' })
export class Favorite {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'comic_id' })
  comicId: number;

  @Column('datetime', { name: 'created_time', nullable: true })
  createdTime: Date | null;
}
