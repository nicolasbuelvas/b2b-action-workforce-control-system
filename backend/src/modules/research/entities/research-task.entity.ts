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

  @Column({ name: 'job_type_id', type: 'uuid', nullable: true })
  jobTypeId?: string;

  @Column({ name: 'company_type_id', type: 'uuid', nullable: true })
  companyTypeId?: string;

  @Column({ type: 'varchar', nullable: true })
  language?: string;

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