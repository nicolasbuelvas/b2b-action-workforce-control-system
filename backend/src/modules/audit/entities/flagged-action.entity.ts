import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('flagged_actions')
export class FlaggedAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  targetId: string; // researchTaskId / inquiryTaskId / actionId

  @Column()
  actionType: string; // research, inquiry, screenshot, etc.

  @Column()
  reason: string; // duplicated data, reused screenshot, abnormal volume

  @Column({ default: false })
  resolved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
