import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RaidGateInfo } from './raid-gate-info.entity';
import { RaidParty } from 'src/raid-party/entites/raid-party.entity';

@Entity('raid_info')
export class RaidInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  raidName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  orderNo: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RaidGateInfo, (raidGateInfo) => raidGateInfo.raidInfo)
  raidGates: RaidGateInfo[];

  @OneToMany(() => RaidParty, (raidParty) => raidParty.raidInfo)
  raidParties: RaidParty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
