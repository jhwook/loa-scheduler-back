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
import { RaidInfo } from './raid-info.entity';

@Entity('raid_gate_info')
@Unique(['raidInfoId', 'difficulty', 'gateNumber'])
export class RaidGateInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raidInfoId: number;

  @ManyToOne(() => RaidInfo, (raidInfo) => raidInfo.raidGates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'raidInfoId' })
  raidInfo: RaidInfo;

  @Column()
  difficulty: string;

  @Column({ type: 'int' })
  gateNumber: number;

  @Column({ nullable: true })
  gateName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  minItemLevel: number;

  // 일반 획득 골드
  @Column({ type: 'int', default: 0 })
  rewardGold: number;

  // 귀속 골드
  @Column({ type: 'int', default: 0 })
  boundGold: number;

  // 싱글 레이드 여부
  @Column({ default: false })
  isSingleMode: boolean;

  // 더보기 가능 여부
  @Column({ default: false })
  canExtraReward: boolean;

  // 더보기 비용
  @Column({ type: 'int', default: 0 })
  extraRewardCost: number;

  @Column({ type: 'int', default: 0 })
  orderNo: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
