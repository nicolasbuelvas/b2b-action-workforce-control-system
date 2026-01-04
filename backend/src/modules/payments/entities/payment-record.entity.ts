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

  @Column()
  userId: string;

  @Column({ length: 50 })
  role: string;

  @Column()
  actionId: string;

  @Column({ length: 50 })
  actionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string; // ⚠ decimal = string

  @Column({ default: 'pending' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}