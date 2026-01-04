import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ResearchStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('research_tasks')
export class ResearchTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @Column()
  submittedByUserId: string;

  @Column()
  targetType: 'COMPANY' | 'LINKEDIN';

  @Column()
  targetId: string;

  @Column({
    type: 'enum',
    enum: ResearchStatus,
    default: ResearchStatus.PENDING,
  })
  status: ResearchStatus;

  @Column({ nullable: true })
  rejectionReasonId?: string;

  @CreateDateColumn()
  createdAt: Date;
}