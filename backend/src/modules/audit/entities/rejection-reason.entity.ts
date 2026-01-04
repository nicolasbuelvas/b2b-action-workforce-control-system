import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rejection_reasons')
export class RejectionReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; 

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}