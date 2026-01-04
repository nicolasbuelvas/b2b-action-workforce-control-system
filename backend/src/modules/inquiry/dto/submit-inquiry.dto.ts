import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum InquiryStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('inquiry_tasks')
export class InquiryTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetId: string; // companyId / domainId / linkedinProfileId

  @Column()
  categoryId: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  @Column()
  assignedToUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}