import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('payment_records')
@Index(['userId', 'actionId'], { unique: true })
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  role: string;

  @Column()
  actionId: string;

  @Column()
  actionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'paid' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;
}