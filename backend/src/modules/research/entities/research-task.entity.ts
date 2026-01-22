import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ResearchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('research_tasks')
export class ResearchTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  targetId: string;

  @Column({ name: 'targettype', type: 'varchar', nullable: true })
  targetType: string; // 'COMPANY' or 'LINKEDIN'

  @Column({ type: 'varchar' })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: ResearchStatus,
    default: ResearchStatus.PENDING,
  })
  status: ResearchStatus;

  @Column({ nullable: true })
  assignedToUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}