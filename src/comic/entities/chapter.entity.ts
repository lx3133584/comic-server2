import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('category_id', ['categoryId'], {})
@Entity('chapters', { schema: 'comic' })
export class Chapter {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'category_id' })
  categoryId: number;

  @Column('varchar', { name: 'link', length: 255 })
  link: string;

  @Column('varchar', { name: 'title', length: 255 })
  title: string;

  @Column('datetime', { name: 'created_time', nullable: true })
  createdTime: Date | null;
}
