import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Character } from '../../characters/entities/character.entity';

export type UserRole = 'USER' | 'ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'text' })
  lostarkApiToken: string | null;

  @Column({ default: false })
  hasApiToken: boolean;

  @Column({ nullable: true })
  mainCharacterName: string | null;

  @Column({
    type: 'varchar',
    default: 'USER',
  })
  role: UserRole;

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
