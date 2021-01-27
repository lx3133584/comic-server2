import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('comic_id', ['comic_id'], {})
@Entity('categories', { schema: 'comic' })
export class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 255 })
  name: string;

  @Column('int', { name: 'comic_id' })
  comic_id: number;

  @Column('datetime', { name: 'created_time', nullable: true })
  created_time: Date | null;
}
