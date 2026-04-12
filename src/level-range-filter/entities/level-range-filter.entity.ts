import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('level_range_filter')
export class LevelRangeFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  label: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minLevel: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxLevel: string | null;

  @Column({ type: 'int', default: 0 })
  orderNo: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
