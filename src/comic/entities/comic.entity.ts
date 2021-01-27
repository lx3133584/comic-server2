import { Column, Entity, Index } from 'typeorm';

@Index('class_id', ['class_id'], {})
@Index('popularity_number', ['popularity_number'], {})
@Index('collection_number', ['collection_number'], {})
@Index('score_number', ['score_number'], {})
@Index('score', ['score'], {})
@Entity('comics', { schema: 'comic' })
export class Comic {
  @Column('int', { primary: true, name: 'id' })
  id: number;

  @Column('varchar', { name: 'source', nullable: true, length: 255 })
  source: string | null;

  @Column('int', { name: 'class_id', nullable: true })
  class_id: number | null;

  @Column('varchar', { name: 'cover', nullable: true, length: 255 })
  cover: string | null;

  @Column('varchar', { name: 'title', nullable: true, length: 255 })
  title: string | null;

  @Column('varchar', { name: 'author', nullable: true, length: 255 })
  author: string | null;

  @Column('varchar', { name: 'status', nullable: true, length: 255 })
  status: string | null;

  @Column('datetime', { name: 'last_crawl_time', nullable: true })
  last_crawl_time: Date | null;

  @Column('datetime', { name: 'created_time', nullable: true })
  created_time: Date | null;

  @Column('datetime', { name: 'update_time', nullable: true })
  update_time: Date | null;

  @Column('varchar', { name: 'desc', nullable: true, length: 255 })
  desc: string | null;

  @Column('int', {
    name: 'popularity_number',
    nullable: true,
    unsigned: true,
    default: () => "'0'",
  })
  popularity_number: number | null;

  @Column('int', {
    name: 'collection_number',
    nullable: true,
    unsigned: true,
    default: () => "'0'",
  })
  collection_number: number | null;

  @Column('int', {
    name: 'score_number',
    nullable: true,
    unsigned: true,
    default: () => "'0'",
  })
  score_number: number | null;

  @Column('float', {
    name: 'score',
    nullable: true,
    unsigned: true,
    precision: 255,
    scale: 2,
    default: () => "'0.00'",
  })
  score: number | null;
}
