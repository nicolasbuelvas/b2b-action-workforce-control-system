import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

export interface CooldownRules {
  cooldownDays: number;
  dailyLimits: {
    researcher: number;
    inquirer: number;
    auditor: number;
  };
}

@Entity('category_configs')
export class CategoryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Category, category => category.config)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ name: 'categoryId' })
  categoryId: string;

  @Column({ type: 'jsonb', default: {} })
  cooldownRules: CooldownRules;
}