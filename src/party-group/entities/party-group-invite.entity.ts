import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartyGroup } from './party-group.entity';
import { User } from '../../users/entities/user.entity';

export type PartyGroupInviteStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELED';

@Entity('party_group_invite')
export class PartyGroupInvite {
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
  invitedUserId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitedUserId' })
  invitedUser: User;

  @Column()
  invitedByUserId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitedByUserId' })
  invitedByUser: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status: PartyGroupInviteStatus;

  @Column({ type: 'varchar', length: 200, nullable: true })
  message: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
