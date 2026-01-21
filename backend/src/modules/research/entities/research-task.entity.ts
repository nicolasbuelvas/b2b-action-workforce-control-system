import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ResearchStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('research_tasks')
export class ResearchTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string;

  @Column()
  targetType: string; // 'COMPANY' or 'LINKEDIN'

  @Column()
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