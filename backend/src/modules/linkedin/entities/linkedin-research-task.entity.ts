import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LinkedInResearchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('linkedin_research_tasks')
export class LinkedInResearchTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  targetId: string;

  @Column({ type: 'varchar' })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: LinkedInResearchStatus,
    default: LinkedInResearchStatus.PENDING,
  })
  status: LinkedInResearchStatus;

  @Column({ nullable: true })
  assignedToUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
