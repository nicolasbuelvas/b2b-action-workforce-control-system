import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResearchTask } from '../../research/entities/research-task.entity';

export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export enum InquiryPlatform {
  WEBSITE = 'WEBSITE',
  LINKEDIN = 'LINKEDIN',
}

@Entity('inquiry_tasks')
@Index(['researchTaskId'])
export class InquiryTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;

  @Column()
  categoryId: string;

  @Column({
    type: 'enum',
    enum: InquiryPlatform,
    default: InquiryPlatform.WEBSITE,
  })
  platform: InquiryPlatform;

  @Column({ name: 'research_task_id', nullable: true })
  researchTaskId: string | null;

  @ManyToOne(() => ResearchTask, { nullable: true })
  @JoinColumn({ name: 'research_task_id' })
  researchTask?: ResearchTask | null;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  @Column({ nullable: true })
  assignedToUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}