import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('category_configs')
export class CategoryConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Category, category => category.config)
  @JoinColumn()
  category: Category;

  // Cooldown days (business rule)
  @Column({ type: 'int', default: 7 })
  websiteInquiryCooldownDays: number;

  @Column({ type: 'int', default: 14 })
  linkedinInquiryCooldownDays: number;

  // Daily limits
  @Column({ type: 'int', default: 50 })
  websiteInquiryDailyLimit: number;

  @Column({ type: 'int', default: 30 })
  linkedinInquiryDailyLimit: number;

  // Actions required (future proof)
  @Column({ type: 'int', default: 1 })
  websiteInquiryActionsRequired: number;

  @Column({ type: 'int', default: 3 })
  linkedinInquiryActionsRequired: number;
}
