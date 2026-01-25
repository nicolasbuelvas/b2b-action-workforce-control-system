import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('inquiry_submission_snapshots')
@Index(['inquiryTaskId'])
@Index(['inquiryActionId'])
@Index(['researchTaskId'])
export class InquirySubmissionSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_task_id' })
  inquiryTaskId: string;

  @Column({ name: 'inquiry_action_id' })
  inquiryActionId: string;

  @Column({ name: 'research_task_id', nullable: true })
  researchTaskId: string | null;

  @Column({ name: 'company_name', nullable: true })
  companyName: string | null;

  @Column({ name: 'company_url', nullable: true })
  companyUrl: string | null;

  @Column({ name: 'country', nullable: true })
  country: string | null;

  @Column({ name: 'language', nullable: true })
  language: string | null;

  @Column({ name: 'screenshot_path', nullable: true })
  screenshotPath: string | null;

  @Column({ name: 'screenshot_hash', nullable: true })
  screenshotHash: string | null;

  @Column({ name: 'is_duplicate', default: false })
  isDuplicate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

