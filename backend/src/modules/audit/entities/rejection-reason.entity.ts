import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('research_audits')
export class ResearchAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  researchTaskId: string;

  @Column()
  auditorUserId: string;

  @Column()
  decision: 'APPROVED' | 'REJECTED';

  @Column({ nullable: true })
  rejectionReasonId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
