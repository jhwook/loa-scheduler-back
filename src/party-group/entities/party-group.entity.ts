import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PartyGroupMember } from './party-group-member.entity';
import { RaidParty } from 'src/raid-party/entites/raid-party.entity';
import { PartyGroupInvite } from './party-group-invite.entity';

@Entity('party_group')
export class PartyGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  ownerUserId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerUserId' })
  ownerUser: User;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PartyGroupMember, (member) => member.group)
  members: PartyGroupMember[];

  @OneToMany(() => RaidParty, (raidParty) => raidParty.group)
  raidParties: RaidParty[];

  @OneToMany(() => PartyGroupInvite, (invite) => invite.group)
  invites: PartyGroupInvite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
