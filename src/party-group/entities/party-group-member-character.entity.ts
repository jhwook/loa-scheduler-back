import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { PartyGroup } from './party-group.entity';
import { User } from '../../users/entities/user.entity';
import { Character } from '../../characters/entities/character.entity';

@Entity('party_group_member_character')
@Unique(['groupId', 'userId', 'characterId'])
export class PartyGroupMemberCharacter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ManyToOne(() => PartyGroup, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: PartyGroup;

  @Column()
  userId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  characterId: number;

  @ManyToOne(() => Character, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
