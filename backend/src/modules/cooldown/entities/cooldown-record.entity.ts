import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('cooldown_records')
@Index(['userId', 'targetId', 'actionType'], { unique: true })
export class CooldownRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  targetId: string;

  @Column()
  actionType: string;

  @Column({ type: 'timestamptz' })
  lastPerformedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}