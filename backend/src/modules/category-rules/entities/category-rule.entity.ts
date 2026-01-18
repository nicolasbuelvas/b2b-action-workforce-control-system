import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum RuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('category_rules')
export class CategoryRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'action_type' })
  actionType: string;

  @Column()
  role: string;

  @Column({ nullable: true, name: 'daily_limit_override' })
  dailyLimitOverride: number;

  @Column({ nullable: true, name: 'cooldown_days_override' })
  cooldownDaysOverride: number;

  @Column({ default: 1, name: 'required_actions' })
  requiredActions: number;

  @Column({ default: false, name: 'screenshot_required' })
  screenshotRequired: boolean;

  @Column({
    type: 'enum',
    enum: RuleStatus,
    default: RuleStatus.ACTIVE,
  })
  status: RuleStatus;

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}