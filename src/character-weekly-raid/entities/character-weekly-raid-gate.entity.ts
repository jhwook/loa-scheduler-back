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
@Unique(['characterId', 'raidGateInfoId', 'weekStartDate'])
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

  @Column({ type: 'date' })
  weekStartDate: string;

  @Column({ default: false })
  isCleared: boolean;

  @Column({ default: false })
  isGoldEarned: boolean;

  // 유저가 더보기 선택했는지
  @Column({ default: false })
  isExtraRewardSelected: boolean;

  // 당시 더보기 비용 snapshot
  @Column({ type: 'int', nullable: true })
  extraRewardCostSnapshot: number | null;

  @Column({ type: 'timestamp', nullable: true })
  clearedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
