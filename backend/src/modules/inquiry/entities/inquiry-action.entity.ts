import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum InquiryActionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('inquiry_actions')
export class InquiryAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'taskid' })
  inquiryTaskId: string;

  @Column({ name: 'actionindex' })
  actionIndex: number;

  @Column({ name: 'performedbyuserid' })
  performedByUserId: string;

  @Column({
    type: 'enum',
    enum: InquiryActionStatus,
    default: InquiryActionStatus.PENDING,
  })
  status: InquiryActionStatus;

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;

  @Column({ name: 'reviewedat', nullable: true })
  reviewedAt: Date | null;
}