import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inquiry_actions')
export class InquiryAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryTaskId: string;

  @Column()
  performedByUserId: string;

  @Column()
  actionType: string; // linkedin_message, email, form, etc.

  @Column()
  screenshotHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
