import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';

@Entity('payment_records')
@Index(['userId'])
@Index(['userId', 'actionId'], { unique: true })
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50 })
  role: string;

  @Column({ name: 'action_id' })
  actionId: string;

  @Column({ length: 50, name: 'action_type' })
  actionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: PaymentStatus;

  @Column({ nullable: true, length: 50 })
  category?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}