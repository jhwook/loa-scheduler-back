import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PartyGroup } from './party-group.entity';
import { User } from '../../users/entities/user.entity';

export type PartyGroupMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

@Entity('party_group_member')
@Unique(['groupId', 'userId'])
export class PartyGroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ManyToOne(() => PartyGroup, (group) => group.members, {
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

  @Column({
    type: 'varchar',
    length: 20,
    default: 'MEMBER',
  })
  role: PartyGroupMemberRole;

  @Column({ length: 30, nullable: true })
  nickname: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
