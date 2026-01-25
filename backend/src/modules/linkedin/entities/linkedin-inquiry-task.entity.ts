import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LinkedInInquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

@Entity('linkedin_inquiry_tasks')
@Index(['researchTaskId'])
export class LinkedInInquiryTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;

  @Column()
  categoryId: string;

  @Column({ name: 'research_task_id', nullable: true })
  researchTaskId: string | null;

  @Column({
    type: 'enum',
    enum: LinkedInInquiryStatus,
    default: LinkedInInquiryStatus.PENDING,
  })
  status: LinkedInInquiryStatus;

  @Column({ nullable: true })
  assignedToUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
