import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('linkedin_research_submissions')
export class LinkedInResearchSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'research_task_id' })
  researchTaskId: string;

  @Column({ type: 'varchar' })
  contactName: string;

  @Column({ type: 'varchar' })
  linkedinProfileUrl: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar' })
  language: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
