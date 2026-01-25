import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LinkedInActionType {
  OUTREACH = 'OUTREACH',
  ASK_FOR_EMAIL = 'ASK_FOR_EMAIL',
  SEND_CATALOGUE = 'SEND_CATALOGUE',
}

export enum LinkedInActionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('linkedin_actions')
export class LinkedInAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_task_id' })
  inquiryTaskId: string;

  @Column({
    type: 'enum',
    enum: LinkedInActionType,
  })
  actionType: LinkedInActionType;

  @Column({
    type: 'enum',
    enum: LinkedInActionStatus,
    default: LinkedInActionStatus.PENDING,
  })
  status: LinkedInActionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date | null;
}
