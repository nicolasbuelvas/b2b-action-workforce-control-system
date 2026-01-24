import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cooldown_records')
@Index(
  ['userId', 'targetId', 'actionType', 'categoryId'],
  { unique: true },
)
export class CooldownRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  targetId: string; // companyId | domainId | linkedinProfileId

  @Column()
  categoryId: string;

  @Column()
  actionType: string; // EMAIL | LINKEDIN | CALL

  @Column({ type: 'int', default: 0 })
  actionCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  cooldownStartedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}