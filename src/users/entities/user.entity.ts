import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Character } from '../../characters/entities/character.entity';
import { PartyGroup } from 'src/party-group/entities/party-group.entity';
import { PartyGroupMember } from 'src/party-group/entities/party-group-member.entity';
import { RaidParty } from 'src/raid-party/entites/raid-party.entity';

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

  @Column({ type: 'timestamp', nullable: true })
  lastFullSyncAt: Date | null;

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];

  @OneToMany(() => PartyGroup, (group) => group.ownerUser)
  ownedGroups: PartyGroup[];

  @OneToMany(() => PartyGroupMember, (member) => member.user)
  groupMemberships: PartyGroupMember[];

  @OneToMany(() => RaidParty, (raidParty) => raidParty.createdByUser)
  createdRaidParties: RaidParty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
