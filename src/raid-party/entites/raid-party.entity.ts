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
import { PartyGroup } from '../../party-group/entities/party-group.entity';
import { RaidInfo } from '../../raid-info/entities/raid-info.entity';
import { User } from '../../users/entities/user.entity';
import { RaidPartyMember } from './raid-party-member.entity';

@Entity('raid_party')
export class RaidParty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ManyToOne(() => PartyGroup, (group) => group.raidParties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: PartyGroup;

  @Column()
  raidInfoId: number;

  @ManyToOne(() => RaidInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'raidInfoId' })
  raidInfo: RaidInfo;

  @Column({ length: 100, nullable: true })
  title: string | null;

  @Column({ type: 'int', default: 4 })
  partySize: number;

  @Column()
  createdByUserId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @OneToMany(() => RaidPartyMember, (member) => member.raidParty)
  members: RaidPartyMember[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  selectedDifficulty: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
