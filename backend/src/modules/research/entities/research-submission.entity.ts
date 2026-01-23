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

  @Column({ type: 'uuid', name: 'researchtaskid' })
  researchTaskId: string;

  @ManyToOne(() => ResearchTask)
  @JoinColumn({ name: 'researchtaskid' })
  researchTask: ResearchTask;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true, name: 'contact_name' })
  contactName?: string;

  @Column({ nullable: true, name: 'contact_linkedin_url' })
  contactLinkedinUrl?: string;

  @Column({ nullable: true, name: 'country' })
  country?: string;

    @Column({ nullable: true, name: 'email' })
  email: string;

    @Column({ nullable: true, name: 'phone' })
  phone: string;

    @Column({ type: 'text', nullable: true, name: 'techstack' })
  techStack: string;

    @Column({ type: 'text', nullable: true, name: 'notes' })
  notes: string;

    @Column({ nullable: true, name: 'screenshotpath' })
  screenshotPath: string;

    @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;
}
