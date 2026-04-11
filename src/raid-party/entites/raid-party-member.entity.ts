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
import { RaidParty } from './raid-party.entity';
import { Character } from '../../characters/entities/character.entity';

export type RaidPartyPositionRole = 'DEALER' | 'SUPPORT';

@Entity('raid_party_member')
@Unique(['raidPartyId', 'characterId'])
@Unique(['raidPartyId', 'partyNumber', 'slotNumber'])
export class RaidPartyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raidPartyId: number;

  @ManyToOne(() => RaidParty, (raidParty) => raidParty.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'raidPartyId' })
  raidParty: RaidParty;

  @Column()
  characterId: number;

  @ManyToOne(() => Character, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column({ type: 'int', default: 1 })
  partyNumber: number;

  @Column({ type: 'int', default: 1 })
  slotNumber: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ETC',
  })
  positionRole: RaidPartyPositionRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
