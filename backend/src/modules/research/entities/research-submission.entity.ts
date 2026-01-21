import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResearchTask } from './research-task.entity';

@Entity('research_submissions')
export class ResearchSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  researchTaskId: string;

  @ManyToOne(() => ResearchTask)
  @JoinColumn({ name: 'researchTaskId' })
  researchTask: ResearchTask;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  techStack: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  screenshotPath: string;

  @CreateDateColumn()
  createdAt: Date;
}
