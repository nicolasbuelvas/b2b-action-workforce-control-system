import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

export interface CooldownRule {
  actionsRequired: number;
  cooldownMs: number;
  dailyLimit?: number;
}

@Entity('category_configs')
export class CategoryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Category, category => category.config)
  @JoinColumn()
  category: Category;

  /**
   * Ej:
   * {
   *   linkedin_message: {
   *     actionsRequired: 3,
   *     cooldownMs: 172800000,
   *     dailyLimit: 30
   *   }
   * }
   */
  @Column({ type: 'jsonb', default: {} })
  cooldownRules: Record<string, CooldownRule>;
}