import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users', { schema: 'comic' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'tel', nullable: true, length: 255 })
  tel: string | null;

  @Column('varchar', { name: 'email', nullable: true, length: 255 })
  email: string | null;

  @Column('varchar', { primary: true, name: 'username', length: 255 })
  username: string;

  @Column('varchar', { name: 'password', length: 255, select: false })
  password: string;

  @Column('varchar', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('varchar', { name: 'avatar', nullable: true, length: 255 })
  avatar: string | null;

  @Column('datetime', { name: 'created_time', nullable: true })
  createdTime: Date | null;

  @Column('datetime', { name: 'last_login_time', nullable: true })
  lastLoginTime: Date | null;

  @Column('tinyint', { name: 'admin', default: () => "'0'" })
  admin: number;

  @Column('datetime', { name: 'last_modified_time', nullable: true })
  lastModifiedTime: Date | null;
}
