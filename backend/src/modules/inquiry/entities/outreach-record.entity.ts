import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('outreach_records')
export class OutreachRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inquiryTaskId: string;

  @Column()
  userId: string;

  @Column()
  actionType: string;

  @Column()
  inquiryActionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
