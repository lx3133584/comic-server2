import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('comic_id', ['comicId'], {})
@Entity('categories', { schema: 'comic' })
export class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 255 })
  name: string;

  @Column('int', { name: 'comic_id' })
  comicId: number;

  @Column('datetime', { name: 'created_time', nullable: true })
  createdTime: Date | null;
}
