import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classes', { schema: 'comic' })
export class Class {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 255 })
  name: string;

  @Column('varchar', { name: 'cover', nullable: true, length: 255 })
  cover: string | null;
}
