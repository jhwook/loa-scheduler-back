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
import { Character } from '../../characters/entities/character.entity';
import { RaidGateInfo } from '../../raid-info/entities/raid-gate-info.entity';

@Entity('character_weekly_raid_gate')
@Unique(['characterId', 'raidGateInfoId'])
export class CharacterWeeklyRaidGate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  characterId: number;

  @ManyToOne(() => Character, (character) => character.weeklyRaidGates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column()
  raidGateInfoId: number;

  @ManyToOne(() => RaidGateInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'raidGateInfoId' })
  raidGateInfo: RaidGateInfo;

  @Column({ default: false })
  isCleared: boolean;

  @Column({ default: false })
  isGoldEarned: boolean;

  @Column({ default: false })
  isExtraRewardSelected: boolean;

  @Column({ type: 'int', nullable: true })
  extraRewardCostSnapshot: number | null;

  @Column({ type: 'timestamp', nullable: true })
  clearedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  orderNo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
