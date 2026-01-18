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
  ['userId', 'targetId', 'categoryId'],
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

  @Column({ type: 'timestamptz', nullable: true })
  cooldownStartedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}