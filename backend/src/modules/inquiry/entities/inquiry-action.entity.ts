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

  @Column({ name: 'taskId' })
  taskId: string;

  @Column()
  actionIndex: number;

  @Column()
  performedByUserId: string;

  @Column({
    type: 'enum',
    enum: InquiryActionStatus,
    default: InquiryActionStatus.PENDING,
  })
  status: InquiryActionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date | null;
}