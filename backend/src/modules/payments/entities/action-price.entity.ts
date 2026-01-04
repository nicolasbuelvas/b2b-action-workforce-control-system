import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('action_prices')
@Index(['role', 'actionType'], { unique: true })
export class ActionPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  role: string;

  @Column({ length: 50 })
  actionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string; // decimal = string en TypeORM

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}