import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { LinkedInActionType } from './linkedin-action.entity';

@Entity('linkedin_submission_snapshots')
@Index(['inquiryTaskId'])
@Index(['actionId'])
@Index(['researchTaskId'])
export class LinkedInSubmissionSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_task_id' })
  inquiryTaskId: string;

  @Column({ name: 'action_id' })
  actionId: string;

  @Column({ name: 'action_type', type: 'enum', enum: LinkedInActionType })
  actionType: LinkedInActionType;

  @Column({ name: 'research_task_id', nullable: true })
  researchTaskId: string | null;

  // Researcher data (immutable source of truth)
  @Column({ name: 'contact_name', nullable: true })
  contactName: string | null;

  @Column({ name: 'linkedin_profile_url', nullable: true })
  linkedinProfileUrl: string | null;

  @Column({ name: 'country', nullable: true })
  country: string | null;

  @Column({ name: 'language', nullable: true })
  language: string | null;

  // Action evidence
  @Column({ name: 'screenshot_path', nullable: true })
  screenshotPath: string | null;

  @Column({ name: 'screenshot_hash', nullable: true })
  screenshotHash: string | null;

  @Column({ name: 'is_duplicate', default: false })
  isDuplicate: boolean;

  // Action-specific data
  @Column({ name: 'message_content', nullable: true })
  messageContent: string | null;

  @Column({ name: 'email_provided', nullable: true })
  emailProvided: boolean | null;

  @Column({ name: 'email_value', nullable: true })
  emailValue: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
