import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.characters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  characterName: string;

  @Column({ nullable: true })
  serverName: string;

  @Column({ nullable: true })
  characterClassName: string;

  @Column({ nullable: true })
  characterLevel: number;

  @Column({ nullable: true })
  itemAvgLevel: string;

  @Column({ nullable: true })
  itemMaxLevel: string;

  @Column({ nullable: true })
  expeditionLevel: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  guildName: string;

  @Column({ nullable: true })
  townName: string;

  @Column({ nullable: true })
  pvpGradeName: string;

  @Column({ nullable: true })
  combatPower: string;

  @Column({ nullable: true })
  characterImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
