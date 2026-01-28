import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('action_prices')
@Index(['roleId', 'actionType'], { unique: true })
export class ActionPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, name: 'role_id' })
  roleId: string;

  @Column({ length: 50, name: 'action_type' })
  actionType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0, name: 'bonus_multiplier' })
  bonusMultiplier: number; // 1.0 for normal, 1.5 for top 3

  @Column({ nullable: true, length: 255 })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}