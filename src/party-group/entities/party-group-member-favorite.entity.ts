import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Column,
} from 'typeorm';
import { PartyGroup } from './party-group.entity';
import { User } from '../../users/entities/user.entity';

@Entity('party_group_member_favorite')
@Unique(['groupId', 'userId', 'favoriteUserId'])
export class PartyGroupMemberFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ManyToOne(() => PartyGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: PartyGroup;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  favoriteUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'favoriteUserId' })
  favoriteUser: User;

  @CreateDateColumn()
  createdAt: Date;
}
